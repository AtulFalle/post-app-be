import { Injectable, OnModuleInit, OnModuleDestroy, OnApplicationShutdown } from '@nestjs/common';
import { randomUUID } from 'crypto';
const Consul = require('consul');
import * as os from 'os';

@Injectable()
export class ConsulService implements OnModuleInit, OnModuleDestroy, OnApplicationShutdown  {
  private readonly consul: any;
  serviceId: string;
  hostname: string;

  constructor() {
    this.consul = new Consul({
      host: process.env.CONSUL_HOST || 'consule', // ✅ Use the correct hostname
      port: process.env.CONSUL_PORT || 8500,
      promisify: true,
    });

  }

  async onModuleInit() {
    await this.registerService();
  }

  private async registerService() {
    this.serviceId = `post-service-${randomUUID()}`; // Unique ID
    this.hostname = os.hostname(); // Unique per container
    await this.consul.agent.service.register({
      name: 'post-service', // Common name for all replicas
      id: this.serviceId, // Unique ID per instance
      address: this.hostname, // Use dynamic hostname
      port: 4000, // Internal port
      check: {
        http: `http://${this.hostname}:3002/health`, // Health check per instance
        interval: '10s',
      },
    });

    console.log(`Registered ${this.serviceId} in Consul`);
  }

  async deregisterService() {
    try {
      await this.consul.agent.service.deregister(this.serviceId);
      console.log(`🛑 Deregistered service with ID: ${this.serviceId}`);
    } catch (error) {
      console.error(`❌ Error deregistering service:`, error);
    }
  }

  // Called when the module is destroyed (e.g., app shutdown)
  async onModuleDestroy() {
    await this.deregisterService();
  }

  // Called when the app is shutting down
  async onApplicationShutdown() {
    await this.deregisterService();
  }
}