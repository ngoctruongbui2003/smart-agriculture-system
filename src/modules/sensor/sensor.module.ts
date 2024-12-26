import { Module } from '@nestjs/common';
import { SensorService } from './sensor.service';
import { SensorController } from './sensor.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Sensor, SensorSchema } from 'src/schemas/sensor.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Sensor.name, schema: SensorSchema }])],
  controllers: [SensorController],
  providers: [SensorService],
})
export class SensorModule {}
