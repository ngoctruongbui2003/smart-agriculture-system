import { Module } from '@nestjs/common';
import { WateringHistoryService } from './watering-history.service';
import { WateringHistoryController } from './watering-history.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { WateringHistory, WateringHistorySchema } from 'src/schemas/watering-history.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: WateringHistory.name, schema: WateringHistorySchema }])],
  controllers: [WateringHistoryController],
  providers: [WateringHistoryService],
  exports: [WateringHistoryService],
})
export class WateringHistoryModule {}
