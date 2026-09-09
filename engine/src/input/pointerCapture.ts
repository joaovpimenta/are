export type PointerCaptureTarget = {
  setPointerCapture(pointerId: number): void;
  hasPointerCapture?(pointerId: number): boolean;
  releasePointerCapture?(pointerId: number): void;
};

export function isPointerCaptureTarget(value: unknown): value is PointerCaptureTarget {
  return Boolean(value && typeof (value as PointerCaptureTarget).setPointerCapture === 'function');
}

export function capturePointer(value: unknown, pointerId: number): boolean {
  if (!isPointerCaptureTarget(value)) return false;
  try {
    value.setPointerCapture(pointerId);
    return true;
  } catch {
    return false;
  }
}

export function releasePointer(value: unknown, pointerId: number): boolean {
  if (!isPointerCaptureTarget(value) || typeof value.releasePointerCapture !== 'function') return false;
  try {
    if (typeof value.hasPointerCapture === 'function' && !value.hasPointerCapture(pointerId)) return false;
    value.releasePointerCapture(pointerId);
    return true;
  } catch {
    return false;
  }
}
