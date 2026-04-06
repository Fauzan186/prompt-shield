type SanitizeMode = 'mask' | 'replace' | 'remove';
type DetectedItemType =
  | 'apiKey'
  | 'awsKey'
  | 'credential'
  | 'banking'
  | 'privateKey'
  | 'email'
  | 'phone'
  | 'url'
  | 'slackWebhook'
  | 'ipAddress'
  | 'ssn'
  | 'dob'
  | 'iban'
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
  replaceFallbackToken?: string;
  validate?: (value: string) => boolean;
}

interface PatternMatch {
  start: number;
  end: number;
  value: string;
  ruleIndex: number;
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
const AI_EDITOR_HOSTS = [
  'chatgpt.com',
  'chat.openai.com',
  'claude.ai',
  'gemini.google.com',
  'copilot.microsoft.com',
  'perplexity.ai',
  'www.perplexity.ai',
];
const CHATGPT_TEXTAREA_SELECTOR = 'textarea[name="prompt-textarea"]';
const EXCLUDED_INPUT_TYPES = new Set([
  'button',
  'checkbox',
  'color',
  'date',
  'datetime-local',
  'file',
  'hidden',
  'image',
  'month',
  'radio',
  'range',
  'reset',
  'submit',
  'time',
  'week',
]);
const processingTargets = new WeakSet<EventTarget>();
const formSelector =
  'input, textarea, [contenteditable="true"], [contenteditable="plaintext-only"], [role="textbox"][contenteditable="true"]';

const defaultSettings: ExtensionSettings = {
  enabled: true,
  mode: 'mask',
  blockSubmissionEnabled: false,
  customDictionaryEnabled: false,
  customPatternsEnabled: false,
  customDictionary: [],
  customPatterns: [],
};

let currentSettings: ExtensionSettings = { ...defaultSettings };
let toastTimeout = 0;
let activeEditableTarget: EditableTarget | null = null;
let pendingPasteText: string | null = null;
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

const isLikelyIban = (value: string): boolean => value.length >= 15 && value.length <= 34;

const hasAtLeastOneDigit = (value: string): boolean => /\d/.test(value);

const isLikelyPhone = (value: string): boolean => {
  const digits = stripNonDigits(value);
  return (
    digits.length >= 7 &&
    digits.length <= 15 &&
    !/^(\d)\1+$/.test(digits) &&
    !isLikelyCreditCard(value)
  );
};

const monthNames =
  '(?:jan|january|feb|february|mar|march|apr|april|may|jun|june|jul|july|aug|august|sep|sept|september|oct|october|nov|november|dec|december)';

const parseMonthToken = (value: string): number | null => {
  const normalized = value.toLowerCase().slice(0, 3);
  const months = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
  const index = months.indexOf(normalized);
  return index === -1 ? null : index + 1;
};

const isLikelyDob = (value: string): boolean => {
  const normalized = value
    .replace(/\b(?:dob|date\s*of\s*birth|birthdate)\b\s*[:=-]?\s*/i, '')
    .replace(/,/g, '')
    .trim();

  let year = 0;
  let month = 0;
  let day = 0;

  const isoMatch = normalized.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/);
  if (isoMatch) {
    year = Number(isoMatch[1]);
    month = Number(isoMatch[2]);
    day = Number(isoMatch[3]);
  }

