import { create } from 'zustand';
import { diaryApi, waterApi } from '../api';

interface Food {
  id: string;
  name: string;
  brand?: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  servingSize: number;
  servingUnit: string;
}

interface MealFood {
  id: string;
  food: Food;
  amount: number;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface Meal {
  id: string;
  type: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
  foods: MealFood[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFats: number;
}

interface DayData {
  date: string;
  meals: Meal[];
  totals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  goals: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  water: {
    current: number;
    goal: number;
  };
}

interface DiaryState {
  currentDate: string;
  dayData: DayData | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
  
  // Actions
  setDate: (date: string) => void;
  fetchDay: (date?: string) => Promise<void>;
  addFoodEntry: (data: { foodId: string; mealType: string; amount: number; food?: Food }) => Promise<boolean>;
  updateEntry: (entryId: string, amount: number) => Promise<boolean>;
  deleteEntry: (entryId: string) => Promise<boolean>;
  addWater: (amount: number) => Promise<boolean>;
  updateWaterOptimistic: (newAmount: number) => void;
}

const getTodayDate = () => new Date().toISOString().split('T')[0];

export const useDiaryStore = create<DiaryState>((set, get) => ({
  currentDate: getTodayDate(),
  dayData: null,
  isLoading: false,
  isSaving: false,
  error: null,

  setDate: (date: string) => {
    set({ currentDate: date });
    get().fetchDay(date);
  },

  fetchDay: async (date?: string) => {
    const targetDate = date || get().currentDate;
    set({ isLoading: true, error: null });
    
    try {
      const [diaryResponse, waterResponse] = await Promise.all([
        diaryApi.getDay(targetDate),
        waterApi.getDay(targetDate),
      ]);

      const diaryData = diaryResponse.data;
      const waterData = waterResponse.data;

      set({
        dayData: {
          date: targetDate,
          meals: diaryData.meals || [],
          totals: diaryData.totals || { calories: 0, protein: 0, carbs: 0, fats: 0 },
          goals: diaryData.goals || { calories: 2000, protein: 150, carbs: 200, fats: 65 },
          water: {
            current: (waterData.amount || 0) / 1000, // Convert ml to liters
            goal: (waterData.goal || 2700) / 1000, // Convert ml to liters
          },
        },
        isLoading: false,
      });
    } catch (error) {
      set({ 
        error: 'Не вдалося завантажити дані', 
        isLoading: false,
        dayData: {
          date: targetDate,
          meals: [],
          totals: { calories: 0, protein: 0, carbs: 0, fats: 0 },
          goals: { calories: 2000, protein: 150, carbs: 200, fats: 65 },
          water: { current: 0, goal: 2.7 }, // In liters
        },
      });
    }
  },

  // Оптимистичное обновление воды (мгновенно обновляем UI)
  updateWaterOptimistic: (newAmount: number) => {
    const { dayData } = get();
    if (dayData) {
      set({
        dayData: {
          ...dayData,
          water: {
            ...dayData.water,
            current: newAmount,
          },
        },
      });
    }
  },

  addFoodEntry: async (data: { foodId: string; mealType: string; amount: number; food?: Food }) => {
    set({ isSaving: true });
    try {
      await diaryApi.addEntry({
        foodId: data.foodId,
        mealType: data.mealType as 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK',
        amount: data.amount,
        date: get().currentDate,
      });
      // Фоновое обновление без блокировки UI
      get().fetchDay();
      set({ isSaving: false });
      return true;
    } catch (error) {
      set({ isSaving: false });
      return false;
    }
  },

  updateEntry: async (entryId: string, amount: number) => {
    set({ isSaving: true });
    try {
      await diaryApi.updateEntry(entryId, { amount });
      get().fetchDay();
      set({ isSaving: false });
      return true;
    } catch (error) {
      set({ isSaving: false });
      return false;
    }
  },

  deleteEntry: async (entryId: string) => {
    set({ isSaving: true });
    try {
      await diaryApi.deleteEntry(entryId);
      get().fetchDay();
      set({ isSaving: false });
      return true;
    } catch (error) {
      set({ isSaving: false });
      return false;
    }
  },

  addWater: async (amount: number) => {
    try {
      // Відправляємо на сервер та рефрешимо дані
      // UI вже оновлено через updateWaterOptimistic
      // Convert liters to ml for backend (round to avoid float precision issues)
      await waterApi.add({ amount: Math.round(amount * 1000), date: get().currentDate });
      return true;
    } catch (error) {
      console.error('Failed to add water:', error);
      return false;
    }
  },
}));
