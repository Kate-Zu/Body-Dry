import { IsString, IsNumber, IsEnum, IsDateString, Min, IsOptional } from 'class-validator';
import { MealType } from '@prisma/client';

export class AddFoodEntryDto {
  @IsString()
  foodId: string;

  @IsDateString({}, { message: 'Невірний формат дати' })
  date: string;

  @IsEnum(MealType, { message: 'Невірний тип прийому їжі' })
  mealType: MealType;

  @IsNumber()
  @Min(1, { message: 'Кількість грам має бути мінімум 1' })
  amount: number; // Grams

  @IsOptional()
  @IsNumber()
  servingAmount?: number; // Deprecated, use amount instead
}
