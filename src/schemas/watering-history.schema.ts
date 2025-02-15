import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { Field } from './field.schema';

export type WateringHistoryDocument = HydratedDocument<WateringHistory>;

@Schema({ timestamps: true })
export class WateringHistory {
    @Prop({ type: Date, default: () => new Date(new Date().getTime() + 7 * 60 * 60 * 1000) }) 
    startDate: Date;

    @Prop({ type: Date, default: () => new Date(new Date().getTime() + 7 * 60 * 60 * 1000) }) 
    endDate: Date;

    @Prop({ default: false })
    isDeleted: boolean;

    @Prop({ type: Types.ObjectId, ref: 'Field' })
    fieldId: Field;
}

export const WateringHistorySchema = SchemaFactory.createForClass(WateringHistory);
