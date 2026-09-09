export const DEFAULT_DRAG_THRESHOLD_PX = 8;

export type GestureKind = 'press' | 'drag' | 'rotate' | 'slide';
export type GesturePhase = 'pending' | 'active' | 'ended' | 'cancelled';

export type PointerSample = {
  pointerId: number;
  pointerType: string;
  clientX: number;
  clientY: number;
};

export type GestureState = {
  kind: GestureKind;
  pointerId: number;
  pointerType: string;
  originX: number;
  originY: number;
  clientX: number;
  clientY: number;
  distancePx: number;
  phase: GesturePhase;
};

function distanceFromOrigin(state: GestureState, sample: PointerSample): number {
  return Math.hypot(sample.clientX - state.originX, sample.clientY - state.originY);
}

export function beginGesture(kind: GestureKind, sample: PointerSample): GestureState {
  return {
    kind,
    pointerId: sample.pointerId,
    pointerType: sample.pointerType,
    originX: sample.clientX,
    originY: sample.clientY,
    clientX: sample.clientX,
    clientY: sample.clientY,
    distancePx: 0,
    phase: 'pending',
  };
}

export function moveGesture(
  state: GestureState,
  sample: PointerSample,
  thresholdPx = DEFAULT_DRAG_THRESHOLD_PX,
): GestureState {
  if (state.pointerId !== sample.pointerId || state.phase === 'ended' || state.phase === 'cancelled') return state;
  const distancePx = distanceFromOrigin(state, sample);
  let phase: GesturePhase = state.phase;
  if (state.kind === 'press' && distancePx > thresholdPx) phase = 'cancelled';
  else if (state.kind !== 'press' && distancePx >= thresholdPx) phase = 'active';
  return { ...state, clientX: sample.clientX, clientY: sample.clientY, distancePx, phase };
}

export function finishGesture(state: GestureState): GestureState {
  return state.phase === 'cancelled' ? state : { ...state, phase: 'ended' };
}

export function cancelGesture(state: GestureState): GestureState {
  return { ...state, phase: 'cancelled' };
}

export function isTapGesture(state: GestureState, thresholdPx = DEFAULT_DRAG_THRESHOLD_PX): boolean {
  return state.phase === 'pending' && state.distancePx <= thresholdPx;
}

export function shouldCaptureAfterMove(previous: GestureState, next: GestureState): boolean {
  return previous.phase === 'pending' && next.phase === 'active';
}

export function allowsVerticalPageScroll(state: GestureState, sample: PointerSample): boolean {
  if (state.pointerType !== 'touch') return false;
  const dx = Math.abs(sample.clientX - state.originX);
  const dy = Math.abs(sample.clientY - state.originY);
  return dy > dx * 1.2;
}
