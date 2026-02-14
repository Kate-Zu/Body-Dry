import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ProgressService } from './progress.service';
import { AddWeightDto } from './dto/add-weight.dto';

@Controller('progress')
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private progressService: ProgressService) {}

  // Get weight history
  @Get('weight')
  async getWeightHistory(
    @CurrentUser('id') userId: string,
    @Query('limit') limit?: string,
  ) {
    return this.progressService.getWeightHistory(userId, limit ? parseInt(limit) : 30);
  }

  // Add weight entry
  @Post('weight')
  async addWeight(
    @CurrentUser('id') userId: string,
    @Body() dto: AddWeightDto,
  ) {
    return this.progressService.addWeight(userId, dto);
  }

  // Delete weight entry
  @Delete('weight/:id')
  async deleteWeight(
    @CurrentUser('id') userId: string,
    @Param('id') weightId: string,
  ) {
    return this.progressService.deleteWeight(userId, weightId);
  }

  // Get weekly progress
  @Get('weekly')
  async getWeeklyProgress(@CurrentUser('id') userId: string) {
    return this.progressService.getWeeklyProgress(userId);
  }

  // Get monthly progress
  @Get('monthly')
  async getMonthlyProgress(@CurrentUser('id') userId: string) {
    return this.progressService.getMonthlyProgress(userId);
  }

  // Get yearly progress
  @Get('yearly')
  async getYearlyProgress(@CurrentUser('id') userId: string) {
    return this.progressService.getYearlyProgress(userId);
  }
}
