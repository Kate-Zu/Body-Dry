import { IsNumber, IsOptional, IsString, Min, Max, IsDateString } from 'class-validator';

export class AddWeightDto {
  @IsNumber({}, { message: 'Вага має бути числом' })
  @Min(30, { message: 'Вага має бути не менше 30 кг' })
  @Max(300, { message: 'Вага має бути не більше 300 кг' })
  weight: number;

  @IsDateString({}, { message: 'Невірний формат дати' })
  date: string;

  @IsOptional()
  @IsString({ message: 'Нотатка має бути текстом' })
  note?: string;
}
