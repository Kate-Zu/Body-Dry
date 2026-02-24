import { create } from 'zustand';
import { authApi, usersApi, subscriptionsApi, tokenManager } from '../api';
import { AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Profile {
  id: string;
  name: string;
  gender: 'MALE' | 'FEMALE';
  birthDate: string;
  height: number;
  currentWeight: number;
  targetWeight?: number;
  activityLevel: string;
  goal: string;
  bmr: number;
  tdee: number;
  calorieGoal: number;
  proteinGoal: number;
  carbsGoal: number;
  fatsGoal: number;
  waterGoal: number;
  createdAt: string;
  updatedAt: string;
}

interface Subscription {
  id: string;
  userId: string;
  plan: 'FREE' | 'BODY_PRO';
  status: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  canceledAt: string | null;
  isPremium: boolean;
}

interface User {
  id: string;
  email: string;
  profile?: Profile;
}

interface GoalsUpdate {
  calorieGoal?: number;
  proteinGoal?: number;
  carbsGoal?: number;
  fatsGoal?: number;
}

interface AuthState {
  user: User | null;
  subscription: Subscription | null;
  isPremium: boolean;
  isAuthenticated: boolean;
  isLoading: boolean;      // Тільки для початкової перевірки авторизації
  isSubmitting: boolean;   // Для логіну/реєстрації
  isNewUser: boolean;       // true після реєстрації, false після логіну
  error: string | null;
  avatarUri: string | null; // Локальне фото профілю
  
  // Actions
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
  setUser: (user: User | null) => void;
  
  // Avatar Actions
  loadAvatar: () => Promise<void>;
  setAvatar: (uri: string | null) => Promise<void>;
  
  // Profile Actions
  fetchProfile: () => Promise<Profile | null>;
  updateGoals: (goals: GoalsUpdate) => Promise<boolean>;
  updateProfile: (data: Partial<Profile>) => Promise<boolean>;
  
  // Subscription Actions
  fetchSubscription: () => Promise<Subscription | null>;
  cancelSubscription: () => Promise<boolean>;
  restoreSubscription: () => Promise<boolean>;
  setSubscription: (subscription: Subscription | null) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  subscription: null,
  isPremium: false,
  isAuthenticated: false,
  isLoading: true,
  isSubmitting: false,
  isNewUser: false,
  error: null,
  avatarUri: null,

  loadAvatar: async () => {
    try {
      const saved = await AsyncStorage.getItem('user_avatar');
      if (saved) set({ avatarUri: saved });
    } catch (_) {}
  },

  setAvatar: async (uri: string | null) => {
    try {
      if (uri) {
        await AsyncStorage.setItem('user_avatar', uri);
      } else {
        await AsyncStorage.removeItem('user_avatar');
      }
      set({ avatarUri: uri });
    } catch (_) {}
  },

  login: async (email: string, password: string) => {
    set({ isSubmitting: true, error: null });
    try {
      const response = await authApi.login({ email, password });
      const { accessToken, refreshToken, user } = response.data;
      
      await tokenManager.setTokens(accessToken, refreshToken);
      set({ user, isAuthenticated: true, isSubmitting: false, isNewUser: false });
      
      // Завантажуємо аватар та підписку після логіну
      get().loadAvatar();
      get().fetchSubscription();
      
      return true;
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string | string[]; statusCode?: number }>;
      let message = 'Помилка входу';
      
      if (axiosError.response?.data?.message) {
        // Handle both string and array of strings
        const serverMessage = axiosError.response.data.message;
        message = Array.isArray(serverMessage) ? serverMessage[0] : serverMessage;
      } else if (axiosError.code === 'ERR_NETWORK' || axiosError.message === 'Network Error') {
        message = 'Немає з\'єднання з сервером. Перевірте інтернет.';
      } else if (axiosError.code === 'ECONNABORTED') {
        message = 'Час очікування вичерпано. Спробуйте ще раз.';
      } else if (axiosError.response?.status === 401) {
        message = 'Невірна пошта або пароль';
      } else if (axiosError.response?.status === 404) {
        message = 'Сервер недоступний';
      } else if (axiosError.response?.status === 500) {
        message = 'Помилка сервера. Спробуйте пізніше.';
      }
      
      set({ error: message, isSubmitting: false });
      return false;
    }
  },

  register: async (email: string, password: string) => {
    set({ isSubmitting: true, error: null });
    try {
      const response = await authApi.register({ email, password });
      const { accessToken, refreshToken, user } = response.data;
      
      await tokenManager.setTokens(accessToken, refreshToken);
      set({ user, isAuthenticated: true, isSubmitting: false, isNewUser: true });
      return true;
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string | string[]; statusCode?: number }>;
      let message = 'Помилка реєстрації';
      
      if (axiosError.response?.data?.message) {
        // Handle both string and array of strings
        const serverMessage = axiosError.response.data.message;
        message = Array.isArray(serverMessage) ? serverMessage[0] : serverMessage;
      } else if (axiosError.code === 'ERR_NETWORK' || axiosError.message === 'Network Error') {
        message = 'Немає з\'єднання з сервером. Перевірте інтернет.';
      } else if (axiosError.code === 'ECONNABORTED') {
        message = 'Час очікування вичерпано. Спробуйте ще раз.';
      } else if (axiosError.response?.status === 409) {
        message = 'Користувач з такою поштою вже існує';
      } else if (axiosError.response?.status === 400) {
        message = 'Невірний формат даних. Перевірте email та пароль.';
      } else if (axiosError.response?.status === 500) {
        message = 'Помилка сервера. Спробуйте пізніше.';
      }
      
      set({ error: message, isSubmitting: false });
      return false;
    }
  },

  logout: async () => {
    try {
      await authApi.logout();
    } catch (error) {
      // Ignore logout errors
    } finally {
      await tokenManager.clearTokens();
      set({ user: null, isAuthenticated: false, subscription: null, isPremium: false, avatarUri: null });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const token = await tokenManager.getAccessToken();
      if (!token) {
        set({ isAuthenticated: false, isLoading: false });
        return;
      }

      const response = await authApi.me();
      set({ user: response.data, isAuthenticated: true, isLoading: false });
      
      // Завантажуємо аватар
      get().loadAvatar();
      
      // Завантажуємо підписку
      get().fetchSubscription();
    } catch (error) {
      await tokenManager.clearTokens();
      set({ user: null, isAuthenticated: false, isLoading: false, subscription: null, isPremium: false });
    }
  },

  clearError: () => set({ error: null }),
  
  setUser: (user) => set({ user }),
  
  setSubscription: (subscription) => set({ 
    subscription, 
    isPremium: subscription?.isPremium || false 
  }),

  fetchSubscription: async () => {
    try {
      const response = await subscriptionsApi.getCurrent();
      const subscription = response.data;
      set({ subscription, isPremium: subscription.isPremium });
      return subscription;
    } catch (error) {
      console.error('Failed to fetch subscription:', error);
      return null;
    }
  },

  cancelSubscription: async () => {
    try {
      const response = await subscriptionsApi.cancel();
      const subscription = response.data;
      set({ subscription, isPremium: subscription.isPremium });
      return true;
    } catch (error) {
      console.error('Failed to cancel subscription:', error);
      return false;
    }
  },

  restoreSubscription: async () => {
    try {
      const response = await subscriptionsApi.restore();
      const subscription = response.data;
      set({ subscription, isPremium: subscription.isPremium });
      return true;
    } catch (error) {
      console.error('Failed to restore subscription:', error);
      return false;
    }
  },

  fetchProfile: async () => {
    try {
      const response = await usersApi.getProfile();
      const profile = response.data;
      
      // Update user with profile
      const currentUser = get().user;
      if (currentUser) {
        set({ user: { ...currentUser, profile } });
      }
      
      return profile;
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      return null;
    }
  },

  updateGoals: async (goals: GoalsUpdate) => {
    set({ isSubmitting: true, error: null });
    try {
      const response = await usersApi.updateGoals(goals);
      const updatedProfile = response.data;
      
      // Update user profile in store
      const currentUser = get().user;
      if (currentUser) {
        set({ 
          user: { ...currentUser, profile: updatedProfile },
          isSubmitting: false 
        });
      }
      
      return true;
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string | string[] }>;
      const serverMessage = axiosError.response?.data?.message;
      const message = Array.isArray(serverMessage) ? serverMessage[0] : (serverMessage || 'Помилка збереження цілей');
      set({ error: message, isSubmitting: false });
      return false;
    }
  },

  updateProfile: async (data: Partial<Profile>) => {
    set({ isSubmitting: true, error: null });
    try {
      const response = await usersApi.updateProfile(data);
      const updatedProfile = response.data;
      
      // Update user profile in store
      const currentUser = get().user;
      if (currentUser) {
        set({ 
          user: { ...currentUser, profile: updatedProfile },
          isSubmitting: false 
        });
      }
      
      return true;
    } catch (error) {
      const axiosError = error as AxiosError<{ message: string }>;
      const message = axiosError.response?.data?.message || 'Помилка оновлення профілю';
      set({ error: message, isSubmitting: false });
      return false;
    }
  },
}));
