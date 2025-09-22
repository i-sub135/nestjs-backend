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
import { getLogger } from '../common/logger';

@WebSocketGateway({
    cors: {
        origin: [process.env.FRONTEND_URL || 'http://localhost:3001', 'null'],
        credentials: true,
    },
})
export class TrackingGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private connectedClients = new Map<string, Socket>();

    private readonly logger = getLogger('webSocket');

    constructor(private trackingService: TrackingService) { }

    handleConnection(client: Socket) {
        this.logger.info('ws_connected', { clientId: client.id });
        this.connectedClients.set(client.id, client);
    }

    handleDisconnect(client: Socket) {
        this.logger.info('ws_disconnected', { clientId: client.id });
        this.connectedClients.delete(client.id);
    }

    @SubscribeMessage('location_update')
    async handleLocationUpdate(
        @MessageBody() data: LocationUpdateDto,
        @ConnectedSocket() client: Socket,
    ) {
        try {
            this.logger.info('ws_event_received', {
                event: 'location_update',
                clientId: client.id,
                vehicleId: data.vehicleId,
            });
            const location = await this.trackingService.updateLocation(data);

            const broadcastPayload = {
                vehicleId: data.vehicleId,
                latitude: data.latitude,
                longitude: data.longitude,
                speed: data.speed,
                timestamp: new Date(),
                vehicle: location.vehicle,
            };
            this.server.emit('location_updated', broadcastPayload);
            this.logger.info('ws_emit', {
                event: 'location_updated',
                to: 'all',
                vehicleId: data.vehicleId,
            });

            const ackPayload = {
                success: true,
                locationId: location.id,
                timestamp: location.timestamp,
            };
            client.emit('location_saved', ackPayload);
            this.logger.info('ws_emit', {
                event: 'location_saved',
                to: 'client',
                clientId: client.id,
                vehicleId: data.vehicleId,
            });

        } catch (error) {
            this.logger.error('ws_event_error', {
                event: 'location_update',
                clientId: client.id,
                message: (error as Error)?.message,
            });
            client.emit('location_error', {
                success: false,
                message: error.message,
            });
            this.logger.info('ws_emit', {
                event: 'location_error',
                to: 'client',
                clientId: client.id,
            });
        }
    }

    @SubscribeMessage('start_tracking')
    async handleStartTracking(
        @MessageBody() data: { vehicleId: string },
        @ConnectedSocket() client: Socket,
    ) {
        try {
            this.logger.info('ws_event_received', {
                event: 'start_tracking',
                clientId: client.id,
                vehicleId: data.vehicleId,
            });
            const session = await this.trackingService.startTrackingSession(data.vehicleId);

            const startedPayload = {
                success: true,
                sessionId: session.id,
                vehicleId: data.vehicleId,
            };
            client.emit('tracking_started', startedPayload);
            this.logger.info('ws_emit', {
                event: 'tracking_started',
                to: 'client',
                clientId: client.id,
                vehicleId: data.vehicleId,
            });

            const startedBroadcast = {
                vehicleId: data.vehicleId,
                sessionId: session.id,
            };
            this.server.emit('vehicle_tracking_started', startedBroadcast);
            this.logger.info('ws_emit', {
                event: 'vehicle_tracking_started',
                to: 'all',
                vehicleId: data.vehicleId,
            });

        } catch (error) {
            this.logger.error('ws_event_error', {
                event: 'start_tracking',
                clientId: client.id,
                message: (error as Error)?.message,
            });
            client.emit('tracking_error', {
                success: false,
                message: error.message,
            });
            this.logger.info('ws_emit', {
                event: 'tracking_error',
                to: 'client',
                clientId: client.id,
            });
        }
    }

    @SubscribeMessage('stop_tracking')
    async handleStopTracking(
        @MessageBody() data: { vehicleId: string },
        @ConnectedSocket() client: Socket,
    ) {
        try {
            this.logger.info('ws_event_received', {
                event: 'stop_tracking',
                clientId: client.id,
                vehicleId: data.vehicleId,
            });
            const session = await this.trackingService.stopTrackingSession(data.vehicleId);

            const stoppedPayload = {
                success: true,
                sessionId: session.id,
                vehicleId: data.vehicleId,
            };
            client.emit('tracking_stopped', stoppedPayload);
            this.logger.info('ws_emit', {
                event: 'tracking_stopped',
                to: 'client',
                clientId: client.id,
                vehicleId: data.vehicleId,
            });

            const stoppedBroadcast = {
                vehicleId: data.vehicleId,
                sessionId: session.id,
            };
            this.server.emit('vehicle_tracking_stopped', stoppedBroadcast);
            this.logger.info('ws_emit', {
                event: 'vehicle_tracking_stopped',
                to: 'all',
                vehicleId: data.vehicleId,
            });

        } catch (error) {
            this.logger.error('ws_event_error', {
                event: 'stop_tracking',
                clientId: client.id,
                message: (error as Error)?.message,
            });
            client.emit('tracking_error', {
                success: false,
                message: error.message,
            });
            this.logger.info('ws_emit', {
                event: 'tracking_error',
                to: 'client',
                clientId: client.id,
            });
        }
    }

    @SubscribeMessage('get_active_vehicles')
    async handleGetActiveVehicles(@ConnectedSocket() client: Socket) {
        try {
            this.logger.info('ws_event_received', {
                event: 'get_active_vehicles',
                clientId: client.id,
            });
            const vehicles = await this.trackingService.getActiveVehicles();

            const activePayload = {
                success: true,
                vehicles,
            };
            client.emit('active_vehicles', activePayload);
            this.logger.info('ws_emit', {
                event: 'active_vehicles',
                to: 'client',
                clientId: client.id,
                count: vehicles?.length ?? 0,
            });

        } catch (error) {
            this.logger.error('ws_event_error', {
                event: 'get_active_vehicles',
                clientId: client.id,
                message: (error as Error)?.message,
            });
            client.emit('tracking_error', {
                success: false,
                message: error.message,
            });
            this.logger.info('ws_emit', {
                event: 'tracking_error',
                to: 'client',
                clientId: client.id,
            });
        }
    }

    @SubscribeMessage('subscribe_vehicle')
    async handleSubscribeVehicle(
        @MessageBody() data: { vehicleId: string },
        @ConnectedSocket() client: Socket,
    ) {
    client.join(`vehicle:${data.vehicleId}`);
    this.logger.info('ws_subscribed_vehicle', { clientId: client.id, vehicleId: data.vehicleId });

        const subscribedPayload = {
            success: true,
            vehicleId: data.vehicleId,
            message: `Subscribed to vehicle ${data.vehicleId} updates`,
        };
        client.emit('subscribed', subscribedPayload);
        this.logger.info('ws_emit', {
            event: 'subscribed',
            to: 'client',
            clientId: client.id,
            vehicleId: data.vehicleId,
        });
    }

    broadcastToVehicleSubscribers(vehicleId: string, data: any) {
        this.server.to(`vehicle:${vehicleId}`).emit('vehicle_location_update', data);
        this.logger.info('ws_broadcast_vehicle', { vehicleId });
    }
}