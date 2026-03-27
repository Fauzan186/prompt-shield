export type SanitizeMode = 'mask' | 'replace' | 'remove';

export type DetectedItemType =
  | 'apiKey'
  | 'email'
  | 'phone'
  | 'url'
  | 'creditCard'
  | 'token';

export interface DetectedItem {
  id: string;
  type: DetectedItemType;
  value: string;
  label: string;
}

export interface SanitizeResult {
  sanitizedText: string;
  detectedItems: DetectedItem[];
}
