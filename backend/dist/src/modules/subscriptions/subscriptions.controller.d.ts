import { SubscriptionsService } from './subscriptions.service';
import { ActivateSubscriptionDto } from './dto/subscription.dto';
export declare class SubscriptionsController {
    private readonly subscriptionsService;
    constructor(subscriptionsService: SubscriptionsService);
    getCurrentSubscription(req: any): Promise<import("./dto/subscription.dto").SubscriptionDto>;
    activateSubscription(req: any, dto: ActivateSubscriptionDto): Promise<import("./dto/subscription.dto").SubscriptionDto>;
    cancelSubscription(req: any): Promise<import("./dto/subscription.dto").SubscriptionDto>;
}
