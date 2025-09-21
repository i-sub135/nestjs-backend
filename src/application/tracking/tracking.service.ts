import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma.service';
import { RedisService } from '../../infrastructure/redis.service';
import { LocationUpdateDto } from './tracking.dto';

@Injectable()
export class TrackingService {
    constructor(
        private prisma: PrismaService,
        private redis: RedisService,
    ) { }

    async updateLocation(data: LocationUpdateDto) {
        const location = await this.prisma.location.create({
            data: {
                vehicleId: data.vehicleId,
                latitude: data.latitude,
                longitude: data.longitude,
                speed: data.speed,
                sessionId: data.sessionId,
                timestamp: new Date(),
            },
            include: {
                vehicle: {
                    include: {
                        customer: true,
                    },
                },
            },
        });

        await this.redis.set(
            `vehicle:${data.vehicleId}:location`,
            {
                latitude: data.latitude,
                longitude: data.longitude,
                speed: data.speed,
                timestamp: new Date(),
            },
            300
        );

        return location;
    }

    async getVehicleLocations(vehicleId: string, limit = 50) {
        return this.prisma.location.findMany({
            where: { vehicleId },
            orderBy: { timestamp: 'desc' },
            take: limit,
            include: {
                vehicle: true,
            },
        });
    }

    async startTrackingSession(vehicleId: string) {
        const activeSession = await this.prisma.trackingSession.findFirst({
            where: {
                vehicleId,
                isActive: true,
            },
        });

        if (activeSession) {
            return activeSession;
        }

        const session = await this.prisma.trackingSession.create({
            data: {
                vehicleId,
                startTime: new Date(),
                isActive: true,
            },
        });

        await this.redis.set(`vehicle:${vehicleId}:session`, session, 3600);

        return session;
    }

    async stopTrackingSession(vehicleId: string) {
        const session = await this.prisma.trackingSession.findFirst({
            where: {
                vehicleId,
                isActive: true,
            },
        });

        if (!session) {
            throw new Error('No active session found');
        }

        const updatedSession = await this.prisma.trackingSession.update({
            where: { id: session.id },
            data: {
                endTime: new Date(),
                isActive: false,
            },
        });

        await this.redis.del(`vehicle:${vehicleId}:session`);

        return updatedSession;
    }

    async getActiveVehicles() {
        const activeSessions = await this.prisma.trackingSession.findMany({
            where: { isActive: true },
            include: {
                vehicle: {
                    include: {
                        customer: true,
                    },
                },
            },
        });

        return activeSessions.map(session => session.vehicle);
    }
}