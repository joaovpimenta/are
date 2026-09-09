export type HitRect = {
  id: string;
  centerX: number;
  centerY: number;
  width: number;
  height: number;
};

export function hitRectsOverlap(a: HitRect, b: HitRect, clearance = 0): boolean {
  const horizontal = Math.abs(a.centerX - b.centerX) < (a.width + b.width) / 2 + clearance;
  const vertical = Math.abs(a.centerY - b.centerY) < (a.height + b.height) / 2 + clearance;
  return horizontal && vertical;
}

export function overlappingHitPairs(targets: readonly HitRect[], clearance = 0): readonly [string, string][] {
  const overlaps: [string, string][] = [];
  for (let left = 0; left < targets.length; left += 1) {
    for (let right = left + 1; right < targets.length; right += 1) {
      if (hitRectsOverlap(targets[left], targets[right], clearance)) overlaps.push([targets[left].id, targets[right].id]);
    }
  }
  return overlaps;
}

export function interactiveRectContainsVisual(interactive: HitRect, visual: HitRect): boolean {
  const interactiveLeft = interactive.centerX - interactive.width / 2;
  const interactiveRight = interactive.centerX + interactive.width / 2;
  const interactiveTop = interactive.centerY + interactive.height / 2;
  const interactiveBottom = interactive.centerY - interactive.height / 2;
  const visualLeft = visual.centerX - visual.width / 2;
  const visualRight = visual.centerX + visual.width / 2;
  const visualTop = visual.centerY + visual.height / 2;
  const visualBottom = visual.centerY - visual.height / 2;
  return interactiveLeft <= visualLeft
    && interactiveRight >= visualRight
    && interactiveTop >= visualTop
    && interactiveBottom <= visualBottom;
}
