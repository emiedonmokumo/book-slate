import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './user.entity';
import { CreateUserDto, LoginDto, UserResponseDto } from './user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<UserResponseDto> {
    const { email, password, firstName, lastName, isAdmin = false } = createUserDto;

    // Check if user already exists
    const existingUser = await this.usersRepository.findOne({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user
    const user = this.usersRepository.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      isAdmin,
    });

    const savedUser = await this.usersRepository.save(user);

    return this.toResponseDto(savedUser);
  }

  async validateUser(email: string, password: string): Promise<UserResponseDto | null> {
    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (user && await bcrypt.compare(password, user.password)) {
      return this.toResponseDto(user);
    }

    return null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  async findById(id: string): Promise<UserResponseDto | null> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });

    return user ? this.toResponseDto(user) : null;
  }

  async findAll(): Promise<UserResponseDto[]> {
    const users = await this.usersRepository.find();
    return users.map(user => this.toResponseDto(user));
  }

  async updateCalendarTokens(email: string, accessToken: string, refreshToken: string): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.googleAccessToken = accessToken;
    user.googleRefreshToken = refreshToken;
    
    await this.usersRepository.save(user);
  }

  async removeCalendarTokens(email: string): Promise<void> {
    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.googleAccessToken = null;
    user.googleRefreshToken = null;
    
    await this.usersRepository.save(user);
  }

  async getAdminCalendarTokens(): Promise<{ accessToken: string; refreshToken: string } | null> {
    const adminEmail = process.env.ADMIN_EMAIL;
    if (!adminEmail) {
      throw new Error('ADMIN_EMAIL environment variable is not configured');
    }
    
    const admin = await this.usersRepository.findOne({
      where: { email: adminEmail },
    });

    if (!admin || !admin.googleAccessToken || !admin.googleRefreshToken) {
      return null;
    }

    return {
      accessToken: admin.googleAccessToken,
      refreshToken: admin.googleRefreshToken,
    };
  }

  private toResponseDto(user: User): UserResponseDto {
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      isAdmin: user.isAdmin,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  }
}