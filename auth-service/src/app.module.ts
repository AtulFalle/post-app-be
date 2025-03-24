import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ConsulModule } from './consule/consule.module';
import { HealthController } from './health.controller';

@Module({
  imports: [ConfigModule.forRoot({isGlobal: true}), ConsulModule, AuthModule],
  controllers: [AppController, HealthController],
  providers: [AppService],
})
export class AppModule {}
