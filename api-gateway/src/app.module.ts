import { Module, OnModuleInit } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ThrottlerModule } from '@nestjs/throttler';
import Consul from 'consul';
import { HttpService } from '@nestjs/axios';
import { ConsulModule } from './consule/consule.module';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'POST_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'post-service',
          port: 3003,
        },
      },
    ]),
    ConsulModule
    
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
