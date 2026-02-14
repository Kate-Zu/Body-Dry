import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddFoodEntryDto } from './dto/add-food-entry.dto';
import { MealType } from '@prisma/client';

@Injectable()
export class DiaryService {
  constructor(private prisma: PrismaService) {}

  // Get diary entries for a specific date
  async getDiaryByDate(userId: string, date: string) {
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

    // Get user profile for goals
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
    });

    // Calculate totals
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

  // Add food to diary
  async addFoodEntry(userId: string, dto: AddFoodEntryDto) {
    const date = new Date(dto.date);

    // Get or create meal
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

    // Get food info
    const food = await this.prisma.food.findUnique({
      where: { id: dto.foodId },
    });

    if (!food) {
      throw new NotFoundException('Продукт не знайдено');
    }

    // Use amount in grams directly (dto.amount) or calculate from servingAmount for backwards compatibility
    const grams = dto.amount || (dto.servingAmount ? dto.servingAmount * food.servingSize : 100);
    
    // Calculate nutrition based on grams (food values are per 100g)
    const multiplier = grams / 100;
    const calories = food.calories * multiplier;
    const protein = food.protein * multiplier;
    const carbs = food.carbs * multiplier;
    const fats = food.fats * multiplier;

    // Create meal food entry
    const mealFood = await this.prisma.mealFood.create({
      data: {
        mealId: meal.id,
        foodId: dto.foodId,
        servingAmount: grams, // Store grams in servingAmount field
        calories,
        protein,
        carbs,
        fats,
      },
      include: { food: true },
    });

    // Update meal totals
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

  // Update food entry
  async updateFoodEntry(userId: string, entryId: string, amount: number) {
    const mealFood = await this.prisma.mealFood.findUnique({
      where: { id: entryId },
      include: { meal: true, food: true },
    });

    if (!mealFood || mealFood.meal.userId !== userId) {
      throw new NotFoundException('Запис не знайдено');
    }

    // Calculate new nutrition based on grams
    const multiplier = amount / 100;
    const newCalories = mealFood.food.calories * multiplier;
    const newProtein = mealFood.food.protein * multiplier;
    const newCarbs = mealFood.food.carbs * multiplier;
    const newFats = mealFood.food.fats * multiplier;

    // Calculate difference for meal totals
    const caloriesDiff = newCalories - mealFood.calories;
    const proteinDiff = newProtein - mealFood.protein;
    const carbsDiff = newCarbs - mealFood.carbs;
    const fatsDiff = newFats - mealFood.fats;

    // Update entry
    const updated = await this.prisma.mealFood.update({
      where: { id: entryId },
      data: {
        servingAmount: amount, // Store grams
        calories: newCalories,
        protein: newProtein,
        carbs: newCarbs,
        fats: newFats,
      },
      include: { food: true },
    });

    // Update meal totals
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

  // Delete food entry
  async deleteFoodEntry(userId: string, entryId: string) {
    const mealFood = await this.prisma.mealFood.findUnique({
      where: { id: entryId },
      include: { meal: true },
    });

    if (!mealFood || mealFood.meal.userId !== userId) {
      throw new NotFoundException('Запис не знайдено');
    }

    // Delete entry
    await this.prisma.mealFood.delete({
      where: { id: entryId },
    });

    // Update meal totals
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

  // Get summary for date range
  async getSummary(userId: string, startDate: string, endDate: string) {
    const meals = await this.prisma.meal.findMany({
      where: {
        userId,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
      },
    });

    const totals = meals.reduce(
      (acc, meal) => ({
        calories: acc.calories + meal.totalCalories,
        protein: acc.protein + meal.totalProtein,
        carbs: acc.carbs + meal.totalCarbs,
        fats: acc.fats + meal.totalFats,
      }),
      { calories: 0, protein: 0, carbs: 0, fats: 0 },
    );

    const days = Math.ceil(
      (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24),
    ) + 1;

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
}
