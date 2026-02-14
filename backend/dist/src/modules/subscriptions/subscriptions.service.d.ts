import { PrismaService } from '../../prisma/prisma.service';
import { SubscriptionDto, ActivateSubscriptionDto } from './dto/subscription.dto';
export declare class SubscriptionsService {
    private prisma;
    constructor(prisma: PrismaService);
    getSubscription(userId: string): Promise<SubscriptionDto>;
    activateSubscription(userId: string, dto: ActivateSubscriptionDto): Promise<SubscriptionDto>;
    cancelSubscription(userId: string): Promise<SubscriptionDto>;
    private checkIsPremium;
}
