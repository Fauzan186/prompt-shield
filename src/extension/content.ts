type SanitizeMode = 'mask' | 'replace' | 'remove';
type DetectedItemType =
  | 'apiKey'
  | 'email'
  | 'phone'
  | 'url'
  | 'creditCard'
  | 'token'
  | 'custom';

interface DetectedItem {
  id: string;
  type: DetectedItemType;
  value: string;
  label: string;
}

interface SanitizeResult {
  sanitizedText: string;
  detectedItems: DetectedItem[];
}

interface DetectionRule {
  type: DetectedItemType;
  label: string;
  pattern: RegExp;
  replacementToken: string;
  validate?: (value: string) => boolean;
}

interface ExtensionSettings {
  enabled: boolean;
  mode: SanitizeMode;
  blockSubmissionEnabled: boolean;
  customDictionaryEnabled: boolean;
  customPatternsEnabled: boolean;
  customDictionary: string[];
  customPatterns: string[];
}

interface ExtensionStats {
  popupOpens: number;
  protectedItems: number;
  modeUsage: Record<SanitizeMode, number>;
}

type EditableTarget = HTMLInputElement | HTMLTextAreaElement | HTMLElement;

const STORAGE_KEY = 'promptshield_settings';
const STATS_KEY = 'promptshield_stats';
const INPUT_TYPES = new Set(['text', 'search', 'email', 'url', 'tel']);
const processingTargets = new WeakSet<EventTarget>();
const formSelector = 'input, textarea, [contenteditable="true"], [contenteditable="plaintext-only"]';

const defaultSettings: ExtensionSettings = {
  enabled: true,
  mode: 'replace',
  blockSubmissionEnabled: false,
  customDictionaryEnabled: false,
  customPatternsEnabled: false,
  customDictionary: [],
  customPatterns: [],
};

let currentSettings: ExtensionSettings = { ...defaultSettings };
let toastTimeout = 0;
const reviewBypassTargets = new WeakMap<EventTarget, number>();
const reviewBypassForms = new WeakMap<HTMLFormElement, number>();

const incrementProtectionStats = (mode: SanitizeMode, count: number) => {
  const storage = typeof chrome === 'undefined' ? undefined : chrome.storage?.local;

  if (!storage || count <= 0) {
    return;
  }

  storage.get([STATS_KEY], (result) => {
    const current = result[STATS_KEY] as ExtensionStats | undefined;
    const nextStats: ExtensionStats = {
      popupOpens: current?.popupOpens ?? 0,
      protectedItems: (current?.protectedItems ?? 0) + count,
      modeUsage: {
        mask: current?.modeUsage?.mask ?? 0,
        replace: current?.modeUsage?.replace ?? 0,
        remove: current?.modeUsage?.remove ?? 0,
      },
    };

    nextStats.modeUsage[mode] += 1;
    storage.set({ [STATS_KEY]: nextStats });
  });
};

const stripNonDigits = (value: string): string => value.replace(/\D/g, '');

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const isLikelyCreditCard = (value: string): boolean => {
  const digits = stripNonDigits(value);

  if (digits.length < 13 || digits.length > 19) {
    return false;
  }

  let sum = 0;
  let shouldDouble = false;

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);

    if (shouldDouble) {
      digit *= 2;

      if (digit > 9) {
        digit -= 9;
      }
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
};

const isLikelyToken = (value: string): boolean => {
  if (value.startsWith('Bearer ')) {
    return value.length >= 24;
  }

  if (value.startsWith('eyJ')) {
    return value.split('.').length === 3;
  }

  return value.length >= 16;
};

