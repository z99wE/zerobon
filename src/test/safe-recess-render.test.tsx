import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SafeRecessPassModal } from '../components/SafeRecessPassModal';

describe('Safe recess pass rendering after extraction', () => {
  it('renders the printable certificate inside the dialog', () => {
    render(
      <SafeRecessPassModal
        cityName="Delhi NCR"
        outdoorPm25={245}
        cleanWindowHours="11:30 AM – 3:30 PM"
        onClose={vi.fn()}
      />
    );

    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(screen.getByRole('heading', { name: /safe recess & outdoor protocol pass/i })).toBeTruthy();
    expect(screen.getByText(/Certificate #ZB-RECESS-/)).toBeTruthy();
  });
});
