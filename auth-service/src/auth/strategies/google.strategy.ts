import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
  ) {
    console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
    console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET);
    console.log('GOOGLE_REDIRECT_URL:', process.env.GOOGLE_CALLBACK_URL);
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_CALLBACK_URL,
      scope: ['email', 'profile'],
      passReqToCallback: true,

    });
  }

//   async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
//     console.log('Google Profile:', profile, 'token: ',accessToken, 'refersh:', refreshToken);
//     console.log('JWT Secret:', this.configService.get<string>('JWT_SECRET')); // Debugging

//     const payload = { email: profile.emails[0].value, sub: profile.id };

//     try {
//       const jwt = this.jwtService.sign(payload); // Error happens here if secret is missing
//       return done(null, { token: jwt });
//     } catch (error) {
//       console.error('JWT Generation Error:', error.message);
//       return done(error, false);
//     }
//   }
async validate(
    request: any,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    console.log('🔹 Access Token:', accessToken);
    console.log('🔹 Refresh Token:', refreshToken);
    console.log('🔹 Profile:', profile);

    // Return the user along with the access token
    const user = {
      googleId: profile.id,
      email: profile.emails[0].value,
      name: profile.displayName,
      picture: profile.photos[0].value,
      accessToken, // Include the access token
    };

    return done(null, user);
  }
}
