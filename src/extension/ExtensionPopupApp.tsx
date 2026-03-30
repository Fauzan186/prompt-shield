import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/Button';
import { sanitizePrompt } from '@/features/prompt/promptUtils';
import type { DetectedItem, SanitizeMode } from '@/types/prompt';

interface ExtensionSettings {
  mode: SanitizeMode;
  autoMaskEnabled: boolean;
  blockSubmissionEnabled: boolean;
  customDictionary: string[];
  customPatterns: string[];
}

const STORAGE_KEY = 'promptshield_settings';

const defaultSettings: ExtensionSettings = {
  mode: 'replace',
  autoMaskEnabled: true,
  blockSubmissionEnabled: true,
  customDictionary: [],
  customPatterns: [],
};

const modeOptions: Array<{ label: string; value: SanitizeMode }> = [
  { label: 'Mask', value: 'mask' },
  { label: 'Replace', value: 'replace' },
  { label: 'Remove', value: 'remove' },
];

const samplePrompt = `Use sk-1234567890abcdef1234567890 and email ops@company.com.
Temporary token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo.signature`;

const parseLines = (value: string): string[] =>
  value
    .split('\n')
    .map((entry) => entry.trim())
    .filter(Boolean);

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const applyCustomRules = (
  text: string,
  mode: SanitizeMode,
  dictionary: string[],
  patterns: string[],
): string => {
  let nextText = text;

  dictionary.forEach((entry) => {
    const regex = new RegExp(escapeRegExp(entry), 'gi');
    nextText = nextText.replace(regex, () => {
      if (mode === 'remove') {
        return '';
      }

      if (mode === 'replace') {
        return '[CUSTOM_TERM]';
      }

      return '*'.repeat(Math.max(8, entry.length));
    });
  });

  patterns.forEach((pattern) => {
    try {
      const regex = new RegExp(pattern, 'gi');
      nextText = nextText.replace(regex, (match) => {
        if (mode === 'remove') {
          return '';
        }

        if (mode === 'replace') {
          return '[CUSTOM_PATTERN]';
        }

        return '*'.repeat(Math.max(8, match.length));
      });
    } catch {
      // Ignore invalid user-supplied expressions in the popup preview.
    }
  });

  return nextText;
};

const detectCustomItems = (text: string, dictionary: string[], patterns: string[]): DetectedItem[] => {
  const items: DetectedItem[] = [];

  dictionary.forEach((entry, index) => {
    const regex = new RegExp(escapeRegExp(entry), 'gi');
    const matches = text.match(regex);

    matches?.forEach((value, matchIndex) => {
      items.push({
        id: `custom-term-${index}-${matchIndex}`,
        type: 'token',
        value,
        label: 'Custom Dictionary Match',
      });
    });
  });

  patterns.forEach((pattern, index) => {
    try {
      const regex = new RegExp(pattern, 'gi');
      const matches = text.match(regex);

      matches?.forEach((value, matchIndex) => {
        items.push({
          id: `custom-pattern-${index}-${matchIndex}`,
          type: 'token',
          value,
          label: 'Custom Pattern Match',
        });
      });
    } catch {
      // Ignore invalid user-supplied expressions in the popup preview.
    }
  });

  return items;
};

const sanitizeWithSettings = (text: string, settings: ExtensionSettings) => {
  const baseResult = sanitizePrompt(text, settings.mode);
  const customDetected = detectCustomItems(text, settings.customDictionary, settings.customPatterns);
  const sanitizedText = applyCustomRules(
    baseResult.sanitizedText,
    settings.mode,
    settings.customDictionary,
    settings.customPatterns,
  );

  return {
    sanitizedText,
    detectedItems: [...baseResult.detectedItems, ...customDetected],
  };
};