  const numericMatch = normalized.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})$/);
  if (!year && numericMatch) {
    day = Number(numericMatch[1]);
    month = Number(numericMatch[2]);
    year = Number(numericMatch[3].length === 2 ? `19${numericMatch[3]}` : numericMatch[3]);
  }

  const longMonthMatch = normalized.match(
    new RegExp(`^(\\d{1,2})\\s+(${monthNames})\\s+(\\d{2,4})$`, 'i'),
  );
  if (!year && longMonthMatch) {
    day = Number(longMonthMatch[1]);
    month = parseMonthToken(longMonthMatch[2]) ?? 0;
    year = Number(longMonthMatch[3].length === 2 ? `19${longMonthMatch[3]}` : longMonthMatch[3]);
  }

  const leadingMonthMatch = normalized.match(
    new RegExp(`^(${monthNames})\\s+(\\d{1,2})\\s+(\\d{2,4})$`, 'i'),
  );
  if (!year && leadingMonthMatch) {
    month = parseMonthToken(leadingMonthMatch[1]) ?? 0;
    day = Number(leadingMonthMatch[2]);
    year = Number(leadingMonthMatch[3].length === 2 ? `19${leadingMonthMatch[3]}` : leadingMonthMatch[3]);
  }

  if (!year || !month || !day) {
    return false;
  }

  const currentYear = new Date().getFullYear();
  if (year < 1900 || year > currentYear) {
    return false;
  }

  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
};

const preserveEdgeMask = (value: string): string => {
  const leadingWhitespace = value.match(/^\s*/)?.[0] ?? '';
  const trailingWhitespace = value.match(/\s*$/)?.[0] ?? '';
  const coreValue = value.slice(leadingWhitespace.length, value.length - trailingWhitespace.length);

  if (!coreValue) {
    return value;
  }

  if (coreValue.length === 1) {
    return `${leadingWhitespace}*${trailingWhitespace}`;
  }

  if (coreValue.length === 2) {
    return `${leadingWhitespace}${coreValue[0]}*${trailingWhitespace}`;
  }

  const visibleStart = coreValue[0];
  const visibleEnd = coreValue[coreValue.length - 1];
  const maskedMiddle = '*'.repeat(coreValue.length - 2);

  return `${leadingWhitespace}${visibleStart}${maskedMiddle}${visibleEnd}${trailingWhitespace}`;
};

