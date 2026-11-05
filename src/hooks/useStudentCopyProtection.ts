import { useEffect } from 'react';

/** Blocks copy/cut/paste/right-click/text selection for students only. */
export function useStudentCopyProtection(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    const isEditable = (t: EventTarget | null) => {
      const el = t as HTMLElement | null;
      return !!el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable);
    };
    const block = (e: Event) => e.preventDefault();
    const blockSelect = (e: Event) => { if (!isEditable(e.target)) e.preventDefault(); };
    const blockCopy = (e: Event) => {
      // Allow copying text the student typed inside their own input box
      if (isEditable(e.target)) return;
      e.preventDefault();
    };
    document.addEventListener('copy', blockCopy);
    document.addEventListener('cut', blockCopy);
    document.addEventListener('paste', block);
    document.addEventListener('contextmenu', block);
    document.addEventListener('selectstart', blockSelect);
    document.documentElement.classList.add('student-no-select');
    return () => {
      document.removeEventListener('copy', blockCopy);
      document.removeEventListener('cut', blockCopy);
      document.removeEventListener('paste', block);
      document.removeEventListener('contextmenu', block);
      document.removeEventListener('selectstart', blockSelect);
      document.documentElement.classList.remove('student-no-select');
    };
  }, [enabled]);
}
