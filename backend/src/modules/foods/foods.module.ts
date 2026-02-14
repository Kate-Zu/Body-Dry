import { Module } from '@nestjs/common';
import { FoodsController } from './foods.controller';
import { FoodsService } from './foods.service';
import { OpenFoodFactsService } from './openfoodfacts.service';

@Module({
  controllers: [FoodsController],
  providers: [FoodsService, OpenFoodFactsService],
  exports: [FoodsService, OpenFoodFactsService],
})
export class FoodsModule {}
