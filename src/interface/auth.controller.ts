import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from '../application/auth/auth.service';
import { LoginDto, CreateUserDto } from '../application/auth/auth.dto';
import { JwtAuthGuard } from '../application/auth/jwt-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        try {
            return await this.authService.login(loginDto.email, loginDto.password);
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    @Post('register')
    async register(@Body() createUserDto: CreateUserDto) {
        try {
            const user = await this.authService.register(
                createUserDto.email,
                createUserDto.password,
                createUserDto.name,
            );
            return { success: true, user };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }

    @UseGuards(JwtAuthGuard)
    @Get('me')
    async getMe(@Request() req) {
        // req.user berisi payload JWT (userId, email)
        return { 
            success: true, 
            user: req.user,
            message: 'Protected route accessed successfully' 
        };
    }

    @Post('verify')
    async verifyToken(@Body() body: { token: string }) {
        try {
            const payload = await this.authService.verifyToken(body.token);
            return { success: true, payload };
        } catch (error) {
            return { success: false, message: error.message };
        }
    }
}