export const ExtensionPopupApp = () => {
  const [input, setInput] = useState('');
  const [settings, setSettings] = useState<ExtensionSettings>(defaultSettings);
  const [sanitized, setSanitized] = useState('');
  const [detected, setDetected] = useState<DetectedItem[]>([]);
  const [copied, setCopied] = useState(false);
  const [saveState, setSaveState] = useState<'idle' | 'saved'>('idle');
  const [dictionaryText, setDictionaryText] = useState('');
  const [patternsText, setPatternsText] = useState('');

  useEffect(() => {
    if (typeof chrome === 'undefined' || !chrome.storage?.local) {
      return;
    }

    chrome.storage.local.get([STORAGE_KEY], (result) => {
      const stored = result[STORAGE_KEY] as ExtensionSettings | undefined;
      const nextSettings = stored ? { ...defaultSettings, ...stored } : defaultSettings;

      setSettings(nextSettings);
      setDictionaryText(nextSettings.customDictionary.join('\n'));
      setPatternsText(nextSettings.customPatterns.join('\n'));
    });
  }, []);

  const customCounts = useMemo(
    () => ({
      dictionary: parseLines(dictionaryText).length,
      patterns: parseLines(patternsText).length,
    }),
    [dictionaryText, patternsText],
  );

  const buildDraftSettings = (): ExtensionSettings => ({
    ...settings,
    customDictionary: parseLines(dictionaryText),
    customPatterns: parseLines(patternsText),
  });

  const handleScan = () => {
    const result = sanitizeWithSettings(input, buildDraftSettings());
    setSanitized(result.sanitizedText);
    setDetected(result.detectedItems);
  };

  const handleSaveSettings = () => {
    const nextSettings = buildDraftSettings();

    setSettings(nextSettings);

    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      chrome.storage.local.set({ [STORAGE_KEY]: nextSettings }, () => {
        setSaveState('saved');
        window.setTimeout(() => setSaveState('idle'), 1500);
      });
      return;
    }

    setSaveState('saved');
    window.setTimeout(() => setSaveState('idle'), 1500);
  };

  const handleCopy = async () => {
    if (!sanitized) {
      return;
    }

    await navigator.clipboard.writeText(sanitized);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <main className="min-h-screen w-[400px] bg-slate-950 text-slate-100">
      <div className="relative overflow-hidden px-4 py-4">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.22),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(251,113,133,0.16),_transparent_30%),linear-gradient(180deg,_rgba(15,23,42,0.92),_rgba(2,6,23,0.98))]" />
        <div className="relative space-y-4">
          <header className="rounded-[1.65rem] border border-white/10 bg-[linear-gradient(180deg,rgba(15,23,42,0.82),rgba(15,23,42,0.68))] p-4 shadow-[0_24px_64px_rgba(2,6,23,0.34)] backdrop-blur">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <img src="/logo-mark.svg" alt="PromptShield logo" className="h-11 w-11 rounded-2xl" />
                <div>
                  <div className="text-sm font-semibold tracking-[0.18em] text-slate-100">
                    PROMPTSHIELD
                  </div>
                  <div className="text-xs text-slate-400">Chrome Extension</div>
                </div>
              </div>
              <div className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-2.5 py-1 text-[11px] font-semibold text-emerald-200">
                Local Only
              </div>
            </div>

            <div className="mt-4">
              <h1 className="text-lg font-semibold text-white">Protect prompts before they leave the page.</h1>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Auto mask sensitive text, block accidental sends, and manage your own detection rules in one place.
              </p>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2.5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Masking</div>
                <div className="mt-1 text-sm font-medium text-slate-100">Real time</div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2.5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Blocking</div>
                <div className="mt-1 text-sm font-medium text-slate-100">Enter + submit</div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/5 px-3 py-2.5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Custom</div>
                <div className="mt-1 text-sm font-medium text-slate-100">Terms + regex</div>
              </div>
            </div>

            <p className="mt-4 rounded-2xl border border-white/8 bg-slate-950/45 px-3 py-3 text-xs leading-6 text-slate-400">
              Changes save to this browser and apply directly on supported text fields across pages.
            </p>
          </header>

          <section className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-4 backdrop-blur">
            <div className="mb-3 text-sm font-semibold text-white">Extension Settings</div>

            <div className="grid gap-3">
              <label className="flex items-center justify-between rounded-[1.1rem] border border-slate-800 bg-slate-950/70 px-3 py-3">
                <div>
                  <div className="text-sm font-medium text-white">Auto mask while typing</div>
                  <div className="text-xs text-slate-500">Mask supported input fields automatically.</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.autoMaskEnabled}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      autoMaskEnabled: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 accent-[rgb(255,107,87)]"
                />
              </label>

              <label className="flex items-center justify-between rounded-[1.1rem] border border-slate-800 bg-slate-950/70 px-3 py-3">
                <div>
                  <div className="text-sm font-medium text-white">Block accidental send</div>
                  <div className="text-xs text-slate-500">Stop Enter/submit if sensitive data is detected.</div>
                </div>
                <input
                  type="checkbox"
                  checked={settings.blockSubmissionEnabled}
                  onChange={(event) =>
                    setSettings((current) => ({
                      ...current,
                      blockSubmissionEnabled: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 accent-[rgb(255,107,87)]"
                />
              </label>
            </div>

            <div className="mt-3">
              <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                Default mode
              </div>
              <div className="grid grid-cols-3 gap-2">
                {modeOptions.map((option) => {
                  const active = option.value === settings.mode;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() =>
                        setSettings((current) => ({
                          ...current,
                          mode: option.value,
                        }))
                      }
                      className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                        active
                          ? 'border-accent-400/30 bg-accent-500/12 text-white'
                          : 'border-slate-800 bg-slate-950/70 text-slate-300 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="mt-3 grid gap-3">
              <label className="block">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Custom dictionary
                  </span>
                  <span className="text-xs text-slate-500">{customCounts.dictionary} entries</span>
                </div>
                <textarea
                  value={dictionaryText}
                  onChange={(event) => setDictionaryText(event.target.value)}
                  rows={3}
                  placeholder="One term per line"
                  className="w-full rounded-[1.1rem] border border-slate-800 bg-slate-950/80 px-3 py-3 text-xs text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-accent-400 focus:ring-2 focus:ring-accent-500/20"
                />
              </label>

              <label className="block">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    Custom regex patterns
                  </span>
                  <span className="text-xs text-slate-500">{customCounts.patterns} patterns</span>
                </div>
                <textarea
                  value={patternsText}
                  onChange={(event) => setPatternsText(event.target.value)}
                  rows={3}
                  placeholder="One regex per line"
                  className="w-full rounded-[1.1rem] border border-slate-800 bg-slate-950/80 px-3 py-3 text-xs text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-accent-400 focus:ring-2 focus:ring-accent-500/20"
                />
              </label>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button variant="primary" onClick={handleSaveSettings} className="px-4 py-2.5 text-xs">
                Save Settings
              </Button>
              {saveState === 'saved' ? (
                <span className="text-xs font-medium text-emerald-300">Saved</span>
              ) : null}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-4 backdrop-blur">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold text-white">Prompt Input</div>
              <button
                type="button"
                onClick={() => setInput(samplePrompt)}
                className="text-xs font-medium text-accent-300 transition hover:text-accent-200"
              >
                Load Sample
              </button>
            </div>

            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              rows={7}
              placeholder="Paste prompt text here..."
              className="w-full rounded-[1.25rem] border border-slate-800 bg-slate-950/80 px-3 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-accent-400 focus:ring-2 focus:ring-accent-500/20"
            />

            <div className="mt-3 flex flex-wrap gap-2">
              <Button variant="primary" onClick={handleScan} className="px-4 py-2.5 text-xs">
                Scan &amp; Sanitize
              </Button>
              <Button
                variant="reset"
                onClick={() => {
                  setInput('');
                  setSanitized('');
                  setDetected([]);
                }}
                className="px-4 py-2.5 text-xs"
              >
                Clear
              </Button>
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-4 backdrop-blur">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold text-white">Sanitized Output</div>
              <Button
                variant="secondary"
                onClick={handleCopy}
                disabled={!sanitized}
                className="px-3 py-2 text-xs"
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>

            <div className="rounded-[1.25rem] border border-slate-800 bg-slate-950/80 p-3">
              {sanitized ? (
                <pre className="whitespace-pre-wrap break-words text-xs text-slate-100">
                  {sanitized}
                </pre>
              ) : (
                <p className="text-xs leading-6 text-slate-500">
                  Your cleaned prompt will appear here after scanning.
                </p>
              )}
            </div>
          </section>

          <section className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-4 backdrop-blur">
            <div className="mb-3 text-sm font-semibold text-white">
              Detected Items
              <span className="ml-2 text-xs font-medium text-slate-500">{detected.length}</span>
            </div>

            {detected.length ? (
              <ul className="space-y-2">
                {detected.map((item) => (
                  <li
                    key={item.id}
                    className="rounded-[1.1rem] border border-slate-800 bg-slate-950/70 px-3 py-3"
                  >
                    <div className="text-xs font-semibold text-white">{item.label}</div>
                    <div className="mt-1 break-all text-xs leading-6 text-slate-400">
                      {item.value}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs leading-6 text-slate-500">
                Scan a prompt to see detected values here.
              </p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
};
