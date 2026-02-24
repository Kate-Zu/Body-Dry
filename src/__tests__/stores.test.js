/**
 * Tests for Zustand stores
 * @jest-environment node
 */

// Mock the API modules before importing stores
jest.mock('../api', () => ({
  diaryApi: {
    getDay: jest.fn(),
    addEntry: jest.fn(),
    updateEntry: jest.fn(),
    deleteEntry: jest.fn(),
  },
  waterApi: {
    getDay: jest.fn(),
    add: jest.fn(),
  },
  progressApi: {
    getWeekly: jest.fn(),
    getMonthly: jest.fn(),
    getYearly: jest.fn(),
    getWeightHistory: jest.fn(),
    addWeight: jest.fn(),
  },
  notificationsApi: {
    registerToken: jest.fn(),
    unregisterToken: jest.fn(),
    getSettings: jest.fn(),
    updateSettings: jest.fn(),
    sendTest: jest.fn(),
  },
}));

// Mock react-native Platform
jest.mock('react-native', () => ({
  Platform: { OS: 'ios' },
}));

import { useDiaryStore } from '../store/diaryStore';
import { useProgressStore } from '../store/progressStore';
import { useNotificationsStore } from '../store/notificationsStore';
import { diaryApi, waterApi, progressApi, notificationsApi } from '../api';

describe('useDiaryStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset the store state
    useDiaryStore.setState({
      currentDate: new Date().toISOString().split('T')[0],
      dayData: null,
      isLoading: false,
      isSaving: false,
      error: null,
    });
  });

  describe('setDate', () => {
    it('should update currentDate', () => {
      const store = useDiaryStore.getState();
      
      // Mock API calls
      diaryApi.getDay.mockResolvedValue({ data: { meals: [] } });
      waterApi.getDay.mockResolvedValue({ data: { total: 0, goal: 2500 } });

      store.setDate('2026-02-03');

      expect(useDiaryStore.getState().currentDate).toBe('2026-02-03');
    });
  });

  describe('fetchDay', () => {
    it('should fetch diary and water data', async () => {
      const mockDiaryData = { 
        meals: [], 
        totals: { calories: 500, protein: 50, carbs: 60, fats: 20 },
        goals: { calories: 2000, protein: 150, carbs: 200, fats: 65 },
      };
      const mockWaterData = { total: 1500, goal: 2500 };
      
      diaryApi.getDay.mockResolvedValue({ data: mockDiaryData });
      waterApi.getDay.mockResolvedValue({ data: mockWaterData });

      const store = useDiaryStore.getState();
      await store.fetchDay();

      expect(diaryApi.getDay).toHaveBeenCalled();
      expect(waterApi.getDay).toHaveBeenCalled();
      expect(useDiaryStore.getState().isLoading).toBe(false);
    });

    it('should handle API errors gracefully', async () => {
      diaryApi.getDay.mockRejectedValue(new Error('Network error'));
      waterApi.getDay.mockResolvedValue({ data: { total: 0, goal: 2500 } });

      const store = useDiaryStore.getState();
      await store.fetchDay();

      expect(useDiaryStore.getState().isLoading).toBe(false);
      expect(useDiaryStore.getState().error).toBeTruthy();
    });
  });

  describe('addWater', () => {
    it('should call API with amount converted to ml', async () => {
      waterApi.add.mockResolvedValue({ data: { success: true } });
      
      const store = useDiaryStore.getState();
      const success = await store.addWater(0.5); // 0.5 liters

      expect(success).toBe(true);
      expect(waterApi.add).toHaveBeenCalledWith(
        expect.objectContaining({ amount: 500 }) // 500ml
      );
    });

    it('should return false on API error', async () => {
      waterApi.add.mockRejectedValue(new Error('Failed'));
      
      const store = useDiaryStore.getState();
      const success = await store.addWater(0.5);

      expect(success).toBe(false);
    });
  });

  describe('updateWaterOptimistic', () => {
    it('should update water current value optimistically', () => {
      // Set initial state with dayData
      useDiaryStore.setState({
        dayData: {
          water: { current: 1.0, goal: 2.7 },
          meals: [],
          totals: { calories: 0, protein: 0, carbs: 0, fats: 0 },
          goals: { calories: 2000, protein: 150, carbs: 200, fats: 65 },
        },
      });

      const store = useDiaryStore.getState();
      store.updateWaterOptimistic(1.5);

      expect(useDiaryStore.getState().dayData.water.current).toBe(1.5);
    });
  });
});

