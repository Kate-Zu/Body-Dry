import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DRY_PLAN_KEY = 'dry_plan_state';

export interface DryPlanState {
  /** ISO date string of last plan generation/update */
  lastPlanUpdate: string | null;
  /** Current week number (1, 2, 3, …) — drives progressive restriction */
  weekNumber: number;
  /** Whether user has an active drying plan */
  isActive: boolean;

  /** Load persisted state from AsyncStorage */
  load: () => Promise<void>;
  /** Mark plan as just updated (resets timer, increments week) */
  markUpdated: () => Promise<void>;
  /** Activate the drying plan tracker (week 1) */
  activate: () => Promise<void>;
  /** Deactivate (user finished / cancelled) */
  deactivate: () => Promise<void>;
  /** Check if 7+ days have passed since lastPlanUpdate */
  isReminderDue: () => boolean;
}

export const useDryPlanStore = create<DryPlanState>((set, get) => ({
  lastPlanUpdate: null,
  weekNumber: 0,
  isActive: false,

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(DRY_PLAN_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        set({
          lastPlanUpdate: parsed.lastPlanUpdate || null,
          weekNumber: parsed.weekNumber || 0,
          isActive: parsed.isActive || false,
        });
      }
    } catch (e) {
      console.error('[dryPlanStore] load error', e);
    }
  },

  markUpdated: async () => {
    const state = get();
    const newWeek = state.weekNumber + 1;
    const newState = {
      lastPlanUpdate: new Date().toISOString(),
      weekNumber: newWeek,
      isActive: true,
    };
    set(newState);
    try {
      await AsyncStorage.setItem(DRY_PLAN_KEY, JSON.stringify(newState));
    } catch (e) {
      console.error('[dryPlanStore] save error', e);
    }
  },

  activate: async () => {
    const newState = {
      lastPlanUpdate: new Date().toISOString(),
      weekNumber: 1,
      isActive: true,
    };
    set(newState);
    try {
      await AsyncStorage.setItem(DRY_PLAN_KEY, JSON.stringify(newState));
    } catch (e) {
      console.error('[dryPlanStore] activate error', e);
    }
  },

  deactivate: async () => {
    const newState = {
      lastPlanUpdate: null,
      weekNumber: 0,
      isActive: false,
    };
    set(newState);
    try {
      await AsyncStorage.setItem(DRY_PLAN_KEY, JSON.stringify(newState));
    } catch (e) {
      console.error('[dryPlanStore] deactivate error', e);
    }
  },

  isReminderDue: () => {
    const { lastPlanUpdate, isActive } = get();
    if (!isActive || !lastPlanUpdate) return false;
    const last = new Date(lastPlanUpdate).getTime();
    const now = Date.now();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    return now - last >= sevenDays;
  },
}));
