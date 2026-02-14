import { IsString, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @IsString({ message: 'Поточний пароль обов\'язковий' })
  currentPassword: string;

  @IsString()
  @MinLength(8, { message: 'Пароль має містити мінімум 8 символів' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Пароль має містити велику, малу літеру та цифру',
  })
  newPassword: string;
}
