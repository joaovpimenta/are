export type MatchMedia = (query: string) => Pick<MediaQueryList, 'matches'>;

function getDefaultMatchMedia(): MatchMedia | undefined {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return undefined;
  return window.matchMedia.bind(window);
}

export function prefersReducedMotion(matchMedia: MatchMedia | undefined = getDefaultMatchMedia()): boolean {
  if (!matchMedia) return false;
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}
