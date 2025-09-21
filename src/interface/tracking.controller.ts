import { Controller, Get, Post, Param, UseGuards } from '@nestjs/common';
import { TrackingService } from '../application/tracking/tracking.service';
import { JwtAuthGuard } from '../application/auth/jwt-auth.guard';

@Controller('tracking')
@UseGuards(JwtAuthGuard)
export class TrackingController {
    constructor(private trackingService: TrackingService) { }

    @Get('vehicles/:id/locations')
    getVehicleLocations(@Param('id') vehicleId: string) {
        return this.trackingService.getVehicleLocations(vehicleId);
    }

    @Post('vehicles/:id/start')
    startTracking(@Param('id') vehicleId: string) {
        return this.trackingService.startTrackingSession(vehicleId);
    }

    @Post('vehicles/:id/stop')
    stopTracking(@Param('id') vehicleId: string) {
        return this.trackingService.stopTrackingSession(vehicleId);
    }

    @Get('active-vehicles')
    getActiveVehicles() {
        return this.trackingService.getActiveVehicles();
    }
}