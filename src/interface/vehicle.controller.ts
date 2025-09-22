import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { VehicleService } from '../application/vehicle/vehicle.service';
import { CreateVehicleDto, UpdateVehicleDto } from '../application/vehicle/vehicle.dto';
import { JwtAuthGuard } from '../common/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('vehicles')
export class VehicleController {
    constructor(private vehicleService: VehicleService) { }

    @Post()
    create(@Body() createVehicleDto: CreateVehicleDto) {
        return this.vehicleService.create(createVehicleDto);
    }

    @Get()
    findAll() {
        return this.vehicleService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.vehicleService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateVehicleDto: UpdateVehicleDto) {
        return this.vehicleService.update(id, updateVehicleDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.vehicleService.remove(id);
    }
}