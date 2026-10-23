// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defaultTheme } from '@are/engine/theme';
import { LAB_ENTRIES } from '../model';
import { LAB_STORIES, LOCK_STORIES } from '../narrative';
import { LOCK_PRESETS } from '../routes/lockPresets';
import { PuzzleGuide } from './PuzzleStory';

vi.mock('@stylexjs/stylex', () => ({
  create: <Styles,>(styles: Styles) => styles,
  props: () => ({}),
}));

afterEach(cleanup);

describe('narrative puzzle catalog', () => {
  it('provides rules, evidence, hints, final answer and walkthroughs for all mechanisms', () => {
    expect(Object.keys(LAB_STORIES).sort()).toEqual(LAB_ENTRIES.map((entry) => entry.id).sort());
    expect(Object.keys(LOCK_STORIES).sort()).toEqual(LOCK_PRESETS.map((preset) => preset.definition.id).sort());
    const all = [...Object.values(LAB_STORIES), ...Object.values(LOCK_STORIES)];
    expect(all).toHaveLength(26);
    for (const story of all) {
      expect(story.title.length).toBeGreaterThan(8);
      expect(story.scene.length).toBeGreaterThan(20);
      expect(story.evidence.length).toBeGreaterThan(20);
      expect(story.objective.length).toBeGreaterThan(12);
      expect(story.rule.length).toBeGreaterThan(15);
      expect(story.hints).toHaveLength(3);
      expect(story.solution.length).toBeGreaterThan(1);
      expect(story.steps.length).toBeGreaterThanOrEqual(2);
    }
  });

  it('reveals hints one at a time and permits direct answer reveal and reset', () => {
    const story = LAB_STORIES.keypad;
    const { rerender } = render(<PuzzleGuide story={story} theme={defaultTheme} resetKey={0} />);
    expect(screen.getByText('Pista 1 · Observe')).toBeVisible();
    expect(screen.queryByText('Pista 2 · Relacione')).not.toBeInTheDocument();
    expect(screen.queryByText('Pista 3 · Direção final')).not.toBeInTheDocument();
    expect(screen.queryByText(story.hints[0])).not.toBeInTheDocument();
    const first = screen.getByText('Pista 1 · Observe').closest('section')!;
    fireEvent.click(within(first).getByRole('button', { name: 'Revelar pista' }));
    expect(screen.getByText(story.hints[0])).toBeVisible();
    expect(screen.getByText('Pista 2 · Relacione')).toBeVisible();

    const second = screen.getByText('Pista 2 · Relacione').closest('section')!;
    fireEvent.click(within(second).getByRole('button', { name: 'Revelar pista' }));
    expect(screen.getByText('Pista 3 · Direção final')).toBeVisible();

    const answer = screen.getByText('Resposta final · Como resolver').closest('section')!;
    fireEvent.click(within(answer).getByRole('button', { name: 'Revelar pista' }));
    expect(within(answer).getByText('RESPOSTA: ' + story.solution, { exact: false })).toBeVisible();

    rerender(<PuzzleGuide story={story} theme={defaultTheme} resetKey={1} />);
    expect(screen.queryByText('Pista 2 · Relacione')).not.toBeInTheDocument();
    expect(screen.queryByText('RESPOSTA: ' + story.solution, { exact: false })).not.toBeInTheDocument();
  });
});
