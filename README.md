# 🛡️ PromptShield

**Don’t leak secrets to AI.**
Protect your prompts before sending them to AI tools like ChatGPT, Gemini, or Claude.

---

## 🚀 What is PromptShield?

PromptShield is a **privacy-first web app** that detects and sanitizes sensitive data in your prompts — such as API keys, emails, phone numbers, and secrets — before you share them with AI tools.

✅ Runs 100% in your browser
✅ No data storage
✅ No API calls
✅ Fully secure & transparent

---

## ✨ Features

* 🔍 **Sensitive Data Detection**

  * API keys (sk-...)
  * Emails
  * Phone numbers
  * URLs
  * IP addresses

* 🔐 **Sanitization Modes**

  * Mask → `********`
  * Replace → `[API_KEY]`
  * Remove → delete completely

* ⚙️ **Custom Rules**

  * Define your own find & replace patterns

* 📋 **One-Click Copy**

  * Copy sanitized prompt instantly

* 🎯 **Real-time Processing**

  * Fast and efficient (client-side only)

---

## 🧱 Tech Stack

* ⚛️ React (Vite + TypeScript)
* 🎨 Tailwind CSS
* 🧠 Redux Toolkit
* 💾 LocalStorage (for custom rules)

---

## 📦 Installation

```bash
git clone https://github.com/YOUR_USERNAME/prompt-shield.git
cd prompt-shield
npm install
npm run dev
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root:

```env
VITE_APP_NAME=PromptShield
VITE_APP_TITLE=Protect your prompts before AI sees them
```

---

## 🧭 Project Structure

```
src/
├── app/                # Redux store
├── features/           # Feature modules (prompt logic)
├── components/         # UI components
├── pages/              # Pages (Home, etc.)
├── hooks/              # Custom hooks
├── types/              # Type definitions
├── App.tsx
├── main.tsx
└── index.css
```

---

## 🔐 Privacy First

PromptShield is built with privacy as the top priority:

* ❌ No backend
* ❌ No tracking
* ❌ No data collection
* ✅ Everything runs locally in your browser

---

## 🧪 Example

**Input:**

```
My API key is sk-1234567890abcdef and email is test@gmail.com
```

**Output (Replace Mode):**

```
My API key is [API_KEY] and email is [EMAIL]
```

---

## 🗺️ Roadmap

* [ ] Chrome Extension (auto-detect on AI tools)
* [ ] Advanced detection (AI-based)
* [ ] Highlight sensitive data in UI
* [ ] Export / download sanitized prompt
* [ ] Team / enterprise features

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repo
2. Create your feature branch
3. Commit your changes
4. Open a Pull Request

---

## 📄 License

MIT License

---

## ⭐ Support

If you like this project, give it a star ⭐ and share it with others!

---

## 💡 Tagline

> Clean your prompts before AI sees them.
