import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AccountType } from 'src/constants/enum';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
    @Prop()
    email: string;

    @Prop()
    password: string;

    @Prop()
    firstName: string;

    @Prop()
    lastName: string;

    @Prop()
    phoneNumber: string;

    @Prop()
    avatarUrl: string;

    @Prop({ enum: AccountType, default: AccountType.LOCAL })
    accountType: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
