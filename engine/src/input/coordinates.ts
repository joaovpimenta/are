export type CanvasBounds = {
  left: number;
  top: number;
  width: number;
  height: number;
};

export type CanvasPoint = { x: number; y: number };
export type NormalizedDeviceCoordinates = { x: number; y: number };

export function clientPointToCanvasPoint(clientX: number, clientY: number, bounds: CanvasBounds): CanvasPoint {
  if (bounds.width <= 0 || bounds.height <= 0) throw new Error('Canvas bounds must have positive dimensions.');
  return { x: clientX - bounds.left, y: clientY - bounds.top };
}

export function canvasPointToNdc(point: CanvasPoint, bounds: CanvasBounds): NormalizedDeviceCoordinates {
  if (bounds.width <= 0 || bounds.height <= 0) throw new Error('Canvas bounds must have positive dimensions.');
  return {
    x: (point.x / bounds.width) * 2 - 1,
    y: -((point.y / bounds.height) * 2 - 1),
  };
}

export function clientPointToNdc(clientX: number, clientY: number, bounds: CanvasBounds): NormalizedDeviceCoordinates {
  return canvasPointToNdc(clientPointToCanvasPoint(clientX, clientY, bounds), bounds);
}
