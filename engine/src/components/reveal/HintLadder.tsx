import * as stylex from '@stylexjs/stylex';
import { useId, useState } from 'react';
import type { AreTheme } from '../../theme';
import { toObjectThemeStyle } from '../../theme';
import { clueStyles } from './RevealClue';

type HintLadderProps = {
  hints: readonly string[];
  solution: string;
  theme?: AreTheme;
  resetKey?: number | string;
};

const styles = stylex.create({
  list: { display: 'grid', gap: 10, margin: 0, paddingLeft: 24, color: 'var(--object-text)', fontSize: 14, lineHeight: 1.6 },
  actions: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  solution: { borderLeftColor: 'var(--object-warning)' },
});

function HintSteps({ hints, solution, theme }: HintLadderProps) {
  const [count, setCount] = useState(0);
  const [showSolution, setShowSolution] = useState(false);
  const hintsId = useId();
  const solutionId = useId();
  return (
    <section {...stylex.props(clueStyles.panel)} style={theme ? toObjectThemeStyle(theme) : undefined} aria-label="Ajuda do enigma">
      <h3 {...stylex.props(clueStyles.title)}>Precisa de uma dica?</h3>
      <p {...stylex.props(clueStyles.teaser)}>Revele uma dica por vez. A solução completa só aparece se você pedir.</p>
      <div id={hintsId} aria-live="polite" aria-relevant="additions">
        {count > 0 && <ol {...stylex.props(styles.list)}>{hints.slice(0, count).map((hint, index) => <li key={index}>{hint}</li>)}</ol>}
      </div>
      <div {...stylex.props(styles.actions)}>
        <button {...stylex.props(clueStyles.button)} type="button" disabled={count >= hints.length} aria-controls={hintsId} onClick={() => setCount((value) => Math.min(value + 1, hints.length))}>
          {count < hints.length ? `Revelar dica ${count + 1} de ${hints.length}` : 'Todas as dicas reveladas'}
        </button>
        <button {...stylex.props(clueStyles.button)} type="button" aria-controls={solutionId} aria-expanded={showSolution} onClick={() => setShowSolution(!showSolution)}>
          {showSolution ? 'Ocultar solução' : 'Revelar solução'}
        </button>
      </div>
      <div id={solutionId} aria-live="polite">{showSolution && <p {...stylex.props(clueStyles.content, styles.solution)}>{solution}</p>}</div>
    </section>
  );
}

export function HintLadder(props: HintLadderProps) {
  return <HintSteps key={`${props.resetKey ?? 0}:${props.solution}`} {...props} />;
}
