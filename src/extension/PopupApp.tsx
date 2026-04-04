import { useEffect, useState } from 'react';
import { Button } from '@/components/Button';
import { BuiltInPatternsPanel } from '@/components/BuiltInPatternsPanel';
import { BUILT_IN_PATTERN_COUNT } from '@/features/prompt/builtInPatterns';
import type { SanitizeMode } from '@/types/prompt';

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

interface SettingToggleProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  compact?: boolean;
}

type RuleInputType = 'dictionary' | 'pattern';
type SavedRule = { type: RuleInputType; value: string };

const STORAGE_KEY = 'promptshield_settings';
const STATS_KEY = 'promptshield_stats';

const defaultSettings: ExtensionSettings = {
  enabled: true,
  mode: 'replace',
  blockSubmissionEnabled: false,
  customDictionaryEnabled: false,
  customPatternsEnabled: false,
  customDictionary: [],
  customPatterns: [],
};

const defaultStats: ExtensionStats = {
  popupOpens: 0,
  protectedItems: 0,
  modeUsage: { mask: 0, replace: 0, remove: 0 },
};

const modeOptions: Array<{ label: string; value: SanitizeMode }> = [
  { label: 'Mask', value: 'mask' },
  { label: 'Replace', value: 'replace' },
  { label: 'Remove', value: 'remove' },
];

