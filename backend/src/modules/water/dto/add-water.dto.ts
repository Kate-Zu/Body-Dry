import { IsNumber, IsDateString, Min, Max } from 'class-validator';

export class AddWaterDto {
  @IsDateString({}, { message: 'Невірний формат дати' })
  date: string;

  @IsNumber({}, { message: 'Кількість води має бути числом' })
  @Min(-5000, { message: 'Мінімум -5000 мл' })
  @Max(5000, { message: 'Максимум 5000 мл' })
  amount: number; // in ml (positive to add, negative to subtract)
}
