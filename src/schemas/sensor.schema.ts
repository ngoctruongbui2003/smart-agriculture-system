import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Field } from './field.schema';

export type SensorDocument = HydratedDocument<Sensor>;

@Schema({ timestamps: true })
export class Sensor {
    @Prop()
    humidity: string;

    @Prop()
    temperature: string;

    @Prop()
    light: string;

    @Prop()
    soilMoisture: string;

    @Prop({ type: Types.ObjectId, ref: 'Field' })
    fieldId: Field;
}

export const SensorSchema = SchemaFactory.createForClass(Sensor);
