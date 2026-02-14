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
exports.WaterService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let WaterService = class WaterService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getWaterByDate(userId, date) {
        const targetDate = new Date(date);
        const waterLog = await this.prisma.waterLog.findUnique({
            where: {
                userId_date: {
                    userId,
                    date: targetDate,
                },
            },
        });
        const profile = await this.prisma.profile.findUnique({
            where: { userId },
            select: { waterGoal: true },
        });
        const amount = waterLog?.amount || 0;
        const goal = profile?.waterGoal || 2.7;
        return {
            date,
            amount,
            goal: goal * 1000,
            percentage: Math.round((amount / (goal * 1000)) * 100),
        };
    }
    async addWater(userId, dto) {
        const date = new Date(dto.date);
        const existing = await this.prisma.waterLog.findUnique({
            where: {
                userId_date: {
                    userId,
                    date,
                },
            },
        });
        const currentAmount = existing?.amount || 0;
        const newAmount = Math.max(0, currentAmount + dto.amount);
        const waterLog = await this.prisma.waterLog.upsert({
            where: {
                userId_date: {
                    userId,
                    date,
                },
            },
            update: {
                amount: newAmount,
            },
            create: {
                userId,
                date,
                amount: Math.max(0, dto.amount),
            },
        });
        const profile = await this.prisma.profile.findUnique({
            where: { userId },
            select: { waterGoal: true },
        });
        const goal = (profile?.waterGoal || 2.7) * 1000;
        return {
            date: dto.date,
            amount: waterLog.amount,
            goal,
            percentage: Math.round((waterLog.amount / goal) * 100),
        };
    }
    async setWater(userId, date, amount) {
        const targetDate = new Date(date);
        const waterLog = await this.prisma.waterLog.upsert({
            where: {
                userId_date: {
                    userId,
                    date: targetDate,
                },
            },
            update: { amount },
            create: {
                userId,
                date: targetDate,
                amount,
            },
        });
        return waterLog;
    }
    async getWaterHistory(userId, startDate, endDate) {
        const waterLogs = await this.prisma.waterLog.findMany({
            where: {
                userId,
                date: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                },
            },
            orderBy: { date: 'asc' },
        });
        const profile = await this.prisma.profile.findUnique({
            where: { userId },
            select: { waterGoal: true },
        });
        const goal = (profile?.waterGoal || 2.7) * 1000;
        return {
            logs: waterLogs.map(log => ({
                date: log.date.toISOString().split('T')[0],
                amount: log.amount,
                percentage: Math.round((log.amount / goal) * 100),
            })),
            goal,
            average: waterLogs.length > 0
                ? Math.round(waterLogs.reduce((sum, log) => sum + log.amount, 0) / waterLogs.length)
                : 0,
        };
    }
    async updateWaterGoal(userId, waterGoal) {
        await this.prisma.profile.update({
            where: { userId },
            data: { waterGoal },
        });
        return { waterGoal };
    }
};
exports.WaterService = WaterService;
exports.WaterService = WaterService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], WaterService);
//# sourceMappingURL=water.service.js.map