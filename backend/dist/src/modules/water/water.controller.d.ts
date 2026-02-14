import { WaterService } from './water.service';
import { AddWaterDto } from './dto/add-water.dto';
export declare class WaterController {
    private waterService;
    constructor(waterService: WaterService);
    getWaterHistory(userId: string, startDate: string, endDate: string): Promise<{
        logs: {
            date: string;
            amount: number;
            percentage: number;
        }[];
        goal: number;
        average: number;
    }>;
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
    updateWaterGoal(userId: string, waterGoal: number): Promise<{
        waterGoal: number;
    }>;
}
