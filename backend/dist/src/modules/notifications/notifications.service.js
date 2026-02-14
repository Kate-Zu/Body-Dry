"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var NotificationsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const firebase_service_1 = require("./firebase.service");
const scheduledNotifications = new Map();
let NotificationsService = NotificationsService_1 = class NotificationsService {
    constructor(prisma, firebase) {
        this.prisma = prisma;
        this.firebase = firebase;
        this.logger = new common_1.Logger(NotificationsService_1.name);
    }
    async registerToken(userId, dto) {
        await this.prisma.fcmToken.deleteMany({
            where: { token: dto.token },
        });
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
    async unregisterToken(userId, token) {
        await this.prisma.fcmToken.deleteMany({
            where: { userId, token },
        });
        this.logger.log(`FCM token unregistered for user ${userId}`);
        return { success: true };
    }
    async getUserTokens(userId) {
        return this.prisma.fcmToken.findMany({
            where: { userId },
            select: { token: true, platform: true },
        });
    }
    async sendToUser(userId, notification) {
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
        }
        catch (error) {
            this.logger.error(`Failed to send notification to user ${userId}:`, error);
            return { success: false, reason: 'send_error' };
        }
    }
    async sendToUsers(userIds, notification) {
        const results = await Promise.all(userIds.map(userId => this.sendToUser(userId, notification)));
        return {
            total: userIds.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
        };
    }
    async sendToAll(notification) {
        const allTokens = await this.prisma.fcmToken.findMany({
            select: { userId: true },
            distinct: ['userId'],
        });
        const userIds = allTokens.map(t => t.userId);
        return this.sendToUsers(userIds, notification);
    }
    async scheduleWaterReminder(userId, time) {
        const profile = await this.prisma.profile.findUnique({
            where: { userId },
            select: { name: true, waterGoal: true },
        });
        const scheduled = {
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
    async scheduleMealReminder(userId, mealType, time) {
        const mealNames = {
            BREAKFAST: 'сніданок',
            LUNCH: 'обід',
            DINNER: 'вечерю',
            SNACK: 'перекус',
        };
        const scheduled = {
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
    async scheduleWeightReminder(userId, time) {
        const scheduled = {
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
    async scheduleDailySummary(userId, time) {
        const scheduled = {
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
    async getNotificationSettings(userId) {
        return {
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
    }
    async updateNotificationSettings(userId, settings) {
        this.logger.log(`Updating notification settings for user ${userId}: ${JSON.stringify(settings)}`);
        return { success: true, settings };
    }
    getScheduledNotifications(userId) {
        return scheduledNotifications.get(userId) || [];
    }
    clearScheduledNotifications(userId) {
        scheduledNotifications.delete(userId);
        return { success: true };
    }
    addScheduledNotification(userId, notification) {
        const existing = scheduledNotifications.get(userId) || [];
        existing.push(notification);
        scheduledNotifications.set(userId, existing);
    }
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
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = NotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        firebase_service_1.FirebaseService])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map