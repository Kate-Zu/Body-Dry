import { IsEmail, IsString } from 'class-validator';

export class ForgotPasswordDto {
  @IsEmail({}, { message: 'Невірний формат email' })
  email: string;
}

export class VerifyCodeDto {
  @IsEmail({}, { message: 'Невірний формат email' })
  email: string;

  @IsString({ message: 'Код обов\'язковий' })
  code: string;
}

export class ResetPasswordDto {
  @IsEmail({}, { message: 'Невірний формат email' })
  email: string;

  @IsString({ message: 'Код обов\'язковий' })
  code: string;

  @IsString({ message: 'Пароль обов\'язковий' })
  password: string;
}
