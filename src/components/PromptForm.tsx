import { clearPrompt, scanAndSanitize, setInputText } from '@/features/prompt/promptSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';

const samplePrompt = `Hey team, use sk-1234567890abcdef1234567890 to connect the staging API.
Reach me at jane.doe@company.com or +1 (555) 867-5309.
Customer card on file: 4242 4242 4242 4242
Temporary auth: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo.signature
Docs are here: https://internal.company.com/secrets`;

export const PromptForm = () => {
  const dispatch = useAppDispatch();
  const inputText = useAppSelector((state) => state.prompt.inputText);

  return (
    <div className="space-y-4">
      <label className="block">
        <span className="mb-2 block text-sm font-medium text-slate-200">Prompt Input</span>
        <textarea
          value={inputText}
          onChange={(event) => dispatch(setInputText(event.target.value))}
          rows={10}
          placeholder="Paste a prompt containing emails, URLs, phone numbers, or API keys."
          className="min-h-[240px] w-full rounded-2xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-accent-400 focus:ring-2 focus:ring-accent-500/20"
        />
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => dispatch(scanAndSanitize())}
          className="inline-flex items-center justify-center rounded-2xl bg-accent-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-accent-400"
        >
          Scan &amp; Sanitize
        </button>
        <button
          type="button"
          onClick={() => dispatch(setInputText(samplePrompt))}
          className="inline-flex items-center justify-center rounded-2xl border border-slate-700 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:border-slate-600 hover:bg-slate-900"
        >
          Load Sample
        </button>
        <button
          type="button"
          onClick={() => dispatch(clearPrompt())}
          className="inline-flex items-center justify-center rounded-2xl border border-slate-800 px-5 py-3 text-sm font-semibold text-slate-400 transition hover:border-slate-700 hover:text-slate-200"
        >
          Clear
        </button>
      </div>
    </div>
  );
};
