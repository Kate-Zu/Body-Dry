import { SubscriptionPlan } from '@prisma/client';
export declare class SubscriptionDto {
    id: string;
    userId: string;
    plan: SubscriptionPlan;
    status: string;
    currentPeriodStart: Date | null;
    currentPeriodEnd: Date | null;
    isPremium: boolean;
}
export declare class ActivateSubscriptionDto {
    paymentId?: string;
    cardLast4?: string;
}
