import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './infrastructure/prisma.module';
import { RedisModule } from './infrastructure/redis.module';
import { AuthController } from './interface/auth.controller';
import { CustomerController } from './interface/customer.controller';
import { VehicleController } from './interface/vehicle.controller';
import { AuthService } from './application/auth/auth.service';
import { CustomerService } from './application/customer/customer.service';
import { VehicleService } from './application/vehicle/vehicle.service';
import { JwtAuthGuard } from './application/auth/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule, 
    RedisModule
  ],
  controllers: [AuthController, CustomerController, VehicleController],
  providers: [AuthService, CustomerService, VehicleService, JwtAuthGuard],
})
export class AppModule { }