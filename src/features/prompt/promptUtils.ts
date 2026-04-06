import { builtInPatterns } from '@/features/prompt/builtInPatterns';
import type { DetectedItem, DetectedItemType, SanitizeMode, SanitizeResult } from '@/types/prompt';

interface PatternMatch {
  start: number;
  end: number;
  value: string;
  ruleIndex: number;
}

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

const getUniqueId = (type: DetectedItemType, index: number, value: string): string =>
  `${type}-${index}-${value.slice(0, 12)}`;

const overlaps = (left: PatternMatch, right: PatternMatch): boolean =>
  left.start < right.end && right.start < left.end;

export const sanitizePrompt = (input: string, mode: SanitizeMode): SanitizeResult => {
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

  builtInPatterns.forEach((rule, ruleIndex) => {
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
      id: getUniqueId(match.type, index, match.value),
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
    sanitizedText: sanitizedText.replace(/\n{3,}/g, '\n\n').trim(),
    detectedItems,
  };
};
