import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ConsulService } from './consule/consule.service';

@Injectable()
export class TcpClientService implements OnModuleInit {
  private client: ClientProxy;

  constructor(private readonly consulService: ConsulService) {}

  async onModuleInit() {
    await this.initializeClient();
  }

  async initializeClient() {
    const postServiceAddress = await this.consulService.getPostServiceAddress();

    console.log(`[TCP Client] Connecting to Post Service via TCP at ${postServiceAddress.host}:${postServiceAddress.port}`);
    this.client = ClientProxyFactory.create({
      transport: Transport.TCP,
      options: {
        host: postServiceAddress.host,
        port: postServiceAddress.port,
      },
    });
  }

  async send(pattern: object, data: any) {
    if (!this.client) {
      await this.initializeClient();
    }
    return this.client.send(pattern, data);
  }
}
