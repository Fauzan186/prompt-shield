import { useState } from 'react';
import { useAppSelector } from '@/hooks/redux';
import { Button } from '@/components/Button';

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
      <div className="rounded-[1.5rem] border border-slate-800 bg-slate-950/65 p-4">
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

      <Button
        variant="secondary"
        onClick={handleCopy}
        disabled={!sanitizedText}
      >
        {copied ? 'Copied' : 'Copy to Clipboard'}
      </Button>
    </div>
  );
};
