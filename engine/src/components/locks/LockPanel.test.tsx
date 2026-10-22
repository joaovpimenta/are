// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defaultTheme } from '../../theme';
import { LockPanel } from './LockPanel';

vi.mock('@stylexjs/stylex', () => ({
  create: <Styles,>(styles: Styles) => styles,
  props: () => ({}),
}));

vi.mock('./LockObject3D', () => ({ LockObject3D: () => null }));

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

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

  it('registers a northeast heading from absolute device orientation', () => {
    vi.useFakeTimers();
    render(<LockPanel definition={{ id: 'compass', kind: 'compass', solution: ['NE'] }} theme={defaultTheme} />);

    const dispatchNortheast = () => {
      const event = new Event('deviceorientationabsolute');
      Object.defineProperties(event, { alpha: { value: 315 }, absolute: { value: true } });
      act(() => window.dispatchEvent(event));
    };
    dispatchNortheast();
    for (let index = 0; index < 6; index += 1) {
      act(() => vi.advanceTimersByTime(100));
      dispatchNortheast();
    }
    act(() => vi.advanceTimersByTime(50));

    expect(screen.getByLabelText('Entrada atual')).toHaveTextContent('NE');
  });

  it('requires 650ms of sampled alignment and cancels the dwell when heading changes', () => {
    vi.useFakeTimers();
    render(<LockPanel definition={{ id: 'compass', kind: 'compass', solution: ['N'] }} theme={defaultTheme} />);

    const dispatchHeading = (heading: number) => {
      const event = new Event('deviceorientationabsolute');
      Object.defineProperties(event, {
        alpha: { value: (360 - heading) % 360 },
        absolute: { value: true },
      });
      act(() => window.dispatchEvent(event));
    };

    dispatchHeading(0);
    act(() => vi.advanceTimersByTime(200));
    dispatchHeading(90);
    act(() => vi.advanceTimersByTime(500));
    expect(screen.getByLabelText('Entrada atual')).toHaveTextContent('Nenhuma posição selecionada.');

    dispatchHeading(0);
    act(() => vi.advanceTimersByTime(200));
    const invalidEvent = new Event('deviceorientationabsolute');
    Object.defineProperties(invalidEvent, { alpha: { value: null }, absolute: { value: true } });
    act(() => window.dispatchEvent(invalidEvent));
    act(() => vi.advanceTimersByTime(500));
    expect(screen.getByLabelText('Entrada atual')).toHaveTextContent('Nenhuma posição selecionada.');
    dispatchHeading(0);
    for (let index = 0; index < 6; index += 1) {
      act(() => vi.advanceTimersByTime(100));
      dispatchHeading(0);
    }
    expect(screen.getByLabelText('Entrada atual')).toHaveTextContent('Nenhuma posição selecionada.');
    act(() => vi.advanceTimersByTime(50));
    expect(screen.getByLabelText('Entrada atual')).toHaveTextContent('N');
  });

  it('completes the hold after 650ms when the latest compass sample stays aligned', () => {
    vi.useFakeTimers();
    render(<LockPanel definition={{ id: 'compass', kind: 'compass', solution: ['NE'] }} theme={defaultTheme} />);
    const event = new Event('deviceorientationabsolute');
    Object.defineProperties(event, { alpha: { value: 315 }, absolute: { value: true } });
    act(() => window.dispatchEvent(event));

    act(() => vi.advanceTimersByTime(649));
    expect(screen.getByLabelText('Entrada atual')).toHaveTextContent('Nenhuma posição selecionada.');
    act(() => vi.advanceTimersByTime(1));

    expect(screen.getByLabelText('Entrada atual')).toHaveTextContent('NE');
  });

  it('requires a fresh dwell for repeated adjacent compass directions', () => {
    vi.useFakeTimers();
    render(<LockPanel definition={{ id: 'compass', kind: 'compass', solution: ['N', 'N'] }} theme={defaultTheme} />);

    const dispatchNorth = () => {
      const event = new Event('deviceorientationabsolute');
      Object.defineProperties(event, {
        alpha: { value: 0 },
        absolute: { value: true },
      });
      act(() => window.dispatchEvent(event));
    };

    dispatchNorth();
    for (let index = 0; index < 6; index += 1) {
      act(() => vi.advanceTimersByTime(100));
      dispatchNorth();
    }
    act(() => vi.advanceTimersByTime(50));
    expect(screen.getByLabelText('Entrada atual')).toHaveTextContent('N');

    dispatchNorth();
    for (let index = 0; index < 6; index += 1) {
      act(() => vi.advanceTimersByTime(100));
      dispatchNorth();
    }
    expect(screen.getByLabelText('Entrada atual')).toHaveTextContent('N');
    act(() => vi.advanceTimersByTime(50));

    expect(screen.getByLabelText('Entrada atual')).toHaveTextContent('NN');
  });

  it('cancels an in-progress compass dwell when resetKey changes', () => {
    vi.useFakeTimers();
    const definition = { id: 'compass', kind: 'compass' as const, solution: ['N'] };
    const view = render(<LockPanel definition={definition} theme={defaultTheme} resetKey={0} />);

    const dispatchNorth = () => {
      const event = new Event('deviceorientationabsolute');
      Object.defineProperties(event, { alpha: { value: 0 }, absolute: { value: true } });
      act(() => window.dispatchEvent(event));
    };

    dispatchNorth();
    for (let index = 0; index < 3; index += 1) {
      act(() => vi.advanceTimersByTime(100));
      dispatchNorth();
    }
    view.rerender(<LockPanel definition={definition} theme={defaultTheme} resetKey={1} />);
    dispatchNorth();

    for (let index = 0; index < 6; index += 1) {
      act(() => vi.advanceTimersByTime(100));
      dispatchNorth();
    }
    expect(screen.getByLabelText('Entrada atual')).toHaveTextContent('Nenhuma posição selecionada.');
    act(() => vi.advanceTimersByTime(50));
    expect(screen.getByLabelText('Entrada atual')).toHaveTextContent('N');
  });

  it('clears compass dwell timers when the lock unmounts', () => {
    vi.useFakeTimers();
    const view = render(<LockPanel definition={{ id: 'compass', kind: 'compass', solution: ['N'] }} theme={defaultTheme} />);
    const event = new Event('deviceorientationabsolute');
    Object.defineProperties(event, { alpha: { value: 0 }, absolute: { value: true } });
    act(() => window.dispatchEvent(event));

    expect(vi.getTimerCount()).toBe(1);
    view.unmount();

    expect(vi.getTimerCount()).toBe(0);
    act(() => vi.advanceTimersByTime(700));
  });

  it('cancels compass dwell when the page becomes hidden', () => {
    vi.useFakeTimers();
    render(<LockPanel definition={{ id: 'compass', kind: 'compass', solution: ['N'] }} theme={defaultTheme} />);
    const event = new Event('deviceorientationabsolute');
    Object.defineProperties(event, { alpha: { value: 0 }, absolute: { value: true } });
    act(() => window.dispatchEvent(event));
    act(() => vi.advanceTimersByTime(200));

    const visibilityDescriptor = Object.getOwnPropertyDescriptor(document, 'visibilityState');
    Object.defineProperty(document, 'visibilityState', { configurable: true, value: 'hidden' });
    act(() => document.dispatchEvent(new Event('visibilitychange')));
    if (visibilityDescriptor) Object.defineProperty(document, 'visibilityState', visibilityDescriptor);
    else Reflect.deleteProperty(document, 'visibilityState');

    act(() => vi.advanceTimersByTime(500));
    expect(screen.getByLabelText('Entrada atual')).toHaveTextContent('Nenhuma posição selecionada.');
  });
});
