import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InversionRadar } from '../components/InversionRadar';

describe('Inversion radar chart correctness', () => {
  it('uses the solar mixing ceiling for cities whose baseline inversion is low', () => {
    render(<InversionRadar selectedCity="Delhi NCR" outdoorPm25={245} />);
    expect(screen.getAllByText(/PBL: 1350m/).length).toBeGreaterThan(0);
  });
});
