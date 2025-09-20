import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/prisma.service';
import { RedisService } from '../../infrastructure/redis.service';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private redis: RedisService,
    ) { }

    async login(email: string, password: string) {
        const user = await this.prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            throw new Error('User not found');
        }

        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid) {
            throw new Error('Invalid password');
        }

        const token = jwt.sign(
            { userId: user.id, email: user.email },
            process.env.JWT_SECRET || 'secret',
            { expiresIn: '7d' }
        );

        await this.redis.set(`user:${user.id}`, { id: user.id, email: user.email }, 86400);

        return { token, user: { id: user.id, email: user.email, name: user.name } };
    }

    async register(email: string, password: string, name: string) {
        const existing = await this.prisma.user.findUnique({
            where: { email },
        });

        if (existing) {
            throw new Error('User already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await this.prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
            },
        });

        return { id: user.id, email: user.email, name: user.name };
    }

    async verifyToken(token: string) {
        try {
            const payload = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
            return payload;
        } catch (error) {
            throw new Error('Invalid token');
        }
    }
}