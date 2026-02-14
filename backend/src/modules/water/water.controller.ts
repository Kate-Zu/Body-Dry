import { Controller, Get, Post, Patch, Query, Param, Body, UseGuards } from '@nestjs/common';
import { WaterService } from './water.service';
import { AddWaterDto } from './dto/add-water.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('water')
@UseGuards(JwtAuthGuard)
export class WaterController {
  constructor(private waterService: WaterService) {}

  // Static routes MUST be before :date
  @Get('history/range')
  async getWaterHistory(
    @CurrentUser('id') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.waterService.getWaterHistory(userId, startDate, endDate);
  }

  @Get(':date')
  async getWaterByDate(
    @CurrentUser('id') userId: string,
    @Param('date') date: string,
  ) {
    return this.waterService.getWaterByDate(userId, date);
  }

  @Post()
  async addWater(
    @CurrentUser('id') userId: string,
    @Body() dto: AddWaterDto,
  ) {
    return this.waterService.addWater(userId, dto);
  }

  @Patch('goal')
  async updateWaterGoal(
    @CurrentUser('id') userId: string,
    @Body('waterGoal') waterGoal: number,
  ) {
    return this.waterService.updateWaterGoal(userId, waterGoal);
  }
}
