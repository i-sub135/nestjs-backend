// Location tracking entity
export class Location {
    id: string;
    vehicleId: string;
    latitude: number;
    longitude: number;
    speed: number;
    timestamp: Date;
    sessionId?: string;

    constructor(data: any) {
        this.id = data.id;
        this.vehicleId = data.vehicleId;
        this.latitude = data.latitude;
        this.longitude = data.longitude;
        this.speed = data.speed;
        this.timestamp = data.timestamp;
        this.sessionId = data.sessionId;
    }
}