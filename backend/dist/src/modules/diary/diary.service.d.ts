import { PrismaService } from '../../prisma/prisma.service';
import { AddFoodEntryDto } from './dto/add-food-entry.dto';
export declare class DiaryService {
    private prisma;
    constructor(prisma: PrismaService);
    getDiaryByDate(userId: string, date: string): Promise<{
        date: string;
        meals: ({
            foods: ({
                food: {
                    id: string;
                    createdAt: Date;
                    name: string;
                    brand: string | null;
                    barcode: string | null;
                    calories: number;
                    protein: number;
                    carbs: number;
                    fats: number;
                    fiber: number | null;
                    sugar: number | null;
                    servingSize: number;
                    servingUnit: string;
                    source: string | null;
                    category: string | null;
                    imageUrl: string | null;
                    isVerified: boolean;
                    createdByUserId: string | null;
                };
            } & {
                id: string;
                createdAt: Date;
                calories: number;
                protein: number;
                carbs: number;
                fats: number;
                mealId: string;
                foodId: string;
                servingAmount: number;
            })[];
        } & {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            type: import(".prisma/client").$Enums.MealType;
            userId: string;
            date: Date;
            totalCalories: number;
            totalProtein: number;
            totalCarbs: number;
            totalFats: number;
        })[];
        totals: {
            calories: number;
            protein: number;
            carbs: number;
            fats: number;
        };
        goals: {
            calories: number;
            protein: number;
            carbs: number;
            fats: number;
        } | null;
        remaining: {
            calories: number;
            protein: number;
            carbs: number;
            fats: number;
        } | null;
    }>;
    addFoodEntry(userId: string, dto: AddFoodEntryDto): Promise<{
        food: {
            id: string;
            createdAt: Date;
            name: string;
            brand: string | null;
            barcode: string | null;
            calories: number;
            protein: number;
            carbs: number;
            fats: number;
            fiber: number | null;
            sugar: number | null;
            servingSize: number;
            servingUnit: string;
            source: string | null;
            category: string | null;
            imageUrl: string | null;
            isVerified: boolean;
            createdByUserId: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        calories: number;
        protein: number;
        carbs: number;
        fats: number;
        mealId: string;
        foodId: string;
        servingAmount: number;
    }>;
    updateFoodEntry(userId: string, entryId: string, amount: number): Promise<{
        food: {
            id: string;
            createdAt: Date;
            name: string;
            brand: string | null;
            barcode: string | null;
            calories: number;
            protein: number;
            carbs: number;
            fats: number;
            fiber: number | null;
            sugar: number | null;
            servingSize: number;
            servingUnit: string;
            source: string | null;
            category: string | null;
            imageUrl: string | null;
            isVerified: boolean;
            createdByUserId: string | null;
        };
    } & {
        id: string;
        createdAt: Date;
        calories: number;
        protein: number;
        carbs: number;
        fats: number;
        mealId: string;
        foodId: string;
        servingAmount: number;
    }>;
    deleteFoodEntry(userId: string, entryId: string): Promise<{
        message: string;
    }>;
    getSummary(userId: string, startDate: string, endDate: string): Promise<{
        totals: {
            calories: number;
            protein: number;
            carbs: number;
            fats: number;
        };
        averages: {
            calories: number;
            protein: number;
            carbs: number;
            fats: number;
        };
        days: number;
    }>;
}
