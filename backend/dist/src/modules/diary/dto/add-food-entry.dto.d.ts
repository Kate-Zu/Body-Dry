import { MealType } from '@prisma/client';
export declare class AddFoodEntryDto {
    foodId: string;
    date: string;
    mealType: MealType;
    amount: number;
    servingAmount?: number;
}
