import { forwardRef, Module } from '@nestjs/common';
import { SensorService } from './sensor.service';
import { SensorController } from './sensor.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Sensor, SensorSchema } from 'src/schemas/sensor.schema';
import { WateringHistoryModule } from '../watering-history/watering-history.module';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Sensor.name, schema: SensorSchema }]),
    WateringHistoryModule,
    forwardRef(() => MailModule)
  ],
  controllers: [SensorController],
  providers: [SensorService],
  exports: [SensorService],
})
export class SensorModule {}
