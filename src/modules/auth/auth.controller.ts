import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, LoginWithPlatformDto, RegisterDto } from './dto';
import { LOGIN_SUCCESS, REGISTER_SUCCESS } from 'src/constants/server';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  async register(@Body() registerDto: RegisterDto) {
    return {
      message: REGISTER_SUCCESS,
      data: await this.authService.register(registerDto),
    };
  }

  @Post('/login')
  async login(@Body() loginDto: LoginDto) {
    return {
      message: LOGIN_SUCCESS,
      data: await this.authService.login(loginDto),
    };
  }

  @Post('/login-facebook')
  async LoginWithFacebook(@Body() loginWithPlatformDto: LoginWithPlatformDto) {
    return {
      message: LOGIN_SUCCESS,
      data: await this.authService.loginWithFacebook(loginWithPlatformDto),
    };
  }

  @Post('/login-google')
  async LoginWithGoogle(@Body() loginWithPlatformDto: LoginWithPlatformDto) {
    return {
      message: LOGIN_SUCCESS,
      data: await this.authService.loginWithGoogle(loginWithPlatformDto),
    };
  }
}