const detectionRules: DetectionRule[] = [
  {
    type: 'apiKey',
    label: 'API Key',
    pattern: /\b(?:sk|pk|rk|pat|ghp|ghu|ghs|ghr|xox[baprs]|AIza)[-_A-Za-z0-9]{10,}\b/g,
    replacementToken: '[API_KEY]',
  },
  {
    type: 'email',
    label: 'Email',
    pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    replacementToken: '[EMAIL]',
  },
  {
    type: 'phone',
    label: 'Phone Number',
    pattern: /\b(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)?\d{3}[\s.-]?\d{4,6}\b/g,
    replacementToken: '[PHONE]',
  },
  {
    type: 'url',
    label: 'URL',
    pattern: /\bhttps?:\/\/[^\s/$.?#].[^\s]*\b/gi,
    replacementToken: '[URL]',
  },
  {
    type: 'creditCard',
    label: 'Credit Card',
    pattern: /\b(?:\d[ -]*?){13,19}\b/g,
    replacementToken: '[CREDIT_CARD]',
    validate: isLikelyCreditCard,
  },
  {
    type: 'token',
    label: 'Access Token',
    pattern:
      /\b(?:Bearer\s+[A-Za-z0-9\-._~+/]+=*|eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9._-]+\.[A-Za-z0-9._-]+|(?:token|access_token|refresh_token)[=:][A-Za-z0-9._-]{16,})\b/g,
    replacementToken: '[TOKEN]',
    validate: isLikelyToken,
  },
];

const createReplacement = (value: string, mode: SanitizeMode, token: string): string => {
  if (mode === 'remove') {
    return '';
  }

  if (mode === 'replace') {
    return token;
  }

  return '*'.repeat(Math.max(8, value.length));
};

const createId = (type: DetectedItemType, index: number, value: string): string =>
  `${type}-${index}-${value.slice(0, 12)}`;

const sanitizeWithBuiltInRules = (input: string, mode: SanitizeMode): SanitizeResult => {
  if (!input.trim()) {
    return {
      sanitizedText: '',
      detectedItems: [],
    };
  }

  const detectedItems: DetectedItem[] = [];
  let sanitizedText = input;

  detectionRules.forEach((rule) => {
    const matches = Array.from(input.matchAll(rule.pattern)).filter((match) => {
      const value = match[0];
      return rule.validate ? rule.validate(value) : true;
    });

    matches.forEach((match, index) => {
      const value = match[0];

      detectedItems.push({
        id: createId(rule.type, index, value),
        type: rule.type,
        value,
        label: rule.label,
      });
    });

    matches.forEach((match) => {
      const value = match[0];
      sanitizedText = sanitizedText.replace(value, createReplacement(value, mode, rule.replacementToken));
    });
  });

  return {
    sanitizedText: sanitizedText.replace(/\n{3,}/g, '\n\n'),
    detectedItems,
  };
};

const parseCustomPatterns = (patterns: string[]): RegExp[] =>
  patterns.flatMap((pattern) => {
    try {
      return [new RegExp(pattern, 'gi')];
    } catch {
      return [];
    }
  });

const findCustomItems = (text: string, settings: ExtensionSettings): DetectedItem[] => {
  const items: DetectedItem[] = [];

  if (settings.customDictionaryEnabled) {
    settings.customDictionary.forEach((entry, index) => {
      if (!entry) {
        return;
      }

      const regex = new RegExp(escapeRegExp(entry), 'gi');
      const matches = text.match(regex);

      matches?.forEach((value, matchIndex) => {
        items.push({
          id: `custom-dictionary-${index}-${matchIndex}`,
          type: 'custom',
          value,
          label: 'Custom Dictionary',
        });
      });
    });
  }

  if (settings.customPatternsEnabled) {
    parseCustomPatterns(settings.customPatterns).forEach((regex, index) => {
      const matches = text.match(regex);

      matches?.forEach((value, matchIndex) => {
        items.push({
          id: `custom-pattern-${index}-${matchIndex}`,
          type: 'custom',
          value,
          label: 'Custom Pattern',
        });
      });
    });
  }

  return items;
};

const applyCustomRules = (text: string, settings: ExtensionSettings): string => {
  let nextText = text;

  if (settings.customDictionaryEnabled) {
    settings.customDictionary.forEach((entry) => {
      if (!entry) {
        return;
      }

      const regex = new RegExp(escapeRegExp(entry), 'gi');
      nextText = nextText.replace(regex, (match) =>
        createReplacement(match, settings.mode, '[CUSTOM_TERM]'),
      );
    });
  }

  if (settings.customPatternsEnabled) {
    parseCustomPatterns(settings.customPatterns).forEach((regex) => {
      nextText = nextText.replace(regex, (match) =>
        createReplacement(match, settings.mode, '[CUSTOM_PATTERN]'),
      );
    });
  }

  return nextText;
};

