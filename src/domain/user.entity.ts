export class User {
    id: string;
    email: string;
    password: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;

    constructor(data: any) {
        this.id = data.id;
        this.email = data.email;
        this.password = data.password;
        this.name = data.name;
        this.createdAt = data.createdAt;
        this.updatedAt = data.updatedAt;
    }
}