import { PrismaService } from '../../prisma/prisma.service';
import { AddWaterDto } from './dto/add-water.dto';
export declare class WaterService {
    private prisma;
    constructor(prisma: PrismaService);
    getWaterByDate(userId: string, date: string): Promise<{
        date: string;
        amount: number;
        goal: number;
        percentage: number;
    }>;
    addWater(userId: string, dto: AddWaterDto): Promise<{
        date: string;
        amount: number;
        goal: number;
        percentage: number;
    }>;
    setWater(userId: string, date: string, amount: number): Promise<{
        id: string;
        createdAt: Date;
        userId: string;
        date: Date;
        amount: number;
    }>;
    getWaterHistory(userId: string, startDate: string, endDate: string): Promise<{
        logs: {
            date: string;
            amount: number;
            percentage: number;
        }[];
        goal: number;
        average: number;
    }>;
    updateWaterGoal(userId: string, waterGoal: number): Promise<{
        waterGoal: number;
    }>;
}
