// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { defaultTheme } from '../../theme';
import { HintLadder } from './HintLadder';

vi.mock('@stylexjs/stylex', () => ({ create: <Styles,>(styles: Styles) => styles, props: () => ({}) }));
afterEach(cleanup);

it('reveals help one step at a time without exposing the answer and resets for a new puzzle', () => {
  const props = { hints: ['Procure o relatório.', 'Leia os três ecos.', 'Use a ordem da mensagem.'], solution: 'A resposta é 731.', theme: defaultTheme };
  const { rerender } = render(<HintLadder {...props} />);
  expect(screen.queryByText(props.hints[0])).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Revelar dica 1 de 3' }));
  expect(screen.getByText(props.hints[0])).toBeVisible();
  expect(screen.queryByText(props.hints[1])).not.toBeInTheDocument();
  expect(screen.queryByText(props.solution)).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole('button', { name: 'Revelar solução' }));
  expect(screen.getByText(props.solution)).toBeVisible();
  rerender(<HintLadder {...props} resetKey={1} />);
  expect(screen.queryByText(props.solution)).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Revelar dica 1 de 3' })).toBeVisible();
});
