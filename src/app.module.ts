import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './infrastructure/prisma.module';
import { RedisModule } from './infrastructure/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule, 
    RedisModule
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }