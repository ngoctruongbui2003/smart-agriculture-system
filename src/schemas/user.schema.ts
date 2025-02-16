import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';
import { AccountType } from 'src/constants/enum';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {

    _id: Types.ObjectId;

    @Prop()
    email: string;

    @Prop()
    password: string;

    @Prop()
    username: string;

    @Prop()
    avatarUrl: string;

    @Prop({ default: false })
    receiveWeeklyEmail: boolean;

    @Prop({ enum: AccountType, default: AccountType.LOCAL })
    accountType: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
