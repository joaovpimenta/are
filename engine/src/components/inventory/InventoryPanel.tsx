import * as stylex from '@stylexjs/stylex';
import { useState } from 'react';
import type { AreTheme } from '../../theme';
import { toObjectThemeStyle } from '../../theme';

export type InventoryItem = {
  id: string;
  label: string;
  description: string;
  symbol?: string;
  collected?: boolean;
};

type InventoryPanelProps = {
  items: readonly InventoryItem[];
  selectedId?: string | null;
  theme: AreTheme;
  onSelect?: (item: InventoryItem) => void;
};

const styles = stylex.create({
  panel: {
    display: 'grid',
    gap: 14,
    padding: 16,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'color-mix(in srgb, var(--object-accent) 28%, transparent)',
    borderRadius: 18,
    backgroundColor: 'color-mix(in srgb, var(--object-surface) 92%, transparent)',
    color: 'var(--object-text)',
  },
  heading: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
    margin: 0,
    fontSize: 15,
  },
  count: {
    color: 'var(--object-muted)',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 11,
    fontWeight: 800,
  },
  list: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 140px), 1fr))',
    gap: 9,
    margin: 0,
    padding: 0,
    listStyle: 'none',
  },
  item: {
    width: '100%',
    minWidth: 0,
    display: 'grid',
    gridTemplateColumns: 'auto 1fr',
    alignItems: 'center',
    gap: 9,
    minHeight: 58,
    padding: 10,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'color-mix(in srgb, var(--object-accent) 18%, transparent)',
    borderRadius: 12,
    color: 'var(--object-text)',
    backgroundColor: 'color-mix(in srgb, var(--object-surface-raised) 82%, transparent)',
    textAlign: 'left',
    cursor: 'pointer',
    transitionProperty: 'border-color, transform, background-color',
    transitionDuration: '140ms',
    ':hover': {
      borderColor: 'var(--object-accent)',
    },
    ':focus-visible': {
      outlineWidth: 3,
      outlineStyle: 'solid',
      outlineColor: 'var(--object-accent)',
      outlineOffset: 2,
    },
    ':active': {
      transform: 'scale(.98)',
    },
    '@media (prefers-reduced-motion: reduce)': {
      transitionDuration: '0.01ms',
    },
  },
  selected: {
    borderColor: 'var(--object-accent)',
    backgroundColor: 'color-mix(in srgb, var(--object-accent-soft) 65%, var(--object-surface-raised))',
  },
  icon: {
    display: 'grid',
    placeItems: 'center',
    width: 32,
    height: 32,
    borderRadius: 9,
    color: 'var(--object-accent)',
    backgroundColor: 'var(--object-accent-soft)',
    fontSize: 17,
    fontWeight: 900,
  },
  label: {
    display: 'block',
    fontSize: 14,
    fontWeight: 800,
  },
  description: {
    display: 'block',
    marginTop: 2,
    color: 'var(--object-muted)',
    fontSize: 12,
    lineHeight: 1.35,
  },
  empty: {
    margin: 0,
    color: 'var(--object-muted)',
    fontSize: 12,
  },
  inspection: { display: 'grid', gap: 8, padding: 14, borderRadius: 12, backgroundColor: 'var(--object-accent-soft)', overflowWrap: 'anywhere' },
  detail: { margin: 0, fontSize: 14, lineHeight: 1.6 },
});

export function InventoryPanel({ items, selectedId, theme, onSelect }: InventoryPanelProps) {
  const [inspectedId, setInspectedId] = useState<string | null>(null);
  const activeId = selectedId === undefined ? inspectedId : selectedId;
  const collectedCount = items.filter((item) => item.collected === true).length;
  const variables = toObjectThemeStyle(theme);
  const selected = items.find((item) => item.id === activeId);

  return (
    <section {...stylex.props(styles.panel)} style={variables} aria-label="Inventário">
      <h3 {...stylex.props(styles.heading)}>
        <span>Inventário</span>
        <span {...stylex.props(styles.count)}>{collectedCount}/{items.length} encontrados</span>
      </h3>
      {items.length === 0 ? (
        <p {...stylex.props(styles.empty)}>Nenhum objeto descoberto.</p>
      ) : (
        <ul {...stylex.props(styles.list)}>
          {items.map((item) => (
            <li key={item.id}>
              <button
                {...stylex.props(styles.item, activeId === item.id ? styles.selected : undefined)}
                type="button"
                aria-pressed={activeId === item.id}
                data-collected={item.collected === true}
                onClick={() => { if (selectedId === undefined) setInspectedId(item.id); onSelect?.(item); }}
              >
                <span {...stylex.props(styles.icon)} aria-hidden="true">{item.symbol ?? '◇'}</span>
                <span>
                  <span {...stylex.props(styles.label)}>{item.label}</span>
                  <span {...stylex.props(styles.description)}>{item.collected ? 'Encontrado · inspecionar' : 'Inspecionar objeto'}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <div aria-live="polite" aria-atomic="true">
        {selected && <div {...stylex.props(styles.inspection)}><strong>{selected.label}</strong><p {...stylex.props(styles.detail)}>{selected.description}</p></div>}
      </div>
    </section>
  );
}
