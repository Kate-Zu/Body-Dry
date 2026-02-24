import api from './client';

// Auth API
export const authApi = {
  register: (data: { email: string; password: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  
  logout: () => api.post('/auth/logout'),
  
  refresh: (refreshToken: string) =>
    api.post('/auth/refresh', { refreshToken }),
  
  me: () => api.get('/auth/me'),

  forgotPassword: (email: string) =>
    api.post('/auth/forgot-password', { email }),

  verifyCode: (data: { email: string; code: string }) =>
    api.post('/auth/verify-code', data),

  resetPassword: (data: { email: string; code: string; password: string }) =>
    api.post('/auth/reset-password', data),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.patch('/auth/change-password', data),
};

// Users API
export const usersApi = {
  getProfile: () => api.get('/users/profile'),
  
  createProfile: (data: {
    name: string;
    gender: 'MALE' | 'FEMALE';
    birthDate: string;
    height: number;
    currentWeight: number;
    targetWeight?: number;
    activityLevel: string;
    goal: string;
    waterGoal?: number;
  }) => api.post('/users/profile', data),
  
  updateProfile: (data: Partial<{
    name: string;
    gender: 'MALE' | 'FEMALE';
    birthDate: string;
    height: number;
    currentWeight: number;
    targetWeight: number;
    activityLevel: string;
    goal: string;
    waterGoal: number;
  }>) => api.patch('/users/profile', data),
  
  updateGoals: (data: {
    calorieGoal?: number;
    proteinGoal?: number;
    carbsGoal?: number;
    fatsGoal?: number;
  }) => api.patch('/users/goals', data),
  
  deleteAccount: () => api.delete('/users/account'),
};

// Foods API
export const foodsApi = {
  search: (query: string, limit?: number) =>
    api.get('/foods/search', { params: { q: query, limit } }),
  
  getByBarcode: (barcode: string) =>
    api.get(`/foods/barcode/${barcode}`),
  
  getById: (id: string) =>
    api.get(`/foods/${id}`),
  
  getRecent: (limit?: number) =>
    api.get('/foods/recent', { params: { limit } }),
  
  getFavorites: () =>
    api.get('/foods/favorites'),
  
  create: (data: {
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
  }) => api.post('/foods', data),
  
  addToFavorites: (foodId: string) =>
    api.post(`/foods/${foodId}/favorite`),
  
  removeFromFavorites: (foodId: string) =>
    api.delete(`/foods/${foodId}/favorite`),
};

// Diary API
export const diaryApi = {
  getDay: (date: string) =>
    api.get(`/diary/${date}`),
  
  getSummaryRange: (start: string, end: string) =>
    api.get('/diary/summary/range', { params: { start, end } }),
  
  addEntry: (data: {
    foodId: string;
    mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
    amount: number;
    date: string;
  }) => api.post('/diary/entry', data),
  
  updateEntry: (entryId: string, data: { amount: number }) =>
    api.patch(`/diary/entry/${entryId}`, data),
  
  deleteEntry: (entryId: string) =>
    api.delete(`/diary/entry/${entryId}`),
};

// Water API
export const waterApi = {
  getDay: (date: string) =>
    api.get(`/water/${date}`),
  
  getHistory: (start: string, end: string) =>
    api.get('/water/history/range', { params: { start, end } }),
  
  add: (data: { amount: number; date: string }) =>
    api.post('/water', data),
  
  updateGoal: (goal: number) =>
    api.patch('/water/goal', { waterGoal: goal }),
};

// Progress API
export const progressApi = {
  getWeightHistory: (limit?: number) =>
    api.get('/progress/weight', { params: { limit } }),
  
  addWeight: (data: { weight: number; date: string; note?: string }) =>
    api.post('/progress/weight', data),
  
  deleteWeight: (id: string) =>
    api.delete(`/progress/weight/${id}`),
  
  getWeekly: () =>
    api.get('/progress/weekly'),
  
  getMonthly: () =>
    api.get('/progress/monthly'),
  
  getYearly: () =>
    api.get('/progress/yearly'),
};

// Chat History API
export const chatApi = {
  getConversations: (type?: string) =>
    api.get('/chat/conversations', { params: type ? { type } : {} }),
  
  createConversation: (type: string) =>
    api.post('/chat/conversations', { type }),
  
  getConversation: (id: string) =>
    api.get(`/chat/conversations/${id}`),
  
  saveMessages: (data: { conversationId: string; title?: string; messages: any[] }) =>
    api.post('/chat/messages', data),
  
  deleteConversation: (id: string) =>
    api.delete(`/chat/conversations/${id}`),
};

// Subscriptions API
export const subscriptionsApi = {
  getCurrent: () =>
    api.get('/subscriptions/current'),
  
  activate: (data?: { paymentId?: string; cardLast4?: string }) =>
    api.post('/subscriptions/activate', data || {}),
  
  cancel: () =>
    api.post('/subscriptions/cancel'),
  
  restore: () =>
    api.post('/subscriptions/restore'),
};

// Notifications API
export const notificationsApi = {
  // Token management
  registerToken: (data: { token: string; platform: 'ios' | 'android' | 'web' }) =>
    api.post('/notifications/token', data),
  
  unregisterToken: (token: string) =>
    api.delete(`/notifications/token/${token}`),
  
  getTokens: () =>
    api.get('/notifications/tokens'),
  
  // Settings
  getSettings: () =>
    api.get('/notifications/settings'),
  
  updateSettings: (settings: Record<string, any>) =>
    api.post('/notifications/settings', settings),
  
  // Scheduled notifications
  getScheduled: () =>
    api.get('/notifications/scheduled'),
  
  clearScheduled: () =>
    api.delete('/notifications/scheduled'),
  
  // Schedule reminders
  scheduleWaterReminder: (time: string) =>
    api.post('/notifications/schedule/water', { time }),
  
  scheduleMealReminder: (mealType: string, time: string) =>
    api.post('/notifications/schedule/meal', { mealType, time }),
  
  scheduleWeightReminder: (time: string) =>
    api.post('/notifications/schedule/weight', { time }),
  
  scheduleDailySummary: (time: string) =>
    api.post('/notifications/schedule/summary', { time }),
  
  // Test
  sendTest: (data: { title: string; body: string; data?: Record<string, string> }) =>
    api.post('/notifications/test', data),
};
