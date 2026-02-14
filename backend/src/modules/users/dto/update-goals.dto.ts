import { IsOptional, IsNumber, Min, Max } from 'class-validator';

export class UpdateGoalsDto {
  @IsOptional()
  @IsNumber()
  @Min(800, { message: 'Калорії мають бути мінімум 800' })
  @Max(10000, { message: 'Калорії мають бути максимум 10000' })
  calorieGoal?: number;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Білки мають бути мінімум 0г' })
  @Max(500, { message: 'Білки мають бути максимум 500г' })
  proteinGoal?: number;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Вуглеводи мають бути мінімум 0г' })
  @Max(800, { message: 'Вуглеводи мають бути максимум 800г' })
  carbsGoal?: number;

  @IsOptional()
  @IsNumber()
  @Min(0, { message: 'Жири мають бути мінімум 0г' })
  @Max(300, { message: 'Жири мають бути максимум 300г' })
  fatsGoal?: number;

  @IsOptional()
  @IsNumber()
  @Min(1, { message: 'Норма води має бути мінімум 1л' })
  @Max(10, { message: 'Норма води має бути максимум 10л' })
  waterGoal?: number;
}
