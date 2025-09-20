import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma.service';
import { CreateVehicleDto, UpdateVehicleDto } from './vehicle.dto';

@Injectable()
export class VehicleService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.vehicle.findMany({
            include: {
                customer: true,
                locations: {
                    orderBy: { timestamp: 'desc' },
                    take: 1,
                },
            },
        });
    }

    async findOne(id: string) {
        const vehicle = await this.prisma.vehicle.findUnique({
            where: { id },
            include: {
                customer: true,
                locations: {
                    orderBy: { timestamp: 'desc' },
                    take: 10,
                },
            },
        });

        if (!vehicle) {
            throw new Error('Vehicle not found');
        }

        return vehicle;
    }

    async create(data: CreateVehicleDto) {
        // Check if customer exists
        const customer = await this.prisma.customer.findUnique({
            where: { id: data.customerId },
        });

        if (!customer) {
            throw new Error('Customer not found');
        }

        return this.prisma.vehicle.create({
            data,
            include: {
                customer: true,
            },
        });
    }

    async update(id: string, data: UpdateVehicleDto) {
        const vehicle = await this.findOne(id);

        return this.prisma.vehicle.update({
            where: { id },
            data,
            include: {
                customer: true,
            },
        });
    }

    async remove(id: string) {
        const vehicle = await this.findOne(id);

        return this.prisma.vehicle.delete({
            where: { id },
        });
    }
}