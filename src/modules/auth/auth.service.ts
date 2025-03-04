import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { LoginDto, LoginWithPlatformDto, RegisterDto } from './dto';
import { LOGIN_FAIL, REGISTER_FAIL, USER_EXISTED } from 'src/constants/server';
import { plainToInstance } from 'class-transformer';
import { CreateUserDto } from '../users/dto';
import { comparePassword } from 'src/utils';
import { AccountType } from 'src/constants/enum';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService
  ) {}

  async register(registerDto: RegisterDto) {

    const foundUser = await this.usersService.findByEmail(registerDto.email);
    if (foundUser) throw new BadRequestException(USER_EXISTED);

    const createUserDto = plainToInstance(CreateUserDto, registerDto);
    const newUser = await this.usersService.create(createUserDto);
    if (!newUser) throw new BadRequestException(REGISTER_FAIL);

    // Send mail
    // const registerMailDto = plainToInstance(RegisterMailDto, createUserDto)
    // this.mailService.registerMail(registerMailDto);

    return newUser;
  }

  async login(loginDto: LoginDto) {
    console.log('Start login process');
    
    const foundUser = await this.usersService.findByEmail(loginDto.email);
    if (!foundUser) {
      console.log('User not found');
      throw new BadRequestException(LOGIN_FAIL);
    }
    console.log('User founded');
  
    const isMatch = await comparePassword(loginDto.password, foundUser.password);
    if (!isMatch) {
      console.log('Password mismatch');
      throw new BadRequestException(LOGIN_FAIL);
    }
    console.log('Password match');
  
    console.log('Login successful');
    delete foundUser.password;
    return foundUser;
  }

  async loginWithPlatform(LoginWithPlatformDto: LoginWithPlatformDto, accountType: string) {

    const foundUser = await this.usersService.findByProps({
      email: LoginWithPlatformDto.email,
      accountType
    });
    if (foundUser) return foundUser;

    const createUserDto = plainToInstance(CreateUserDto, {
      ...LoginWithPlatformDto,
      accountType
    })

    const newUser = await this.usersService.create(createUserDto);
    if (!newUser) throw new BadRequestException(REGISTER_FAIL);

    // send mail
    // const registerMailDto = plainToInstance(RegisterMailDto, createUserDto)
    // this.mailService.registerMail(registerMailDto);
    delete newUser.password;
    return newUser;
  }

  async loginWithGoogle(LoginWithPlatformDto: LoginWithPlatformDto) {
    return await this.loginWithPlatform(LoginWithPlatformDto, AccountType.GOOGLE);
  }

  async loginWithFacebook(LoginWithPlatformDto: LoginWithPlatformDto) {
    return await this.loginWithPlatform(LoginWithPlatformDto, AccountType.FACEBOOK);
  }
}
