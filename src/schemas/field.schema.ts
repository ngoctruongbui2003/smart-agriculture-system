import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type FieldDocument = HydratedDocument<Field>;

@Schema({ timestamps: true })
export class Field {
    @Prop()
    name: string;

    @Prop()
    status: string;

    @Prop()
    type: string;

    @Prop()
    area: string;

    @Prop()
    imageUrl: string;

    @Prop()
    plantingDate: string;

    @Prop()
    cropHealth: string;

    @Prop()
    haverstTime: string;
}

export const FieldSchema = SchemaFactory.createForClass(Field);
