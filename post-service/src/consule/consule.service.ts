import { Injectable, OnModuleInit } from '@nestjs/common';
const Consul = require('consul');
@Injectable()
export class ConsulService implements OnModuleInit {
  private readonly consul: any;

  constructor() {
    this.consul = new Consul({  host: process.env.CONSUL_HOST || 'consule', // ✅ Use the correct hostname
      port: process.env.CONSUL_PORT || 8500,
      promisify: true, 
    });

  }

  async onModuleInit() {
    await this.registerService();
  }

  private async registerService() {
    await this.consul.agent.service.register({
      name: 'post-service',
      address: 'post-service',
      port: 3003,
      check: {
        http: 'http://localhost:3002/health',
        interval: '10s',
        name: 'post-service',
        timeout: '10s'
      },
    });
  }
}