import { IsString, IsEnum, IsNumber, IsDateString, IsOptional, Min, Max } from 'class-validator';
import { Gender, ActivityLevel, Goal } from '@prisma/client';

export class CreateProfileDto {
  @IsString({ message: 'Ім\'я обов\'язкове' })
  name: string;

  @IsEnum(Gender, { message: 'Невірна стать' })
  gender: Gender;

  @IsDateString({}, { message: 'Невірний формат дати народження' })
  birthDate: string;

  @IsNumber({}, { message: 'Зріст має бути числом' })
  @Min(100, { message: 'Зріст має бути мінімум 100 см' })
  @Max(250, { message: 'Зріст має бути максимум 250 см' })
  height: number;

  @IsNumber({}, { message: 'Вага має бути числом' })
  @Min(30, { message: 'Вага має бути мінімум 30 кг' })
  @Max(300, { message: 'Вага має бути максимум 300 кг' })
  currentWeight: number;

  @IsOptional()
  @IsNumber({}, { message: 'Цільова вага має бути числом' })
  @Min(30, { message: 'Цільова вага має бути мінімум 30 кг' })
  @Max(300, { message: 'Цільова вага має бути максимум 300 кг' })
  targetWeight?: number;

  @IsEnum(ActivityLevel, { message: 'Невірний рівень активності' })
  activityLevel: ActivityLevel;

  @IsEnum(Goal, { message: 'Невірна ціль' })
  goal: Goal;

  @IsOptional()
  @IsNumber({}, { message: 'Норма води має бути числом' })
  @Min(1, { message: 'Норма води має бути мінімум 1 л' })
  @Max(10, { message: 'Норма води має бути максимум 10 л' })
  waterGoal?: number;
}
