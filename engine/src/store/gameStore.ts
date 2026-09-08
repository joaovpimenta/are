import { create } from 'zustand';

export type GameStore = {
  inventory: string[];
  flags: Record<string, boolean>;
  addItem: (item: string) => void;
  setFlag: (flag: string, value?: boolean) => void;
  reset: () => void;
};

const initial = {
  inventory: [] as string[],
  flags: {} as Record<string, boolean>,
};

export const useGameStore = create<GameStore>((set) => ({
  ...initial,
  addItem: (item) => set((state) => ({
    inventory: state.inventory.includes(item) ? state.inventory : [...state.inventory, item],
  })),
  setFlag: (flag, value = true) => set((state) => ({
    flags: { ...state.flags, [flag]: value },
  })),
  reset: () => set({ ...initial }),
}));
