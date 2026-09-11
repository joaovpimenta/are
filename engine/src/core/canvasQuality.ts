export type CanvasFrameLoop = 'always' | 'demand';

export type CanvasQuality = {
  dpr: number;
  frameloop: CanvasFrameLoop;
};

/**
 * Large touch viewports are commonly GPU-constrained, especially when the
 * browser is emulating a high-density tablet. Keep the artifact legible while
 * avoiding a full-resolution, always-on render loop for every interaction.
 */
export function getCanvasQuality(): CanvasQuality {
  if (typeof window === 'undefined') return { dpr: 1.25, frameloop: 'always' };

  const coarsePointer = typeof window.matchMedia === 'function'
    && window.matchMedia('(pointer: coarse)').matches;
  const touchCapable = coarsePointer
    || 'ontouchstart' in window
    || navigator.maxTouchPoints > 0;
  const largeTouchViewport = Math.min(window.innerWidth, window.innerHeight) >= 768;

  return touchCapable && largeTouchViewport
    ? { dpr: 0.8, frameloop: 'demand' }
    : { dpr: 1.25, frameloop: 'always' };
}
