import { Module } from '@nestjs/common';
import { FieldService } from './field.service';
import { FieldController } from './field.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Field, FieldSchema } from 'src/schemas/field.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Field.name, schema: FieldSchema }])],
  controllers: [FieldController],
  providers: [FieldService],
  exports: [FieldService],
})
export class FieldModule {}
