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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getProfile(userId) {
        const profile = await this.prisma.profile.findUnique({
            where: { userId },
        });
        if (!profile) {
            return null;
        }
        return profile;
    }
    async createProfile(userId, dto) {
        const existing = await this.prisma.profile.findUnique({
            where: { userId },
        });
        if (existing) {
            throw new common_1.BadRequestException('Профіль вже існує');
        }
        const { bmr, tdee } = this.calculateTDEE(dto.gender, dto.currentWeight, dto.height, this.calculateAge(new Date(dto.birthDate)), dto.activityLevel);
        const macros = this.calculateMacros(tdee, dto.goal, dto.currentWeight);
        const waterGoal = this.calculateWaterGoal(dto.currentWeight, dto.activityLevel, dto.goal);
        const profile = await this.prisma.profile.create({
            data: {
                userId,
                name: dto.name,
                gender: dto.gender,
                birthDate: new Date(dto.birthDate),
                height: dto.height,
                currentWeight: dto.currentWeight,
                targetWeight: dto.targetWeight,
                activityLevel: dto.activityLevel,
                goal: dto.goal,
                bmr,
                tdee,
                calorieGoal: macros.calories,
                proteinGoal: macros.protein,
                carbsGoal: macros.carbs,
                fatsGoal: macros.fats,
                waterGoal,
            },
        });
        return profile;
    }
    async updateProfile(userId, dto) {
        const profile = await this.prisma.profile.findUnique({
            where: { userId },
        });
        if (!profile) {
            throw new common_1.NotFoundException('Профіль не знайдено');
        }
        let updates = { ...dto };
        const needRecalculate = dto.currentWeight || dto.height || dto.activityLevel || dto.birthDate || dto.goal;
        if (needRecalculate) {
            const { bmr, tdee } = this.calculateTDEE(dto.gender || profile.gender, dto.currentWeight || profile.currentWeight, dto.height || profile.height, this.calculateAge(dto.birthDate ? new Date(dto.birthDate) : profile.birthDate), dto.activityLevel || profile.activityLevel);
            updates.bmr = bmr;
            updates.tdee = tdee;
            const macros = this.calculateMacros(tdee, dto.goal || profile.goal, dto.currentWeight || profile.currentWeight);
            const waterGoal = this.calculateWaterGoal(dto.currentWeight || profile.currentWeight, dto.activityLevel || profile.activityLevel, dto.goal || profile.goal);
            updates.calorieGoal = macros.calories;
            updates.proteinGoal = macros.protein;
            updates.carbsGoal = macros.carbs;
            updates.fatsGoal = macros.fats;
            updates.waterGoal = waterGoal;
        }
        if (dto.birthDate) {
            updates.birthDate = new Date(dto.birthDate);
        }
        return this.prisma.profile.update({
            where: { userId },
            data: updates,
        });
    }
    async updateGoals(userId, goals) {
        return this.prisma.profile.update({
            where: { userId },
            data: goals,
        });
    }
    async deleteAccount(userId) {
        await this.prisma.user.delete({
            where: { id: userId },
        });
        return { message: 'Акаунт видалено' };
    }
    calculateBMR(gender, weight, height, age) {
        if (gender === 'MALE') {
            return 10 * weight + 6.25 * height - 5 * age + 5;
        }
        else {
            return 10 * weight + 6.25 * height - 5 * age - 161;
        }
    }
    calculateTDEE(gender, weight, height, age, activityLevel) {
        const bmr = this.calculateBMR(gender, weight, height, age);
        const activityMultipliers = {
            SEDENTARY: 1.2,
            LIGHT: 1.375,
            MODERATE: 1.55,
            ACTIVE: 1.725,
            VERY_ACTIVE: 1.9,
        };
        const tdee = Math.round(bmr * activityMultipliers[activityLevel]);
        return { bmr: Math.round(bmr), tdee };
    }
    calculateMacros(tdee, goal, weight) {
        let calories;
        switch (goal) {
            case 'LOSE_WEIGHT':
                calories = Math.round(tdee * 0.8);
                break;
            case 'DRYING':
                calories = Math.round(tdee * 0.75);
                break;
            case 'GAIN_MUSCLE':
                calories = Math.round(tdee * 1.1);
                break;
            case 'MAINTAIN':
            default:
                calories = tdee;
        }
        const proteinPerKg = goal === 'GAIN_MUSCLE' || goal === 'DRYING' ? 2.2 : 1.6;
        const protein = Math.round(weight * proteinPerKg);
        const fats = Math.round(weight * 0.9);
        const proteinCalories = protein * 4;
        const fatsCalories = fats * 9;
        const carbsCalories = calories - proteinCalories - fatsCalories;
        const carbs = Math.round(carbsCalories / 4);
        return { calories, protein, carbs, fats };
    }
    calculateAge(birthDate) {
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    }
    calculateWaterGoal(weight, activityLevel, goal) {
        let baseWaterMl = weight * 33;
        const activityMultipliers = {
            SEDENTARY: 0.9,
            LIGHT: 1.0,
            MODERATE: 1.1,
            ACTIVE: 1.2,
            VERY_ACTIVE: 1.3,
        };
        baseWaterMl *= activityMultipliers[activityLevel];
        if (goal === 'DRYING' || goal === 'LOSE_WEIGHT') {
            baseWaterMl *= 1.1;
        }
        const waterLiters = Math.min(Math.max(baseWaterMl / 1000, 1.5), 5);
        return Math.round(waterLiters * 10) / 10;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map