const detectionRules: DetectionRule[] = [
  {
    type: 'apiKey',
    label: 'OpenAI Project Key',
    pattern: /\bsk-proj-[A-Za-z0-9_-]{12,}\b/g,
    replacementToken: '[OPENAI_PROJECT_KEY]',
  },
  {
    type: 'apiKey',
    label: 'OpenAI Secret Key',
    pattern: /\bsk-[A-Za-z0-9]{20,}\b/g,
    replacementToken: '[OPENAI_API_KEY]',
  },
  {
    type: 'apiKey',
    label: 'Anthropic API Key',
    pattern: /\bsk-ant-(?:api\d{2}-)?[A-Za-z0-9_-]{16,}\b/g,
    replacementToken: '[ANTHROPIC_API_KEY]',
  },
  {
    type: 'apiKey',
    label: 'Stripe Secret Key',
    pattern: /\bsk_(?:live|test)_[A-Za-z0-9]{16,}\b/g,
    replacementToken: '[STRIPE_SECRET_KEY]',
  },
  {
    type: 'apiKey',
    label: 'Stripe Publishable Key',
    pattern: /\bpk_(?:live|test)_[A-Za-z0-9]{16,}\b/g,
    replacementToken: '[STRIPE_PUBLISHABLE_KEY]',
  },
  {
    type: 'apiKey',
    label: 'Stripe Restricted Key',
    pattern: /\brk_(?:live|test)_[A-Za-z0-9]{16,}\b/g,
    replacementToken: '[STRIPE_RESTRICTED_KEY]',
  },
  {
    type: 'token',
    label: 'Stripe Webhook Secret',
    pattern: /\bwhsec_[A-Za-z0-9]{16,}\b/g,
    replacementToken: '[STRIPE_WEBHOOK_SECRET]',
  },
  {
    type: 'awsKey',
    label: 'AWS Access Key',
    pattern: /\b(?:A3T[A-Z0-9]|AKIA|ASIA|AGPA|AIDA|AROA|ANPA)[A-Z0-9]{16}\b/g,
    replacementToken: '[AWS_ACCESS_KEY]',
  },
  {
    type: 'token',
    label: 'GitHub Fine-Grained Token',
    pattern: /\bgithub_pat_[A-Za-z0-9_]{20,}\b/g,
    replacementToken: '[GITHUB_FINE_GRAINED_TOKEN]',
  },
  {
    type: 'token',
    label: 'GitHub Personal Access Token',
    pattern: /\bghp_[A-Za-z0-9]{20,}\b/g,
    replacementToken: '[GITHUB_PAT]',
  },
  {
    type: 'token',
    label: 'GitHub OAuth Token',
    pattern: /\b(?:gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}\b/g,
    replacementToken: '[GITHUB_TOKEN]',
  },
  {
    type: 'token',
    label: 'Slack Bot Token',
    pattern: /\bxoxb-[A-Za-z0-9-]{20,}\b/g,
    replacementToken: '[SLACK_BOT_TOKEN]',
  },
  {
    type: 'token',
    label: 'Slack User Token',
    pattern: /\bxoxp-[A-Za-z0-9-]{20,}\b/g,
    replacementToken: '[SLACK_USER_TOKEN]',
  },
  {
    type: 'token',
    label: 'Slack App Token',
    pattern: /\bxapp-[A-Za-z0-9-]{20,}\b/g,
    replacementToken: '[SLACK_APP_TOKEN]',
  },
  {
    type: 'url',
    label: 'Slack Webhook URL',
    pattern: /\bhttps:\/\/hooks\.slack(?:-gov)?\.com\/services\/[A-Z0-9]+\/[A-Z0-9]+\/[A-Za-z0-9]+\b/g,
    replacementToken: '[SLACK_WEBHOOK_URL]',
  },
  {
    type: 'url',
    label: 'Discord Webhook URL',
    pattern: /\bhttps:\/\/(?:discord(?:app)?\.com)\/api\/webhooks\/\d+\/[A-Za-z0-9_-]+\b/g,
    replacementToken: '[DISCORD_WEBHOOK_URL]',
  },
  {
    type: 'apiKey',
    label: 'Google API Key',
    pattern: /\bAIza[0-9A-Za-z_-]{20,}\b/g,
    replacementToken: '[GOOGLE_API_KEY]',
  },
  {
    type: 'apiKey',
    label: 'SendGrid API Key',
    pattern: /\bSG\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\b/g,
    replacementToken: '[SENDGRID_API_KEY]',
  },
  {
    type: 'apiKey',
    label: 'Mailchimp API Key',
    pattern: /\b[a-f0-9]{32}-us\d{1,2}\b/gi,
    replacementToken: '[MAILCHIMP_API_KEY]',
  },
  {
    type: 'apiKey',
    label: 'Twilio API Key',
    pattern: /\bSK[0-9a-fA-F]{32}\b/g,
    replacementToken: '[TWILIO_API_KEY]',
  },
  {
    type: 'token',
    label: 'Shopify Admin Token',
    pattern: /\bshpat_[A-Za-z0-9]{16,}\b/g,
    replacementToken: '[SHOPIFY_ADMIN_TOKEN]',
  },
  {
    type: 'token',
    label: 'Square Access Token',
    pattern: /\bsq0atp-[A-Za-z0-9_-]{16,}\b/g,
    replacementToken: '[SQUARE_ACCESS_TOKEN]',
  },
  {
    type: 'token',
    label: 'DigitalOcean Token',
    pattern: /\bdop_v1_[A-Za-z0-9_-]{16,}\b/g,
    replacementToken: '[DIGITALOCEAN_TOKEN]',
  },
  {
    type: 'token',
    label: 'Hugging Face Token',
    pattern: /\bhf_[A-Za-z0-9]{20,}\b/g,
    replacementToken: '[HUGGINGFACE_TOKEN]',
  },
  {
    type: 'token',
    label: 'Mapbox Token',
    pattern: /\b(?:pk|sk)\.[A-Za-z0-9_-]{20,}\b/g,
    replacementToken: '[MAPBOX_TOKEN]',
  },
  {
    type: 'privateKey',
    label: 'Private Key',
    pattern: /-----BEGIN(?:[\sA-Z]+)?PRIVATE KEY-----[\s\S]*?-----END(?:[\sA-Z]+)?PRIVATE KEY-----/g,
    replacementToken: '[PRIVATE_KEY]',
  },
  {
    type: 'email',
    label: 'Email',
    pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    replacementToken: '[EMAIL]',
    replaceFallbackToken: '[SENSITIVE_CONTACT]',
  },
  {
    type: 'dob',
    label: 'Date of Birth',
    pattern: new RegExp(
      `\\b(?:dob|date\\s*of\\s*birth|birthdate)\\s*[:=-]?\\s*(?:\\d{4}[-/.]\\d{1,2}[-/.]\\d{1,2}|\\d{1,2}[-/.]\\d{1,2}[-/.]\\d{2,4}|\\d{1,2}\\s+${monthNames}\\s+\\d{2,4}|${monthNames}\\s+\\d{1,2},?\\s+\\d{2,4})\\b`,
      'gi',
    ),
    replacementToken: '[DATE_OF_BIRTH]',
    replaceFallbackToken: '[SENSITIVE_DATE]',
    validate: isLikelyDob,
  },
  {
    type: 'url',
    label: 'URL',
    pattern: /\bhttps?:\/\/[^\s/$.?#].[^\s]*\b/gi,
    replacementToken: '[URL]',
    replaceFallbackToken: '[SENSITIVE_URL]',
  },
  {
    type: 'ipAddress',
    label: 'IP Address',
    pattern: /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g,
    replacementToken: '[IP_ADDRESS]',
  },
  {
    type: 'ssn',
    label: 'SSN',
    pattern: /\b\d{3}-\d{2}-\d{4}\b/g,
    replacementToken: '[SSN]',
  },
  {
    type: 'iban',
    label: 'IBAN',
    pattern: /\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/g,
    replacementToken: '[IBAN]',
    validate: isLikelyIban,
  },
  {
    type: 'banking',
    label: 'SWIFT / BIC',
    pattern: /\b[A-Z]{6}[A-Z0-9]{2}(?:[A-Z0-9]{3})?\b/g,
    replacementToken: '[SWIFT_BIC]',
    replaceFallbackToken: '[SENSITIVE_CODE]',
  },
  {
    type: 'banking',
    label: 'IFSC Code',
    pattern: /\b[A-Z]{4}0[A-Z0-9]{6}\b/g,
    replacementToken: '[IFSC]',
  },
  {
    type: 'banking',
    label: 'UPI ID',
    pattern: /\b[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}[a-zA-Z0-9._-]{1,}\b/g,
    replacementToken: '[UPI_ID]',
    replaceFallbackToken: '[SENSITIVE_ID]',
  },
  {
    type: 'banking',
    label: 'Routing Number',
    pattern: /\b(?:routing|aba)\s*(?:number|no)?\s*[:=-]?\s*\d{9}\b/gi,
    replacementToken: '[ROUTING_NUMBER]',
    replaceFallbackToken: '[SENSITIVE_BANKING]',
  },
  {
    type: 'banking',
    label: 'Bank Account Number',
    pattern: /\b(?:account|acct)(?:\s*(?:number|no))?\s*[:=-]?\s*[A-Z0-9]{8,20}\b/gi,
    replacementToken: '[BANK_ACCOUNT]',
    replaceFallbackToken: '[SENSITIVE_BANKING]',
    validate: hasAtLeastOneDigit,
  },
  {
    type: 'phone',
    label: 'Phone Number',
    pattern: /(?<!\w)(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{1,4}\)?[\s.-]?)?(?:\d[\s.-]?){6,14}\d\b/g,
    replacementToken: '[PHONE]',
    replaceFallbackToken: '[SENSITIVE_NUMBER]',
    validate: isLikelyPhone,
  },
  {
    type: 'creditCard',
    label: 'Credit Card',
    pattern: /\b(?:\d[ -]*?){13,19}\b/g,
    replacementToken: '[CREDIT_CARD]',
    validate: isLikelyCreditCard,
  },
  {
    type: 'creditCard',
    label: 'Card Expiry',
    pattern: /\b(?:exp|expiry|expiration)\s*[:=-]?\s*(?:0[1-9]|1[0-2])(?:[/-])(?:\d{2}|\d{4})\b/gi,
    replacementToken: '[CARD_EXPIRY]',
  },
  {
    type: 'creditCard',
    label: 'Card Security Code',
    pattern: /\b(?:cvv|cvc|cvn|security\s*code)\s*[:=-]?\s*\d{3,4}\b/gi,
    replacementToken: '[CARD_SECURITY_CODE]',
  },
  {
    type: 'token',
    label: 'Bearer Token',
    pattern: /\bBearer\s+[A-Za-z0-9\-._~+/]+=*\b/g,
    replacementToken: '[BEARER_TOKEN]',
    validate: (value) => value.length >= 24,
  },
  {
    type: 'token',
    label: 'JWT',
    pattern: /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9._-]+\.[A-Za-z0-9._-]+\b/g,
    replacementToken: '[JWT]',
    validate: (value) => value.split('.').length === 3,
  },
  {
    type: 'token',
    label: 'Access Token Parameter',
    pattern: /\b(?:token|access_token|api_token|refresh_token)[=:][A-Za-z0-9._-]{16,}\b/g,
    replacementToken: '[TOKEN]',
    replaceFallbackToken: '[SENSITIVE_VALUE]',
  },
  {
    type: 'credential',
    label: 'Password Assignment',
    pattern: /\b(?:password|passwd|pwd|passphrase)\s*[:=]\s*[^\s"'`;,]{4,}\b/gi,
    replacementToken: '[PASSWORD]',
  },
  {
    type: 'credential',
    label: 'Username Assignment',
    pattern: /\b(?:username|user|login)\s*[:=]\s*[A-Za-z0-9._@-]{3,}\b/gi,
    replacementToken: '[USERNAME]',
    replaceFallbackToken: '[SENSITIVE_VALUE]',
  },
];

