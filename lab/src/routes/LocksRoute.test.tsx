// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { AdventureSession, AdventureSessionSnapshot } from '@are/engine/session/adventureSession';
import { defaultTheme } from '@are/engine/theme';
import { LAB_ENTRIES } from '../model';
import { LocksRoute } from './LocksRoute';
import { LOCK_PRESETS } from './lockPresets';

vi.mock('@stylexjs/stylex', () => ({
  create: <Styles,>(styles: Styles) => styles,
  props: () => ({}),
}));

afterEach(cleanup);

describe('LocksRoute', () => {
  it('renders every mechanism as an independent section', () => {
    const send = vi.fn();
    const entry = LAB_ENTRIES.find((candidate) => candidate.id === 'locks')!;
    const snapshot = { mechanismResults: { locks: 'pending' } } as unknown as AdventureSessionSnapshot;

    const { container } = render(
      <LocksRoute
        entry={entry}
        theme={defaultTheme}
        reducedMotion={false}
        resetVersion={0}
        session={{ send } as unknown as AdventureSession}
        snapshot={snapshot}
      />,
    );

    expect(container.querySelectorAll('section[id^="lock-"]')).toHaveLength(14);
    expect(container.querySelectorAll('[data-three-lock]')).toHaveLength(14);
    for (const preset of LOCK_PRESETS) {
      const section = container.querySelector<HTMLElement>(`#lock-${preset.definition.id}`)!;
      expect(section.querySelector(`[data-three-lock="${preset.definition.kind}"]`)).not.toBeNull();
    }
    expect(screen.getByRole('heading', { name: /^Numérico$/ })).toBeVisible();
    expect(screen.getByRole('heading', { name: /^Geoloc\. real$/ })).toBeVisible();

    const numeric = container.querySelector<HTMLElement>('#lock-numeric')!;
    fireEvent.change(within(numeric).getByLabelText('Código numérico'), { target: { value: '1234' } });
    fireEvent.click(within(numeric).getByRole('button', { name: 'Validar' }));

    expect(within(numeric).getByText('Cadeado aberto. Solução confirmada.')).toBeVisible();
    expect(send).toHaveBeenCalledWith({ type: 'MECHANISM_ACTIVE', mechanismId: 'locks' });
  });
});
