export type SanitizeMode = 'mask' | 'replace' | 'remove';

export type DetectedItemType =
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
