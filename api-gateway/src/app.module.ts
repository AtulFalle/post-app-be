import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ConsulModule } from './consule/consule.module';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { TcpClientService } from './tcp-client.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'POST_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'post-service',
          port: 4000,
        },
      },
    ]),
    ConsulModule,
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 3000,
          limit: 10,
        },
      ],
    }),

  ],
  controllers: [AppController],
  providers: [AppService, TcpClientService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard
    }
  ],
})
export class AppModule { }
