import { PartialType } from "@nestjs/mapped-types";
import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber } from "class-validator";

export class CreateUserDto {
    @IsEmail({}, { message: 'Invalid email' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;
    
    @IsOptional()
    password: string;

    @IsNotEmpty({ message: 'firstName is required' })
    firstName: string;

    @IsNotEmpty({ message: 'lastName is required' })
    lastName: string;

    @IsNotEmpty({ message: 'phoneNumber is required' })
    @IsPhoneNumber('VN', { message: 'Invalid phone number' })
    phoneNumber: string;

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
