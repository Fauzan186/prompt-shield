import { setMode } from '@/features/prompt/promptSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import type { SanitizeMode } from '@/types/prompt';

const modeOptions: Array<{
  value: SanitizeMode;
  label: string;
  description: string;
}> = [
  { value: 'mask', label: 'Mask', description: 'Hide values with asterisks.' },
  { value: 'remove', label: 'Remove', description: 'Delete sensitive values entirely.' },
  { value: 'replace', label: 'Replace', description: 'Use clear placeholders for detected values.' },
];

export const ModeToggle = () => {
  const dispatch = useAppDispatch();
  const mode = useAppSelector((state) => state.prompt.mode);

  return (
    <div className="grid gap-3 md:grid-cols-3">
      {modeOptions.map((option) => {
        const isActive = option.value === mode;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => dispatch(setMode(option.value))}
            className={`rounded-2xl border px-4 py-3 text-left transition ${
              isActive
                ? 'border-accent-400/40 bg-accent-500/12 text-white shadow-[0_10px_24px_rgba(255,107,87,0.14)]'
                : 'border-slate-800 bg-slate-950/50 text-slate-300 hover:border-slate-700 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <div className="text-sm font-semibold">{option.label}</div>
            <div className={`mt-1 text-xs ${isActive ? 'text-slate-200/80' : 'text-slate-400'}`}>
              {option.description}
            </div>
          </button>
        );
      })}
    </div>
  );
};
