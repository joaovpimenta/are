import * as stylex from '@stylexjs/stylex';

export const labStyles = stylex.create({
  page: {
    minHeight: '100dvh',
    backgroundColor: 'var(--are-bg)',
    backgroundImage:
      'radial-gradient(circle at 15% 0%, color-mix(in srgb, var(--are-accent) 12%, transparent), transparent 32rem), linear-gradient(180deg, color-mix(in srgb, var(--are-bg) 88%, #0d1722), var(--are-bg))',
    color: 'var(--are-text)',
    fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    transitionProperty: 'background-color, color',
    transitionDuration: '280ms',
    transitionTimingFunction: 'ease',
  },
  shell: {
    width: {
      default: 'min(1220px, calc(100% - 32px))',
      '@media (max-width: 640px)': 'min(100% - 20px, 1220px)',
    },
    marginInline: 'auto',
    paddingBlock: {
      default: '28px 40px',
      '@media (max-width: 640px)': '18px 28px',
    },
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: {
      default: 20,
      '@media (max-width: 640px)': 16,
    },
    marginBottom: {
      default: 24,
      '@media (max-width: 640px)': 16,
    },
    flexWrap: 'wrap',
  },
  intro: {
    minWidth: 0,
  },
  eyebrow: {
    margin: 0,
    color: 'var(--are-accent)',
    fontSize: 12,
    fontWeight: 800,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  title: {
    marginBlock: '6px 8px',
    marginInline: 0,
    fontSize: {
      default: 'clamp(32px, 6vw, 64px)',
      '@media (max-width: 640px)': 'clamp(36px, 13vw, 52px)',
    },
    lineHeight: {
      default: 0.96,
      '@media (max-width: 640px)': 0.94,
    },
    letterSpacing: '-0.04em',
  },
  subtitle: {
    maxWidth: 700,
    margin: 0,
    color: 'var(--are-muted)',
    fontSize: {
      default: 16,
      '@media (max-width: 640px)': 14,
    },
    lineHeight: {
      default: 1.6,
      '@media (max-width: 640px)': 1.55,
    },
  },
  toolbar: {
    display: 'flex',
    width: {
      default: 'auto',
      '@media (max-width: 640px)': '100%',
    },
    gap: 10,
    flexWrap: 'wrap',
  },
  interactiveButton: {
    minHeight: 44,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'color-mix(in srgb, var(--are-accent) 34%, transparent)',
    color: 'var(--are-text)',
    backgroundColor: 'var(--are-surface-raised)',
    cursor: 'pointer',
    fontWeight: 750,
    transitionProperty: 'transform, border-color, box-shadow',
    transitionDuration: '140ms',
    transitionTimingFunction: 'ease',
    ':hover': {
      borderColor: 'var(--are-accent)',
      boxShadow: '0 0 22px color-mix(in srgb, var(--are-accent) 18%, transparent)',
    },
    ':active': {
      transform: 'scale(.97)',
    },
    ':focus-visible': {
      outlineWidth: 3,
      outlineStyle: 'solid',
      outlineColor: 'color-mix(in srgb, var(--are-accent) 55%, transparent)',
      outlineOffset: 3,
    },
    '@media (prefers-reduced-motion: reduce)': {
      transitionDuration: '0.01ms',
    },
  },
  button: {
    flexGrow: {
      default: 0,
      '@media (max-width: 640px)': 1,
    },
    flexShrink: 1,
    flexBasis: {
      default: 'auto',
      '@media (max-width: 640px)': 0,
    },
    borderRadius: 12,
    paddingBlock: 10,
    paddingInline: 14,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 460px), 1fr))',
    gap: {
      default: 18,
      '@media (max-width: 640px)': 12,
    },
  },
  card: {
    overflow: 'hidden',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'color-mix(in srgb, var(--are-accent) 16%, #ffffff12)',
    borderRadius: {
      default: 22,
      '@media (max-width: 640px)': 16,
    },
    backgroundColor: 'color-mix(in srgb, var(--are-surface) 94%, transparent)',
    boxShadow: '0 18px 70px rgba(0,0,0,.28)',
    backdropFilter: 'blur(14px)',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: {
      default: 18,
      '@media (max-width: 640px)': 15,
    },
    paddingInline: {
      default: 20,
      '@media (max-width: 640px)': 15,
    },
  },
  cardTitle: {
    margin: 0,
    fontSize: 18,
  },
  badge: {
    borderRadius: 999,
    paddingBlock: 6,
    paddingInline: 9,
    color: 'var(--are-accent)',
    backgroundColor: 'var(--are-accent-soft)',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 11,
    fontWeight: 800,
    textTransform: 'uppercase',
  },
  canvas: {
    height: {
      default: 'clamp(300px, 48vw, 430px)',
      '@media (max-width: 640px)': 'min(82vw, 360px)',
    },
    minHeight: {
      default: 300,
      '@media (max-width: 640px)': 280,
    },
    marginTop: 10,
    backgroundImage:
      'radial-gradient(circle at 50% 44%, color-mix(in srgb, var(--are-accent) 11%, transparent), transparent 45%)',
  },
  cardFooter: {
    display: 'flex',
    alignItems: {
      default: 'center',
      '@media (max-width: 640px)': 'stretch',
    },
    justifyContent: 'space-between',
    flexDirection: {
      default: 'row',
      '@media (max-width: 640px)': 'column',
    },
    gap: 12,
    minHeight: 62,
    paddingTop: 8,
    paddingBottom: {
      default: 18,
      '@media (max-width: 640px)': 15,
    },
    paddingInline: {
      default: 20,
      '@media (max-width: 640px)': 15,
    },
    color: 'var(--are-muted)',
    fontSize: 13,
  },
  status: {
    color: 'var(--are-text)',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontWeight: 800,
  },
  statePanel: {
    marginTop: {
      default: 18,
      '@media (max-width: 640px)': 12,
    },
    padding: {
      default: 18,
      '@media (max-width: 640px)': 15,
    },
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'rgba(255,255,255,.08)',
    borderRadius: {
      default: 18,
      '@media (max-width: 640px)': 16,
    },
    backgroundColor: 'var(--are-surface)',
    boxShadow: '0 12px 40px rgba(0,0,0,.18)',
  },
  stateTitle: {
    marginTop: 0,
    marginBottom: 10,
    fontSize: 14,
  },
  stateLine: {
    display: 'flex',
    gap: 10,
    flexWrap: 'wrap',
    color: 'var(--are-muted)',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 12,
    overflowWrap: 'anywhere',
  },
});

