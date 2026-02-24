import { create } from 'zustand';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { notificationsApi } from '../api';

// Configure how notifications are handled when app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

interface NotificationSettings {
  waterReminders: boolean;
  waterReminderInterval: number; // hours
  mealReminders: boolean;
  mealReminderTimes: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
  weightReminder: boolean;
  weightReminderTime: string;
  dailySummary: boolean;
  dailySummaryTime: string;
}

interface NotificationsState {
  fcmToken: string | null;
  isRegistered: boolean;
  settings: NotificationSettings;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setFcmToken: (token: string) => void;
  registerToken: (token: string) => Promise<boolean>;
  unregisterToken: () => Promise<boolean>;
  fetchSettings: () => Promise<void>;
  updateSettings: (settings: Partial<NotificationSettings>) => Promise<boolean>;
  scheduleWaterReminder: (time: Date) => Promise<boolean>;
  scheduleMealReminder: (mealType: string, time: Date) => Promise<boolean>;
  scheduleWeightReminder: (time: Date) => Promise<boolean>;
  scheduleDailySummary: (time: Date) => Promise<boolean>;
  sendTestNotification: () => Promise<boolean>;
}

const defaultSettings: NotificationSettings = {
  waterReminders: true,
  waterReminderInterval: 2,
  mealReminders: true,
  mealReminderTimes: {
    breakfast: '08:00',
    lunch: '13:00',
    dinner: '19:00',
  },
  weightReminder: true,
  weightReminderTime: '07:00',
  dailySummary: true,
  dailySummaryTime: '21:00',
};

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  fcmToken: null,
  isRegistered: false,
  settings: defaultSettings,
  isLoading: false,
  error: null,

  setFcmToken: (token: string) => {
    set({ fcmToken: token });
  },

  registerToken: async (token: string) => {
    try {
      const platform = Platform.OS as 'ios' | 'android' | 'web';
      await notificationsApi.registerToken({ token, platform });
      set({ fcmToken: token, isRegistered: true });
      return true;
    } catch (error) {
      console.error('Failed to register FCM token:', error);
      return false;
    }
  },

  unregisterToken: async () => {
    const { fcmToken } = get();
    if (!fcmToken) return true;
    
    try {
      await notificationsApi.unregisterToken(fcmToken);
      set({ fcmToken: null, isRegistered: false });
      return true;
    } catch (error) {
      console.error('Failed to unregister FCM token:', error);
      return false;
    }
  },

  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await notificationsApi.getSettings();
      if (response.data && typeof response.data === 'object') {
        set({ settings: { ...defaultSettings, ...response.data }, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to fetch notification settings:', error);
      set({ isLoading: false, error: 'Failed to fetch settings' });
    }
  },

  updateSettings: async (newSettings: Partial<NotificationSettings>) => {
    // Optimistically update UI immediately without loading state
    const currentSettings = get().settings;
    const updatedSettings = { ...currentSettings, ...newSettings };
    set({ settings: updatedSettings });
    
    try {
      await notificationsApi.updateSettings(updatedSettings);
      return true;
    } catch (error) {
      // Revert on error
      set({ settings: currentSettings });
      return false;
    }
  },

  scheduleWaterReminder: async (time: Date) => {
    try {
      await notificationsApi.scheduleWaterReminder(time.toISOString());
      return true;
    } catch (error) {
      console.error('Failed to schedule water reminder:', error);
      return false;
    }
  },

  scheduleMealReminder: async (mealType: string, time: Date) => {
    try {
      await notificationsApi.scheduleMealReminder(mealType, time.toISOString());
      return true;
    } catch (error) {
      console.error('Failed to schedule meal reminder:', error);
      return false;
    }
  },

  scheduleWeightReminder: async (time: Date) => {
    try {
      await notificationsApi.scheduleWeightReminder(time.toISOString());
      return true;
    } catch (error) {
      console.error('Failed to schedule weight reminder:', error);
      return false;
    }
  },

  scheduleDailySummary: async (time: Date) => {
    try {
      await notificationsApi.scheduleDailySummary(time.toISOString());
      return true;
    } catch (error) {
      console.error('Failed to schedule daily summary:', error);
      return false;
    }
  },

  sendTestNotification: async () => {
    try {
      // Request permissions first
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        console.warn('Notification permissions not granted');
        return false;
      }

      // Schedule local notification immediately
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎉 Тестове сповіщення',
          body: 'Push-сповіщення працюють!',
          sound: true,
        },
        trigger: null, // null means show immediately
      });

      return true;
    } catch (error) {
      console.error('Failed to send test notification:', error);
      return false;
    }
  },
}));
