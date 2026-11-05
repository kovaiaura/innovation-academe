import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const MAX_PROCTOR_WARNINGS = 3;

interface Options {
  attemptId: string | null;
  active: boolean;
  onLimitReached: () => void;
}

export function useAssessmentProctoring({ attemptId, active, onLimitReached }: Options) {
  const storageKey = attemptId ? `proctor-warnings-${attemptId}` : '';
  const [warnings, setWarnings] = useState(0);
  const [lastWarningAt, setLastWarningAt] = useState<number | null>(null);
  const warningsRef = useRef(0);
  const lastViolationRef = useRef(0);
  const limitRef = useRef(onLimitReached);
  limitRef.current = onLimitReached;

  useEffect(() => {
    if (!storageKey) return;
    const stored = Number(sessionStorage.getItem(storageKey) || 0);
    warningsRef.current = stored;
    setWarnings(stored);
  }, [storageKey]);

  const registerViolation = useCallback(() => {
    if (!active || !attemptId) return;
    const now = Date.now();
    if (now - lastViolationRef.current < 1500) return; // one action = one warning
    lastViolationRef.current = now;
    const next = warningsRef.current + 1;
    warningsRef.current = next;
    setWarnings(next);
    setLastWarningAt(now);
    sessionStorage.setItem(storageKey, String(next));
    supabase.from('assessment_attempts')
      .update({ tab_switch_count: next, ...(next >= MAX_PROCTOR_WARNINGS ? { proctoring_auto_submitted: true } : {}) })
      .eq('id', attemptId)
      .then(({ error }) => { if (error) console.warn('Proctoring update failed', error); });
    if (next >= MAX_PROCTOR_WARNINGS) limitRef.current();
  }, [active, attemptId, storageKey]);

  const requestFullscreen = useCallback(() => {
    const el = document.documentElement;
    if (!document.fullscreenElement && el.requestFullscreen) {
      el.requestFullscreen().catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (!active) return;
    const onVisibility = () => { if (document.hidden) registerViolation(); };
    const onBlur = () => registerViolation();
    const onFullscreen = () => { if (!document.fullscreenElement) registerViolation(); };
    const onKey = (e: KeyboardEvent) => {
      const k = e.key.toLowerCase();
      if (e.key === 'F12' || ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x', 'p', 'u', 'a', 's'].includes(k))) {
        e.preventDefault();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('blur', onBlur);
    document.addEventListener('fullscreenchange', onFullscreen);
    document.addEventListener('keydown', onKey, true);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('blur', onBlur);
      document.removeEventListener('fullscreenchange', onFullscreen);
      document.removeEventListener('keydown', onKey, true);
    };
  }, [active, registerViolation]);

  const exitFullscreen = useCallback(() => {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
  }, []);

  const clear = useCallback(() => { if (storageKey) sessionStorage.removeItem(storageKey); }, [storageKey]);

  return { warnings, lastWarningAt, requestFullscreen, exitFullscreen, clear };
}
