import { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

const STEPS = ['Reading sessions…', 'Checking answers…', 'Building insights…'];

export const OutcomeAnalysing = () => {
  const [step, setStep] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStep(s => (s + 1) % STEPS.length), 1200);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="py-16 flex flex-col items-center text-center gap-4" role="status" aria-live="polite">
      <div className="relative h-16 w-16">
        <span className="absolute inset-0 rounded-full bg-primary/20 animate-ping" />
        <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
          <Sparkles className="h-8 w-8 text-primary animate-pulse" />
        </span>
      </div>
      <h2 className="text-lg font-semibold">Analysing learning and assessments</h2>
      <p className="text-sm text-muted-foreground">{STEPS[step]}</p>
    </div>
  );
};
