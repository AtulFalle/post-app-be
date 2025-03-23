import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { GoogleStrategy } from './strategies/google.strategy';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { FacebookStrategy } from './strategies/facebook.strategy';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { jwtConstants } from 'src/constants';

@Module({
  imports: [PassportModule.register({ defaultStrategy: 'jwt' }),
    ConfigModule,
    JwtModule.register({ secret: jwtConstants.secret,
      signOptions: { expiresIn: '1h' },  global: true,})
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, JwtService],
  exports:[JwtModule]
})
export class AuthModule { }
