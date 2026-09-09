import * as stylex from '@stylexjs/stylex';

const styles = stylex.create({
  archive: {
    display: 'grid',
    gap: 18,
    padding: {
      default: 28,
      '@media (max-width: 680px)': 18,
    },
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'color-mix(in srgb, var(--echo-success) 38%, transparent)',
    borderRadius: 18,
    backgroundColor: 'color-mix(in srgb, var(--echo-surface) 90%, black)',
    boxShadow: '0 0 70px color-mix(in srgb, var(--echo-success) 10%, transparent)',
  },
  stamp: {
    width: 'fit-content',
    paddingBlock: 6,
    paddingInline: 9,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'var(--echo-success)',
    borderRadius: 5,
    color: 'var(--echo-success)',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 11,
    fontWeight: 900,
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  title: {
    margin: 0,
    color: 'var(--echo-text)',
    fontSize: 'clamp(28px, 6vw, 58px)',
    lineHeight: 0.98,
    letterSpacing: '-0.04em',
  },
  message: {
    maxWidth: 620,
    margin: 0,
    color: 'var(--echo-muted)',
    fontSize: 16,
    lineHeight: 1.7,
  },
  signature: {
    color: 'var(--echo-accent)',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 12,
    letterSpacing: 0.8,
  },
});

export function SignalArchive() {
  return (
    <article {...stylex.props(styles.archive)} aria-live="polite">
      <span {...stylex.props(styles.stamp)}>Arquivo restaurado</span>
      <h2 {...stylex.props(styles.title)}>Você não chegou tarde.</h2>
      <p {...stylex.props(styles.message)}>
        A transmissão não era um pedido de resgate. Era um aviso mantido em repetição por vinte e sete anos.
        O corredor permanece escuro — mas agora a estação sabe que alguém escutou.
      </p>
      <span {...stylex.props(styles.signature)}>VALE / RELAY 04 / CARRIER CLOSED</span>
    </article>
  );
}
