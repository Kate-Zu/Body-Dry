import { create } from 'zustand';

export const useStore = create((set, get) => ({
  // User
  user: null,
  isAuthenticated: false,
  
  // Subscription
  subscription: null,
  isPremium: false,
  
  // Daily Goals
  calorieGoal: 2000,
  caloriesConsumed: 0,
  waterGoal: 2.7,
  waterConsumed: 0,
  
  // Macros
  proteinGoal: 150,
  proteinConsumed: 0,
  carbsGoal: 200,
  carbsConsumed: 0,
  fatsGoal: 65,
  fatsConsumed: 0,
  
  // Weight
  currentWeight: 75,
  targetWeight: 70,
  weightHistory: [],
  
  // Meals
  meals: {
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: [],
  },
  
  // Actions
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => set({ user: null, isAuthenticated: false, subscription: null, isPremium: false }),
  
  setSubscription: (subscription) => set({ 
    subscription, 
    isPremium: subscription?.isPremium || false 
  }),
  
  addWater: (amount) => set((state) => ({ 
    waterConsumed: Math.min(state.waterConsumed + amount, state.waterGoal) 
  })),
  
  removeWater: (amount) => set((state) => ({ 
    waterConsumed: Math.max(state.waterConsumed - amount, 0) 
  })),
  
  addMeal: (mealType, food) => set((state) => ({
    meals: {
      ...state.meals,
      [mealType]: [...state.meals[mealType], food],
    },
    caloriesConsumed: state.caloriesConsumed + food.calories,
    proteinConsumed: state.proteinConsumed + (food.protein || 0),
    carbsConsumed: state.carbsConsumed + (food.carbs || 0),
    fatsConsumed: state.fatsConsumed + (food.fats || 0),
  })),
  
  removeMeal: (mealType, foodIndex) => set((state) => {
    const food = state.meals[mealType][foodIndex];
    const newMeals = [...state.meals[mealType]];
    newMeals.splice(foodIndex, 1);
    return {
      meals: {
        ...state.meals,
        [mealType]: newMeals,
      },
      caloriesConsumed: state.caloriesConsumed - food.calories,
      proteinConsumed: state.proteinConsumed - (food.protein || 0),
      carbsConsumed: state.carbsConsumed - (food.carbs || 0),
      fatsConsumed: state.fatsConsumed - (food.fats || 0),
    };
  }),
  
  updateWeight: (weight) => set((state) => ({
    currentWeight: weight,
    weightHistory: [...state.weightHistory, { weight, date: new Date().toISOString() }],
  })),
  
  resetDaily: () => set({
    caloriesConsumed: 0,
    waterConsumed: 0,
    proteinConsumed: 0,
    carbsConsumed: 0,
    fatsConsumed: 0,
    meals: {
      breakfast: [],
      lunch: [],
      dinner: [],
      snacks: [],
    },
  }),
}));
