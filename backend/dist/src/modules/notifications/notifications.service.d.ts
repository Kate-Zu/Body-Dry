import { PrismaService } from '../../prisma/prisma.service';
import { RegisterTokenDto, SendNotificationDto } from './dto';
import { FirebaseService } from './firebase.service';
export interface ScheduledNotification {
    userId: string;
    type: 'water_reminder' | 'meal_reminder' | 'weight_reminder' | 'daily_summary';
    scheduledFor: Date;
    title: string;
    body: string;
    data?: Record<string, string>;
}
export declare class NotificationsService {
    private prisma;
    private firebase;
    private readonly logger;
    constructor(prisma: PrismaService, firebase: FirebaseService);
    registerToken(userId: string, dto: RegisterTokenDto): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        token: string;
        platform: string;
    }>;
    unregisterToken(userId: string, token: string): Promise<{
        success: boolean;
    }>;
    getUserTokens(userId: string): Promise<{
        token: string;
        platform: string;
    }[]>;
    sendToUser(userId: string, notification: SendNotificationDto): Promise<{
        success: boolean;
        reason: string;
        tokenCount?: undefined;
        successCount?: undefined;
        failureCount?: undefined;
        notification?: undefined;
    } | {
        success: boolean;
        tokenCount: number;
        successCount: number;
        failureCount: number;
        notification: SendNotificationDto;
        reason?: undefined;
    }>;
    sendToUsers(userIds: string[], notification: SendNotificationDto): Promise<{
        total: number;
        successful: number;
        failed: number;
    }>;
    sendToAll(notification: SendNotificationDto): Promise<{
        total: number;
        successful: number;
        failed: number;
    }>;
    scheduleWaterReminder(userId: string, time: Date): Promise<ScheduledNotification>;
    scheduleMealReminder(userId: string, mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK', time: Date): Promise<ScheduledNotification>;
    scheduleWeightReminder(userId: string, time: Date): Promise<ScheduledNotification>;
    scheduleDailySummary(userId: string, time: Date): Promise<ScheduledNotification>;
    getNotificationSettings(userId: string): Promise<{
        waterReminders: boolean;
        waterReminderInterval: number;
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
    }>;
    updateNotificationSettings(userId: string, settings: Record<string, any>): Promise<{
        success: boolean;
        settings: Record<string, any>;
    }>;
    getScheduledNotifications(userId: string): ScheduledNotification[];
    clearScheduledNotifications(userId: string): {
        success: boolean;
    };
    private addScheduledNotification;
    processDueNotifications(): Promise<{
        processed: number;
    }>;
}
