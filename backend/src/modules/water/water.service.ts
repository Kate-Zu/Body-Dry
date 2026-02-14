import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { AddWaterDto } from './dto/add-water.dto';

@Injectable()
export class WaterService {
  constructor(private prisma: PrismaService) {}

  // Get water intake for a specific date
  async getWaterByDate(userId: string, date: string) {
    const targetDate = new Date(date);

    const waterLog = await this.prisma.waterLog.findUnique({
      where: {
        userId_date: {
          userId,
          date: targetDate,
        },
      },
    });

    // Get water goal from profile
    const profile = await this.prisma.profile.findUnique({
      where: { userId },
      select: { waterGoal: true },
    });

    const amount = waterLog?.amount || 0;
    const goal = profile?.waterGoal || 2.7;

    return {
      date,
      amount, // in ml
      goal: goal * 1000, // convert to ml
      percentage: Math.round((amount / (goal * 1000)) * 100),
    };
  }

  // Add water intake
  async addWater(userId: string, dto: AddWaterDto) {
    const date = new Date(dto.date);

    // Get current amount to prevent going below zero
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

    // Upsert water log
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

    // Get goal for response
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

  // Set water amount (override)
  async setWater(userId: string, date: string, amount: number) {
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

  // Get water history for date range
  async getWaterHistory(userId: string, startDate: string, endDate: string) {
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

    // Get goal
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

  // Update water goal
  async updateWaterGoal(userId: string, waterGoal: number) {
    await this.prisma.profile.update({
      where: { userId },
      data: { waterGoal },
    });

    return { waterGoal };
  }
}
