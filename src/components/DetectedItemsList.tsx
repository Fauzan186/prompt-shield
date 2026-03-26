import { useAppSelector } from '@/hooks/redux';

const typeBadgeStyles: Record<string, string> = {
  apiKey: 'bg-rose-500/10 text-rose-300 ring-1 ring-inset ring-rose-500/20',
  email: 'bg-sky-500/10 text-sky-300 ring-1 ring-inset ring-sky-500/20',
  phone: 'bg-amber-500/10 text-amber-300 ring-1 ring-inset ring-amber-500/20',
  url: 'bg-violet-500/10 text-violet-300 ring-1 ring-inset ring-violet-500/20',
};

export const DetectedItemsList = () => {
  const detectedItems = useAppSelector((state) => state.prompt.detectedItems);

  if (!detectedItems.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/50 px-4 py-5 text-sm text-slate-400">
        Nothing detected yet. Run a scan to see what PromptShield found.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {detectedItems.map((item) => (
        <li
          key={item.id}
          className="rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-4"
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="text-sm font-medium text-white">{item.label}</div>
              <div className="mt-1 break-all text-sm text-slate-400">{item.value}</div>
            </div>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-medium capitalize ${typeBadgeStyles[item.type]}`}
            >
              {item.type}
            </span>
          </div>
        </li>
      ))}
    </ul>
  );
};
