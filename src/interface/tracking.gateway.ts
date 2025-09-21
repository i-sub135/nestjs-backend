import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    WebSocketServer,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { TrackingService } from '../application/tracking/tracking.service';
import { LocationUpdateDto } from '../application/tracking/tracking.dto';

@WebSocketGateway({
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:3001',
        credentials: true,
    },
})
export class TrackingGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private connectedClients = new Map<string, Socket>();

    constructor(private trackingService: TrackingService) { }

    handleConnection(client: Socket) {
        console.log(`Client connected: ${client.id}`);
        this.connectedClients.set(client.id, client);
    }

    handleDisconnect(client: Socket) {
        console.log(`Client disconnected: ${client.id}`);
        this.connectedClients.delete(client.id);
    }

    @SubscribeMessage('location_update')
    async handleLocationUpdate(
        @MessageBody() data: LocationUpdateDto,
        @ConnectedSocket() client: Socket,
    ) {
        try {
            const location = await this.trackingService.updateLocation(data);

            this.server.emit('location_updated', {
                vehicleId: data.vehicleId,
                latitude: data.latitude,
                longitude: data.longitude,
                speed: data.speed,
                timestamp: new Date(),
                vehicle: location.vehicle,
            });

            client.emit('location_saved', {
                success: true,
                locationId: location.id,
                timestamp: location.timestamp,
            });

        } catch (error) {
            client.emit('location_error', {
                success: false,
                message: error.message,
            });
        }
    }

    @SubscribeMessage('start_tracking')
    async handleStartTracking(
        @MessageBody() data: { vehicleId: string },
        @ConnectedSocket() client: Socket,
    ) {
        try {
            const session = await this.trackingService.startTrackingSession(data.vehicleId);

            client.emit('tracking_started', {
                success: true,
                sessionId: session.id,
                vehicleId: data.vehicleId,
            });

            this.server.emit('vehicle_tracking_started', {
                vehicleId: data.vehicleId,
                sessionId: session.id,
            });

        } catch (error) {
            client.emit('tracking_error', {
                success: false,
                message: error.message,
            });
        }
    }

    @SubscribeMessage('stop_tracking')
    async handleStopTracking(
        @MessageBody() data: { vehicleId: string },
        @ConnectedSocket() client: Socket,
    ) {
        try {
            const session = await this.trackingService.stopTrackingSession(data.vehicleId);

            client.emit('tracking_stopped', {
                success: true,
                sessionId: session.id,
                vehicleId: data.vehicleId,
            });

            this.server.emit('vehicle_tracking_stopped', {
                vehicleId: data.vehicleId,
                sessionId: session.id,
            });

        } catch (error) {
            client.emit('tracking_error', {
                success: false,
                message: error.message,
            });
        }
    }

    @SubscribeMessage('get_active_vehicles')
    async handleGetActiveVehicles(@ConnectedSocket() client: Socket) {
        try {
            const vehicles = await this.trackingService.getActiveVehicles();

            client.emit('active_vehicles', {
                success: true,
                vehicles,
            });

        } catch (error) {
            client.emit('tracking_error', {
                success: false,
                message: error.message,
            });
        }
    }

    @SubscribeMessage('subscribe_vehicle')
    async handleSubscribeVehicle(
        @MessageBody() data: { vehicleId: string },
        @ConnectedSocket() client: Socket,
    ) {
        client.join(`vehicle:${data.vehicleId}`);

        client.emit('subscribed', {
            success: true,
            vehicleId: data.vehicleId,
            message: `Subscribed to vehicle ${data.vehicleId} updates`,
        });
    }

    broadcastToVehicleSubscribers(vehicleId: string, data: any) {
        this.server.to(`vehicle:${vehicleId}`).emit('vehicle_location_update', data);
    }
}