import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma.service';
import { RedisService } from '../../infrastructure/redis.service';

@Injectable()
export class HealthService {
    constructor(
        private prisma: PrismaService,
        private redis: RedisService,
    ) { }

    async checkHealth() {
        const startTime = Date.now();
        
        const [databaseStatus, redisStatus] = await Promise.allSettled([
            this.checkDatabase(),
            this.checkRedis(),
        ]);

        const responseTime = Date.now() - startTime;

        return {
            status: this.getOverallStatus(databaseStatus, redisStatus),
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            responseTime: `${responseTime}ms`,
            services: {
                database: this.getServiceStatus(databaseStatus),
                redis: this.getServiceStatus(redisStatus),
            },
            environment: process.env.NODE_ENV || 'development',
            version: process.env.npm_package_version || '1.0.0',
        };
    }

    private async checkDatabase(): Promise<void> {
        await this.prisma.$queryRaw`SELECT 1`;
    }

    private async checkRedis(): Promise<void> {
        await this.redis.getClient().ping();
    }

    private getServiceStatus(result: PromiseSettledResult<void>): { status: string; message?: string } {
        if (result.status === 'fulfilled') {
            return { status: 'healthy' };
        }
        return {
            status: 'unhealthy',
            message: result.reason?.message || 'Unknown error',
        };
    }

    private getOverallStatus(
        databaseStatus: PromiseSettledResult<void>,
        redisStatus: PromiseSettledResult<void>,
    ): string {
        if (databaseStatus.status === 'fulfilled' && redisStatus.status === 'fulfilled') {
            return 'healthy';
        }
        if (databaseStatus.status === 'rejected' && redisStatus.status === 'rejected') {
            return 'unhealthy';
        }
        return 'degraded';
    }

    async checkReadiness() {
        try {
            await this.checkDatabase();
            await this.checkRedis();
            return {
                status: 'ready',
                timestamp: new Date().toISOString(),
            };
        } catch (error) {
            return {
                status: 'not_ready',
                timestamp: new Date().toISOString(),
                error: error.message,
            };
        }
    }

    async checkLiveness() {
        return {
            status: 'alive',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            memory: {
                heapUsed: `${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)}MB`,
                heapTotal: `${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)}MB`,
                rss: `${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`,
            },
        };
    }
}
