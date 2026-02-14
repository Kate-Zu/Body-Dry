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
exports.DiaryService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let DiaryService = class DiaryService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDiaryByDate(userId, date) {
        const targetDate = new Date(date);
        const meals = await this.prisma.meal.findMany({
            where: {
                userId,
                date: targetDate,
            },
            include: {
                foods: {
                    include: {
                        food: true,
                    },
                },
            },
            orderBy: { type: 'asc' },
        });
        const profile = await this.prisma.profile.findUnique({
            where: { userId },
        });
        const totals = {
            calories: 0,
            protein: 0,
            carbs: 0,
            fats: 0,
        };
        meals.forEach(meal => {
            totals.calories += meal.totalCalories;
            totals.protein += meal.totalProtein;
            totals.carbs += meal.totalCarbs;
            totals.fats += meal.totalFats;
        });
        return {
            date: date,
            meals,
            totals,
            goals: profile ? {
                calories: profile.calorieGoal,
                protein: profile.proteinGoal,
                carbs: profile.carbsGoal,
                fats: profile.fatsGoal,
            } : null,
            remaining: profile ? {
                calories: profile.calorieGoal - totals.calories,
                protein: profile.proteinGoal - totals.protein,
                carbs: profile.carbsGoal - totals.carbs,
                fats: profile.fatsGoal - totals.fats,
            } : null,
        };
    }
    async addFoodEntry(userId, dto) {
        const date = new Date(dto.date);
        let meal = await this.prisma.meal.findUnique({
            where: {
                userId_date_type: {
                    userId,
                    date,
                    type: dto.mealType,
                },
            },
        });
        if (!meal) {
            meal = await this.prisma.meal.create({
                data: {
                    userId,
                    date,
                    type: dto.mealType,
                },
            });
        }
        const food = await this.prisma.food.findUnique({
            where: { id: dto.foodId },
        });
        if (!food) {
            throw new common_1.NotFoundException('Продукт не знайдено');
        }
        const grams = dto.amount || (dto.servingAmount ? dto.servingAmount * food.servingSize : 100);
        const multiplier = grams / 100;
        const calories = food.calories * multiplier;
        const protein = food.protein * multiplier;
        const carbs = food.carbs * multiplier;
        const fats = food.fats * multiplier;
        const mealFood = await this.prisma.mealFood.create({
            data: {
                mealId: meal.id,
                foodId: dto.foodId,
                servingAmount: grams,
                calories,
                protein,
                carbs,
                fats,
            },
            include: { food: true },
        });
        await this.prisma.meal.update({
            where: { id: meal.id },
            data: {
                totalCalories: { increment: calories },
                totalProtein: { increment: protein },
                totalCarbs: { increment: carbs },
                totalFats: { increment: fats },
            },
        });
        return mealFood;
    }
    async updateFoodEntry(userId, entryId, amount) {
        const mealFood = await this.prisma.mealFood.findUnique({
            where: { id: entryId },
            include: { meal: true, food: true },
        });
        if (!mealFood || mealFood.meal.userId !== userId) {
            throw new common_1.NotFoundException('Запис не знайдено');
        }
        const multiplier = amount / 100;
        const newCalories = mealFood.food.calories * multiplier;
        const newProtein = mealFood.food.protein * multiplier;
        const newCarbs = mealFood.food.carbs * multiplier;
        const newFats = mealFood.food.fats * multiplier;
        const caloriesDiff = newCalories - mealFood.calories;
        const proteinDiff = newProtein - mealFood.protein;
        const carbsDiff = newCarbs - mealFood.carbs;
        const fatsDiff = newFats - mealFood.fats;
        const updated = await this.prisma.mealFood.update({
            where: { id: entryId },
            data: {
                servingAmount: amount,
                calories: newCalories,
                protein: newProtein,
                carbs: newCarbs,
                fats: newFats,
            },
            include: { food: true },
        });
        await this.prisma.meal.update({
            where: { id: mealFood.mealId },
            data: {
                totalCalories: { increment: caloriesDiff },
                totalProtein: { increment: proteinDiff },
                totalCarbs: { increment: carbsDiff },
                totalFats: { increment: fatsDiff },
            },
        });
        return updated;
    }
    async deleteFoodEntry(userId, entryId) {
        const mealFood = await this.prisma.mealFood.findUnique({
            where: { id: entryId },
            include: { meal: true },
        });
        if (!mealFood || mealFood.meal.userId !== userId) {
            throw new common_1.NotFoundException('Запис не знайдено');
        }
        await this.prisma.mealFood.delete({
            where: { id: entryId },
        });
        await this.prisma.meal.update({
            where: { id: mealFood.mealId },
            data: {
                totalCalories: { decrement: mealFood.calories },
                totalProtein: { decrement: mealFood.protein },
                totalCarbs: { decrement: mealFood.carbs },
                totalFats: { decrement: mealFood.fats },
            },
        });
        return { message: 'Запис видалено' };
    }
    async getSummary(userId, startDate, endDate) {
        const meals = await this.prisma.meal.findMany({
            where: {
                userId,
                date: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                },
            },
        });
        const totals = meals.reduce((acc, meal) => ({
            calories: acc.calories + meal.totalCalories,
            protein: acc.protein + meal.totalProtein,
            carbs: acc.carbs + meal.totalCarbs,
            fats: acc.fats + meal.totalFats,
        }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
        const days = Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;
        return {
            totals,
            averages: {
                calories: Math.round(totals.calories / days),
                protein: Math.round(totals.protein / days),
                carbs: Math.round(totals.carbs / days),
                fats: Math.round(totals.fats / days),
            },
            days,
        };
    }
};
exports.DiaryService = DiaryService;
exports.DiaryService = DiaryService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DiaryService);
//# sourceMappingURL=diary.service.js.map