const SettingToggle = ({ label, description, checked, onChange, compact = false }: SettingToggleProps) => (
  <button
    type="button"
    onClick={() => onChange(!checked)}
    className={`flex items-center justify-between rounded-[1.2rem] border text-left transition ${
      checked
        ? 'border-orange-300/20 bg-[linear-gradient(135deg,rgba(249,115,22,0.14),rgba(251,113,133,0.08))] shadow-[0_16px_30px_rgba(249,115,22,0.08)]'
        : 'border-slate-800 bg-slate-950/70 hover:border-slate-700'
    } ${compact ? 'gap-3 px-2.5 py-2' : 'w-full px-3 py-3'}`}
    aria-pressed={checked}
  >
    {compact ? (
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-300">
        {checked ? 'On' : 'Off'}
      </div>
    ) : (
      <div>
        <div className="text-sm font-medium text-white">{label}</div>
        <div className="text-xs text-slate-500">{description}</div>
      </div>
    )}
    <span
      className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full border transition ${
        checked
          ? 'border-orange-300/30 bg-[linear-gradient(135deg,rgba(249,115,22,0.95),rgba(251,113,133,0.88))]'
          : 'border-slate-700 bg-slate-900'
      }`}
    >
      <span
        className={`absolute h-5 w-5 rounded-full bg-white shadow-[0_8px_18px_rgba(15,23,42,0.28)] transition ${
          checked ? 'left-6' : 'left-1'
        }`}
      />
    </span>
  </button>
);

export const ExtensionPopupApp = () => {
  const [settings, setSettings] = useState<ExtensionSettings>(defaultSettings);
  const [stats, setStats] = useState<ExtensionStats>(defaultStats);
  const [ruleInputType, setRuleInputType] = useState<RuleInputType>('dictionary');
  const [ruleDraft, setRuleDraft] = useState('');
  const [hasLoadedSettings, setHasLoadedSettings] = useState(false);

  const currentYear = new Date().getFullYear();

  useEffect(() => {
    const storage = typeof chrome === 'undefined' ? undefined : chrome.storage?.local;

    if (!storage) {
      setHasLoadedSettings(true);
      return;
    }

    storage.get([STORAGE_KEY], (result) => {
      const stored = result[STORAGE_KEY] as ExtensionSettings | undefined;
      const nextSettings = stored ? { ...defaultSettings, ...stored } : defaultSettings;
      setSettings(nextSettings);

      storage.get([STATS_KEY], (statsResult) => {
        const storedStats = statsResult[STATS_KEY] as ExtensionStats | undefined;
        const nextStats: ExtensionStats = {
          popupOpens: (storedStats?.popupOpens ?? 0) + 1,
          protectedItems: storedStats?.protectedItems ?? 0,
          modeUsage: {
            mask: storedStats?.modeUsage?.mask ?? 0,
            replace: storedStats?.modeUsage?.replace ?? 0,
            remove: storedStats?.modeUsage?.remove ?? 0,
          },
        };

        setStats(nextStats);
        storage.set({ [STATS_KEY]: nextStats }, () => {
          setHasLoadedSettings(true);
        });
      });
    });
  }, []);

  useEffect(() => {
    const storage = typeof chrome === 'undefined' ? undefined : chrome.storage?.local;
    if (!hasLoadedSettings || !storage) {
      return;
    }

    storage.set({ [STORAGE_KEY]: settings });
  }, [hasLoadedSettings, settings]);

  const addRuleItem = () => {
    const value = ruleDraft.trim();
    if (!value) {
      return;
    }

    if (ruleInputType === 'dictionary') {
      if (settings.customDictionary.includes(value)) {
        return;
      }

      setSettings((current) => ({
        ...current,
        customDictionary: [...current.customDictionary, value],
      }));
    } else {
      if (settings.customPatterns.includes(value)) {
        return;
      }

      setSettings((current) => ({
        ...current,
        customPatterns: [...current.customPatterns, value],
      }));
    }

    setRuleDraft('');
  };

  const handleReset = () => {
    setSettings(defaultSettings);
    setRuleInputType('dictionary');
    setRuleDraft('');
  };

  const savedRules: SavedRule[] = [
    ...settings.customDictionary.map((value) => ({ type: 'dictionary' as const, value })),
    ...settings.customPatterns.map((value) => ({ type: 'pattern' as const, value })),
  ];

  const removeRuleItem = (rule: SavedRule) => {
    if (rule.type === 'dictionary') {
      setSettings((current) => ({
        ...current,
        customDictionary: current.customDictionary.filter((item) => item !== rule.value),
      }));
      return;
    }

    setSettings((current) => ({
      ...current,
      customPatterns: current.customPatterns.filter((item) => item !== rule.value),
    }));
  };

  const customRulesEnabled = settings.customDictionaryEnabled || settings.customPatternsEnabled;

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
                  <div className="text-sm font-semibold tracking-[0.18em] text-slate-100">PROMPTSHIELD</div>
                  <div className="text-xs text-slate-400">Chrome Extension</div>
                </div>
              </div>
              <div
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  settings.enabled
                    ? 'border border-emerald-300/20 bg-[linear-gradient(135deg,rgba(16,185,129,0.18),rgba(52,211,153,0.12))] text-emerald-50 shadow-[0_8px_24px_rgba(16,185,129,0.12)]'
                    : 'border border-rose-300/20 bg-[linear-gradient(135deg,rgba(244,63,94,0.16),rgba(251,113,133,0.12))] text-rose-50 shadow-[0_8px_24px_rgba(244,63,94,0.12)]'
                }`}
              >
                <span
                  className={`inline-flex h-2.5 w-2.5 rounded-full ${
                    settings.enabled ? 'animate-pulse bg-emerald-300' : 'bg-rose-300'
                  }`}
                />
                {settings.enabled ? 'Live' : 'Off'}
              </div>
            </div>

            <div className="mt-3 rounded-[1rem] bg-white/[0.04] px-3 py-2 text-xs text-slate-300">
              Protect your prompts. Prevent data leaks.
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              <div className="rounded-[1.2rem] bg-white/[0.04] px-3 py-2.5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Built-in</div>
                <div className="mt-1 text-base font-semibold text-white">{BUILT_IN_PATTERN_COUNT}</div>
              </div>
              <div className="rounded-[1.2rem] bg-white/[0.04] px-3 py-2.5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Protected</div>
                <div className="mt-1 text-base font-semibold text-white">{stats.protectedItems}</div>
              </div>
              <div className="rounded-[1.2rem] bg-white/[0.04] px-3 py-2.5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Custom</div>
                <div className="mt-1 text-base font-semibold text-white">{savedRules.length}</div>
              </div>
            </div>
          </header>

          <section className="rounded-[1.5rem] border border-white/10 bg-slate-900/70 p-4 backdrop-blur">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold text-white">Default Mode</div>
              <div className="text-[11px] uppercase tracking-[0.16em] text-slate-500">Applies live</div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Choose mode</div>
                <div className="text-[11px] text-slate-500">Mask, replace, or remove</div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {modeOptions.map((option) => {
                  const active = option.value === settings.mode;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setSettings((current) => ({ ...current, mode: option.value }))}
                      className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                        active
                          ? 'border-orange-300/20 bg-[linear-gradient(135deg,rgba(249,115,22,0.16),rgba(251,113,133,0.1))] text-orange-50 shadow-[0_14px_24px_rgba(249,115,22,0.08)]'
                          : 'border-slate-800 bg-slate-950/70 text-slate-300 hover:border-slate-700 hover:text-white'
                      }`}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2">
                <div className="rounded-full bg-white/[0.04] px-3 py-2 text-[11px] text-slate-400">
                  Mask <span className="ml-1 font-semibold text-white">{stats.modeUsage.mask}</span>
                </div>
                <div className="rounded-full bg-white/[0.04] px-3 py-2 text-[11px] text-slate-400">
                  Replace <span className="ml-1 font-semibold text-white">{stats.modeUsage.replace}</span>
                </div>
                <div className="rounded-full bg-white/[0.04] px-3 py-2 text-[11px] text-slate-400">
                  Remove <span className="ml-1 font-semibold text-white">{stats.modeUsage.remove}</span>
                </div>
              </div>
            </div>

            <div className="mb-3 mt-4 flex items-center justify-between">
              <div className="text-sm font-semibold text-white">Extension Settings</div>
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1 rounded-full border border-rose-200/25 bg-rose-300/12 px-2.5 py-1 text-[11px] font-semibold text-rose-50 transition hover:border-rose-200/35 hover:bg-rose-300/18"
              >
                <span aria-hidden="true">↺</span>
                <span>Reset</span>
              </button>
            </div>

            <div className="grid gap-3">
              <SettingToggle
                label="Enable PromptShield"
                description="Turn website protection on or off."
                checked={settings.enabled}
                onChange={(checked) => setSettings((current) => ({ ...current, enabled: checked }))}
              />

              <SettingToggle
                label="Block accidental send"
                description="Review sensitive prompts before they are sent."
                checked={settings.blockSubmissionEnabled}
                onChange={(checked) =>
                  setSettings((current) => ({ ...current, blockSubmissionEnabled: checked }))
                }
              />
            </div>

            <div className="mt-4 grid gap-3">
              <div className="rounded-[1.2rem] border border-slate-800 bg-slate-950/55 p-3">
                <div className="mb-3 flex items-center justify-between">
                  <div className="pr-3">
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Custom Rules</div>
                    <p className="mt-1 text-[11px] leading-5 text-slate-500">
                      Add dictionary words or regex patterns, then manage them in one shared list.
                    </p>
                  </div>
                  <span className="shrink-0">
                    <SettingToggle
                      label="Custom Rules"
                      description=""
                      checked={customRulesEnabled}
                      onChange={(checked) =>
                        setSettings((current) => ({
                          ...current,
                          customDictionaryEnabled: checked,
                          customPatternsEnabled: checked,
                        }))
                      }
                      compact
                    />
                  </span>
                </div>

                {customRulesEnabled ? (
                  <>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setRuleInputType('dictionary')}
                        className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                          ruleInputType === 'dictionary'
                            ? 'border-orange-300/20 bg-[linear-gradient(135deg,rgba(249,115,22,0.16),rgba(251,113,133,0.1))] text-orange-50'
                            : 'border-slate-800 bg-slate-950/70 text-slate-300 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        Dictionary
                      </button>
                      <button
                        type="button"
                        onClick={() => setRuleInputType('pattern')}
                        className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                          ruleInputType === 'pattern'
                            ? 'border-orange-300/20 bg-[linear-gradient(135deg,rgba(249,115,22,0.16),rgba(251,113,133,0.1))] text-orange-50'
                            : 'border-slate-800 bg-slate-950/70 text-slate-300 hover:border-slate-700 hover:text-white'
                        }`}
                      >
                        Regex
                      </button>
                    </div>

                    <div className="mt-3 flex gap-2">
                      <input
                        value={ruleDraft}
                        onChange={(event) => setRuleDraft(event.target.value)}
                        placeholder={ruleInputType === 'dictionary' ? 'Acme Internal or CLIENT-7842' : 'INV-\\d{4,}'}
                        className="min-w-0 flex-1 rounded-[1rem] border border-slate-800 bg-slate-950/85 px-3 py-2.5 text-xs text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-accent-400 focus:ring-2 focus:ring-accent-500/20"
                      />
                      <Button variant="secondary" onClick={addRuleItem} className="gap-1 px-3 py-2.5 text-xs">
                        <span aria-hidden="true">+</span>
                        <span>Add</span>
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="rounded-[1rem] border border-dashed border-slate-800 bg-slate-950/55 px-3 py-3 text-[11px] leading-5 text-slate-500">
                    Enable custom rules to add dictionary words or regex patterns.
                  </div>
                )}

                {savedRules.length ? (
                  <div className="mt-3 space-y-2">
                    {savedRules.map((rule, index) => (
                      <div
                        key={`${rule.type}-${rule.value}`}
                        className="flex items-center gap-2.5 rounded-[0.95rem] bg-white/[0.035] px-2.5 py-2.5"
                      >
                        <div
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-2xl text-[11px] font-semibold ${
                            rule.type === 'dictionary'
                              ? 'bg-orange-400/12 text-orange-100'
                              : 'bg-rose-400/12 text-rose-100'
                          }`}
                        >
                          {(index + 1).toString().padStart(2, '0')}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                            {rule.type === 'dictionary' ? 'Dictionary' : 'Regex'}
                          </div>
                          <div className="truncate text-[13px] text-slate-100">{rule.value}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeRuleItem(rule)}
                          className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/80 text-xs font-semibold text-slate-500 transition hover:bg-slate-800 hover:text-white"
                          aria-label={`Remove ${rule.value}`}
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-3 rounded-[1rem] border border-dashed border-slate-800 bg-slate-950/55 px-3 py-3 text-[11px] leading-5 text-slate-500">
                    Examples: <span className="text-slate-300">Acme Internal</span> or{' '}
                    <span className="text-slate-300">{'INV-\\d{4,}'}</span>
                  </div>
                )}
              </div>
            </div>
          </section>

          <BuiltInPatternsPanel compact />

          <footer className="rounded-[1.3rem] border border-white/8 bg-slate-950/55 px-4 py-2.5 text-center text-[11px] leading-4.5 text-slate-500">
            <div>
              © {currentYear}{' '}
              <a
                href="https://promptshield.in/"
                target="_blank"
                rel="noreferrer"
                className="font-semibold text-orange-200 transition hover:text-white"
              >
                PromptShield
              </a>
              . All rights reserved.
            </div>
            <div>Detection is best-effort and not a guarantee.</div>
          </footer>
        </div>
      </div>
    </main>
  );
};
