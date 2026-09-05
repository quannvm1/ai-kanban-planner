import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  HealthIndicatorResult,
  MemoryHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../../infrastructure/database/prisma.service';

@Controller('api/v1/health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private memory: MemoryHealthIndicator,
    private prisma: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  async check() {
    return this.health.check([
      async (): Promise<HealthIndicatorResult> => {
        try {
          await this.prisma.$queryRawUnsafe('SELECT 1');
          return {
            database: {
              status: 'up',
            },
          };
        } catch (error: any) {
          return {
            database: {
              status: 'down',
              message: error.message,
            },
          };
        }
      },
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
    ]);
  }
}
