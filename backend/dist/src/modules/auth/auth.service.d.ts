import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto, VerifyCodeDto, ResetPasswordDto } from './dto/forgot-password.dto';
export declare class AuthService {
    private prisma;
    private jwtService;
    private configService;
    constructor(prisma: PrismaService, jwtService: JwtService, configService: ConfigService);
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            emailVerified: boolean;
        };
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        refreshToken: string;
        user: {
            id: string;
            email: string;
            emailVerified: boolean;
            profile: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                name: string;
                userId: string;
                gender: import(".prisma/client").$Enums.Gender;
                birthDate: Date;
                height: number;
                currentWeight: number;
                targetWeight: number | null;
                activityLevel: import(".prisma/client").$Enums.ActivityLevel;
                goal: import(".prisma/client").$Enums.Goal;
                bmr: number;
                tdee: number;
                calorieGoal: number;
                proteinGoal: number;
                carbsGoal: number;
                fatsGoal: number;
                waterGoal: number;
            } | null;
        };
    }>;
    logout(userId: string, refreshToken: string): Promise<{
        message: string;
    }>;
    refreshTokens(refreshToken: string): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
    private generateTokens;
    getCurrentUser(userId: string): Promise<{
        id: string;
        email: string;
        emailVerified: boolean;
        profile: {
            id: string;
            createdAt: Date;
            updatedAt: Date;
            name: string;
            userId: string;
            gender: import(".prisma/client").$Enums.Gender;
            birthDate: Date;
            height: number;
            currentWeight: number;
            targetWeight: number | null;
            activityLevel: import(".prisma/client").$Enums.ActivityLevel;
            goal: import(".prisma/client").$Enums.Goal;
            bmr: number;
            tdee: number;
            calorieGoal: number;
            proteinGoal: number;
            carbsGoal: number;
            fatsGoal: number;
            waterGoal: number;
        } | null;
        subscription: {
            plan: import(".prisma/client").$Enums.SubscriptionPlan;
            status: import(".prisma/client").$Enums.SubscriptionStatus;
            currentPeriodEnd: Date | null;
        } | null;
    }>;
    validateUser(userId: string): Promise<{
        email: string;
        id: string;
        passwordHash: string | null;
        emailVerified: boolean;
        twoFactorEnabled: boolean;
        twoFactorSecret: string | null;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    verifyResetCode(dto: VerifyCodeDto): Promise<{
        message: string;
        valid: boolean;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    changePassword(userId: string, dto: {
        currentPassword: string;
        newPassword: string;
    }): Promise<{
        message: string;
    }>;
}
