// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defaultTheme } from '../../theme';
import { SequenceInput } from './SequenceInput';

vi.mock('@stylexjs/stylex', () => ({
  create: <Styles,>(styles: Styles) => styles,
  props: () => ({}),
}));

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('SequenceInput', () => {
  it('locks an incorrect sequence during feedback and accepts input after recovery', () => {
    vi.useFakeTimers();
    const onChange = vi.fn();
    const onError = vi.fn();
    render(
      <SequenceInput
        symbols={['A', 'B']}
        solution={[1, 0]}
        theme={defaultTheme}
        onChange={onChange}
        onError={onError}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Símbolo A, posição 1' }));
    fireEvent.click(screen.getByRole('button', { name: 'Símbolo B, posição 2' }));

    expect(screen.getByText('Sequência incorreta. Tente outra vez.')).toBeVisible();
    const tiles = screen.getAllByRole('button');
    expect(tiles).toHaveLength(2);
    expect(tiles.every((tile) => (tile as HTMLButtonElement).disabled)).toBe(true);
    expect(onError).toHaveBeenCalledOnce();
    expect(onChange).toHaveBeenLastCalledWith([0, 1]);

    act(() => vi.advanceTimersByTime(650));

    expect(screen.getByText('0/2')).toBeVisible();
    expect(tiles.every((tile) => (tile as HTMLButtonElement).disabled)).toBe(false);
    fireEvent.click(tiles[1]);
    expect(onChange).toHaveBeenLastCalledWith([1]);
  });
});
