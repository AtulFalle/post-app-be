import { Injectable, Logger } from '@nestjs/common';
const Consul = require('consul');
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';

@Injectable()
export class ConsulLoadBalancerService {
  private readonly logger = new Logger(ConsulLoadBalancerService.name);
  private consul: any;

  constructor() {
    this.consul = new Consul({
      host: 'consul', // Change to 'localhost' if running locally
      port: 8500,
      promisify: true,
    });
  }

  /** 🔹 Fetch a healthy instance of a given service dynamically */
  async getAvailableInstance(serviceName: string): Promise<{ host: string; port: number }> {
    try {
      const services = await this.consul.health.service(serviceName);
      const healthyInstances = services
        .filter(svc => svc.Checks.every(check => check.Status === 'passing'))
        .map(svc => ({ host: svc.Service.Address, port: svc.Service.Port }));

      if (healthyInstances.length === 0) {
        this.logger.error(`❌ No healthy instances found for ${serviceName}`);
        throw new Error(`No available instance for ${serviceName}`);
      }

      // 🎯 Pick a random healthy instance (Load Balancing)
      const selectedInstance = healthyInstances[Math.floor(Math.random() * healthyInstances.length)];
      this.logger.log(`✅ Selected ${serviceName} instance: ${selectedInstance.host}:${selectedInstance.port}`);

      return selectedInstance;
    } catch (error) {
      this.logger.error(`❌ Error fetching ${serviceName} from Consul: ${error.message}`);
      throw error;
    }
  }

  /** 🔹 Get TCP Client for a given microservice */
  async getTcpClient(serviceName: string): Promise<ClientProxy> {
    const { host, port } = await this.getAvailableInstance(serviceName);
    
    return ClientProxyFactory.create({
      transport: Transport.TCP,
      options: { host, port },
    });
  }
}
