import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';
import { RegisterTokenDto, SendNotificationDto } from './dto';

interface RequestWithUser {
  user: { sub: string };
}

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  /**
   * Register FCM token for push notifications
   * POST /notifications/token
   */
  @Post('token')
  async registerToken(@Request() req: RequestWithUser, @Body() dto: RegisterTokenDto) {
    return this.notificationsService.registerToken(req.user.sub, dto);
  }

  /**
   * Unregister FCM token
   * DELETE /notifications/token/:token
   */
  @Delete('token/:token')
  async unregisterToken(@Request() req: RequestWithUser, @Param('token') token: string) {
    return this.notificationsService.unregisterToken(req.user.sub, token);
  }

  /**
   * Get all registered tokens for current user
   * GET /notifications/tokens
   */
  @Get('tokens')
  async getTokens(@Request() req: RequestWithUser) {
    return this.notificationsService.getUserTokens(req.user.sub);
  }

  /**
   * Get notification settings
   * GET /notifications/settings
   */
  @Get('settings')
  async getSettings(@Request() req: RequestWithUser) {
    return this.notificationsService.getNotificationSettings(req.user.sub);
  }

  /**
   * Update notification settings
   * POST /notifications/settings
   */
  @Post('settings')
  async updateSettings(@Request() req: RequestWithUser, @Body() settings: Record<string, any>) {
    return this.notificationsService.updateNotificationSettings(req.user.sub, settings);
  }

  /**
   * Get scheduled notifications for current user
   * GET /notifications/scheduled
   */
  @Get('scheduled')
  getScheduledNotifications(@Request() req: RequestWithUser) {
    return this.notificationsService.getScheduledNotifications(req.user.sub);
  }

  /**
   * Clear all scheduled notifications
   * DELETE /notifications/scheduled
   */
  @Delete('scheduled')
  clearScheduledNotifications(@Request() req: RequestWithUser) {
    return this.notificationsService.clearScheduledNotifications(req.user.sub);
  }

  /**
   * Schedule water reminder
   * POST /notifications/schedule/water
   */
  @Post('schedule/water')
  async scheduleWaterReminder(@Request() req: RequestWithUser, @Body() body: { time: string }) {
    const time = new Date(body.time);
    return this.notificationsService.scheduleWaterReminder(req.user.sub, time);
  }

  /**
   * Schedule meal reminder
   * POST /notifications/schedule/meal
   */
  @Post('schedule/meal')
  async scheduleMealReminder(
    @Request() req: RequestWithUser,
    @Body() body: { mealType: 'BREAKFAST' | 'LUNCH' | 'DINNER' | 'SNACK'; time: string },
  ) {
    const time = new Date(body.time);
    return this.notificationsService.scheduleMealReminder(req.user.sub, body.mealType, time);
  }

  /**
   * Schedule weight reminder
   * POST /notifications/schedule/weight
   */
  @Post('schedule/weight')
  async scheduleWeightReminder(@Request() req: RequestWithUser, @Body() body: { time: string }) {
    const time = new Date(body.time);
    return this.notificationsService.scheduleWeightReminder(req.user.sub, time);
  }

  /**
   * Schedule daily summary
   * POST /notifications/schedule/summary
   */
  @Post('schedule/summary')
  async scheduleDailySummary(@Request() req: RequestWithUser, @Body() body: { time: string }) {
    const time = new Date(body.time);
    return this.notificationsService.scheduleDailySummary(req.user.sub, time);
  }

  /**
   * Send test notification to current user
   * POST /notifications/test
   */
  @Post('test')
  async sendTestNotification(@Request() req: RequestWithUser, @Body() dto: SendNotificationDto) {
    return this.notificationsService.sendToUser(req.user.sub, dto);
  }
}
