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
exports.ProgressService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let ProgressService = class ProgressService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getWeightHistory(userId, limit = 30) {
        const weights = await this.prisma.weightLog.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
            take: limit,
        });
        const profile = await this.prisma.profile.findUnique({
            where: { userId },
            select: { currentWeight: true, targetWeight: true },
        });
        return {
            weights: weights.reverse().map(w => ({
                date: w.date.toISOString().split('T')[0],
                weight: w.weight,
                note: w.note,
            })),
            current: profile?.currentWeight,
            target: profile?.targetWeight,
            change: weights.length >= 2
                ? weights[0].weight - weights[weights.length - 1].weight
                : 0,
        };
    }
    async addWeight(userId, dto) {
        const date = new Date(dto.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const entryDate = new Date(date);
        entryDate.setHours(0, 0, 0, 0);
        const weightLog = await this.prisma.weightLog.upsert({
            where: {
                userId_date: {
                    userId,
                    date,
                },
            },
            update: {
                weight: dto.weight,
                note: dto.note,
            },
            create: {
                userId,
                date,
                weight: dto.weight,
                note: dto.note,
            },
        });
        if (entryDate <= today) {
            const latestWeight = await this.prisma.weightLog.findFirst({
                where: {
                    userId,
                    date: { lte: today },
                },
                orderBy: { date: 'desc' },
            });
            if (latestWeight) {
                await this.prisma.profile.update({
                    where: { userId },
                    data: { currentWeight: latestWeight.weight },
                });
            }
        }
        return weightLog;
    }
    async deleteWeight(userId, weightId) {
        const weight = await this.prisma.weightLog.findUnique({
            where: { id: weightId },
        });
        if (!weight || weight.userId !== userId) {
            throw new common_1.NotFoundException('Запис не знайдено');
        }
        await this.prisma.weightLog.delete({
            where: { id: weightId },
        });
        return { message: 'Запис видалено' };
    }
    async getWeeklyProgress(userId) {
        const today = new Date();
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        return this.getProgressForRange(userId, weekAgo, today);
    }
    async getMonthlyProgress(userId) {
        const today = new Date();
        const monthAgo = new Date(today);
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        return this.getProgressForRange(userId, monthAgo, today);
    }
    async getYearlyProgress(userId) {
        const today = new Date();
        const yearAgo = new Date(today);
        yearAgo.setFullYear(yearAgo.getFullYear() - 1);
        return this.getProgressForRange(userId, yearAgo, today);
    }
    async getProgressForRange(userId, startDate, endDate) {
        const meals = await this.prisma.meal.findMany({
            where: {
                userId,
                date: { gte: startDate, lte: endDate },
            },
        });
        const waterLogs = await this.prisma.waterLog.findMany({
            where: {
                userId,
                date: { gte: startDate, lte: endDate },
            },
        });
        const weightLogs = await this.prisma.weightLog.findMany({
            where: {
                userId,
                date: { gte: startDate, lte: endDate },
            },
            orderBy: { date: 'asc' },
        });
        const profile = await this.prisma.profile.findUnique({
            where: { userId },
        });
        const dailyData = {};
        meals.forEach(meal => {
            const dateKey = meal.date.toISOString().split('T')[0];
            if (!dailyData[dateKey]) {
                dailyData[dateKey] = { calories: 0, protein: 0, carbs: 0, fats: 0, water: 0 };
            }
            dailyData[dateKey].calories += meal.totalCalories;
            dailyData[dateKey].protein += meal.totalProtein;
            dailyData[dateKey].carbs += meal.totalCarbs;
            dailyData[dateKey].fats += meal.totalFats;
        });
        waterLogs.forEach(log => {
            const dateKey = log.date.toISOString().split('T')[0];
            if (!dailyData[dateKey]) {
                dailyData[dateKey] = { calories: 0, protein: 0, carbs: 0, fats: 0, water: 0 };
            }
            dailyData[dateKey].water = log.amount;
        });
        weightLogs.forEach(log => {
            const dateKey = log.date.toISOString().split('T')[0];
            if (!dailyData[dateKey]) {
                dailyData[dateKey] = { calories: 0, protein: 0, carbs: 0, fats: 0, water: 0 };
            }
            dailyData[dateKey].weight = log.weight;
        });
        const days = Object.keys(dailyData).length || 1;
        const totals = Object.values(dailyData).reduce((acc, day) => ({
            calories: acc.calories + day.calories,
            protein: acc.protein + day.protein,
            carbs: acc.carbs + day.carbs,
            fats: acc.fats + day.fats,
            water: acc.water + day.water,
        }), { calories: 0, protein: 0, carbs: 0, fats: 0, water: 0 });
        const weightChange = weightLogs.length >= 2
            ? weightLogs[weightLogs.length - 1].weight - weightLogs[0].weight
            : 0;
        return {
            period: {
                start: startDate.toISOString().split('T')[0],
                end: endDate.toISOString().split('T')[0],
                days,
            },
            averages: {
                calories: Math.round(totals.calories / days),
                protein: Math.round(totals.protein / days),
                carbs: Math.round(totals.carbs / days),
                fats: Math.round(totals.fats / days),
                water: Math.round(totals.water / days),
            },
            totals,
            goals: profile ? {
                calories: profile.calorieGoal,
                protein: profile.proteinGoal,
                carbs: profile.carbsGoal,
                fats: profile.fatsGoal,
                water: profile.waterGoal * 1000,
            } : null,
            weight: {
                start: weightLogs[0]?.weight,
                current: weightLogs[weightLogs.length - 1]?.weight,
                change: weightChange,
                target: profile?.targetWeight,
            },
            dailyData: Object.entries(dailyData)
                .sort(([a], [b]) => a.localeCompare(b))
                .map(([date, data]) => ({ date, ...data })),
        };
    }
};
exports.ProgressService = ProgressService;
exports.ProgressService = ProgressService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ProgressService);
//# sourceMappingURL=progress.service.js.map