// Component/subpage styles compose on top of the shared Lab contract.
// Consumers inherit `labStyles` and pass local styles later to stylex.props(...)
// when they need to extend or override one semantic slot.
export const dialStyles = stylex.create({
  footer: {
    rowGap: 12,
  },
  controls: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: {
      default: 'flex-start',
      '@media (max-width: 640px)': 'space-between',
    },
    width: {
      default: 'auto',
      '@media (max-width: 640px)': '100%',
    },
    gap: 10,
    flexShrink: 0,
    borderTopWidth: {
      default: 0,
      '@media (max-width: 640px)': 1,
    },
    borderTopStyle: 'solid',
    borderTopColor: 'rgba(255,255,255,.08)',
    paddingTop: {
      default: 0,
      '@media (max-width: 640px)': 12,
    },
  },
  stepButton: {
    width: {
      default: 44,
      '@media (max-width: 640px)': 52,
    },
    height: {
      default: 44,
      '@media (max-width: 640px)': 52,
    },
    minHeight: 44,
    borderRadius: '50%',
    padding: 0,
    fontSize: 24,
    lineHeight: 1,
    touchAction: 'manipulation',
  },
});

export const objectStyles = stylex.create({
  body: {
    display: 'grid',
    gap: 12,
    padding: {
      default: '14px 20px 20px',
      '@media (max-width: 640px)': '12px 15px 15px',
    },
  },
  stack: {
    display: 'grid',
    gap: 12,
  },
  note: {
    margin: 0,
    color: 'var(--are-muted)',
    fontSize: 12,
    lineHeight: 1.5,
  },
});