const sanitizeText = (input: string, settings: ExtensionSettings): SanitizeResult => {
  const builtInResult = sanitizeWithBuiltInRules(input, settings.mode);
  const customDetectedItems = findCustomItems(input, settings);

  return {
    sanitizedText: applyCustomRules(builtInResult.sanitizedText, settings),
    detectedItems: [...builtInResult.detectedItems, ...customDetectedItems],
  };
};

const getValue = (target: EditableTarget): string => {
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
    return target.value;
  }

  return target.innerText;
};

const setValue = (target: EditableTarget, value: string) => {
  if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
    target.value = value;
    return;
  }

  target.innerText = value;
};

const isTextInput = (target: EventTarget | null): target is HTMLInputElement =>
  target instanceof HTMLInputElement &&
  INPUT_TYPES.has(target.type.toLowerCase()) &&
  !target.readOnly &&
  !target.disabled;

const isTextArea = (target: EventTarget | null): target is HTMLTextAreaElement =>
  target instanceof HTMLTextAreaElement && !target.readOnly && !target.disabled;

const isContentEditable = (target: EventTarget | null): target is HTMLElement =>
  target instanceof HTMLElement && target.isContentEditable;

const getEditableTarget = (target: EventTarget | null): EditableTarget | null => {
  if (isTextInput(target) || isTextArea(target) || isContentEditable(target)) {
    return target;
  }

  if (target instanceof HTMLElement) {
    const candidate = target.closest(formSelector);

    if (isTextInput(candidate) || isTextArea(candidate) || isContentEditable(candidate)) {
      return candidate;
    }
  }

  return null;
};

const moveCaretToEnd = (element: HTMLElement) => {
  const selection = window.getSelection();

  if (!selection) {
    return;
  }

  const range = document.createRange();
  range.selectNodeContents(element);
  range.collapse(false);
  selection.removeAllRanges();
  selection.addRange(range);
};

const updateSelectionForInput = (
  target: HTMLInputElement | HTMLTextAreaElement,
  originalValue: string,
  nextValue: string,
) => {
  const currentStart = target.selectionStart ?? originalValue.length;
  const delta = nextValue.length - originalValue.length;
  const nextPosition = Math.max(0, Math.min(nextValue.length, currentStart + delta));
  target.setSelectionRange(nextPosition, nextPosition);
};

const sanitizeEditableTarget = (target: EditableTarget) => {
  if (!currentSettings.enabled) {
    return;
  }

  if (processingTargets.has(target)) {
    return;
  }

  const originalValue = getValue(target);
  const { sanitizedText, detectedItems } = sanitizeText(originalValue, currentSettings);

  if (!sanitizedText || sanitizedText === originalValue) {
    return;
  }

  incrementProtectionStats(currentSettings.mode, detectedItems.length);

  processingTargets.add(target);

  try {
    setValue(target, sanitizedText);

    if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
      updateSelectionForInput(target, originalValue, sanitizedText);
    } else {
      moveCaretToEnd(target);
    }

    target.dispatchEvent(new Event('input', { bubbles: true }));
    target.dispatchEvent(new Event('change', { bubbles: true }));
  } finally {
    window.setTimeout(() => {
      processingTargets.delete(target);
    }, 0);
  }
};

const shouldSanitizeOnInput = (event: Event): boolean => {
  if (!(event instanceof InputEvent)) {
    return false;
  }

  if (event.inputType === 'insertFromPaste' || event.inputType === 'insertLineBreak') {
    return true;
  }

  if (event.inputType.startsWith('delete')) {
    return false;
  }

  if (!event.data) {
    return false;
  }

  return /[\s,.;:!?)}\]]/.test(event.data);
};

const getSensitiveItems = (value: string): DetectedItem[] => sanitizeText(value, currentSettings).detectedItems;

const isBypassed = (value: number | undefined): boolean =>
  typeof value === 'number' && Date.now() - value < 2500;

