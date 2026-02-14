import { IsOptional, IsString, IsEnum } from 'class-validator';
import { SubscriptionPlan } from '@prisma/client';

export class SubscriptionDto {
  id: string;
  userId: string;
  plan: SubscriptionPlan;
  status: string;
  currentPeriodStart: Date | null;
  currentPeriodEnd: Date | null;
  isPremium: boolean;
}

export class ActivateSubscriptionDto {
  @IsOptional()
  @IsString()
  paymentId?: string;

  @IsOptional()
  @IsString()
  cardLast4?: string;
}
