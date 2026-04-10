import { Controller, Post, Body, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from '../users/user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('verify')
  @UseGuards(JwtAuthGuard)
  async verifyToken(@Request() req) {
    return {
      user: {
        id: req.user.id,
        email: req.user.email,
        isAdmin: req.user.isAdmin,
      },
    };
  }

  @Get('google/url')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getGoogleAuthUrl() {
    return this.authService.getGoogleAuthUrl();
  }

  @Get('google/callback')
  async handleGoogleCallbackGet(@Query('code') code: string, @Query('error') error?: string) {
    if (error) {
      throw new Error(`OAuth error: ${error}`);
    }
    
    if (!code) {
      throw new Error('Authorization code not provided');
    }
    
    return this.authService.handleGoogleCallback(code);
  }

  @Post('google/callback')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async handleGoogleCallback(@Body() body: { code: string }) {
    return this.authService.handleGoogleCallback(body.code);
  }

  @Get('calendar/status')
  async getCalendarConnectionStatus() {
    return this.authService.getCalendarConnectionStatus();
  }

  @Post('calendar/disconnect')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async disconnectCalendar() {
    return this.authService.disconnectCalendar();
  }
}