import { useAppSelector } from '@/hooks/redux';

const typeBadgeStyles: Record<string, string> = {
  apiKey: 'bg-rose-500/10 text-rose-300 ring-1 ring-inset ring-rose-500/20',
  awsKey: 'bg-red-500/10 text-red-300 ring-1 ring-inset ring-red-500/20',
  credential: 'bg-orange-500/10 text-orange-300 ring-1 ring-inset ring-orange-500/20',
  banking: 'bg-emerald-500/10 text-emerald-300 ring-1 ring-inset ring-emerald-500/20',
  privateKey: 'bg-pink-500/10 text-pink-300 ring-1 ring-inset ring-pink-500/20',
  email: 'bg-sky-500/10 text-sky-300 ring-1 ring-inset ring-sky-500/20',
  phone: 'bg-amber-500/10 text-amber-300 ring-1 ring-inset ring-amber-500/20',
  url: 'bg-violet-500/10 text-violet-300 ring-1 ring-inset ring-violet-500/20',
  slackWebhook: 'bg-indigo-500/10 text-indigo-300 ring-1 ring-inset ring-indigo-500/20',
  ipAddress: 'bg-cyan-500/10 text-cyan-300 ring-1 ring-inset ring-cyan-500/20',
  ssn: 'bg-lime-500/10 text-lime-300 ring-1 ring-inset ring-lime-500/20',
  dob: 'bg-yellow-500/10 text-yellow-300 ring-1 ring-inset ring-yellow-500/20',
  iban: 'bg-teal-500/10 text-teal-300 ring-1 ring-inset ring-teal-500/20',
  creditCard: 'bg-fuchsia-500/10 text-fuchsia-300 ring-1 ring-inset ring-fuchsia-500/20',
  token: 'bg-orange-500/10 text-orange-300 ring-1 ring-inset ring-orange-500/20',
};

export const DetectedItemsList = () => {
  const detectedItems = useAppSelector((state) => state.prompt.detectedItems);
  const totalCount = detectedItems.length;

  if (!detectedItems.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-800 bg-slate-950/50 px-4 py-5 text-sm text-slate-400">
        Nothing detected yet. Run a scan to see what PromptShield found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-slate-950/45 px-4 py-3">
        <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Summary</div>
        <div className="mt-2 text-2xl font-semibold text-white">{totalCount}</div>
        <div className="text-sm text-slate-400">sensitive matches found</div>
      </div>

      <ul className="space-y-3">
        {detectedItems.map((item) => (
          <li
            key={item.id}
            className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="text-sm font-medium text-white">{item.label}</div>
                <div className="mt-1 break-all text-sm leading-6 text-slate-400">{item.value}</div>
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
    </div>
  );
};
