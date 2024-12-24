import { Controller, Get, Post, Body, Patch, Param, Delete, HttpCode } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto, LoginWithPlatformDto, RegisterDto } from './dto';
import { LOGIN_SUCCESS, REGISTER_SUCCESS } from 'src/constants/server';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/register')
  @HttpCode(200)
  async register(@Body() registerDto: RegisterDto) {
    return {
      message: REGISTER_SUCCESS,
      data: await this.authService.register(registerDto),
    };
  }

  @Post('/login')
  @HttpCode(200)
  async login(@Body() loginDto: LoginDto) {
    return {
      message: LOGIN_SUCCESS,
      data: await this.authService.login(loginDto),
    };
  }

  @Post('/login-facebook')
  @HttpCode(200)
  async LoginWithFacebook(@Body() loginWithPlatformDto: LoginWithPlatformDto) {
    return {
      message: LOGIN_SUCCESS,
      data: await this.authService.loginWithFacebook(loginWithPlatformDto),
    };
  }

  @Post('/login-google')
  @HttpCode(200)
  async LoginWithGoogle(@Body() loginWithPlatformDto: LoginWithPlatformDto) {
    return {
      message: LOGIN_SUCCESS,
      data: await this.authService.loginWithGoogle(loginWithPlatformDto),
    };
  }
}
