export interface AdventureRuntimeState {
  flags: Record<string, boolean>;
  values: Record<string, unknown>;
}

export interface RuntimeContext {
  adventureId: string;
  themeId: string;
  scenarioId: string;
  reducedMotion: boolean;
  debug: boolean;
  state: AdventureRuntimeState;
}

export type RuntimeContextInput = Partial<Omit<RuntimeContext, 'adventureId' | 'state'>> & {
  adventureId: string;
  state?: Partial<AdventureRuntimeState>;
};

export function createRuntimeContext(input: RuntimeContextInput): RuntimeContext {
  return {
    adventureId: input.adventureId,
    themeId: input.themeId ?? 'default',
    scenarioId: input.scenarioId ?? 'default',
    reducedMotion: input.reducedMotion ?? false,
    debug: input.debug ?? false,
    state: {
      flags: { ...input.state?.flags },
      values: { ...input.state?.values },
    },
  };
}
