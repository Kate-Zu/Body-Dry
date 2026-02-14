import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { ForgotPasswordDto, VerifyCodeDto, ResetPasswordDto } from './dto/forgot-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
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
    logout(userId: string, dto: RefreshTokenDto): Promise<{
        message: string;
    }>;
    refreshTokens(dto: RefreshTokenDto): Promise<{
        accessToken: string;
        refreshToken: string;
    }>;
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
    forgotPassword(dto: ForgotPasswordDto): Promise<{
        message: string;
    }>;
    verifyCode(dto: VerifyCodeDto): Promise<{
        message: string;
        valid: boolean;
    }>;
    resetPassword(dto: ResetPasswordDto): Promise<{
        message: string;
    }>;
    changePassword(userId: string, dto: ChangePasswordDto): Promise<{
        message: string;
    }>;
}
