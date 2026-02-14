import { Controller, Get, Post, Patch, Delete, Query, Param, Body, UseGuards } from '@nestjs/common';
import { DiaryService } from './diary.service';
import { AddFoodEntryDto } from './dto/add-food-entry.dto';
import { UpdateFoodEntryDto } from './dto/update-food-entry.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('diary')
@UseGuards(JwtAuthGuard)
export class DiaryController {
  constructor(private diaryService: DiaryService) {}

  // Static routes MUST be before :date
  @Get('summary/range')
  async getSummary(
    @CurrentUser('id') userId: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.diaryService.getSummary(userId, startDate, endDate);
  }

  @Get(':date')
  async getDiaryByDate(
    @CurrentUser('id') userId: string,
    @Param('date') date: string,
  ) {
    return this.diaryService.getDiaryByDate(userId, date);
  }

  @Post('entry')
  async addFoodEntry(
    @CurrentUser('id') userId: string,
    @Body() dto: AddFoodEntryDto,
  ) {
    return this.diaryService.addFoodEntry(userId, dto);
  }

  @Patch('entry/:id')
  async updateFoodEntry(
    @CurrentUser('id') userId: string,
    @Param('id') entryId: string,
    @Body() dto: UpdateFoodEntryDto,
  ) {
    return this.diaryService.updateFoodEntry(userId, entryId, dto.amount);
  }

  @Delete('entry/:id')
  async deleteFoodEntry(
    @CurrentUser('id') userId: string,
    @Param('id') entryId: string,
  ) {
    return this.diaryService.deleteFoodEntry(userId, entryId);
  }
}
