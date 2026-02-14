import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ActivityLevel, Gender, Goal } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Get user profile
  async getProfile(userId: string) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      return null;
    }

    return profile;
  }

  // Create profile with BMR/TDEE calculation
  async createProfile(userId: string, dto: CreateProfileDto) {
    // Check if profile already exists
    const existing = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (existing) {
      throw new BadRequestException('Профіль вже існує');
    }

    // Calculate BMR and TDEE
    const { bmr, tdee } = this.calculateTDEE(
      dto.gender,
      dto.currentWeight,
      dto.height,
      this.calculateAge(new Date(dto.birthDate)),
      dto.activityLevel,
    );

    // Calculate macro goals based on goal
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

  // Update profile
  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    if (!profile) {
      throw new NotFoundException('Профіль не знайдено');
    }

    // Recalculate if weight/height/activity/goal changed
    let updates: any = { ...dto };

    const needRecalculate = dto.currentWeight || dto.height || dto.activityLevel || dto.birthDate || dto.goal;

    if (needRecalculate) {
      const { bmr, tdee } = this.calculateTDEE(
        dto.gender || profile.gender,
        dto.currentWeight || profile.currentWeight,
        dto.height || profile.height,
        this.calculateAge(dto.birthDate ? new Date(dto.birthDate) : profile.birthDate),
        dto.activityLevel || profile.activityLevel,
      );
      updates.bmr = bmr;
      updates.tdee = tdee;

      // Recalculate macros and water
      const macros = this.calculateMacros(
        tdee,
        dto.goal || profile.goal,
        dto.currentWeight || profile.currentWeight,
      );
      const waterGoal = this.calculateWaterGoal(
        dto.currentWeight || profile.currentWeight,
        dto.activityLevel || profile.activityLevel,
        dto.goal || profile.goal,
      );

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

  // Update goals (calories/macros)
  async updateGoals(userId: string, goals: {
    calorieGoal?: number;
    proteinGoal?: number;
    carbsGoal?: number;
    fatsGoal?: number;
    waterGoal?: number;
  }) {
    return this.prisma.profile.update({
      where: { userId },
      data: goals,
    });
  }

  // Delete account
  async deleteAccount(userId: string) {
    await this.prisma.user.delete({
      where: { id: userId },
    });

    return { message: 'Акаунт видалено' };
  }

  // Calculate BMR using Mifflin-St Jeor formula
  private calculateBMR(gender: Gender, weight: number, height: number, age: number): number {
    if (gender === 'MALE') {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161;
    }
  }

  // Calculate TDEE based on activity level
  private calculateTDEE(
    gender: Gender,
    weight: number,
    height: number,
    age: number,
    activityLevel: ActivityLevel,
  ): { bmr: number; tdee: number } {
    const bmr = this.calculateBMR(gender, weight, height, age);
    
    const activityMultipliers: Record<ActivityLevel, number> = {
      SEDENTARY: 1.2,
      LIGHT: 1.375,
      MODERATE: 1.55,
      ACTIVE: 1.725,
      VERY_ACTIVE: 1.9,
    };

    const tdee = Math.round(bmr * activityMultipliers[activityLevel]);

    return { bmr: Math.round(bmr), tdee };
  }

  // Calculate macro goals based on goal
  private calculateMacros(tdee: number, goal: Goal, weight: number) {
    let calories: number;
    
    switch (goal) {
      case 'LOSE_WEIGHT':
        calories = Math.round(tdee * 0.8); // 20% deficit
        break;
      case 'DRYING':
        calories = Math.round(tdee * 0.75); // 25% deficit
        break;
      case 'GAIN_MUSCLE':
        calories = Math.round(tdee * 1.1); // 10% surplus
        break;
      case 'MAINTAIN':
      default:
        calories = tdee;
    }

    // Protein: 2g per kg for muscle goals, 1.6g otherwise
    const proteinPerKg = goal === 'GAIN_MUSCLE' || goal === 'DRYING' ? 2.2 : 1.6;
    const protein = Math.round(weight * proteinPerKg);

    // Fats: 0.9g per kg
    const fats = Math.round(weight * 0.9);

    // Carbs: remaining calories
    const proteinCalories = protein * 4;
    const fatsCalories = fats * 9;
    const carbsCalories = calories - proteinCalories - fatsCalories;
    const carbs = Math.round(carbsCalories / 4);

    return { calories, protein, carbs, fats };
  }

  // Calculate age from birthdate
  private calculateAge(birthDate: Date): number {
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  }

  // Calculate water goal in liters based on weight, activity and goal
  private calculateWaterGoal(weight: number, activityLevel: ActivityLevel, goal: Goal): number {
    // Base: 33ml per kg of body weight
    let baseWaterMl = weight * 33;

    // Activity adjustment
    const activityMultipliers: Record<ActivityLevel, number> = {
      SEDENTARY: 0.9,
      LIGHT: 1.0,
      MODERATE: 1.1,
      ACTIVE: 1.2,
      VERY_ACTIVE: 1.3,
    };
    baseWaterMl *= activityMultipliers[activityLevel];

    // Goal adjustment
    if (goal === 'DRYING' || goal === 'LOSE_WEIGHT') {
      baseWaterMl *= 1.1; // 10% more water for weight loss
    }

    // Convert to liters, min 1.5L, max 5L
    const waterLiters = Math.min(Math.max(baseWaterMl / 1000, 1.5), 5);
    
    return Math.round(waterLiters * 10) / 10; // Round to 1 decimal
  }
}
