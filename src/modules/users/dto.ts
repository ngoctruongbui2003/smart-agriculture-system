import { PartialType } from "@nestjs/mapped-types";
import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber, IsString } from "class-validator";

export class CreateUserDto {
    @IsEmail({}, { message: 'Invalid email' })
    @IsNotEmpty({ message: 'Email is required' })
    @IsString()
    email: string;
    
    @IsOptional()
    @IsString()
    password: string;

    @IsNotEmpty({ message: 'username is required' })
    @IsString()
    userName: string;

    @IsOptional()
    @IsString()
    avatarUrl: string;

    @IsOptional()
    account_type: string;
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
    
}

export class UpdateUserPasswordDto {
    @IsNotEmpty({ message: 'Password is required' })
    oldPassword: string;

    @IsNotEmpty({ message: 'New password is required' })
    newPassword: string;
}
