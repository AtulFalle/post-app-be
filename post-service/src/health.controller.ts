import { Controller, Get } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Controller('health')
export class HealthController {
  constructor(
    @InjectConnection() private readonly dbConnection: Connection,
  ) {}

  @Get()
  async healthCheck() {
    const healthReport = {
      database: await this.checkDatabase(),
      uptime: process.uptime(),
      timestamp: new Date(),
    };

    return healthReport;
  }

  private async checkDatabase(): Promise<string> {
    try {
      await this.dbConnection.db.admin().ping();
      return 'UP';
    } catch (error) {
      return 'DOWN';
    }
  }

}
