import { IsString, IsOptional, IsObject } from 'class-validator';

export class SendNotificationDto {
  @IsString()
  title: string;

  @IsString()
  body: string;

  @IsObject()
  @IsOptional()
  data?: Record<string, string>;
}
