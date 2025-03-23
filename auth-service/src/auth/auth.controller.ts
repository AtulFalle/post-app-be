import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly jwtService: JwtService, private configService: ConfigService, private authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  googleAuthCallback(@Req() req) {
    console.log('inside callbackurl', req.user);
    console.log('JWT_SECRET:', this.configService.get<string>('JWT_SECRET'));
    return { access_token: req.user.accessToken };
  }
}
