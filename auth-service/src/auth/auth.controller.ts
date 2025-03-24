import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { MessagePattern, Payload } from '@nestjs/microservices';

@Controller('auth')
export class AuthController {
  constructor(private configService: ConfigService, private authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthCallback(@Req() req) {
    console.log('inside callbackurl', req.user);
    const token = this.authService.generateToken(req.user);
    console.log('JWT_SECRET:', this.configService.get<string>('JWT_SECRET'));
    return { access_token: token };
  }

  @Post('google')
  async googleLogin(@Body('code') code: string) {
    return this.authService.getGoogleAuthToken(code);
  }

  @MessagePattern({ cmd: 'get_auth_token' })
  googleLoginTCP(data: any) {
    console.log('data from tcp is: ', data.code)
    return this.authService.getGoogleAuthToken(data.code);

  }

}
