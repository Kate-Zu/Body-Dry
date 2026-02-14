import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Невірний формат email' })
  email: string;

  @IsString({ message: 'Пароль обов\'язковий' })
  password: string;
}
