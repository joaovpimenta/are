import { events, type RootState } from '@react-three/fiber';
import { clientPointToNdc } from './coordinates';

/**
 * R3F's default offsetX/offsetY are relative to the browser event target.
 * Drei Html overlays can change that target, and scrolling or CSS sizing can
 * also make its offsets differ from the WebGL canvas's visual rectangle.
 * Always raycast from viewport client coordinates relative to the actual canvas.
 */
export function canvasEvents(state: RootState) {
  const defaultEvents = events(state);
  return {
    ...defaultEvents,
    compute: (event: Parameters<typeof defaultEvents.compute>[0], current: RootState) => {
      const bounds = current.gl.domElement.getBoundingClientRect();
      if (bounds.width <= 0 || bounds.height <= 0) return;
      const pointer = clientPointToNdc(event.clientX, event.clientY, bounds);
      current.pointer.set(pointer.x, pointer.y);
      current.raycaster.setFromCamera(current.pointer, current.camera);
    },
  };
}