const ensureToast = (): HTMLDivElement => {
  let toast = document.getElementById('promptshield-toast') as HTMLDivElement | null;

  if (toast) {
    return toast;
  }

  toast = document.createElement('div');
  toast.id = 'promptshield-toast';
  toast.style.position = 'fixed';
  toast.style.right = '20px';
  toast.style.bottom = '20px';
  toast.style.zIndex = '2147483647';
  toast.style.maxWidth = '320px';
  toast.style.borderRadius = '16px';
  toast.style.border = '1px solid rgba(251, 113, 133, 0.22)';
  toast.style.background =
    'linear-gradient(135deg, rgba(15, 23, 42, 0.96), rgba(30, 41, 59, 0.94))';
  toast.style.padding = '12px 14px';
  toast.style.boxShadow = '0 20px 45px rgba(15, 23, 42, 0.28)';
  toast.style.backdropFilter = 'blur(16px)';
  toast.style.color = '#f8fafc';
  toast.style.fontFamily =
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  toast.style.fontSize = '13px';
  toast.style.lineHeight = '1.5';
  toast.style.opacity = '0';
  toast.style.transform = 'translateY(8px)';
  toast.style.transition = 'opacity 180ms ease, transform 180ms ease';
  document.body.appendChild(toast);

  return toast;
};

const showToast = (message: string) => {
  const toast = ensureToast();
  toast.textContent = message;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';

  window.clearTimeout(toastTimeout);
  toastTimeout = window.setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(8px)';
  }, 2400);
};

const ensureReviewModal = () => {
  let overlay = document.getElementById('promptshield-review-overlay') as HTMLDivElement | null;

  if (overlay) {
    return overlay;
  }

  overlay = document.createElement('div');
  overlay.id = 'promptshield-review-overlay';
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.zIndex = '2147483647';
  overlay.style.display = 'none';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.padding = '20px';
  overlay.style.background = 'rgba(2, 6, 23, 0.55)';
  overlay.style.backdropFilter = 'blur(10px)';

  const panel = document.createElement('div');
  panel.style.width = 'min(460px, 100%)';
  panel.style.borderRadius = '24px';
  panel.style.border = '1px solid rgba(255,255,255,0.08)';
  panel.style.background =
    'linear-gradient(180deg, rgba(15,23,42,0.97), rgba(17,24,39,0.97))';
  panel.style.boxShadow = '0 28px 80px rgba(2, 6, 23, 0.4)';
  panel.style.padding = '22px';
  panel.style.color = '#f8fafc';
  panel.style.fontFamily =
    'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

  const eyebrow = document.createElement('div');
  eyebrow.textContent = 'Review Before Send';
  eyebrow.style.fontSize = '11px';
  eyebrow.style.fontWeight = '700';
  eyebrow.style.letterSpacing = '0.18em';
  eyebrow.style.textTransform = 'uppercase';
  eyebrow.style.color = '#fdba74';

  const title = document.createElement('h3');
  title.textContent = 'Sensitive data is still present in this prompt.';
  title.style.margin = '10px 0 0';
  title.style.fontSize = '20px';
  title.style.lineHeight = '1.3';
  title.style.fontWeight = '600';

  const message = document.createElement('p');
  message.id = 'promptshield-review-message';
  message.style.margin = '10px 0 0';
  message.style.fontSize = '14px';
  message.style.lineHeight = '1.7';
  message.style.color = '#cbd5e1';

  const list = document.createElement('div');
  list.id = 'promptshield-review-list';
  list.style.marginTop = '16px';
  list.style.display = 'grid';
  list.style.gap = '10px';

  const actions = document.createElement('div');
  actions.style.marginTop = '18px';
  actions.style.display = 'flex';
  actions.style.justifyContent = 'flex-end';
  actions.style.gap = '10px';

  const editButton = document.createElement('button');
  editButton.id = 'promptshield-review-edit';
  editButton.type = 'button';
  editButton.textContent = 'Keep editing';
  editButton.style.borderRadius = '999px';
  editButton.style.border = '1px solid rgba(255,255,255,0.1)';
  editButton.style.background = 'rgba(15,23,42,0.88)';
  editButton.style.color = '#e2e8f0';
  editButton.style.padding = '11px 16px';
  editButton.style.fontSize = '13px';
  editButton.style.fontWeight = '600';
  editButton.style.cursor = 'pointer';

  const sendButton = document.createElement('button');
  sendButton.id = 'promptshield-review-send';
  sendButton.type = 'button';
  sendButton.textContent = 'Send anyway';
  sendButton.style.borderRadius = '999px';
  sendButton.style.border = '1px solid rgba(253,186,116,0.25)';
  sendButton.style.background =
    'linear-gradient(135deg, rgba(249,115,22,0.98), rgba(251,113,133,0.92))';
  sendButton.style.color = '#fff7ed';
  sendButton.style.padding = '11px 16px';
  sendButton.style.fontSize = '13px';
  sendButton.style.fontWeight = '700';
  sendButton.style.cursor = 'pointer';
  sendButton.style.boxShadow = '0 14px 30px rgba(249,115,22,0.22)';

  actions.append(editButton, sendButton);
  panel.append(eyebrow, title, message, list, actions);
  overlay.appendChild(panel);
  document.body.appendChild(overlay);

  return overlay;
};

