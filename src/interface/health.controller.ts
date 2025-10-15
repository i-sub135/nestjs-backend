import { Controller, Get } from '@nestjs/common';
import { HealthService } from '../application/health/health.service';

@Controller('health')
export class HealthController {
    constructor(private healthService: HealthService) { }

    @Get()
    async health() {
        return this.healthService.checkHealth();
    }

    @Get('ready')
    async readiness() {
        return this.healthService.checkReadiness();
    }

    @Get('live')
    async liveness() {
        return this.healthService.checkLiveness();
    }
}
