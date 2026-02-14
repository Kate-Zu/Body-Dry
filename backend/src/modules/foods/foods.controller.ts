import { Controller, Get, Post, Delete, Query, Param, Body, UseGuards } from '@nestjs/common';
import { FoodsService } from './foods.service';
import { CreateFoodDto } from './dto/create-food.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@Controller('foods')
export class FoodsController {
  constructor(private foodsService: FoodsService) {}

  // Public endpoints (no auth required)
  @Get('search')
  async search(
    @Query('q') query: string,
    @Query('limit') limit?: number,
  ) {
    return this.foodsService.search(query || '', limit);
  }

  @Get('barcode/:barcode')
  async getByBarcode(@Param('barcode') barcode: string) {
    return this.foodsService.getByBarcode(barcode);
  }

  // Protected endpoints (auth required) — MUST be before :id route
  @Get('recent')
  @UseGuards(JwtAuthGuard)
  async getRecent(
    @CurrentUser('id') userId: string,
    @Query('limit') limit?: number,
  ) {
    return this.foodsService.getRecent(userId, limit);
  }

  @Get('favorites')
  @UseGuards(JwtAuthGuard)
  async getFavorites(@CurrentUser('id') userId: string) {
    return this.foodsService.getFavorites(userId);
  }

  // Dynamic :id route MUST be after all static routes
  @Get(':id')
  async getById(@Param('id') id: string) {
    return this.foodsService.getById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateFoodDto,
  ) {
    return this.foodsService.create(userId, dto);
  }

  @Post(':id/favorite')
  @UseGuards(JwtAuthGuard)
  async addToFavorites(
    @CurrentUser('id') userId: string,
    @Param('id') foodId: string,
  ) {
    return this.foodsService.addToFavorites(userId, foodId);
  }

  @Delete(':id/favorite')
  @UseGuards(JwtAuthGuard)
  async removeFromFavorites(
    @CurrentUser('id') userId: string,
    @Param('id') foodId: string,
  ) {
    return this.foodsService.removeFromFavorites(userId, foodId);
  }
}
