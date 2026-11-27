import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useAccessibleModal } from '../hooks/useAccessibleModal';

const FocusHarness: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const dialogRef = useAccessibleModal(open, onClose);
  if (!open) return null;
  return (
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Test dialog">
      <button type="button">First action</button>
      <button type="button">Second action</button>
    </div>
  );
};

describe('Modal Focus Management (WCAG 2.4.3)', () => {
  it('moves keyboard focus into the dialog as soon as it opens', () => {
    const onClose = vi.fn();
    const { rerender } = render(
      <>
        <button type="button">Trigger</button>
        <FocusHarness open={false} onClose={onClose} />
      </>
    );

    screen.getByRole('button', { name: 'Trigger' }).focus();
    rerender(
      <>
        <button type="button">Trigger</button>
        <FocusHarness open onClose={onClose} />
      </>
    );

    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'First action' }));
  });

  it('does not yank focus back to the first button when the parent re-renders', () => {
    const { rerender } = render(
      <>
        <button type="button">Trigger</button>
        <FocusHarness open={false} onClose={() => undefined} />
      </>
    );

    screen.getByRole('button', { name: 'Trigger' }).focus();
    rerender(
      <>
        <button type="button">Trigger</button>
        <FocusHarness open onClose={() => undefined} />
      </>
    );

    const second = screen.getByRole('button', { name: 'Second action' });
    second.focus();
    // A fresh inline handler on every render must not re-run the focus effect.
    rerender(
      <>
        <button type="button">Trigger</button>
        <FocusHarness open onClose={() => undefined} />
      </>
    );

    expect(document.activeElement).toBe(second);
  });

  it('restores focus to the triggering element when the dialog closes', () => {
    const onClose = vi.fn();
    const trigger = <button type="button">Trigger</button>;
    const { rerender } = render(
      <>
        {trigger}
        <FocusHarness open={false} onClose={onClose} />
      </>
    );

    screen.getByRole('button', { name: 'Trigger' }).focus();
    const triggerElement = document.activeElement;
    rerender(
      <>
        {trigger}
        <FocusHarness open onClose={onClose} />
      </>
    );
    rerender(
      <>
        {trigger}
        <FocusHarness open={false} onClose={onClose} />
      </>
    );

    expect(document.activeElement).toBe(triggerElement);
  });
});
