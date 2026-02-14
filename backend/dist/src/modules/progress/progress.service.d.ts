import { PrismaService } from '../../prisma/prisma.service';
import { AddWeightDto } from './dto/add-weight.dto';
export declare class ProgressService {
    private prisma;
    constructor(prisma: PrismaService);
    getWeightHistory(userId: string, limit?: number): Promise<{
        weights: {
            date: string;
            weight: number;
            note: string | null;
        }[];
        current: number | undefined;
        target: number | null | undefined;
        change: number;
    }>;
    addWeight(userId: string, dto: AddWeightDto): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        date: Date;
        weight: number;
        note: string | null;
    }>;
    deleteWeight(userId: string, weightId: string): Promise<{
        message: string;
    }>;
    getWeeklyProgress(userId: string): Promise<{
        period: {
            start: string;
            end: string;
            days: number;
        };
        averages: {
            calories: number;
            protein: number;
            carbs: number;
            fats: number;
            water: number;
        };
        totals: {
            calories: number;
            protein: number;
            carbs: number;
            fats: number;
            water: number;
        };
        goals: {
            calories: number;
            protein: number;
            carbs: number;
            fats: number;
            water: number;
        } | null;
        weight: {
            start: number;
            current: number;
            change: number;
            target: number | null | undefined;
        };
        dailyData: {
            calories: number;
            protein: number;
            carbs: number;
            fats: number;
            water: number;
            weight?: number;
            date: string;
        }[];
    }>;
    getMonthlyProgress(userId: string): Promise<{
        period: {
            start: string;
            end: string;
            days: number;
        };
        averages: {
            calories: number;
            protein: number;
            carbs: number;
            fats: number;
            water: number;
        };
        totals: {
            calories: number;
            protein: number;
            carbs: number;
            fats: number;
            water: number;
        };
        goals: {
            calories: number;
            protein: number;
            carbs: number;
            fats: number;
            water: number;
        } | null;
        weight: {
            start: number;
            current: number;
            change: number;
            target: number | null | undefined;
        };
        dailyData: {
            calories: number;
            protein: number;
            carbs: number;
            fats: number;
            water: number;
            weight?: number;
            date: string;
        }[];
    }>;
    getYearlyProgress(userId: string): Promise<{
        period: {
            start: string;
            end: string;
            days: number;
        };
        averages: {
            calories: number;
            protein: number;
            carbs: number;
            fats: number;
            water: number;
        };
        totals: {
            calories: number;
            protein: number;
            carbs: number;
            fats: number;
            water: number;
        };
        goals: {
            calories: number;
            protein: number;
            carbs: number;
            fats: number;
            water: number;
        } | null;
        weight: {
            start: number;
            current: number;
            change: number;
            target: number | null | undefined;
        };
        dailyData: {
            calories: number;
            protein: number;
            carbs: number;
            fats: number;
            water: number;
            weight?: number;
            date: string;
        }[];
    }>;
    private getProgressForRange;
}
