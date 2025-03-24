import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService, private configService: ConfigService) {}

  async validateOAuthLogin(profile: any): Promise<string> {
    const payload = { id: profile.id, email: profile.email };
    return this.jwtService.sign(payload);
  }

  async validateToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Invalid token');
    }
  }

  generateToken(user: any) {
    const payload = { sub: user.googleId , email: user.email };
    return this.jwtService.sign(user);
  }

  async getGoogleAuthToken(code: string) {
    const tokenUrl = 'https://oauth2.googleapis.com/token';
    const clientId = this.configService.get('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get('GOOGLE_CLIENT_SECRET');
    const redirectUri = 'http://localhost:4200/auth/callback';

    const { data } = await axios.post(tokenUrl, {
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });

    if (!data.id_token) {
      throw new UnauthorizedException('Invalid token');
    }

    const jwtToken = jwt.sign({ sub: data.id_token }, this.configService.get('JWT_SECRET'), { expiresIn: '1h' });

    return { access_token: jwtToken };
  }
}
