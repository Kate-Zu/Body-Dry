import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { SubscriptionPlan, SubscriptionStatus } from '@prisma/client';
import { SubscriptionDto, ActivateSubscriptionDto } from './dto/subscription.dto';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  async getSubscription(userId: string): Promise<SubscriptionDto> {
    let subscription = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    // Якщо підписки немає, створюємо безкоштовну
    if (!subscription) {
      subscription = await this.prisma.subscription.create({
        data: {
          userId,
          plan: SubscriptionPlan.FREE,
          status: SubscriptionStatus.ACTIVE,
        },
      });
    }

    // Перевіряємо чи не закінчилась підписка
    const isPremium = this.checkIsPremium(subscription);

    return {
      id: subscription.id,
      userId: subscription.userId,
      plan: subscription.plan,
      status: subscription.status,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      isPremium,
    };
  }

  async activateSubscription(
    userId: string,
    dto: ActivateSubscriptionDto,
  ): Promise<SubscriptionDto> {
    const now = new Date();
    const endDate = new Date(now);
    endDate.setMonth(endDate.getMonth() + 1); // +1 місяць

    const subscription = await this.prisma.subscription.upsert({
      where: { userId },
      update: {
        plan: SubscriptionPlan.BODY_PRO,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: now,
        currentPeriodEnd: endDate,
      },
      create: {
        userId,
        plan: SubscriptionPlan.BODY_PRO,
        status: SubscriptionStatus.ACTIVE,
        currentPeriodStart: now,
        currentPeriodEnd: endDate,
      },
    });

    return {
      id: subscription.id,
      userId: subscription.userId,
      plan: subscription.plan,
      status: subscription.status,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      isPremium: true,
    };
  }

  async cancelSubscription(userId: string): Promise<SubscriptionDto> {
    const subscription = await this.prisma.subscription.update({
      where: { userId },
      data: {
        status: SubscriptionStatus.CANCELED,
      },
    });

    return {
      id: subscription.id,
      userId: subscription.userId,
      plan: subscription.plan,
      status: subscription.status,
      currentPeriodStart: subscription.currentPeriodStart,
      currentPeriodEnd: subscription.currentPeriodEnd,
      isPremium: this.checkIsPremium(subscription),
    };
  }

  private checkIsPremium(subscription: any): boolean {
    if (subscription.plan !== SubscriptionPlan.BODY_PRO) {
      return false;
    }
    if (subscription.status !== SubscriptionStatus.ACTIVE) {
      return false;
    }
    if (subscription.currentPeriodEnd && subscription.currentPeriodEnd < new Date()) {
      return false;
    }
    return true;
  }
}
