import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class CreateFoodDto {
  @IsString({ message: 'Назва обов\'язкова' })
  name: string;

  @IsOptional()
  @IsString()
  brand?: string;

  @IsOptional()
  @IsString()
  barcode?: string;

  @IsNumber({}, { message: 'Калорії мають бути числом' })
  @Min(0)
  @Max(1000)
  calories: number;

  @IsNumber({}, { message: 'Білки мають бути числом' })
  @Min(0)
  @Max(100)
  protein: number;

  @IsNumber({}, { message: 'Вуглеводи мають бути числом' })
  @Min(0)
  @Max(100)
  carbs: number;

  @IsNumber({}, { message: 'Жири мають бути числом' })
  @Min(0)
  @Max(100)
  fats: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  fiber?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  sugar?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  servingSize?: number;

  @IsOptional()
  @IsString()
  servingUnit?: string;
}
