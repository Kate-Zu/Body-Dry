import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterTokenDto, SendNotificationDto } from './dto';
import { FirebaseService } from './firebase.service';

// Types for notification scheduling
export interface ScheduledNotification {
  userId: string;
  type: 'water_reminder' | 'meal_reminder' | 'weight_reminder' | 'daily_summary';
  scheduledFor: Date;
  title: string;
  body: string;
  data?: Record<string, string>;
}

// In-memory storage for scheduled notifications (in production use Redis/Bull queue)
const scheduledNotifications: Map<string, ScheduledNotification[]> = new Map();

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private prisma: PrismaService,
    private firebase: FirebaseService,
  ) {}

  /**
   * Register FCM token for push notifications
   */
  async registerToken(userId: string, dto: RegisterTokenDto) {
    // Remove existing token if it exists for another user
    await this.prisma.fcmToken.deleteMany({
      where: { token: dto.token },
    });

    // Upsert the token for this user
    const token = await this.prisma.fcmToken.upsert({
      where: {
        userId_token: {
          userId,
          token: dto.token,
        },
      },
      update: {
        platform: dto.platform,
      },
      create: {
        userId,
        token: dto.token,
        platform: dto.platform,
      },
    });

    this.logger.log(`FCM token registered for user ${userId} on ${dto.platform}`);
    return token;
  }

  /**
   * Unregister FCM token
   */
  async unregisterToken(userId: string, token: string) {
    await this.prisma.fcmToken.deleteMany({
      where: { userId, token },
    });
    this.logger.log(`FCM token unregistered for user ${userId}`);
    return { success: true };
  }

  /**
   * Get all tokens for a user
   */
  async getUserTokens(userId: string) {
    return this.prisma.fcmToken.findMany({
      where: { userId },
      select: { token: true, platform: true },
    });
  }

  /**
   * Send notification to a specific user
   * Uses Firebase Admin SDK for real push notifications
   */
  async sendToUser(userId: string, notification: SendNotificationDto) {
    const tokens = await this.getUserTokens(userId);
    
    if (tokens.length === 0) {
      this.logger.warn(`No FCM tokens found for user ${userId}`);
      return { success: false, reason: 'no_tokens' };
    }

    const tokenStrings = tokens.map(t => t.token);
    
    try {
      const result = await this.firebase.sendToDevices(tokenStrings, {
        title: notification.title,
        body: notification.body,
        data: notification.data,
      });

      // Remove invalid tokens from database
      if (result.invalidTokens.length > 0) {
        await this.prisma.fcmToken.deleteMany({
          where: {
            userId,
            token: { in: result.invalidTokens },
          },
        });
        this.logger.log(`Removed ${result.invalidTokens.length} invalid tokens for user ${userId}`);
      }

      return { 
        success: result.successCount > 0, 
        tokenCount: tokens.length,
        successCount: result.successCount,
        failureCount: result.failureCount,
        notification,
      };
    } catch (error) {
      this.logger.error(`Failed to send notification to user ${userId}:`, error);
      return { success: false, reason: 'send_error' };
    }
  }

  /**
   * Send notification to multiple users
   */
  async sendToUsers(userIds: string[], notification: SendNotificationDto) {
    const results = await Promise.all(
      userIds.map(userId => this.sendToUser(userId, notification))
    );
    
    return {
      total: userIds.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
    };
  }

  /**
   * Send notification to all users
   */
  async sendToAll(notification: SendNotificationDto) {
    const allTokens = await this.prisma.fcmToken.findMany({
      select: { userId: true },
      distinct: ['userId'],
    });

    const userIds = allTokens.map(t => t.userId);
    return this.sendToUsers(userIds, notification);
  }

  /**
   * Schedule a water reminder notification
   */
  async scheduleWaterReminder(userId: string, time: Date) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { name: true, waterGoal: true },
    });

    const scheduled: ScheduledNotification = {
      userId,
      type: 'water_reminder',
      scheduledFor: time,
      title: '💧 Час пити воду!',
      body: `${profile?.name || 'Ей'}, не забудь випити склянку води!`,
      data: { screen: 'WaterTracker' },
    };

    this.addScheduledNotification(userId, scheduled);
    return scheduled;
  }

  /**
   * Schedule meal reminder notification
   */
  async scheduleMealReminder(userId: string, mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK', time: Date) {
    const mealNames = {
      BREAKFAST: 'сніданок',
      LUNCH: 'обід',
      DINNER: 'вечерю',
      SNACK: 'перекус',
    };

    const scheduled: ScheduledNotification = {
      userId,
      type: 'meal_reminder',
      scheduledFor: time,
      title: '🍽️ Нагадування про прийом їжі',
      body: `Час записати ${mealNames[mealType]}!`,
      data: { screen: 'Diary', mealType },
    };

    this.addScheduledNotification(userId, scheduled);
    return scheduled;
  }

  /**
   * Schedule daily weight check reminder
   */
  async scheduleWeightReminder(userId: string, time: Date) {
    const scheduled: ScheduledNotification = {
      userId,
      type: 'weight_reminder',
      scheduledFor: time,
      title: '⚖️ Зважування',
      body: 'Не забудь записати свою вагу сьогодні!',
      data: { screen: 'Progress' },
    };

    this.addScheduledNotification(userId, scheduled);
    return scheduled;
  }

  /**
   * Schedule daily summary notification
   */
  async scheduleDailySummary(userId: string, time: Date) {
    const scheduled: ScheduledNotification = {
      userId,
      type: 'daily_summary',
      scheduledFor: time,
      title: '📊 Денний підсумок',
      body: 'Переглянь свій прогрес за сьогодні!',
      data: { screen: 'Progress' },
    };

    this.addScheduledNotification(userId, scheduled);
    return scheduled;
  }

  /**
   * Get user notification settings
   */
  async getNotificationSettings(userId: string) {
    // In production, these would be stored in DB
    // For now return default settings
    return {
      waterReminders: true,
      waterReminderInterval: 2, // hours
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
  }

  /**
   * Update user notification settings
   */
  async updateNotificationSettings(userId: string, settings: Record<string, any>) {
    // In production, save to DB
    this.logger.log(`Updating notification settings for user ${userId}: ${JSON.stringify(settings)}`);
    return { success: true, settings };
  }

  /**
   * Get scheduled notifications for user
   */
  getScheduledNotifications(userId: string) {
    return scheduledNotifications.get(userId) || [];
  }

  /**
   * Clear all scheduled notifications for user
   */
  clearScheduledNotifications(userId: string) {
    scheduledNotifications.delete(userId);
    return { success: true };
  }

  private addScheduledNotification(userId: string, notification: ScheduledNotification) {
    const existing = scheduledNotifications.get(userId) || [];
    existing.push(notification);
    scheduledNotifications.set(userId, existing);
  }

  /**
   * Process due notifications (would be called by a cron job)
   */
  async processDueNotifications() {
    const now = new Date();
    let processed = 0;

    for (const [userId, notifications] of scheduledNotifications.entries()) {
      const due = notifications.filter(n => n.scheduledFor <= now);
      const pending = notifications.filter(n => n.scheduledFor > now);

      for (const notification of due) {
        await this.sendToUser(userId, {
          title: notification.title,
          body: notification.body,
          data: notification.data,
        });
        processed++;
      }

      scheduledNotifications.set(userId, pending);
    }

    return { processed };
  }
}
