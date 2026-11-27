import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
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

const AutoFocusHarness: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const dialogRef = useAccessibleModal(true, onClose);
  return (
    <div ref={dialogRef} role="dialog" aria-label="Auto-focus dialog">
      <button type="button" autoFocus>First action</button>
      <button type="button">Second action</button>
      <button type="button" style={{ display: 'none' }}>Hidden action</button>
    </div>
  );
};

describe('Modal Focus Management (WCAG 2.4.3)', () => {
  it('does not steal focus that is already inside the dialog', () => {
    render(<AutoFocusHarness onClose={() => undefined} />);
    const first = screen.getByRole('button', { name: 'First action' });
    expect(document.activeElement).toBe(first);
  });

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

  it('wraps focus between the last and first controls when Tab is pressed', () => {
    render(
      <>
        <button type="button">Trigger</button>
        <FocusHarness open onClose={() => undefined} />
      </>
    );

    const dialog = screen.getByRole('dialog');
    const first = screen.getByRole('button', { name: 'First action' });
    const last = screen.getByRole('button', { name: 'Second action' });
    // jsdom has no layout, so mark both controls as visible for the trap's filter.
    for (const button of [first, last]) {
      Object.defineProperty(button, 'offsetParent', { value: dialog, configurable: true });
    }

    first.focus();
    fireEvent.keyDown(window, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(last);

    fireEvent.keyDown(window, { key: 'Tab' });
    expect(document.activeElement).toBe(first);
  });

  it('calls the close handler when Escape is pressed inside the dialog', () => {
    const onClose = vi.fn();
    render(
      <>
        <button type="button">Trigger</button>
        <FocusHarness open onClose={onClose} />
      </>
    );

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);
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