const showReviewModal = (
  detectedItems: DetectedItem[],
): Promise<'send' | 'edit'> =>
  new Promise((resolve) => {
    const overlay = ensureReviewModal();
    const message = overlay.querySelector('#promptshield-review-message') as HTMLParagraphElement;
    const list = overlay.querySelector('#promptshield-review-list') as HTMLDivElement;
    const editButton = overlay.querySelector('#promptshield-review-edit') as HTMLButtonElement;
    const sendButton = overlay.querySelector('#promptshield-review-send') as HTMLButtonElement;

    message.textContent = `PromptShield found ${detectedItems.length} sensitive match${
      detectedItems.length === 1 ? '' : 'es'
    }. Review before sending this prompt.`;

    const previewItems = detectedItems.slice(0, 4);
    list.innerHTML = '';

    previewItems.forEach((item) => {
      const row = document.createElement('div');
      row.style.border = '1px solid rgba(255,255,255,0.06)';
      row.style.borderRadius = '16px';
      row.style.background = 'rgba(255,255,255,0.03)';
      row.style.padding = '10px 12px';

      const label = document.createElement('div');
      label.textContent = item.label;
      label.style.fontSize = '12px';
      label.style.fontWeight = '700';
      label.style.color = '#f8fafc';

      const value = document.createElement('div');
      value.textContent = item.value;
      value.style.marginTop = '4px';
      value.style.fontSize = '12px';
      value.style.lineHeight = '1.6';
      value.style.color = '#94a3b8';
      value.style.wordBreak = 'break-all';

      row.append(label, value);
      list.appendChild(row);
    });

    if (detectedItems.length > 4) {
      const extra = document.createElement('div');
      extra.textContent = `+${detectedItems.length - 4} more detected item${
        detectedItems.length - 4 === 1 ? '' : 's'
      }`;
      extra.style.fontSize = '12px';
      extra.style.color = '#94a3b8';
      extra.style.padding = '0 4px';
      list.appendChild(extra);
    }

    const cleanup = () => {
      overlay.style.display = 'none';
      editButton.onclick = null;
      sendButton.onclick = null;
    };

    overlay.style.display = 'flex';

    editButton.onclick = () => {
      cleanup();
      resolve('edit');
    };

    sendButton.onclick = () => {
      cleanup();
      resolve('send');
    };
  });

const attemptSendFromTarget = (target: EditableTarget) => {
  const targetElement = target as HTMLElement;
  const form = targetElement.closest('form');

  if (form instanceof HTMLFormElement) {
    reviewBypassForms.set(form, Date.now());
    form.requestSubmit();
    return;
  }

  const sendButton = targetElement
    .closest('[role="dialog"], form, main, body')
    ?.querySelector<HTMLElement>(
      'button[aria-label*="send" i], button[title*="send" i], button[data-testid*="send" i], button[type="submit"], [role="button"][aria-label*="send" i]',
    );

  if (sendButton) {
    reviewBypassTargets.set(target, Date.now());
    sendButton.click();
    return;
  }

  showToast('PromptShield could not find a send action. Edit the prompt or try again.');
};

