import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddWeightDto } from './dto/add-weight.dto';

@Injectable()
export class ProgressService {
  constructor(private prisma: PrismaService) {}

  // Get weight history
  async getWeightHistory(userId: string, limit: number = 30) {
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

  // Add weight entry
  async addWeight(userId: string, dto: AddWeightDto) {
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

    // Update current weight in profile only if date is today or in the past
    // (latest weight becomes current)
    if (entryDate <= today) {
      // Find the most recent weight entry up to today
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

  // Delete weight entry
  async deleteWeight(userId: string, weightId: string) {
    const weight = await this.prisma.weightLog.findUnique({
      where: { id: weightId },
    });

    if (!weight || weight.userId !== userId) {
      throw new NotFoundException('Запис не знайдено');
    }

    await this.prisma.weightLog.delete({
      where: { id: weightId },
    });

    return { message: 'Запис видалено' };
  }

  // Get weekly progress
  async getWeeklyProgress(userId: string) {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);

    return this.getProgressForRange(userId, weekAgo, today);
  }

  // Get monthly progress
  async getMonthlyProgress(userId: string) {
    const today = new Date();
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    return this.getProgressForRange(userId, monthAgo, today);
  }

  // Get yearly progress
  async getYearlyProgress(userId: string) {
    const today = new Date();
    const yearAgo = new Date(today);
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);

    return this.getProgressForRange(userId, yearAgo, today);
  }

  // Helper: Get progress for date range
  private async getProgressForRange(userId: string, startDate: Date, endDate: Date) {
    // Get meals data
    const meals = await this.prisma.meal.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
    });

    // Get water data
    const waterLogs = await this.prisma.waterLog.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
    });

    // Get weight data
    const weightLogs = await this.prisma.weightLog.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: endDate },
      },
      orderBy: { date: 'asc' },
    });

    // Get goals
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    // Calculate daily totals
    const dailyData: Record<string, {
      calories: number;
      protein: number;
      carbs: number;
      fats: number;
      water: number;
      weight?: number;
    }> = {};

    // Aggregate meals by date
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

    // Add water data
    waterLogs.forEach(log => {
      const dateKey = log.date.toISOString().split('T')[0];
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { calories: 0, protein: 0, carbs: 0, fats: 0, water: 0 };
      }
      dailyData[dateKey].water = log.amount;
    });

    // Add weight data
    weightLogs.forEach(log => {
      const dateKey = log.date.toISOString().split('T')[0];
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { calories: 0, protein: 0, carbs: 0, fats: 0, water: 0 };
      }
      dailyData[dateKey].weight = log.weight;
    });

    // Calculate averages
    const days = Object.keys(dailyData).length || 1;
    const totals = Object.values(dailyData).reduce(
      (acc, day) => ({
        calories: acc.calories + day.calories,
        protein: acc.protein + day.protein,
        carbs: acc.carbs + day.carbs,
        fats: acc.fats + day.fats,
        water: acc.water + day.water,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0, water: 0 },
    );

    // Weight change
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
}
