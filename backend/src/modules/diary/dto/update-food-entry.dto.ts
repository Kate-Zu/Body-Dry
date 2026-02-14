import { IsNumber, Min } from 'class-validator';

export class UpdateFoodEntryDto {
  @IsNumber()
  @Min(1, { message: 'Кількість грам має бути мінімум 1' })
  amount: number; // Grams
}
