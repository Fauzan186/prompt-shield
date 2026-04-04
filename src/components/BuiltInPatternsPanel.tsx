import { BUILT_IN_PATTERN_COUNT, builtInPatternGroups } from '@/features/prompt/builtInPatterns';

interface BuiltInPatternsPanelProps {
  compact?: boolean;
}

export const BuiltInPatternsPanel = ({ compact = false }: BuiltInPatternsPanelProps) => {
  const categories = Object.entries(builtInPatternGroups);

  return (
    <details className="group rounded-[1.4rem] border border-white/10 bg-slate-950/55 open:bg-slate-950/70">
      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-4 py-3 text-left">
        <div>
          <div className="text-sm font-semibold text-white">Built-in Patterns</div>
          <div className="mt-1 text-xs text-slate-400">
            View {BUILT_IN_PATTERN_COUNT} built-in detectors used by PromptShield.
          </div>
        </div>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-semibold text-slate-200 transition group-open:rotate-180">
          v
        </span>
      </summary>

      <div className={`border-t border-white/10 ${compact ? 'px-3 py-3' : 'px-4 py-4'}`}>
        <div className="space-y-4">
          {categories.map(([category, items]) => (
            <div key={category} className="rounded-[1.2rem] bg-white/[0.035] px-3 py-3">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                {category}
              </div>
              <div className={`mt-3 grid gap-2 ${compact ? '' : 'sm:grid-cols-2'}`}>
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[1rem] border border-white/8 bg-slate-950/70 px-3 py-2.5"
                  >
                    <div className="text-sm font-medium text-white">{item.label}</div>
                    <div className="mt-1 text-xs text-slate-400">{item.example}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </details>
  );
};
