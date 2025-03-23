import { Global, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { PostModule } from './post/post.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConsulModule } from './consule/consule.module';
import { HealthController } from './health.controller';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';

@Module({
  imports: [
    PrometheusModule.register(),
    MongooseModule.forRoot('mongodb://mongo1,mongo2,mongo3/postdb', {
      replicaSet: 'rs0',
    }),
    ConfigModule.forRoot(),
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get('REDIS_HOST', 'localhost'),
        port: configService.get<number>('REDIS_PORT', 6379),
        ttl: 60 * 60, // Cache for 1 hour
      }),
    }),
    PostModule,
    ConsulModule
  ],
  controllers: [AppController, HealthController],
  providers: [AppService],
  exports: [CacheModule]
})
export class AppModule { }
