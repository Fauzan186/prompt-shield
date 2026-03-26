import { useState } from 'react';
import { useAppSelector } from '@/hooks/redux';

export const SanitizedOutput = () => {
  const [copied, setCopied] = useState(false);
  const sanitizedText = useAppSelector((state) => state.prompt.sanitizedText);

  const handleCopy = async () => {
    if (!sanitizedText) {
      return;
    }

    await navigator.clipboard.writeText(sanitizedText);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
        {sanitizedText ? (
          <pre className="whitespace-pre-wrap break-words text-sm text-slate-100">
            {sanitizedText}
          </pre>
        ) : (
          <p className="text-sm text-slate-400">
            Sanitized output will appear here after scanning the prompt.
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={handleCopy}
        disabled={!sanitizedText}
        className="inline-flex items-center justify-center rounded-2xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-600 hover:bg-slate-900 disabled:cursor-not-allowed disabled:border-slate-800 disabled:text-slate-500 disabled:hover:bg-transparent"
      >
        {copied ? 'Copied' : 'Copy to Clipboard'}
      </button>
    </div>
  );
};
