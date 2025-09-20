import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { CustomerService } from '../application/customer/customer.service';
import { CreateCustomerDto, UpdateCustomerDto } from '../application/customer/customer.dto';
import { JwtAuthGuard } from '../application/auth/jwt-auth.guard';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomerController {
    constructor(private customerService: CustomerService) { }

    @Post()
    create(@Body() createCustomerDto: CreateCustomerDto) {
        return this.customerService.create(createCustomerDto);
    }

    @Get()
    findAll() {
        return this.customerService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.customerService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
        return this.customerService.update(id, updateCustomerDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.customerService.remove(id);
    }
}