const createReplacement = (
  value: string,
  mode: SanitizeMode,
  token: string,
  replaceFallbackToken?: string,
): string => {
  if (mode === 'remove') {
    return '';
  }

  if (mode === 'replace') {
    return replaceFallbackToken ?? token;
  }

  return preserveEdgeMask(value);
};

const createId = (type: DetectedItemType, index: number, value: string): string =>
  `${type}-${index}-${value.slice(0, 12)}`;

const overlaps = (left: PatternMatch, right: PatternMatch): boolean =>
  left.start < right.end && right.start < left.end;

const sanitizeWithBuiltInRules = (input: string, mode: SanitizeMode): SanitizeResult => {
  if (!input.trim()) {
    return {
      sanitizedText: '',
      detectedItems: [],
    };
  }

  const detectedItems: DetectedItem[] = [];
  const selectedMatches: Array<
    PatternMatch & {
      type: DetectedItemType;
      label: string;
      replacementToken: string;
      replaceFallbackToken?: string;
    }
  > = [];

  detectionRules.forEach((rule, ruleIndex) => {
    rule.pattern.lastIndex = 0;

    const matches = Array.from(input.matchAll(rule.pattern))
      .map((match) => {
        const value = match[0];
        const start = match.index ?? -1;

        return {
          value,
          start,
          end: start + value.length,
          ruleIndex,
        };
      })
      .filter((match) => match.start >= 0)
      .filter((match) => (rule.validate ? rule.validate(match.value) : true))
      .sort((left, right) => left.start - right.start);

    matches.forEach((match) => {
      const hasOverlap = selectedMatches.some((selected) => overlaps(selected, match));
      if (hasOverlap) {
        return;
      }

      selectedMatches.push({
        ...match,
        type: rule.type,
        label: rule.label,
        replacementToken: rule.replacementToken,
        replaceFallbackToken: rule.replaceFallbackToken,
      });
    });
  });

  selectedMatches.sort((left, right) => left.start - right.start);

  selectedMatches.forEach((match, index) => {
    detectedItems.push({
      id: createId(match.type, index, match.value),
      type: match.type,
      value: match.value,
      label: match.label,
    });
  });

  let cursor = 0;
  let sanitizedText = '';

  selectedMatches.forEach((match) => {
    sanitizedText += input.slice(cursor, match.start);
    sanitizedText += createReplacement(match.value, mode, match.replacementToken, match.replaceFallbackToken);
    cursor = match.end;
  });

  sanitizedText += input.slice(cursor);

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

const isAiEditorHost = (): boolean =>
  AI_EDITOR_HOSTS.some((host) => location.hostname === host || location.hostname.endsWith(`.${host}`));

const getPreferredChatGptTextarea = (): HTMLTextAreaElement | null => {
  if (!/^(chatgpt\.com|chat\.openai\.com)$/i.test(location.hostname)) {
    return null;
  }

  const textarea = document.querySelector(CHATGPT_TEXTAREA_SELECTOR);
  return textarea instanceof HTMLTextAreaElement ? textarea : null;
};

const getValue = (target: EditableTarget): string =>
  target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement
    ? target.value
    : target.innerText;

const inputValueSetter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
const textAreaValueSetter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')?.set;

const setValue = (target: EditableTarget, value: string) => {
  if (target instanceof HTMLInputElement) {
    inputValueSetter?.call(target, value);
    return;
  }

  if (target instanceof HTMLTextAreaElement) {
    textAreaValueSetter?.call(target, value);
    return;
  }

  target.textContent = value;
};

const dispatchSyntheticInput = (target: EditableTarget) => {
  target.dispatchEvent(
    new InputEvent('input', {
      bubbles: true,
      composed: true,
      inputType: 'insertReplacementText',
      data: null,
    }),
  );
  target.dispatchEvent(new Event('change', { bubbles: true }));
};

const isTextInput = (target: EventTarget | null): target is HTMLInputElement =>
  target instanceof HTMLInputElement &&
  !EXCLUDED_INPUT_TYPES.has(target.type.toLowerCase()) &&
  !target.readOnly &&
  !target.disabled;

const isTextArea = (target: EventTarget | null): target is HTMLTextAreaElement =>
  target instanceof HTMLTextAreaElement && !target.readOnly && !target.disabled;

const isSupportedContentEditable = (target: EventTarget | null): target is HTMLElement =>
  isAiEditorHost() &&
  target instanceof HTMLElement &&
  target.isContentEditable &&
  target.getAttribute('contenteditable') !== 'false';

const getEditableTarget = (target: EventTarget | null): EditableTarget | null => {
  if (isTextInput(target) || isTextArea(target) || isSupportedContentEditable(target)) {
    return target;
  }

  if (target instanceof HTMLElement) {
    const candidate = target.closest(formSelector);

    if (isTextInput(candidate) || isTextArea(candidate) || isSupportedContentEditable(candidate)) {
      return candidate;
    }
  }

  const activeElement = document.activeElement;

  if (isTextInput(activeElement) || isTextArea(activeElement) || isSupportedContentEditable(activeElement)) {
    return activeElement;
  }

  const preferredChatGptTextarea = getPreferredChatGptTextarea();

  if (preferredChatGptTextarea) {
    return preferredChatGptTextarea;
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

const insertTextAtCursor = (target: EditableTarget, text: string) => {
  if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) {
    const selection = window.getSelection();

    if (!selection || selection.rangeCount === 0) {
      target.textContent = `${target.textContent ?? ''}${text}`;
      moveCaretToEnd(target);
      return;
    }

    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(text));
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
    return;
  }

  const currentValue = target.value;
  const selectionStart = target.selectionStart ?? currentValue.length;
  const selectionEnd = target.selectionEnd ?? selectionStart;

  target.setRangeText(text, selectionStart, selectionEnd, 'end');
  const nextCaretPosition = selectionStart + text.length;
  target.setSelectionRange(nextCaretPosition, nextCaretPosition);
};

const updateSelectionForInput = (
  target: EditableTarget,
  originalValue: string,
  nextValue: string,
) => {
  if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) {
    moveCaretToEnd(target);
    return;
  }

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

    updateSelectionForInput(target, originalValue, sanitizedText);

    dispatchSyntheticInput(target);
  } finally {
    window.setTimeout(() => {
      processingTargets.delete(target);
    }, 0);
  }
};

