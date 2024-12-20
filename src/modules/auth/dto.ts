import { PartialType } from "@nestjs/mapped-types";
import { IsEmail, IsNotEmpty, IsOptional, IsPhoneNumber } from "class-validator";

export class LoginDto {
    @IsEmail({}, { message: 'Invalid email' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;
    
    @IsNotEmpty({ message: 'Password is required' })
    password: string;
}

export class RegisterDto {
    @IsEmail({}, { message: 'Invalid email' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @IsNotEmpty({ message: 'Password is required' })
    password: string;

    @IsNotEmpty({ message: 'firstName is required' })
    firstName: string;

    @IsNotEmpty({ message: 'lastName is required' })
    lastName: string;

    @IsNotEmpty({ message: 'phoneNumber is required' })
    @IsPhoneNumber('VN', { message: 'Invalid phone number' })
    phoneNumber: string;
}

export class LoginWithPlatformDto extends PartialType(RegisterDto) {
    @IsOptional()
    avatarUrl: string;
}

