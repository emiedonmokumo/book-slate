import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { LoginDto, CalendarConnectionResponseDto } from '../users/user.dto';
import { google } from 'googleapis';

export interface JwtPayload {
  sub: string;
  email: string;
  isAdmin: boolean;
}

@Injectable()
export class AuthService {
  private oauth2Client;

  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/auth/google/callback'
    );
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string; user: any }> {
    const { email, password } = loginDto;
    
    const user = await this.usersService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      isAdmin: user.isAdmin,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        isAdmin: user.isAdmin,
      },
    };
  }

  async validateUser(payload: JwtPayload): Promise<any> {
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }

  async getGoogleAuthUrl(): Promise<{ authUrl: string }> {
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/calendar.events',
    ];

    const authUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent',
    });

    return { authUrl };
  }

  async handleGoogleCallback(code: string): Promise<CalendarConnectionResponseDto> {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      
      const adminEmail = process.env.ADMIN_EMAIL;
      if (!adminEmail) {
        throw new UnauthorizedException('ADMIN_EMAIL environment variable is not configured');
      }
      
      await this.usersService.updateCalendarTokens(
        adminEmail,
        tokens.access_token,
        tokens.refresh_token
      );

      return {
        message: 'Calendar connected successfully',
        connected: true,
        adminEmail,
      };
    } catch (error) {
      throw new UnauthorizedException('Failed to connect calendar: ' + error.message);
    }
  }

  async getCalendarConnectionStatus(): Promise<CalendarConnectionResponseDto> {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      throw new UnauthorizedException('ADMIN_EMAIL environment variable is not configured');
    }
    
    const admin = await this.usersService.findByEmail(adminEmail);
    
    if (!admin) {
      return {
        message: 'Admin user not found',
        connected: false,
        adminEmail,
      };
    }

    const connected = !!(admin.googleAccessToken && admin.googleRefreshToken);
    
    return {
      message: connected ? 'Calendar is connected' : 'Calendar is not connected',
      connected,
      adminEmail,
    };
  }

  async disconnectCalendar(): Promise<CalendarConnectionResponseDto> {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      throw new UnauthorizedException('ADMIN_EMAIL environment variable is not configured');
    }
    
    await this.usersService.removeCalendarTokens(adminEmail);
    
    return {
      message: 'Calendar disconnected successfully',
      connected: false,
      adminEmail,
    };
  }
}