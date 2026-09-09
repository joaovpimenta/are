import * as stylex from '@stylexjs/stylex';

const focusRing = { outlineWidth: 3, outlineStyle: 'solid', outlineColor: '#61dafb', outlineOffset: 3 } as const;
const styles = stylex.create({
  page: {
    display: 'grid',
    alignItems: 'center',
    minHeight: '100dvh',
    paddingBlock: 'clamp(44px, 8vw, 96px)',
    paddingInline: 16,
    color: '#f4f5f7',
    backgroundColor: '#070a0f',
    backgroundImage: 'radial-gradient(circle at 18% -10%, #15374a, #070a0f 34rem)',
    fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
  },
  shell: { width: 'min(980px, 100%)', marginInline: 'auto' },
  eyebrow: { margin: 0, color: '#61dafb', fontFamily: 'ui-monospace, monospace', fontSize: 12, fontWeight: 900, letterSpacing: 1.8 },
  title: { margin: '8px 0 14px', fontSize: 'clamp(52px, 12vw, 108px)', lineHeight: 0.85, letterSpacing: '-0.07em' },
  lede: { maxWidth: 580, margin: 0, color: '#91a0b4', fontSize: 17, lineHeight: 1.6 },
  lab: {
    display: 'inline-flex', alignItems: 'center', minHeight: 48, marginBlock: '14px 48px', paddingInline: 16, borderWidth: 1, borderStyle: 'solid', borderColor: '#2f829c', borderRadius: 10, color: '#dff9ff', backgroundColor: '#101722', textDecoration: 'none', fontWeight: 850,
    ':hover': { borderColor: '#61dafb' }, ':focus-visible': focusRing,
  },
  grid: { display: 'grid', gap: 10 },
  card: {
    display: 'grid', gridTemplateColumns: { default: 'auto 1fr auto', '@media (max-width: 560px)': 'auto 1fr' }, alignItems: 'center', gap: 16, minHeight: 94, padding: 16, borderWidth: 1, borderStyle: 'solid', borderColor: '#20313d', borderRadius: 16, color: '#f4f5f7', backgroundColor: '#101722', textDecoration: 'none',
    ':hover': { borderColor: '#61dafb', backgroundColor: '#16212d' }, ':focus-visible': focusRing,
  },
  index: { display: 'grid', placeItems: 'center', width: 42, height: 42, borderRadius: 10, color: '#61dafb', backgroundColor: '#143b4a', fontFamily: 'ui-monospace, monospace', fontSize: 12, fontWeight: 900 },
  copy: { display: 'grid', gap: 5 },
  description: { color: '#91a0b4', fontSize: 13, lineHeight: 1.45 },
  action: { color: '#61dafb', fontFamily: 'ui-monospace, monospace', fontSize: 11, fontWeight: 850, '@media (max-width: 560px)': { gridColumn: 2 } },
  empty: { color: '#91a0b4' },
});

export function App() {
  return (
    <main {...stylex.props(styles.page)}>
      <div {...stylex.props(styles.shell)}>
        <p {...stylex.props(styles.eyebrow)}>ADVENTURE ROOMS ENGINE</p>
        <h1 {...stylex.props(styles.title)}>ARE</h1>
        <p {...stylex.props(styles.lede)}>Objetos diegéticos, mecanismos profundos e Adventures interativas verificáveis.</p>
        <a {...stylex.props(styles.lab)} href="./lab/">Abrir Lab de mecanismos →</a>
        <section {...stylex.props(styles.grid)} aria-label="Adventures">
          {__ARE_ADVENTURES__.length === 0 ? <p {...stylex.props(styles.empty)}>Nenhuma Adventure disponível.</p> : __ARE_ADVENTURES__.map((adventure, index) => (
            <a {...stylex.props(styles.card)} key={adventure.id} href={`./${adventure.id}/`}>
              <span {...stylex.props(styles.index)}>{String(index + 1).padStart(2, '0')}</span>
              <span {...stylex.props(styles.copy)}><strong>{adventure.title}</strong><small {...stylex.props(styles.description)}>{adventure.description}</small></span>
              <b {...stylex.props(styles.action)}>ABRIR →</b>
            </a>
          ))}
        </section>
      </div>
    </main>
  );
}
