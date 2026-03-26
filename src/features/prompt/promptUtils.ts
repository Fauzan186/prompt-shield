import type { DetectedItem, DetectedItemType, SanitizeMode, SanitizeResult } from '@/types/prompt';

interface DetectionRule {
  type: DetectedItemType;
  label: string;
  pattern: RegExp;
  replacementToken: string;
}

const detectionRules: DetectionRule[] = [
  {
    type: 'apiKey',
    label: 'API Key',
    pattern: /\bsk-[A-Za-z0-9_-]{12,}\b/g,
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
    const matches = Array.from(input.matchAll(rule.pattern));

    matches.forEach((match, index) => {
      const value = match[0];

      detectedItems.push({
        id: getUniqueId(rule.type, index, value),
        type: rule.type,
        value,
        label: rule.label,
      });
    });

    sanitizedText = sanitizedText.replace(rule.pattern, (match) =>
      createReplacement(match, mode, rule.replacementToken),
    );
  });

  return {
    sanitizedText: sanitizedText.replace(/\n{3,}/g, '\n\n').trim(),
    detectedItems,
  };
};
