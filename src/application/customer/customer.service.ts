import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma.service';
import { CreateCustomerDto, UpdateCustomerDto } from './customer.dto';

@Injectable()
export class CustomerService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        return this.prisma.customer.findMany({
            include: {
                vehicles: true,
            },
        });
    }

    async findOne(id: string) {
        const customer = await this.prisma.customer.findUnique({
            where: { id },
            include: {
                vehicles: true,
            },
        });

        if (!customer) {
            throw new Error('Customer not found');
        }

        return customer;
    }

    async create(data: CreateCustomerDto) {
        return this.prisma.customer.create({
            data,
        });
    }

    async update(id: string, data: UpdateCustomerDto) {
        const customer = await this.findOne(id);

        return this.prisma.customer.update({
            where: { id },
            data,
        });
    }

    async remove(id: string) {
        const customer = await this.findOne(id);

        return this.prisma.customer.delete({
            where: { id },
        });
    }
}