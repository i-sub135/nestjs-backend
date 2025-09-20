// Customer entity
export class Customer {
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
    createdAt: Date;
    updatedAt: Date;

    constructor(data: any) {
        this.id = data.id;
        this.name = data.name;
        this.email = data.email;
        this.phone = data.phone;
        this.address = data.address;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }
}