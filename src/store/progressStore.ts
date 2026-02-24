import { create } from 'zustand';
import { progressApi } from '../api';

interface WeightEntry {
  id: string;
  weight: number;
  date: string;
  note?: string;
  isExpected?: boolean; // For future expected weight
}

interface DailyData {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  water: number;
  weight?: number;
}

interface ProgressStats {
  period: {
    start: string;
    end: string;
    days: number;
  };
  averages: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    water: number;
  };
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    water: number;
  };
  goals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
    water: number;
  } | null;
  weight: {
    start?: number;
    current?: number;
    change: number;
    target?: number;
  };
  dailyData: DailyData[];
}

interface ProgressState {
  weightHistory: WeightEntry[];
  weeklyStats: ProgressStats | null;
  monthlyStats: ProgressStats | null;
  yearlyStats: ProgressStats | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  fetchWeightHistory: (limit?: number) => Promise<void>;
  addWeight: (weight: number, date?: string, note?: string) => Promise<boolean>;
  deleteWeight: (id: string) => Promise<boolean>;
  fetchWeeklyStats: () => Promise<void>;
  fetchMonthlyStats: () => Promise<void>;
  fetchYearlyStats: () => Promise<void>;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  weightHistory: [],
  weeklyStats: null,
  monthlyStats: null,
  yearlyStats: null,
  isLoading: false,
  error: null,

  fetchWeightHistory: async (limit?: number) => {
    set({ isLoading: true, error: null });
    try {
      const response = await progressApi.getWeightHistory(limit);
      // Backend returns { weights: [...], current, target, change }
      const weightsArray = response.data?.weights || response.data || [];
      // Mark entries that are in the future as expected
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const entries = weightsArray.map((entry: any) => {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);
        return {
          id: entry.id || `${entry.date}-${entry.weight}`,
          weight: entry.weight,
          date: entry.date,
          note: entry.note,
          isExpected: entryDate > today,
        };
      });
      set({ weightHistory: entries, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch weight history:', error);
      set({ error: 'Не вдалося завантажити історію ваги', isLoading: false, weightHistory: [] });
    }
  },

  addWeight: async (weight: number, date?: string, note?: string) => {
    try {
      const targetDate = date || new Date().toISOString().split('T')[0];
      await progressApi.addWeight({ weight, date: targetDate, note });
      await get().fetchWeightHistory();
      return true;
    } catch (error) {
      return false;
    }
  },

  deleteWeight: async (id: string) => {
    try {
      await progressApi.deleteWeight(id);
      await get().fetchWeightHistory();
      return true;
    } catch (error) {
      return false;
    }
  },

  fetchWeeklyStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await progressApi.getWeekly();
      set({ weeklyStats: response.data, isLoading: false });
    } catch (error) {
      set({ 
        error: 'Не вдалося завантажити статистику', 
        isLoading: false,
        weeklyStats: null,
      });
    }
  },

  fetchMonthlyStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await progressApi.getMonthly();
      set({ monthlyStats: response.data, isLoading: false });
    } catch (error) {
      set({ 
        error: 'Не вдалося завантажити статистику',
        isLoading: false,
        monthlyStats: null,
      });
    }
  },

  fetchYearlyStats: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await progressApi.getYearly();
      set({ yearlyStats: response.data, isLoading: false });
    } catch (error) {
      set({ 
        error: 'Не вдалося завантажити статистику',
        isLoading: false,
        yearlyStats: null,
      });
    }
  },
}));
