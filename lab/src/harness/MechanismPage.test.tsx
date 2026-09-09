// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { LAB_ENTRIES } from '../model';
import { MechanismPage } from './MechanismPage';

vi.mock('@stylexjs/stylex', () => ({
  create: <Styles,>(styles: Styles) => styles,
  props: () => ({}),
}));

describe('MechanismPage', () => {
  it('makes the artifact operation, hints and fallback controls the test surface', () => {
    const entry = LAB_ENTRIES.find((candidate) => candidate.id === 'tuner')!;
    render(
      <MechanismPage
        entry={entry}
        status="active"
        visual={<div>3D artifact</div>}
        controls={<button type="button">Fallback control</button>}
        telemetry={<span>signal=41</span>}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Signal tuner' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Fallback control' })).toBeEnabled();
    expect(screen.getByText(entry.solution)).toBeVisible();
    for (const hint of entry.hints) expect(screen.getByText(hint, { exact: false })).toBeVisible();
    expect(screen.getByText(/Acessibilidade:/)).toBeVisible();
  });
});