describe('useProgressStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useProgressStore.setState({
      weeklyStats: null,
      monthlyStats: null,
      yearlyStats: null,
      weightHistory: [],
      isLoading: false,
      error: null,
    });
  });

  describe('fetchWeightHistory', () => {
    it('should fetch and store weight history', async () => {
      const mockApiResponse = [
        { date: '2026-02-01', weight: 75.5 },
        { date: '2026-02-02', weight: 75.3 },
      ];
      
      progressApi.getWeightHistory.mockResolvedValue({ data: mockApiResponse });

      const store = useProgressStore.getState();
      await store.fetchWeightHistory(7);

      expect(progressApi.getWeightHistory).toHaveBeenCalledWith(7);
      const history = useProgressStore.getState().weightHistory;
      expect(history).toHaveLength(2);
      expect(history[0].weight).toBe(75.5);
      expect(history[0].date).toBe('2026-02-01');
      expect(history[0].id).toBeDefined();
    });

    it('should handle empty history', async () => {
      progressApi.getWeightHistory.mockResolvedValue({ data: [] });

      const store = useProgressStore.getState();
      await store.fetchWeightHistory(30);

      expect(useProgressStore.getState().weightHistory).toEqual([]);
    });
  });

  describe('addWeight', () => {
    it('should add weight entry successfully', async () => {
      progressApi.addWeight.mockResolvedValue({ data: { success: true } });
      progressApi.getWeightHistory.mockResolvedValue({ data: [] });

      const store = useProgressStore.getState();
      const success = await store.addWeight(74.5, '2026-02-03');

      expect(success).toBe(true);
      expect(progressApi.addWeight).toHaveBeenCalledWith({
        weight: 74.5,
        date: '2026-02-03',
      });
    });

    it('should return false on error', async () => {
      progressApi.addWeight.mockRejectedValue(new Error('Failed'));

      const store = useProgressStore.getState();
      const success = await store.addWeight(74.5, '2026-02-03');

      expect(success).toBe(false);
    });
  });

  describe('fetchWeeklyStats', () => {
    it('should fetch weekly stats', async () => {
      const mockStats = {
        avgCalories: 1800,
        avgProtein: 120,
        avgCarbs: 180,
        avgFats: 60,
        data: [],
      };
      
      progressApi.getWeekly.mockResolvedValue({ data: mockStats });

      const store = useProgressStore.getState();
      await store.fetchWeeklyStats();

      expect(progressApi.getWeekly).toHaveBeenCalled();
      expect(useProgressStore.getState().weeklyStats).toEqual(mockStats);
    });
  });
});

describe('useNotificationsStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useNotificationsStore.setState({
      fcmToken: null,
      isRegistered: false,
      settings: {
        waterReminders: true,
        waterReminderInterval: 2,
        mealReminders: true,
        mealReminderTimes: { breakfast: '08:00', lunch: '13:00', dinner: '19:00' },
        weightReminder: true,
        weightReminderTime: '07:00',
        dailySummary: true,
        dailySummaryTime: '21:00',
      },
      isLoading: false,
      error: null,
    });
  });

  describe('registerToken', () => {
    it('should register FCM token successfully', async () => {
      notificationsApi.registerToken.mockResolvedValue({ data: { success: true } });

      const store = useNotificationsStore.getState();
      const success = await store.registerToken('test-fcm-token');

      expect(success).toBe(true);
      expect(useNotificationsStore.getState().fcmToken).toBe('test-fcm-token');
      expect(useNotificationsStore.getState().isRegistered).toBe(true);
    });

    it('should handle registration failure', async () => {
      notificationsApi.registerToken.mockRejectedValue(new Error('Failed'));

      const store = useNotificationsStore.getState();
      const success = await store.registerToken('test-fcm-token');

      expect(success).toBe(false);
      expect(useNotificationsStore.getState().isRegistered).toBe(false);
    });
  });

  describe('fetchSettings', () => {
    it('should fetch and merge settings with defaults', async () => {
      const serverSettings = {
        waterReminders: false,
        mealReminders: true,
      };
      
      notificationsApi.getSettings.mockResolvedValue({ data: serverSettings });

      const store = useNotificationsStore.getState();
      await store.fetchSettings();

      const settings = useNotificationsStore.getState().settings;
      expect(settings.waterReminders).toBe(false);
      expect(settings.mealReminders).toBe(true);
      // Default values should be preserved
      expect(settings.weightReminder).toBe(true);
    });

    it('should handle null response gracefully', async () => {
      notificationsApi.getSettings.mockResolvedValue({ data: null });

      const originalSettings = useNotificationsStore.getState().settings;
      const store = useNotificationsStore.getState();
      await store.fetchSettings();

      // Settings should remain unchanged (defaults preserved)
      expect(useNotificationsStore.getState().settings.waterReminders).toBe(
        originalSettings.waterReminders
      );
    });

    it('should set error on failure', async () => {
      notificationsApi.getSettings.mockRejectedValue(new Error('Network error'));

      const store = useNotificationsStore.getState();
      await store.fetchSettings();

      expect(useNotificationsStore.getState().error).toBeTruthy();
    });
  });

  describe('updateSettings', () => {
    it('should update settings and call API', async () => {
      notificationsApi.updateSettings.mockResolvedValue({ data: { success: true } });

      const store = useNotificationsStore.getState();
      const success = await store.updateSettings({ waterReminders: false });

      expect(success).toBe(true);
      expect(useNotificationsStore.getState().settings.waterReminders).toBe(false);
      expect(notificationsApi.updateSettings).toHaveBeenCalled();
    });

    it('should return false on API error', async () => {
      notificationsApi.updateSettings.mockRejectedValue(new Error('Failed'));

      const store = useNotificationsStore.getState();
      const success = await store.updateSettings({ waterReminders: false });

      expect(success).toBe(false);
    });
  });

  describe('sendTestNotification', () => {
    it('should send test notification successfully', async () => {
      const Notifications = require('expo-notifications');
      Notifications.requestPermissionsAsync.mockResolvedValue({ status: 'granted' });
      Notifications.scheduleNotificationAsync.mockResolvedValue('notification-id');

      const store = useNotificationsStore.getState();
      const success = await store.sendTestNotification();

      expect(success).toBe(true);
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: '🎉 Тестове сповіщення',
          body: 'Push-сповіщення працюють!',
          sound: true,
        },
        trigger: null,
      });
    });

    it('should return false on error', async () => {
      const Notifications = require('expo-notifications');
      Notifications.requestPermissionsAsync.mockRejectedValue(new Error('Failed'));

      const store = useNotificationsStore.getState();
      const success = await store.sendTestNotification();

      expect(success).toBe(false);
    });
  });
});
