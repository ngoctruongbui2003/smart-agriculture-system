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

    @Prop()
    rainVolume: string;

    @Prop()
    gasVolume: string;

    @Prop({ type: Types.ObjectId, ref: 'Field' })
    fieldId: Field;

    @Prop({ type: Date, default: () => new Date(new Date().getTime() + 7 * 60 * 60 * 1000) }) 
    addedAt: Date;

    createdAt?: Date;
    updatedAt?: Date;
}

export const SensorSchema = SchemaFactory.createForClass(Sensor);
