// @vitest-environment jsdom
import '@testing-library/jest-dom/vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { defaultTheme } from '../../theme';
import { InventoryPanel } from './InventoryPanel';

vi.mock('@stylexjs/stylex', () => ({ create: <Styles,>(styles: Styles) => styles, props: () => ({}) }));
afterEach(cleanup);

it('allows evidence inspection without an external selection controller', () => {
  render(<InventoryPanel theme={defaultTheme} items={[{ id: 'recording', label: 'Gravação', description: 'A operadora informou a banda 73.' }]} />);
  const item = screen.getByRole('button', { name: /Gravação/ });
  fireEvent.click(item);
  expect(item).toHaveAttribute('aria-pressed', 'true');
  expect(screen.getByText('A operadora informou a banda 73.')).toBeVisible();
});
