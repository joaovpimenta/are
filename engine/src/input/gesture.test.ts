import { describe, expect, it } from 'vitest';
import {
  DEFAULT_DRAG_THRESHOLD_PX,
  allowsVerticalPageScroll,
  beginGesture,
  cancelGesture,
  isTapGesture,
  moveGesture,
  moveGestureRespectingPageScroll,
  shouldCaptureAfterMove,
} from './gesture';

const sample = (clientX: number, clientY: number, pointerType = 'touch') => ({ pointerId: 7, pointerType, clientX, clientY });

describe('gesture primitive', () => {
  it('keeps a few pixels of movement as a tap', () => {
    const start = beginGesture('press', sample(20, 30));
    const moved = moveGesture(start, sample(24, 33));
    expect(moved.phase).toBe('pending');
    expect(isTapGesture(moved)).toBe(true);
  });

  it('promotes drag, rotate and slide after the shared threshold', () => {
    for (const kind of ['drag', 'rotate', 'slide'] as const) {
      const start = beginGesture(kind, sample(0, 0, 'mouse'));
      const moved = moveGesture(start, sample(DEFAULT_DRAG_THRESHOLD_PX + 1, 0, 'mouse'));
      expect(moved.phase).toBe('active');
      expect(shouldCaptureAfterMove(start, moved)).toBe(true);
    }
  });

  it('cancels a press that turns into a drag', () => {
    const start = beginGesture('press', sample(0, 0));
    expect(moveGesture(start, sample(0, 12)).phase).toBe('cancelled');
  });

  it('recognizes vertical touch motion as page-scroll intent', () => {
    const start = beginGesture('rotate', sample(40, 40));
    expect(allowsVerticalPageScroll(start, sample(43, 64))).toBe(true);
    expect(allowsVerticalPageScroll(start, sample(64, 43))).toBe(false);
  });

  it('cancels a rotate candidate once touch motion belongs to page scroll', () => {
    const start = beginGesture('rotate', sample(40, 40));
    const moved = moveGestureRespectingPageScroll(start, sample(43, 64));
    expect(moved.phase).toBe('cancelled');
    expect(moved.distancePx).toBeGreaterThan(DEFAULT_DRAG_THRESHOLD_PX);
    expect(isTapGesture(moved)).toBe(false);
  });

  it('keeps horizontal rotate motion eligible for capture', () => {
    const start = beginGesture('rotate', sample(40, 40));
    const moved = moveGestureRespectingPageScroll(start, sample(64, 43));
    expect(moved.phase).toBe('active');
    expect(shouldCaptureAfterMove(start, moved)).toBe(true);
  });

  it('cancels deterministically', () => {
    expect(cancelGesture(beginGesture('drag', sample(0, 0))).phase).toBe('cancelled');
  });
});
