import * as stylex from '@stylexjs/stylex';
import { useEffect, useState } from 'react';
import { RevealClue } from '@are/engine/components/reveal/RevealClue';
import type { AreTheme } from '@are/engine/theme';
import type { PuzzleStory } from '../narrative';

const styles = stylex.create({
  brief: {
    display: 'grid',
    gap: 13,
    margin: { default: '0 24px 20px', '@media (max-width: 760px)': '0 14px 16px' },
    padding: { default: 19, '@media (max-width: 760px)': 15 },
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'color-mix(in srgb, var(--are-accent) 28%, transparent)',
    borderRadius: 16,
    backgroundColor: 'color-mix(in srgb, var(--are-accent) 6%, var(--are-surface-raised))',
  },
  badge: {
    margin: 0,
    color: 'var(--are-accent)',
    fontSize: 10,
    fontWeight: 900,
    fontFamily: 'ui-monospace, monospace',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  title: {
    margin: 0,
    fontSize: 'clamp(19px, 3.2vw, 27px)',
    lineHeight: 1.2,
    color: 'var(--are-text)',
  },
  paragraph: {
    margin: 0,
    color: 'var(--are-text)',
    fontSize: 14,
    lineHeight: 1.7,
  },
  evidence: {
    display: 'grid',
    gap: 7,
    margin: 0,
    padding: 13,
    borderLeftWidth: 3,
    borderLeftStyle: 'solid',
    borderLeftColor: 'var(--are-accent)',
    borderRadius: 9,
    backgroundColor: 'color-mix(in srgb, var(--are-bg) 74%, transparent)',
    color: 'var(--are-text)',
  },
  ruleGrid: {
    display: 'grid',
    gridTemplateColumns: { default: 'repeat(2, minmax(0, 1fr))', '@media (max-width: 650px)': '1fr' },
    gap: 10,
  },
  rule: {
    display: 'grid',
    alignContent: 'start',
    gap: 6,
    padding: 11,
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'color-mix(in srgb, var(--are-accent) 14%, transparent)',
    borderRadius: 10,
  },
  guide: {
    display: 'grid',
    gap: 13,
    minWidth: 0,
    padding: { default: 20, '@media (max-width: 760px)': 14 },
    borderTopWidth: 1,
    borderTopStyle: 'solid',
    borderTopColor: 'color-mix(in srgb, var(--are-accent) 16%, transparent)',
    backgroundColor: 'var(--are-surface)',
  },
  guideTitle: {
    margin: 0,
    color: 'var(--are-text)',
    fontSize: 20,
    lineHeight: 1.2,
  },
  note: {
    margin: 0,
    color: 'var(--are-muted)',
    fontSize: 13,
    lineHeight: 1.55,
  },
  hintGrid: {
    display: 'grid',
    gridTemplateColumns: { default: 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))', '@media (max-width: 650px)': '1fr' },
    gap: 10,
  },
});

export function PuzzleBrief({ story, number }: { story: PuzzleStory; number?: number }) {
  return (
    <section {...stylex.props(styles.brief)} aria-label={'História: ' + story.title}>
      <p {...stylex.props(styles.badge)}>{number === undefined ? 'Arquivo de missão' : 'Missão ' + String(number).padStart(2, '0')}</p>
      <h3 {...stylex.props(styles.title)}>{story.title}</h3>
      <p {...stylex.props(styles.paragraph)}>{story.scene}</p>
      <blockquote {...stylex.props(styles.evidence)}>
        <strong {...stylex.props(styles.badge)}>Evidência encontrada</strong>
        <p {...stylex.props(styles.paragraph)}>{story.evidence}</p>
      </blockquote>
      <div {...stylex.props(styles.ruleGrid)}>
        <div {...stylex.props(styles.rule)}>
          <strong {...stylex.props(styles.badge)}>Seu objetivo</strong>
          <p {...stylex.props(styles.paragraph)}>{story.objective}</p>
        </div>
        <div {...stylex.props(styles.rule)}>
          <strong {...stylex.props(styles.badge)}>Regra do minigame</strong>
          <p {...stylex.props(styles.paragraph)}>{story.rule}</p>
        </div>
      </div>
    </section>
  );
}

/** Uses the real RevealClue component for three incremental hints and a direct answer. */
export function PuzzleGuide({
  story,
  theme,
  resetKey = 0,
}: {
  story: PuzzleStory;
  theme: AreTheme;
  resetKey?: number;
}) {
  const [unlocked, setUnlocked] = useState(0);
  useEffect(() => { setUnlocked(0); }, [resetKey]);

  return (
    <section {...stylex.props(styles.guide)} aria-label={'Ajuda: ' + story.title}>
      <h3 {...stylex.props(styles.guideTitle)}>Precisa de uma pista?</h3>
      <p {...stylex.props(styles.note)}>Revele uma dica por vez ou vá diretamente à resposta final. Abrir uma dica não resolve o mecanismo.</p>
      <div {...stylex.props(styles.hintGrid)}>
        <RevealClue
          resetKey={resetKey}
          title="Pista 1 · Observe"
          teaser="Primeiro indício, sem revelar a resposta."
          content={story.hints[0]}
          theme={theme}
          onReveal={() => setUnlocked((value) => Math.max(value, 1))}
        />
        {unlocked >= 1 && (
          <RevealClue
            resetKey={resetKey}
            title="Pista 2 · Relacione"
            teaser="Uma orientação adicional sobre a evidência."
            content={story.hints[1]}
            theme={theme}
            onReveal={() => setUnlocked((value) => Math.max(value, 2))}
          />
        )}
        {unlocked >= 2 && (
          <RevealClue
            resetKey={resetKey}
            title="Pista 3 · Direção final"
            teaser="Última dica antes da solução completa."
            content={story.hints[2]}
            theme={theme}
          />
        )}
      </div>
      <RevealClue
        resetKey={resetKey}
        title="Resposta final · Como resolver"
        teaser="Mostrar a combinação exata e o passo a passo completo, sem executar o puzzle automaticamente."
        content={['RESPOSTA: ' + story.solution, '', ...story.steps.map((step, index) => (index + 1) + '. ' + step)].join('\n')}
        theme={theme}
      />
    </section>
  );
}
