import { Injectable, UnauthorizedException, ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto, VerifyCodeDto, ResetPasswordDto } from './dto/forgot-password.dto';

// Тимчасове сховище кодів (в продакшені - Redis)
const resetCodes = new Map<string, { code: string; expiresAt: Date }>();

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // Register new user
  async register(dto: RegisterDto) {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException('Користувач з такою поштою вже існує');
    }

    // Hash password (10 rounds is optimal balance of security/speed)
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Create user
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash,
      },
    });

    // Generate tokens
    const tokens = await this.generateTokens(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
      },
      ...tokens,
    };
  }

  // Login user
  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
      include: { profile: true },
    });

    if (!user || !user.passwordHash) {
      throw new UnauthorizedException('Невірна пошта або пароль');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!passwordValid) {
      throw new UnauthorizedException('Невірна пошта або пароль');
    }

    const tokens = await this.generateTokens(user.id, user.email);

    return {
      user: {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        profile: user.profile || null,
      },
      ...tokens,
    };
  }

  // Logout - invalidate refresh token
  async logout(userId: string, refreshToken: string) {
    await this.prisma.refreshToken.deleteMany({
      where: {
        userId,
        token: refreshToken,
      },
    });

    return { message: 'Вихід успішний' };
  }

  // Refresh tokens
  async refreshTokens(refreshToken: string) {
    const tokenRecord = await this.prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: { user: true },
    });

    if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Невалідний refresh token');
    }

    // Delete old token
    await this.prisma.refreshToken.delete({
      where: { id: tokenRecord.id },
    });

    // Generate new tokens
    return this.generateTokens(tokenRecord.user.id, tokenRecord.user.email);
  }

  // Generate access and refresh tokens
  private async generateTokens(userId: string, email: string) {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        { expiresIn: '15m' },
      ),
      this.jwtService.signAsync(
        { sub: userId, email, type: 'refresh' },
        { expiresIn: '7d' },
      ),
    ]);

    // Save refresh token to database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  // Get current user
  async getCurrentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        subscription: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Користувача не знайдено');
    }

    return {
      id: user.id,
      email: user.email,
      emailVerified: user.emailVerified,
      profile: user.profile,
      subscription: user.subscription ? {
        plan: user.subscription.plan,
        status: user.subscription.status,
        currentPeriodEnd: user.subscription.currentPeriodEnd,
      } : null,
    };
  }

  // Validate user by ID (for JWT strategy)
  async validateUser(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
    });
  }

  // Request password reset - sends code to email
  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    // Завжди повертаємо успіх (щоб не розкривати існування email)
    if (!user) {
      return { message: 'Якщо email існує, код надіслано' };
    }

    // Генеруємо 6-значний код
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 хвилин

    // Зберігаємо код (в продакшені - Redis або БД)
    resetCodes.set(dto.email.toLowerCase(), { code, expiresAt });

    // TODO: Відправити email з кодом
    console.log(`[DEV] Reset code for ${dto.email}: ${code}`);

    return { message: 'Код надіслано на email' };
  }

  // Verify reset code
  async verifyResetCode(dto: VerifyCodeDto) {
    const stored = resetCodes.get(dto.email.toLowerCase());

    if (!stored) {
      throw new BadRequestException('Код не знайдено. Запросіть новий');
    }

    if (stored.expiresAt < new Date()) {
      resetCodes.delete(dto.email.toLowerCase());
      throw new BadRequestException('Код закінчив дію. Запросіть новий');
    }

    if (stored.code !== dto.code) {
      throw new BadRequestException('Невірний код');
    }

    return { message: 'Код підтверджено', valid: true };
  }

  // Reset password with code
  async resetPassword(dto: ResetPasswordDto) {
    const stored = resetCodes.get(dto.email.toLowerCase());

    if (!stored || stored.code !== dto.code || stored.expiresAt < new Date()) {
      throw new BadRequestException('Невірний або застарілий код');
    }

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new NotFoundException('Користувача не знайдено');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Update password
    await this.prisma.user.update({
      where: { id: user.id },
      data: { passwordHash },
    });

    // Delete used code
    resetCodes.delete(dto.email.toLowerCase());

    // Invalidate all refresh tokens
    await this.prisma.refreshToken.deleteMany({
      where: { userId: user.id },
    });

    return { message: 'Пароль успішно змінено' };
  }

  // Change password (authenticated user)
  async changePassword(userId: string, dto: { currentPassword: string; newPassword: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.passwordHash) {
      throw new NotFoundException('Користувача не знайдено');
    }

    // Verify current password
    const isCurrentValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!isCurrentValid) {
      throw new BadRequestException('Невірний поточний пароль');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(dto.newPassword, 10);

    // Update password
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    return { message: 'Пароль успішно змінено' };
  }
}
