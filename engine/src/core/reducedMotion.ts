export type MatchMedia = (query: string) => Pick<MediaQueryList, 'matches'>;

export function prefersReducedMotion(matchMedia: MatchMedia | undefined = globalThis.matchMedia?.bind(globalThis)): boolean {
  if (!matchMedia) return false;
  return matchMedia('(prefers-reduced-motion: reduce)').matches;
}
