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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const client_1 = require("@prisma/client");
let SubscriptionsService = class SubscriptionsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getSubscription(userId) {
        let subscription = await this.prisma.subscription.findUnique({
            where: { userId },
        });
        if (!subscription) {
            subscription = await this.prisma.subscription.create({
                data: {
                    userId,
                    plan: client_1.SubscriptionPlan.FREE,
                    status: client_1.SubscriptionStatus.ACTIVE,
                },
            });
        }
        const isPremium = this.checkIsPremium(subscription);
        return {
            id: subscription.id,
            userId: subscription.userId,
            plan: subscription.plan,
            status: subscription.status,
            currentPeriodStart: subscription.currentPeriodStart,
            currentPeriodEnd: subscription.currentPeriodEnd,
            isPremium,
        };
    }
    async activateSubscription(userId, dto) {
        const now = new Date();
        const endDate = new Date(now);
        endDate.setMonth(endDate.getMonth() + 1);
        const subscription = await this.prisma.subscription.upsert({
            where: { userId },
            update: {
                plan: client_1.SubscriptionPlan.BODY_PRO,
                status: client_1.SubscriptionStatus.ACTIVE,
                currentPeriodStart: now,
                currentPeriodEnd: endDate,
            },
            create: {
                userId,
                plan: client_1.SubscriptionPlan.BODY_PRO,
                status: client_1.SubscriptionStatus.ACTIVE,
                currentPeriodStart: now,
                currentPeriodEnd: endDate,
            },
        });
        return {
            id: subscription.id,
            userId: subscription.userId,
            plan: subscription.plan,
            status: subscription.status,
            currentPeriodStart: subscription.currentPeriodStart,
            currentPeriodEnd: subscription.currentPeriodEnd,
            isPremium: true,
        };
    }
    async cancelSubscription(userId) {
        const subscription = await this.prisma.subscription.update({
            where: { userId },
            data: {
                status: client_1.SubscriptionStatus.CANCELED,
            },
        });
        return {
            id: subscription.id,
            userId: subscription.userId,
            plan: subscription.plan,
            status: subscription.status,
            currentPeriodStart: subscription.currentPeriodStart,
            currentPeriodEnd: subscription.currentPeriodEnd,
            isPremium: this.checkIsPremium(subscription),
        };
    }
    checkIsPremium(subscription) {
        if (subscription.plan !== client_1.SubscriptionPlan.BODY_PRO) {
            return false;
        }
        if (subscription.status !== client_1.SubscriptionStatus.ACTIVE) {
            return false;
        }
        if (subscription.currentPeriodEnd && subscription.currentPeriodEnd < new Date()) {
            return false;
        }
        return true;
    }
};
exports.SubscriptionsService = SubscriptionsService;
exports.SubscriptionsService = SubscriptionsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], SubscriptionsService);
//# sourceMappingURL=subscriptions.service.js.map