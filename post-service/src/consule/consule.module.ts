import { Module } from '@nestjs/common';
import { ConsulService } from './consule.service';

@Module({
  providers: [ConsulService],
  exports: [ConsulService],
})
export class ConsulModule {}