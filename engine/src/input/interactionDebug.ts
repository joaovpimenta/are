import { clientPointToNdc, type CanvasBounds } from './coordinates';

declare const __ARE_INTERACTION_DEBUG__: boolean | undefined;

type LocalPoint = { x: number; y: number; z?: number };

export type InteractionDebugRecord = {
  clientX: number;
  clientY: number;
  pointerType: string;
  pointerId: number;
  hit: string;
  ndc: { x: number; y: number };
  bounds: CanvasBounds;
  local?: LocalPoint;
};

declare global {
  interface Window {
    __ARE_INTERACTION_DEBUG_STATE__?: {
      last: InteractionDebugRecord;
      history: InteractionDebugRecord[];
    };
  }
}

export function interactionDebugEnabled(): boolean {
  return typeof __ARE_INTERACTION_DEBUG__ !== 'undefined' && __ARE_INTERACTION_DEBUG__ === true;
}

export function recordPointerDebug(
  sample: { clientX: number; clientY: number; pointerType: string; pointerId: number },
  bounds: CanvasBounds,
  hit: string,
  local?: LocalPoint,
): void {
  if (!interactionDebugEnabled() || typeof window === 'undefined') return;
  const record: InteractionDebugRecord = {
    ...sample,
    hit,
    ndc: clientPointToNdc(sample.clientX, sample.clientY, bounds),
    bounds: { left: bounds.left, top: bounds.top, width: bounds.width, height: bounds.height },
    local: local ? { x: local.x, y: local.y, z: local.z } : undefined,
  };
  const history = [record, ...(window.__ARE_INTERACTION_DEBUG_STATE__?.history ?? [])].slice(0, 30);
  window.__ARE_INTERACTION_DEBUG_STATE__ = { last: record, history };
}
