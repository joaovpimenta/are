// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defaultTheme } from '../../theme';
import { LockPanel } from './LockPanel';

vi.mock('@stylexjs/stylex', () => ({
  create: <Styles,>(styles: Styles) => styles,
  props: () => ({}),
}));

afterEach(cleanup);

describe('LockPanel', () => {
  it('operates the numeric lock with a dedicated keypad input', () => {
    const onSolved = vi.fn();
    render(<LockPanel definition={{ id: 'numeric', kind: 'numeric', solution: '1234' }} theme={defaultTheme} onSolved={onSolved} />);

    fireEvent.change(screen.getByLabelText('Código numérico'), { target: { value: '1234' } });
    fireEvent.click(screen.getByRole('button', { name: 'Validar' }));

    expect(onSolved).toHaveBeenCalledOnce();
    expect(screen.getByText('Cadeado aberto. Solução confirmada.')).toBeVisible();
  });

  it('keeps login identifier and password as separate inputs', () => {
    const onSolved = vi.fn();
    render(<LockPanel definition={{ id: 'login', kind: 'login', solution: 'professor:escape' }} theme={defaultTheme} onSolved={onSolved} />);

    fireEvent.change(screen.getByLabelText('Identificador'), { target: { value: 'professor' } });
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'escape' } });
    fireEvent.click(screen.getByRole('button', { name: 'Validar' }));

    expect(onSolved).toHaveBeenCalledOnce();
  });

  it('accepts unordered switch combinations in any activation order', () => {
    const onSolved = vi.fn();
    render(<LockPanel definition={{ id: 'switches', kind: 'switches', solution: ['1', '4', '6'], columns: 4 }} theme={defaultTheme} onSolved={onSolved} />);

    for (const value of ['6', '1', '4']) fireEvent.click(screen.getByRole('button', { name: value }));
    fireEvent.click(screen.getByRole('button', { name: 'Validar' }));

    expect(onSolved).toHaveBeenCalledOnce();
  });
});
