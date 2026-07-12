'use client';

import { useState, useEffect } from 'react';
import { Key, Eye, EyeOff, Check, X, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

type ValidationState = 'idle' | 'validating' | 'valid' | 'invalid';

export function ByokSettings() {
  const [expanded, setExpanded] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [visible, setVisible] = useState(false);
  const [validation, setValidation] = useState<ValidationState>('idle');
  const [validationMessage, setValidationMessage] = useState('');

  // Check if a BYOK cookie is already set (server returns boolean only)
  useEffect(() => {
    let cancelled = false;
    fetch('/api/validate-key', { method: 'GET' })
      .then((r) => r.json())
      .then((data: { configured: boolean }) => {
        if (!cancelled && data.configured) {
          setSaved(true);
          setValidation('valid');
        }
      })
      .catch(() => {
        // ignore — default to not configured
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleValidate = async () => {
    const key = apiKey.trim();
    if (key.length === 0) {
      return;
    }

    setValidation('validating');
    setValidationMessage('');

    try {
      const response = await fetch('/api/validate-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: key }),
      });
      const data = (await response.json()) as {
        valid: boolean;
        message?: string;
      };

      if (data.valid) {
        setValidation('valid');
        // Key is now stored in an httpOnly cookie by the server
        setSaved(true);
        setApiKey(''); // clear from component state — no need to keep it
      } else {
        setValidation('invalid');
        setValidationMessage(data.message ?? 'This API key is invalid.');
      }
    } catch {
      setValidation('invalid');
      setValidationMessage(
        "Couldn't verify the key. Check your connection and try again.",
      );
    }
  };

  const handleClear = async () => {
    setApiKey('');
    setSaved(false);
    setValidation('idle');
    setValidationMessage('');
    try {
      await fetch('/api/validate-key', { method: 'DELETE' });
    } catch {
      // ignore network errors
    }
  };

  if (typeof window === 'undefined') {
    return null;
  }

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg border border-border bg-surface-elevated/50 px-4 py-2.5 text-caption font-medium text-muted-foreground transition-colors hover:bg-surface-elevated focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-expanded={expanded}
      >
        <span className="flex items-center gap-2">
          <Key className="size-3.5" aria-hidden />
          {saved && validation === 'valid'
            ? 'API key verified (LLM mode)'
            : saved
              ? 'API key configured (unverified)'
              : 'Bring your own API key (optional)'}
        </span>
        <span className="text-caption">
          {saved && validation === 'valid' ? (
            <Check className="size-3.5 text-primary" aria-hidden />
          ) : validation === 'invalid' ? (
            <AlertCircle className="size-3.5 text-destructive" aria-hidden />
          ) : (
            <span className="text-muted-foreground/60">
              {expanded ? '−' : '+'}
            </span>
          )}
        </span>
      </button>

      <AnimatePresence>
        {expanded ? (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="mt-3 flex flex-col gap-3 rounded-lg border border-border bg-surface-elevated/30 p-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="byok-key">Google AI API Key</Label>
                <div className="relative">
                  <Input
                    id="byok-key"
                    type={visible ? 'text' : 'password'}
                    placeholder="AIza..."
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value);
                      setSaved(false);
                      setValidation('idle');
                      setValidationMessage('');
                    }}
                    className="pr-10"
                    autoComplete="off"
                    aria-invalid={validation === 'invalid'}
                    aria-describedby={
                      validation === 'invalid' ? 'byok-validation' : undefined
                    }
                  />
                  <button
                    type="button"
                    onClick={() => setVisible((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                    aria-label={visible ? 'Hide API key' : 'Show API key'}
                  >
                    {visible ? (
                      <EyeOff className="size-4" aria-hidden />
                    ) : (
                      <Eye className="size-4" aria-hidden />
                    )}
                  </button>
                </div>
              </div>

              {/* Validation status */}
              <AnimatePresence mode="wait">
                {validation === 'invalid' ? (
                  <motion.p
                    id="byok-validation"
                    role="alert"
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="flex items-center gap-1.5 rounded-md border border-destructive/40 bg-destructive/5 px-3 py-2 text-caption text-destructive"
                  >
                    <AlertCircle className="size-3.5 shrink-0" aria-hidden />
                    {validationMessage}
                  </motion.p>
                ) : null}
                {validation === 'valid' && !saved ? (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    className="flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-caption text-primary"
                  >
                    <Check className="size-3.5 shrink-0" aria-hidden />
                    API key verified successfully.
                  </motion.p>
                ) : null}
              </AnimatePresence>

              <p className="text-caption text-muted-foreground">
                When provided, your story is generated using Google AI for
                richer, more personalized output. Without a key, our instant
                heuristic engine crafts your story. Your key is stored locally
                in your browser and never sent to our servers beyond the
                generation request.
              </p>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  onClick={handleValidate}
                  disabled={
                    apiKey.trim().length === 0 || validation === 'validating'
                  }
                >
                  {validation === 'validating' ? (
                    <>
                      <Loader2 className="size-3.5 animate-spin" aria-hidden />
                      Verifying…
                    </>
                  ) : (
                    <>
                      <Check className="size-3.5" aria-hidden />
                      Verify &amp; save
                    </>
                  )}
                </Button>
                {saved ? (
                  <Button size="sm" variant="ghost" onClick={handleClear}>
                    <X className="size-3.5" aria-hidden />
                    Remove
                  </Button>
                ) : null}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
