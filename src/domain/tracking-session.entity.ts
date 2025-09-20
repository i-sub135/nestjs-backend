export class TrackingSession {
    id: string;
    vehicleId: string;
    startTime: Date;
    endTime?: Date;
    isActive: boolean;
    totalDistance?: number;

    constructor(data: any) {
        this.id = data.id;
        this.vehicleId = data.vehicleId;
        this.startTime = data.startTime;
        this.endTime = data.endTime;
        this.isActive = data.isActive;
        this.totalDistance = data.totalDistance;
    }
}