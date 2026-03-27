import type { DetectedItem, DetectedItemType, SanitizeMode, SanitizeResult } from '@/types/prompt';

interface DetectionRule {
  type: DetectedItemType;
  label: string;
  pattern: RegExp;
  replacementToken: string;
  validate?: (value: string) => boolean;
}

const stripNonDigits = (value: string): string => value.replace(/\D/g, '');

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

const getUniqueId = (type: DetectedItemType, index: number, value: string): string =>
  `${type}-${index}-${value.slice(0, 12)}`;

export const sanitizePrompt = (input: string, mode: SanitizeMode): SanitizeResult => {
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
        id: getUniqueId(rule.type, index, value),
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
    sanitizedText: sanitizedText.replace(/\n{3,}/g, '\n\n').trim(),
    detectedItems,
  };
};
