// Vehicle entity
export class Vehicle {
    id: string;
    licensePlate: string;
    model: string;
    brand: string;
    year: number;
    customerId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;

    constructor(data: any) {
        this.id = data.id;
        this.licensePlate = data.licensePlate;
        this.model = data.model;
        this.brand = data.brand;
        this.year = data.year;
        this.customerId = data.customerId;
        this.isActive = data.isActive;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }
}