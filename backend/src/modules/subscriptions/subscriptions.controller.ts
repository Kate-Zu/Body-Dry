import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { ActivateSubscriptionDto } from './dto/subscription.dto';

@Controller('subscriptions')
@UseGuards(JwtAuthGuard)
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('current')
  async getCurrentSubscription(@Request() req: any) {
    return this.subscriptionsService.getSubscription(req.user.id);
  }

  @Post('activate')
  async activateSubscription(
    @Request() req: any,
    @Body() dto: ActivateSubscriptionDto,
  ) {
    return this.subscriptionsService.activateSubscription(req.user.id, dto);
  }

  @Post('cancel')
  async cancelSubscription(@Request() req: any) {
    return this.subscriptionsService.cancelSubscription(req.user.id);
  }
}
