// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { defaultTheme } from '@are/engine/theme';
import { LAB_ENTRIES } from '../model';
import { LAB_STORIES } from '../narrative';
import { MechanismPage } from './MechanismPage';

vi.mock('@stylexjs/stylex', () => ({
  create: <Styles,>(styles: Styles) => styles,
  props: () => ({}),
}));

describe('MechanismPage', () => {
  it('shows a playable mission and hides spoilers until requested', () => {
    const entry = LAB_ENTRIES.find((candidate) => candidate.id === 'tuner')!;
    const story = LAB_STORIES[entry.id];
    render(
      <MechanismPage
        entry={entry}
        status="active"
        theme={defaultTheme}
        visual={<div>3D artifact</div>}
        controls={<button type="button">Fallback control</button>}
        telemetry={<span>signal=41</span>}
      />,
    );
    expect(screen.getByRole('heading', { name: 'Signal tuner' })).toBeVisible();
    expect(screen.getByRole('heading', { name: story.title })).toBeVisible();
    expect(screen.getByText(story.evidence)).toBeVisible();
    expect(screen.getByText(story.rule)).toBeVisible();
    expect(screen.getByRole('button', { name: 'Fallback control' })).toBeEnabled();
    expect(screen.queryByText('RESPOSTA: ' + story.solution, { exact: false })).not.toBeInTheDocument();
    const answerPanel = screen.getByText('Resposta final · Como resolver').closest('section')!;
    fireEvent.click(within(answerPanel).getByRole('button', { name: 'Mostrar solução completa' }));
    expect(within(answerPanel).getByText('RESPOSTA: ' + story.solution, { exact: false })).toBeVisible();
    expect(screen.getByText(/Acessibilidade:/)).toBeVisible();
  });
});
