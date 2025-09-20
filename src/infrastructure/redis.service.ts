import { Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
    private client: Redis;

    constructor() {
        this.client = new Redis({
            host: process.env.REDIS_HOST || 'localhost',
            port: parseInt(process.env.REDIS_PORT || '6379'),
            maxRetriesPerRequest: 3,
        });
    }

    async set(key: string, value: any, ttl?: number): Promise<void> {
        const serialized = JSON.stringify(value);
        if (ttl) {
            await this.client.setex(key, ttl, serialized);
        } else {
            await this.client.set(key, serialized);
        }
    }

    async get(key: string): Promise<any> {
        const value = await this.client.get(key);
        return value ? JSON.parse(value) : null;
    }

    async del(key: string): Promise<void> {
        await this.client.del(key);
    }

    async exists(key: string): Promise<boolean> {
        return (await this.client.exists(key)) === 1;
    }

    getClient(): Redis {
        return this.client;
    }
}