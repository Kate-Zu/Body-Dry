"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const bcrypt = __importStar(require("bcryptjs"));
const prisma_service_1 = require("../../prisma/prisma.service");
const resetCodes = new Map();
let AuthService = class AuthService {
    constructor(prisma, jwtService, configService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.configService = configService;
    }
    async register(dto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Користувач з такою поштою вже існує');
        }
        const passwordHash = await bcrypt.hash(dto.password, 10);
        const user = await this.prisma.user.create({
            data: {
                email: dto.email.toLowerCase(),
                passwordHash,
            },
        });
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
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
            include: { profile: true },
        });
        if (!user || !user.passwordHash) {
            throw new common_1.UnauthorizedException('Невірна пошта або пароль');
        }
        const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!passwordValid) {
            throw new common_1.UnauthorizedException('Невірна пошта або пароль');
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
    async logout(userId, refreshToken) {
        await this.prisma.refreshToken.deleteMany({
            where: {
                userId,
                token: refreshToken,
            },
        });
        return { message: 'Вихід успішний' };
    }
    async refreshTokens(refreshToken) {
        const tokenRecord = await this.prisma.refreshToken.findUnique({
            where: { token: refreshToken },
            include: { user: true },
        });
        if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Невалідний refresh token');
        }
        await this.prisma.refreshToken.delete({
            where: { id: tokenRecord.id },
        });
        return this.generateTokens(tokenRecord.user.id, tokenRecord.user.email);
    }
    async generateTokens(userId, email) {
        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync({ sub: userId, email }, { expiresIn: '15m' }),
            this.jwtService.signAsync({ sub: userId, email, type: 'refresh' }, { expiresIn: '7d' }),
        ]);
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
    async getCurrentUser(userId) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                profile: true,
                subscription: true,
            },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Користувача не знайдено');
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
    async validateUser(userId) {
        return this.prisma.user.findUnique({
            where: { id: userId },
        });
    }
    async forgotPassword(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
        });
        if (!user) {
            return { message: 'Якщо email існує, код надіслано' };
        }
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        resetCodes.set(dto.email.toLowerCase(), { code, expiresAt });
        console.log(`[DEV] Reset code for ${dto.email}: ${code}`);
        return { message: 'Код надіслано на email' };
    }
    async verifyResetCode(dto) {
        const stored = resetCodes.get(dto.email.toLowerCase());
        if (!stored) {
            throw new common_1.BadRequestException('Код не знайдено. Запросіть новий');
        }
        if (stored.expiresAt < new Date()) {
            resetCodes.delete(dto.email.toLowerCase());
            throw new common_1.BadRequestException('Код закінчив дію. Запросіть новий');
        }
        if (stored.code !== dto.code) {
            throw new common_1.BadRequestException('Невірний код');
        }
        return { message: 'Код підтверджено', valid: true };
    }
    async resetPassword(dto) {
        const stored = resetCodes.get(dto.email.toLowerCase());
        if (!stored || stored.code !== dto.code || stored.expiresAt < new Date()) {
            throw new common_1.BadRequestException('Невірний або застарілий код');
        }
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email.toLowerCase() },
        });
        if (!user) {
            throw new common_1.NotFoundException('Користувача не знайдено');
        }
        const passwordHash = await bcrypt.hash(dto.password, 10);
        await this.prisma.user.update({
            where: { id: user.id },
            data: { passwordHash },
        });
        resetCodes.delete(dto.email.toLowerCase());
        await this.prisma.refreshToken.deleteMany({
            where: { userId: user.id },
        });
        return { message: 'Пароль успішно змінено' };
    }
    async changePassword(userId, dto) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
        });
        if (!user || !user.passwordHash) {
            throw new common_1.NotFoundException('Користувача не знайдено');
        }
        const isCurrentValid = await bcrypt.compare(dto.currentPassword, user.passwordHash);
        if (!isCurrentValid) {
            throw new common_1.BadRequestException('Невірний поточний пароль');
        }
        const passwordHash = await bcrypt.hash(dto.newPassword, 10);
        await this.prisma.user.update({
            where: { id: userId },
            data: { passwordHash },
        });
        return { message: 'Пароль успішно змінено' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map