const scheduleSanitizeEditableTarget = (target: EditableTarget) => {
  sanitizeEditableTarget(target);
  window.requestAnimationFrame(() => sanitizeEditableTarget(target));
  window.setTimeout(() => sanitizeEditableTarget(target), 24);
};

const dispatchPasteInput = (target: EditableTarget, text: string) => {
  target.dispatchEvent(
    new InputEvent('input', {
      bubbles: true,
      composed: true,
      inputType: 'insertFromPaste',
      data: text,
    }),
  );
  target.dispatchEvent(new Event('change', { bubbles: true }));
};

const applySanitizedPaste = (target: EditableTarget, rawText: string) => {
  const { sanitizedText, detectedItems } = sanitizeText(rawText, currentSettings);
  incrementProtectionStats(currentSettings.mode, detectedItems.length);
  insertTextAtCursor(target, sanitizedText);
  dispatchPasteInput(target, sanitizedText);
  scheduleSanitizeEditableTarget(target);
};

const syncActiveTarget = () => {
  if (!activeEditableTarget || !activeEditableTarget.isConnected || !currentSettings.enabled) {
    return;
  }

  sanitizeEditableTarget(activeEditableTarget);
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

  return Boolean(event.data);
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

    syncActiveTarget();
  });
}

document.addEventListener(
  'focusin',
  (event) => {
    activeEditableTarget = getEditableTarget(event.target);
  },
  true,
);

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

    activeEditableTarget = target;
    scheduleSanitizeEditableTarget(target);
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

    activeEditableTarget = target;
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

    activeEditableTarget = target;
    sanitizeEditableTarget(target);
  },
  true,
);

document.addEventListener(
  'beforeinput',
  (event) => {
    if (!currentSettings.enabled || !(event instanceof InputEvent) || event.inputType !== 'insertFromPaste') {
      return;
    }

    const target = getEditableTarget(event.target);

    if (!target) {
      return;
    }

    activeEditableTarget = target;
    const inputEvent = event as InputEvent & { dataTransfer?: DataTransfer | null };
    const pastedText = pendingPasteText ?? inputEvent.dataTransfer?.getData('text/plain') ?? '';

    if (!pastedText) {
      window.requestAnimationFrame(() => scheduleSanitizeEditableTarget(target));
      return;
    }

    pendingPasteText = null;
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    applySanitizedPaste(target, pastedText);
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

    activeEditableTarget = target;
    const clipboardText = event instanceof ClipboardEvent ? event.clipboardData?.getData('text/plain') ?? '' : '';

    if (clipboardText) {
      pendingPasteText = clipboardText;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      window.setTimeout(() => {
        if (!pendingPasteText) {
          return;
        }

        const fallbackPasteText = pendingPasteText;
        pendingPasteText = null;
        applySanitizedPaste(target, fallbackPasteText);
      }, 0);
      return;
    }

    scheduleSanitizeEditableTarget(target);
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