const shouldBlockSubmission = (value: string): boolean => {
  if (!currentSettings.enabled || !currentSettings.blockSubmissionEnabled) {
    return false;
  }

  return getSensitiveItems(value).length > 0;
};

const getFormFieldValues = (form: HTMLFormElement): string[] =>
  Array.from(form.querySelectorAll(formSelector))
    .map((element) => getEditableTarget(element))
    .filter((element): element is EditableTarget => Boolean(element))
    .map((element) => getValue(element))
    .filter(Boolean);

const loadSettings = () => {
  if (typeof chrome === 'undefined' || !chrome.storage?.local) {
    return;
  }

  chrome.storage.local.get([STORAGE_KEY], (result) => {
    const stored = result[STORAGE_KEY] as Partial<ExtensionSettings> | undefined;
    currentSettings = {
      ...defaultSettings,
      ...stored,
      customDictionary: stored?.customDictionary ?? defaultSettings.customDictionary,
      customPatterns: stored?.customPatterns ?? defaultSettings.customPatterns,
    };
  });
};

loadSettings();

if (typeof chrome !== 'undefined' && chrome.storage?.onChanged) {
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== 'local' || !changes[STORAGE_KEY]) {
      return;
    }

    const nextValue = changes[STORAGE_KEY].newValue as Partial<ExtensionSettings> | undefined;
    currentSettings = {
      ...defaultSettings,
      ...nextValue,
      customDictionary: nextValue?.customDictionary ?? defaultSettings.customDictionary,
      customPatterns: nextValue?.customPatterns ?? defaultSettings.customPatterns,
    };
  });
}

document.addEventListener(
  'input',
  (event) => {
    if (!currentSettings.enabled || !shouldSanitizeOnInput(event)) {
      return;
    }

    const target = getEditableTarget(event.target);

    if (!target) {
      return;
    }

    sanitizeEditableTarget(target);
  },
  true,
);

document.addEventListener(
  'blur',
  (event) => {
    if (!currentSettings.enabled) {
      return;
    }

    const target = getEditableTarget(event.target);

    if (!target) {
      return;
    }

    sanitizeEditableTarget(target);
  },
  true,
);

document.addEventListener(
  'change',
  (event) => {
    if (!currentSettings.enabled) {
      return;
    }

    const target = getEditableTarget(event.target);

    if (!target) {
      return;
    }

    sanitizeEditableTarget(target);
  },
  true,
);

document.addEventListener(
  'paste',
  (event) => {
    if (!currentSettings.enabled) {
      return;
    }

    const target = getEditableTarget(event.target);

    if (!target) {
      return;
    }

    window.setTimeout(() => sanitizeEditableTarget(target), 0);
  },
  true,
);

document.addEventListener(
  'keydown',
  async (event) => {
    if (!currentSettings.enabled) {
      return;
    }

    if (event.key !== 'Enter' || event.shiftKey || event.altKey || event.ctrlKey || event.metaKey) {
      return;
    }

    const target = getEditableTarget(event.target);

    if (!target) {
      return;
    }

    if (isBypassed(reviewBypassTargets.get(target))) {
      reviewBypassTargets.delete(target);
      return;
    }

    const detectedItems = getSensitiveItems(getValue(target));

    if (!currentSettings.blockSubmissionEnabled || detectedItems.length === 0) {
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();

    const decision = await showReviewModal(detectedItems);

    if (decision === 'send') {
      attemptSendFromTarget(target);
    }
  },
  true,
);

document.addEventListener(
  'submit',
  async (event) => {
    const form = event.target instanceof HTMLFormElement ? event.target : null;

    if (!form || !currentSettings.enabled || !currentSettings.blockSubmissionEnabled) {
      return;
    }

    if (isBypassed(reviewBypassForms.get(form))) {
      reviewBypassForms.delete(form);
      return;
    }

    const detectedItems = getFormFieldValues(form).flatMap((value) => getSensitiveItems(value));

    if (detectedItems.length === 0) {
      return;
    }

    event.preventDefault();
    event.stopImmediatePropagation();

    const decision = await showReviewModal(detectedItems);

    if (decision === 'send') {
      reviewBypassForms.set(form, Date.now());
      form.requestSubmit();
    }
  },
  true,
);
