import type { AdventureSessionDefinition, AdventureSessionSnapshot, MechanismInput, MechanismResult } from './adventureSession';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isScalar(value: unknown): value is string | number | boolean {
  return typeof value === 'string' || typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value));
}

function isInput(value: unknown): value is MechanismInput {
  return isScalar(value) || (Array.isArray(value) && value.every(isScalar));
}

export function loadCheckpoint(definition: AdventureSessionDefinition, initial: AdventureSessionSnapshot): AdventureSessionSnapshot {
  if (!definition.persistence) return initial;
  try {
    const raw: unknown = JSON.parse(definition.persistence.storage.getItem(definition.persistence.key ?? `are:session:${definition.adventureId}`) ?? 'null');
    if (!isRecord(raw) || raw.version !== 1 || raw.adventureId !== definition.adventureId
      || !Array.isArray(raw.requiredMechanisms) || raw.requiredMechanisms.join('\0') !== definition.requiredMechanisms.join('\0')
      || !isRecord(raw.mechanismResults) || !isRecord(raw.mechanismInputs)
      || !(raw.sceneId === null || typeof raw.sceneId === 'string')
      || !Array.isArray(raw.inventory) || !raw.inventory.every((id) => typeof id === 'string')
      || !(raw.selectedArtifactId === null || typeof raw.selectedArtifactId === 'string')) return initial;

    const results: Record<string, MechanismResult> = {};
    for (const id of definition.requiredMechanisms) {
      const result = raw.mechanismResults[id];
      if (result !== 'pending' && result !== 'active' && result !== 'error' && result !== 'solved') return initial;
      results[id] = result;
    }
    const inputs: Record<string, MechanismInput> = {};
    for (const [id, value] of Object.entries(raw.mechanismInputs)) {
      if (!definition.requiredMechanisms.includes(id) || !isInput(value)) return initial;
      Object.defineProperty(inputs, id, { value: Array.isArray(value) ? Object.freeze([...value]) : value, enumerable: true });
    }
    return {
      ...initial,
      sceneId: raw.sceneId,
      mechanismResults: Object.freeze(results),
      mechanismInputs: Object.freeze(inputs),
      inventory: Object.freeze([...new Set(raw.inventory)]),
      selectedArtifactId: raw.selectedArtifactId !== null && raw.inventory.includes(raw.selectedArtifactId) ? raw.selectedArtifactId : null,
      completed: definition.requiredMechanisms.every((id) => results[id] === 'solved'),
    };
  } catch {
    return initial;
  }
}

export function saveCheckpoint(definition: AdventureSessionDefinition, snapshot: AdventureSessionSnapshot): void {
  if (!definition.persistence) return;
  try {
    definition.persistence.storage.setItem(definition.persistence.key ?? `are:session:${definition.adventureId}`, JSON.stringify({
      ...snapshot, version: 1, requiredMechanisms: definition.requiredMechanisms,
    }));
  } catch {
    // Storage can be disabled or full; the in-memory session must remain playable.
  }
}
