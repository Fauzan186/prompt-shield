import { clearPrompt, scanAndSanitize, setInputText } from '@/features/prompt/promptSlice';
import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { Button } from '@/components/Button';

const samplePrompt = `Hey team, use sk-1234567890abcdef1234567890 to connect the staging API.
Reach me at jane.doe@company.com or +1 (555) 867-5309.
Customer card on file: 4242 4242 4242 4242
Temporary auth: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.demo.signature
Docs are here: https://internal.company.com/secrets`;

export const PromptForm = () => {
  const dispatch = useAppDispatch();
  const inputText = useAppSelector((state) => state.prompt.inputText);

  return (
    <div className="space-y-5">
      <label className="block">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="block text-sm font-medium text-slate-200">Prompt Input</span>
          <span className="text-xs text-slate-500">{inputText.length} characters</span>
        </div>
        <textarea
          value={inputText}
          onChange={(event) => dispatch(setInputText(event.target.value))}
          rows={10}
          placeholder="Paste a prompt containing emails, URLs, phone numbers, or API keys."
          className="min-h-[280px] w-full rounded-[1.5rem] border border-slate-800 bg-slate-950/75 px-4 py-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-accent-400 focus:ring-2 focus:ring-accent-500/20"
        />
      </label>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <Button
          variant="primary"
          onClick={() => dispatch(scanAndSanitize())}
        >
          Scan &amp; Sanitize
        </Button>
        <Button
          variant="secondary"
          onClick={() => dispatch(setInputText(samplePrompt))}
        >
          Load Sample
        </Button>
        <Button
          variant="reset"
          onClick={() => dispatch(clearPrompt())}
        >
          Clear
        </Button>
      </div>
    </div>
  );
};
