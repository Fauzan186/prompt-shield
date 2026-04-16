# PromptShield

Privacy-first prompt protection for modern AI workflows.

PromptShield helps detect and sanitize sensitive data before it is shared through AI tools, browser inputs, support workflows, and web forms. It is available as both a web app and a Chrome extension, with all detection and sanitization running locally in the browser.

## Product Highlights

- Browser-first privacy with no prompt scanning backend
- Chrome extension for live input and paste sanitization
- Web app for manual prompt review and cleanup
- Three sanitization modes: `Mask`, `Remove`, and `Replace`
- Built-in detection for keys, tokens, credentials, URLs, finance-related values, and common PII
- Custom dictionary and custom regex rules

## Live Product

- Website: [https://promptshield.in](https://promptshield.in)
- Chrome Extension: [https://chromewebstore.google.com/detail/promptshield/ngpdelcnkpikcjajmmlihiacaecomlme?authuser=1&hl=en](https://chromewebstore.google.com/detail/promptshield/ngpdelcnkpikcjajmmlihiacaecomlme?authuser=1&hl=en)
- Privacy Policy: [https://promptshield.in/privacy](https://promptshield.in/privacy)
- Contact: [https://promptshield.in/contact](https://promptshield.in/contact)

## What PromptShield Detects

PromptShield ships with **47 built-in patterns** across:

- API keys
- Access tokens and webhooks
- Emails and phone numbers
- URLs and IP addresses
- Credit-card and banking-related values
- Password and credential-style assignments
- Date of birth, SSN, IBAN, and similar structured values

PromptShield also supports:

- Custom dictionary terms
- Custom regex rules

## Sanitization Modes

### `Mask`
Best default for safety and readability.

Example:

```text
finance@company.com -> f*****************m
```

### `Remove`
Deletes the detected value entirely.

Example:

```text
API key: sk-123... -> API key:
```

### `Replace`
Swaps detected values for placeholders.

PromptShield uses safer generic placeholders for ambiguous patterns and more specific placeholders for strong matches.

Examples:

```text
sk-proj-... -> [OPENAI_PROJECT_KEY]
john@company.com -> [SENSITIVE_CONTACT]
4242 4242 4242 4242 -> [CREDIT_CARD]
```

## Chrome Extension Features

- Enable or disable protection
- Live sanitization while typing
- Instant paste sanitization
- Optional accidental-send review
- Custom rule management in the popup
- Built-in pattern viewer
- Local settings and local usage stats

### Install the Chrome Extension

Install PromptShield from the Chrome Web Store:

[https://chromewebstore.google.com/detail/promptshield/ngpdelcnkpikcjajmmlihiacaecomlme?authuser=1&hl=en](https://chromewebstore.google.com/detail/promptshield/ngpdelcnkpikcjajmmlihiacaecomlme?authuser=1&hl=en)

## Web App Features

- Paste prompt content into a dedicated workspace
- Scan and sanitize manually
- Review detected items
- Copy cleaned output
- View built-in pattern coverage

## Privacy

PromptShield is designed to keep prompt handling local.

- No backend prompt processing
- No remote code
- No prompt content sent to external servers for scanning
- Local browser storage only for settings and extension preferences

## Tech Stack

- React
- Vite
- TypeScript
- Tailwind CSS
- Redux Toolkit
- Chrome Extension Manifest V3

## Getting Started

### Install dependencies

```bash
npm install
```

### Start the web app

```bash
npm run dev
```

### Build the project

```bash
npm run build
```

## Environment Variables

Create a `.env` file in the project root:

```env
VITE_APP_NAME=PromptShield
VITE_APP_TITLE=PromptShield | AI Prompt Sanitizer
```

## Project Structure

```text
src/
├── app/                     # Redux store setup
├── components/              # Shared UI components
├── extension/               # Chrome extension popup and content script
├── features/prompt/         # Prompt logic, built-in patterns, sanitization
├── hooks/                   # Reusable hooks
├── pages/                   # Landing, app, privacy, terms, contact
├── types/                   # Shared TypeScript types
├── App.tsx
├── main.tsx
└── index.css
```

## Loading the Chrome Extension

After building:

```bash
npm run build
```

Then:

1. Open `chrome://extensions`
2. Enable `Developer mode`
3. Click `Load unpacked`
4. Select the `dist` folder

## Recommended QA Checklist

- Test `Mask`, `Remove`, and `Replace` in the web app
- Test paste sanitization in a normal `input`
- Test paste sanitization in a normal `textarea`
- Test live sanitization in ChatGPT
- Test custom dictionary rules
- Test custom regex rules
- Test the extension popup reset flow
- Test accidental-send review if enabled

## Product Notes

- `Mask` is the safest default mode
- `Replace` is designed to stay readable while avoiding misleading labels on ambiguous patterns
- Detection is best-effort and should be treated as a protection layer, not a legal or compliance guarantee

## License

MIT
