import type { DetectedItemType } from '@/types/prompt';

export interface BuiltInPatternDefinition {
  id: string;
  type: DetectedItemType;
  label: string;
  category: string;
  example: string;
  pattern: RegExp;
  replacementToken: string;
  replaceFallbackToken?: string;
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

const isLikelyIban = (value: string): boolean => value.length >= 15 && value.length <= 34;

const isLikelyJwt = (value: string): boolean => value.split('.').length === 3;

const isLikelyBearerToken = (value: string): boolean => value.length >= 24;

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

export const builtInPatterns: BuiltInPatternDefinition[] = [
  {
    id: 'openai-project-key',
    type: 'apiKey',
    label: 'OpenAI Project Key',
    category: 'API Keys',
    example: 'sk-proj-abc123...',
    pattern: /\bsk-proj-[A-Za-z0-9_-]{12,}\b/g,
    replacementToken: '[OPENAI_PROJECT_KEY]',
  },
  {
    id: 'openai-secret-key',
    type: 'apiKey',
    label: 'OpenAI Secret Key',
    category: 'API Keys',
    example: 'sk-abc123...',
    pattern: /\bsk-[A-Za-z0-9]{20,}\b/g,
    replacementToken: '[OPENAI_API_KEY]',
  },
  {
    id: 'anthropic-api-key',
    type: 'apiKey',
    label: 'Anthropic API Key',
    category: 'API Keys',
    example: 'sk-ant-api03-...',
    pattern: /\bsk-ant-(?:api\d{2}-)?[A-Za-z0-9_-]{16,}\b/g,
    replacementToken: '[ANTHROPIC_API_KEY]',
  },
  {
    id: 'stripe-secret-key',
    type: 'apiKey',
    label: 'Stripe Secret Key',
    category: 'API Keys',
    example: 'sk_live_...',
    pattern: /\bsk_(?:live|test)_[A-Za-z0-9]{16,}\b/g,
    replacementToken: '[STRIPE_SECRET_KEY]',
  },
  {
    id: 'stripe-publishable-key',
    type: 'apiKey',
    label: 'Stripe Publishable Key',
    category: 'API Keys',
    example: 'pk_live_...',
    pattern: /\bpk_(?:live|test)_[A-Za-z0-9]{16,}\b/g,
    replacementToken: '[STRIPE_PUBLISHABLE_KEY]',
  },
  {
    id: 'stripe-restricted-key',
    type: 'apiKey',
    label: 'Stripe Restricted Key',
    category: 'API Keys',
    example: 'rk_live_...',
    pattern: /\brk_(?:live|test)_[A-Za-z0-9]{16,}\b/g,
    replacementToken: '[STRIPE_RESTRICTED_KEY]',
  },
  {
    id: 'stripe-webhook-secret',
    type: 'token',
    label: 'Stripe Webhook Secret',
    category: 'Tokens & Secrets',
    example: 'whsec_...',
    pattern: /\bwhsec_[A-Za-z0-9]{16,}\b/g,
    replacementToken: '[STRIPE_WEBHOOK_SECRET]',
  },
  {
    id: 'aws-access-key',
    type: 'awsKey',
    label: 'AWS Access Key',
    category: 'API Keys',
    example: 'AKIAIOSFODNN7EXAMPLE',
    pattern: /\b(?:A3T[A-Z0-9]|AKIA|ASIA|AGPA|AIDA|AROA|ANPA)[A-Z0-9]{16}\b/g,
    replacementToken: '[AWS_ACCESS_KEY]',
  },
  {
    id: 'github-fine-grained-token',
    type: 'token',
    label: 'GitHub Fine-Grained Token',
    category: 'Tokens & Secrets',
    example: 'github_pat_...',
    pattern: /\bgithub_pat_[A-Za-z0-9_]{20,}\b/g,
    replacementToken: '[GITHUB_FINE_GRAINED_TOKEN]',
  },
  {
    id: 'github-personal-access-token',
    type: 'token',
    label: 'GitHub Personal Access Token',
    category: 'Tokens & Secrets',
    example: 'ghp_...',
    pattern: /\bghp_[A-Za-z0-9]{20,}\b/g,
    replacementToken: '[GITHUB_PAT]',
  },
  {
    id: 'github-oauth-token',
    type: 'token',
    label: 'GitHub OAuth Token',
    category: 'Tokens & Secrets',
    example: 'gho_...',
    pattern: /\b(?:gho|ghu|ghs|ghr)_[A-Za-z0-9]{20,}\b/g,
    replacementToken: '[GITHUB_TOKEN]',
  },
  {
    id: 'slack-bot-token',
    type: 'token',
    label: 'Slack Bot Token',
    category: 'Tokens & Secrets',
    example: 'xoxb-...',
    pattern: /\bxoxb-[A-Za-z0-9-]{20,}\b/g,
    replacementToken: '[SLACK_BOT_TOKEN]',
  },
  {
    id: 'slack-user-token',
    type: 'token',
    label: 'Slack User Token',
    category: 'Tokens & Secrets',
    example: 'xoxp-...',
    pattern: /\bxoxp-[A-Za-z0-9-]{20,}\b/g,
    replacementToken: '[SLACK_USER_TOKEN]',
  },
  {
    id: 'slack-app-token',
    type: 'token',
    label: 'Slack App Token',
    category: 'Tokens & Secrets',
    example: 'xapp-...',
    pattern: /\bxapp-[A-Za-z0-9-]{20,}\b/g,
    replacementToken: '[SLACK_APP_TOKEN]',
  },
  {
    id: 'slack-webhook',
    type: 'url',
    label: 'Slack Webhook URL',
    category: 'URLs & Network',
    example: 'https://hooks.slack.com/services/...',
    pattern: /\bhttps:\/\/hooks\.slack(?:-gov)?\.com\/services\/[A-Z0-9]+\/[A-Z0-9]+\/[A-Za-z0-9]+\b/g,
    replacementToken: '[SLACK_WEBHOOK_URL]',
  },
  {
    id: 'discord-webhook',
    type: 'url',
    label: 'Discord Webhook URL',
    category: 'URLs & Network',
    example: 'https://discord.com/api/webhooks/...',
    pattern: /\bhttps:\/\/(?:discord(?:app)?\.com)\/api\/webhooks\/\d+\/[A-Za-z0-9_-]+\b/g,
    replacementToken: '[DISCORD_WEBHOOK_URL]',
  },
  {
    id: 'google-api-key',
    type: 'apiKey',
    label: 'Google API Key',
    category: 'API Keys',
    example: 'AIzaSy...',
    pattern: /\bAIza[0-9A-Za-z_-]{20,}\b/g,
    replacementToken: '[GOOGLE_API_KEY]',
  },
  {
    id: 'sendgrid-api-key',
    type: 'apiKey',
    label: 'SendGrid API Key',
    category: 'API Keys',
    example: 'SG.x.y',
    pattern: /\bSG\.[A-Za-z0-9_-]{16,}\.[A-Za-z0-9_-]{16,}\b/g,
    replacementToken: '[SENDGRID_API_KEY]',
  },
  {
    id: 'mailchimp-api-key',
    type: 'apiKey',
    label: 'Mailchimp API Key',
    category: 'API Keys',
    example: '012345...-us5',
    pattern: /\b[a-f0-9]{32}-us\d{1,2}\b/gi,
    replacementToken: '[MAILCHIMP_API_KEY]',
  },
  {
    id: 'twilio-api-key',
    type: 'apiKey',
    label: 'Twilio API Key',
    category: 'API Keys',
    example: 'SK1234...',
    pattern: /\bSK[0-9a-fA-F]{32}\b/g,
    replacementToken: '[TWILIO_API_KEY]',
  },
  {
    id: 'shopify-admin-token',
    type: 'token',
    label: 'Shopify Admin Token',
    category: 'Tokens & Secrets',
    example: 'shpat_...',
    pattern: /\bshpat_[A-Za-z0-9]{16,}\b/g,
    replacementToken: '[SHOPIFY_ADMIN_TOKEN]',
  },
  {
    id: 'square-access-token',
    type: 'token',
    label: 'Square Access Token',
    category: 'Tokens & Secrets',
    example: 'sq0atp-...',
    pattern: /\bsq0atp-[A-Za-z0-9_-]{16,}\b/g,
    replacementToken: '[SQUARE_ACCESS_TOKEN]',
  },
  {
    id: 'digitalocean-token',
    type: 'token',
    label: 'DigitalOcean Token',
    category: 'Tokens & Secrets',
    example: 'dop_v1_...',
    pattern: /\bdop_v1_[A-Za-z0-9_-]{16,}\b/g,
    replacementToken: '[DIGITALOCEAN_TOKEN]',
  },
  {
    id: 'huggingface-token',
    type: 'token',
    label: 'Hugging Face Token',
    category: 'Tokens & Secrets',
    example: 'hf_...',
    pattern: /\bhf_[A-Za-z0-9]{20,}\b/g,
    replacementToken: '[HUGGINGFACE_TOKEN]',
  },
  {
    id: 'mapbox-token',
    type: 'token',
    label: 'Mapbox Token',
    category: 'Tokens & Secrets',
    example: 'pk.ey...',
    pattern: /\b(?:pk|sk)\.[A-Za-z0-9_-]{20,}\b/g,
    replacementToken: '[MAPBOX_TOKEN]',
  },
  {
    id: 'generic-bearer-token',
    type: 'token',
    label: 'Bearer Token',
    category: 'Tokens & Secrets',
    example: 'Bearer eyJ...',
    pattern: /\bBearer\s+[A-Za-z0-9\-._~+/]+=*\b/g,
    replacementToken: '[BEARER_TOKEN]',
    validate: isLikelyBearerToken,
  },
  {
    id: 'jwt-token',
    type: 'token',
    label: 'JWT',
    category: 'Tokens & Secrets',
    example: 'eyJhbGciOi...',
    pattern: /\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9._-]+\.[A-Za-z0-9._-]+\b/g,
    replacementToken: '[JWT]',
    validate: isLikelyJwt,
  },
  {
    id: 'access-token-param',
    type: 'token',
    label: 'Access Token Parameter',
    category: 'Tokens & Secrets',
    example: 'access_token=...',
    pattern: /\b(?:token|access_token|api_token|refresh_token)[=:][A-Za-z0-9._-]{16,}\b/g,
    replacementToken: '[TOKEN]',
    replaceFallbackToken: '[SENSITIVE_VALUE]',
  },
  {
    id: 'email',
    type: 'email',
    label: 'Email Address',
    category: 'PII & Finance',
    example: 'team@company.com',
    pattern: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
    replacementToken: '[EMAIL]',
    replaceFallbackToken: '[SENSITIVE_CONTACT]',
  },
  {
    id: 'date-of-birth',
    type: 'dob',
    label: 'Date of Birth',
    category: 'PII & Finance',
    example: 'DOB: 1991-04-12',
    pattern: new RegExp(
      `\\b(?:dob|date\\s*of\\s*birth|birthdate)\\s*[:=-]?\\s*(?:\\d{4}[-/.]\\d{1,2}[-/.]\\d{1,2}|\\d{1,2}[-/.]\\d{1,2}[-/.]\\d{2,4}|\\d{1,2}\\s+${monthNames}\\s+\\d{2,4}|${monthNames}\\s+\\d{1,2},?\\s+\\d{2,4})\\b`,
      'gi',
    ),
    replacementToken: '[DATE_OF_BIRTH]',
    replaceFallbackToken: '[SENSITIVE_DATE]',
    validate: isLikelyDob,
  },
  {
    id: 'url',
    type: 'url',
    label: 'URL',
    category: 'URLs & Network',
    example: 'https://internal.company.com',
    pattern: /\bhttps?:\/\/[^\s/$.?#].[^\s]*\b/gi,
    replacementToken: '[URL]',
    replaceFallbackToken: '[SENSITIVE_URL]',
  },
  {
    id: 'ipv4',
    type: 'ipAddress',
    label: 'IPv4 Address',
    category: 'URLs & Network',
    example: '10.0.0.15',
    pattern: /\b(?:(?:25[0-5]|2[0-4]\d|1?\d?\d)\.){3}(?:25[0-5]|2[0-4]\d|1?\d?\d)\b/g,
    replacementToken: '[IP_ADDRESS]',
  },
  {
    id: 'ssn',
    type: 'ssn',
    label: 'US SSN',
    category: 'PII & Finance',
    example: '123-45-6789',
    pattern: /\b\d{3}-\d{2}-\d{4}\b/g,
    replacementToken: '[SSN]',
  },
  {
    id: 'iban',
    type: 'iban',
    label: 'IBAN',
    category: 'PII & Finance',
    example: 'GB82WEST12345698765432',
    pattern: /\b[A-Z]{2}\d{2}[A-Z0-9]{11,30}\b/g,
    replacementToken: '[IBAN]',
    validate: isLikelyIban,
  },
  {
    id: 'swift-bic',
    type: 'banking',
    label: 'SWIFT / BIC',
    category: 'PII & Finance',
    example: 'DEUTDEFF500',
    pattern: /\b[A-Z]{6}[A-Z0-9]{2}(?:[A-Z0-9]{3})?\b/g,
    replacementToken: '[SWIFT_BIC]',
    replaceFallbackToken: '[SENSITIVE_CODE]',
  },
  {
    id: 'ifsc',
    type: 'banking',
    label: 'IFSC Code',
    category: 'PII & Finance',
    example: 'HDFC0001234',
    pattern: /\b[A-Z]{4}0[A-Z0-9]{6}\b/g,
    replacementToken: '[IFSC]',
  },
  {
    id: 'upi-id',
    type: 'banking',
    label: 'UPI ID',
    category: 'PII & Finance',
    example: 'name@oksbi',
    pattern: /\b[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}[a-zA-Z0-9._-]{1,}\b/g,
    replacementToken: '[UPI_ID]',
    replaceFallbackToken: '[SENSITIVE_ID]',
  },
  {
    id: 'routing-number',
    type: 'banking',
    label: 'Routing Number',
    category: 'PII & Finance',
    example: 'routing: 021000021',
    pattern: /\b(?:routing|aba)\s*(?:number|no)?\s*[:=-]?\s*\d{9}\b/gi,
    replacementToken: '[ROUTING_NUMBER]',
    replaceFallbackToken: '[SENSITIVE_BANKING]',
  },
  {
    id: 'bank-account',
    type: 'banking',
    label: 'Bank Account Number',
    category: 'PII & Finance',
    example: 'account number: 123456789012',
    pattern: /\b(?:account|acct)(?:\s*(?:number|no))?\s*[:=-]?\s*[A-Z0-9]{8,20}\b/gi,
    replacementToken: '[BANK_ACCOUNT]',
    replaceFallbackToken: '[SENSITIVE_BANKING]',
    validate: hasAtLeastOneDigit,
  },
  {
    id: 'phone',
    type: 'phone',
    label: 'Phone Number',
    category: 'PII & Finance',
    example: '+1 555 0199',
    pattern: /(?<!\w)(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{1,4}\)?[\s.-]?)?(?:\d[\s.-]?){6,14}\d\b/g,
    replacementToken: '[PHONE]',
    replaceFallbackToken: '[SENSITIVE_NUMBER]',
    validate: isLikelyPhone,
  },
  {
    id: 'credit-card',
    type: 'creditCard',
    label: 'Credit Card',
    category: 'PII & Finance',
    example: '4242 4242 4242 4242',
    pattern: /\b(?:\d[ -]*?){13,19}\b/g,
    replacementToken: '[CREDIT_CARD]',
    validate: isLikelyCreditCard,
  },
  {
    id: 'card-expiry',
    type: 'creditCard',
    label: 'Card Expiry',
    category: 'PII & Finance',
    example: 'exp: 08/28',
    pattern: /\b(?:exp|expiry|expiration)\s*[:=-]?\s*(?:0[1-9]|1[0-2])(?:[/-])(?:\d{2}|\d{4})\b/gi,
    replacementToken: '[CARD_EXPIRY]',
  },
  {
    id: 'card-cvv',
    type: 'creditCard',
    label: 'Card Security Code',
    category: 'PII & Finance',
    example: 'cvv: 123',
    pattern: /\b(?:cvv|cvc|cvn|security\s*code)\s*[:=-]?\s*\d{3,4}\b/gi,
    replacementToken: '[CARD_SECURITY_CODE]',
  },
  {
    id: 'private-key',
    type: 'privateKey',
    label: 'Private Key Block',
    category: 'Tokens & Secrets',
    example: '-----BEGIN PRIVATE KEY-----',
    pattern: /-----BEGIN(?:[\sA-Z]+)?PRIVATE KEY-----[\s\S]*?-----END(?:[\sA-Z]+)?PRIVATE KEY-----/g,
    replacementToken: '[PRIVATE_KEY]',
  },
  {
    id: 'password-assignment',
    type: 'credential',
    label: 'Password Assignment',
    category: 'Credentials',
    example: 'password=mySecret123',
    pattern: /\b(?:password|passwd|pwd|passphrase)\s*[:=]\s*[^\s"'`;,]{4,}\b/gi,
    replacementToken: '[PASSWORD]',
  },
  {
    id: 'username-assignment',
    type: 'credential',
    label: 'Username Assignment',
    category: 'Credentials',
    example: 'username=admin',
    pattern: /\b(?:username|user|login)\s*[:=]\s*[A-Za-z0-9._@-]{3,}\b/gi,
    replacementToken: '[USERNAME]',
    replaceFallbackToken: '[SENSITIVE_VALUE]',
  },
];

export const BUILT_IN_PATTERN_COUNT = builtInPatterns.length;

export const builtInPatternGroups = builtInPatterns.reduce<Record<string, BuiltInPatternDefinition[]>>(
  (groups, pattern) => {
    if (!groups[pattern.category]) {
      groups[pattern.category] = [];
    }

    groups[pattern.category].push(pattern);
    return groups;
  },
  {},
);
