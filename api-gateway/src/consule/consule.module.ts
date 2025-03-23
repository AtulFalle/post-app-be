import { Module } from '@nestjs/common';
import { ConsulService } from './consule.service';
import { ConsulLoadBalancerService } from './consule-load-balancer.service';

@Module({
  providers: [ConsulService, ConsulLoadBalancerService],
  exports: [ConsulService,ConsulLoadBalancerService],
})
export class ConsulModule {}