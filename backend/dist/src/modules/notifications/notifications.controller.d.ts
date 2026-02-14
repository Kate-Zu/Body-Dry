import { NotificationsService } from './notifications.service';
import { RegisterTokenDto, SendNotificationDto } from './dto';
interface RequestWithUser {
    user: {
        sub: string;
    };
}
export declare class NotificationsController {
    private readonly notificationsService;
    constructor(notificationsService: NotificationsService);
    registerToken(req: RequestWithUser, dto: RegisterTokenDto): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        token: string;
        platform: string;
    }>;
    unregisterToken(req: RequestWithUser, token: string): Promise<{
        success: boolean;
    }>;
    getTokens(req: RequestWithUser): Promise<{
        token: string;
        platform: string;
    }[]>;
    getSettings(req: RequestWithUser): Promise<{
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
    updateSettings(req: RequestWithUser, settings: Record<string, any>): Promise<{
        success: boolean;
        settings: Record<string, any>;
    }>;
    getScheduledNotifications(req: RequestWithUser): import("./notifications.service").ScheduledNotification[];
    clearScheduledNotifications(req: RequestWithUser): {
        success: boolean;
    };
    scheduleWaterReminder(req: RequestWithUser, body: {
        time: string;
    }): Promise<import("./notifications.service").ScheduledNotification>;
    scheduleMealReminder(req: RequestWithUser, body: {
        mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK';
        time: string;
    }): Promise<import("./notifications.service").ScheduledNotification>;
    scheduleWeightReminder(req: RequestWithUser, body: {
        time: string;
    }): Promise<import("./notifications.service").ScheduledNotification>;
    scheduleDailySummary(req: RequestWithUser, body: {
        time: string;
    }): Promise<import("./notifications.service").ScheduledNotification>;
    sendTestNotification(req: RequestWithUser, dto: SendNotificationDto): Promise<{
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
}
export {};
