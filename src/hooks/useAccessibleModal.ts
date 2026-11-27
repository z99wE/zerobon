import { useEffect, useRef } from 'react';

const FOCUSABLE_SELECTOR =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Provides WCAG 2.1 AA modal accessibility:
 * - Escape key dismissal
 * - Tab / Shift+Tab focus trapping inside the dialog
 * - Focus restoration to the triggering element upon close
 */
export function useAccessibleModal(isOpen: boolean, onClose: () => void) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const previousFocus = document.activeElement as HTMLElement | null;

    // WCAG 2.4.3: move focus into the dialog so keyboard and screen-reader
    // users land inside it instead of remaining on the background page.
    const container = containerRef.current;
    if (container && !container.contains(document.activeElement)) {
      container.querySelector<HTMLElement>(FOCUSABLE_SELECTOR)?.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }

      if (e.key === 'Tab' && containerRef.current) {
        const focusables = Array.from(
          containerRef.current.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)
        ).filter((el) => el.offsetParent !== null || el === document.activeElement);

        if (focusables.length === 0) return;

        const first = focusables[0]!;
        const last = focusables[focusables.length - 1]!;

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (previousFocus && typeof previousFocus.focus === 'function') {
        previousFocus.focus();
      }
    };
  }, [isOpen, onClose]);

  return containerRef;
}
