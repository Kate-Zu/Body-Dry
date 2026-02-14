import { IsEmail, IsString, MinLength, MaxLength, Matches } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Невірний формат email' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Пароль має бути мінімум 8 символів' })
  @MaxLength(32, { message: 'Пароль має бути максимум 32 символи' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Пароль має містити велику, малу літеру та цифру',
  })
  password: string;
}
