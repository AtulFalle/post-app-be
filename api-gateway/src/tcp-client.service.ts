import { Injectable, OnModuleInit } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ConsulService } from './consule/consule.service';
import { ConsulLoadBalancerService } from './consule/consule-load-balancer.service';

@Injectable()
export class TcpClientService {

  constructor( private readonly loadBalancer: ConsulLoadBalancerService) {}


  async send(pattern: object, data: any) {

    const client = await this.loadBalancer.getTcpClient('post-service');
    return client.send(pattern, data);
  }

  async sendAuthReq(pattern: object, data: any) {

    const client = await this.loadBalancer.getTcpClient('auth-service');
    return client.send(pattern, data);
  }

}
