import { create } from 'zustand';
import { foodsApi } from '../api';

interface Food {
  id: string;
  name: string;
  brand?: string;
  barcode?: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
  servingSize: number;
  servingUnit: string;
  isVerified: boolean;
  category?: string;
}

interface CreateFoodData {
  name: string;
  brand?: string;
  barcode?: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber?: number;
  servingSize?: number;
  servingUnit?: string;
}

interface FoodsState {
  searchResults: Food[];
  recentFoods: Food[];
  favoriteFoods: Food[];
  selectedFood: Food | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  search: (query: string) => Promise<void>;
  searchByBarcode: (barcode: string) => Promise<Food | null>;
  createFood: (data: CreateFoodData) => Promise<Food | null>;
  fetchRecent: () => Promise<void>;
  fetchFavorites: () => Promise<void>;
  addToFavorites: (foodId: string) => Promise<boolean>;
  removeFromFavorites: (foodId: string) => Promise<boolean>;
  selectFood: (food: Food | null) => void;
  clearSearch: () => void;
}

export const useFoodsStore = create<FoodsState>((set, get) => ({
  searchResults: [],
  recentFoods: [],
  favoriteFoods: [],
  selectedFood: null,
  isLoading: false,
  error: null,

  search: async (query: string) => {
    if (!query.trim()) {
      set({ searchResults: [] });
      return;
    }
    
    set({ isLoading: true, error: null });
    try {
      const response = await foodsApi.search(query);
      set({ searchResults: response.data, isLoading: false });
    } catch (error) {
      set({ error: 'Помилка пошуку', isLoading: false, searchResults: [] });
    }
  },

  searchByBarcode: async (barcode: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await foodsApi.getByBarcode(barcode);
      set({ isLoading: false });
      return response.data;
    } catch (error: any) {
      const is404 = error?.response?.status === 404;
      set({ 
        error: is404 ? 'not_found' : 'Помилка пошуку', 
        isLoading: false 
      });
      return null;
    }
  },

  createFood: async (data: CreateFoodData) => {
    set({ error: null });
    try {
      const response = await foodsApi.create(data);
      const newFood = response.data;
      // Add to recent foods
      set(state => ({
        recentFoods: [newFood, ...state.recentFoods.slice(0, 19)],
      }));
      return newFood;
    } catch (error) {
      set({ error: 'Не вдалося створити продукт' });
      return null;
    }
  },

  fetchRecent: async () => {
    try {
      const response = await foodsApi.getRecent(20);
      const serverFoods: Food[] = response.data;
      // Merge: keep locally created foods (from createFood) that aren't in server response
      set(state => {
        const serverIds = new Set(serverFoods.map((f: Food) => f.id));
        const localOnly = state.recentFoods.filter((f: Food) => !serverIds.has(f.id));
        return { recentFoods: [...localOnly, ...serverFoods].slice(0, 20) };
      });
    } catch (error) {
      // Ignore errors for recent foods
    }
  },

  fetchFavorites: async () => {
    try {
      const response = await foodsApi.getFavorites();
      set({ favoriteFoods: response.data });
    } catch (error) {
      // Ignore errors for favorites
    }
  },

  addToFavorites: async (foodId: string) => {
    try {
      await foodsApi.addToFavorites(foodId);
      // Update local state
      const food = get().searchResults.find(f => f.id === foodId) 
        || get().recentFoods.find(f => f.id === foodId);
      if (food) {
        set(state => ({ favoriteFoods: [...state.favoriteFoods, food] }));
      }
      return true;
    } catch (error) {
      return false;
    }
  },

  removeFromFavorites: async (foodId: string) => {
    try {
      await foodsApi.removeFromFavorites(foodId);
      set(state => ({
        favoriteFoods: state.favoriteFoods.filter(f => f.id !== foodId),
      }));
      return true;
    } catch (error) {
      return false;
    }
  },

  selectFood: (food: Food | null) => set({ selectedFood: food }),
  
  clearSearch: () => set({ searchResults: [], error: null }),
}));
