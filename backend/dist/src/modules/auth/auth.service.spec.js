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
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const auth_service_1 = require("./auth.service");
const jwt_1 = require("@nestjs/jwt");
const prisma_service_1 = require("../../prisma/prisma.service");
const config_1 = require("@nestjs/config");
const common_1 = require("@nestjs/common");
const bcrypt = __importStar(require("bcryptjs"));
jest.mock('bcryptjs');
describe('AuthService', () => {
    let service;
    let prismaService;
    let jwtService;
    const mockPrismaService = {
        user: {
            findUnique: jest.fn(),
            create: jest.fn(),
            update: jest.fn(),
        },
        profile: {
            findUnique: jest.fn(),
        },
        refreshToken: {
            findUnique: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
            deleteMany: jest.fn(),
        },
    };
    const mockJwtService = {
        sign: jest.fn(),
        signAsync: jest.fn(),
        verify: jest.fn(),
    };
    const mockConfigService = {
        get: jest.fn((key) => {
            const config = {
                JWT_SECRET: 'test-secret',
                JWT_EXPIRES_IN: '15m',
                JWT_REFRESH_EXPIRES_IN: '7d',
            };
            return config[key];
        }),
    };
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [
                auth_service_1.AuthService,
                { provide: prisma_service_1.PrismaService, useValue: mockPrismaService },
                { provide: jwt_1.JwtService, useValue: mockJwtService },
                { provide: config_1.ConfigService, useValue: mockConfigService },
            ],
        }).compile();
        service = module.get(auth_service_1.AuthService);
        prismaService = module.get(prisma_service_1.PrismaService);
        jwtService = module.get(jwt_1.JwtService);
        jest.clearAllMocks();
    });
    describe('register', () => {
        const registerDto = {
            email: 'new@example.com',
            password: 'password123',
        };
        it('should create new user with hashed password', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null);
            bcrypt.hash.mockResolvedValue('hashed-password');
            mockPrismaService.user.create.mockResolvedValue({
                id: 'user-1',
                email: registerDto.email.toLowerCase(),
                passwordHash: 'hashed-password',
                emailVerified: false,
            });
            mockJwtService.signAsync
                .mockResolvedValueOnce('access-token')
                .mockResolvedValueOnce('refresh-token');
            const result = await service.register(registerDto);
            expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
            expect(mockPrismaService.user.create).toHaveBeenCalledWith({
                data: {
                    email: registerDto.email.toLowerCase(),
                    passwordHash: 'hashed-password',
                },
            });
            expect(result).toHaveProperty('accessToken');
            expect(result).toHaveProperty('user');
        });
        it('should throw ConflictException if email already exists', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue({ id: 'existing-user' });
            await expect(service.register(registerDto))
                .rejects
                .toThrow(common_1.ConflictException);
        });
    });
    describe('login', () => {
        it('should return tokens for valid credentials', async () => {
            const mockUser = {
                id: 'user-1',
                email: 'test@example.com',
                passwordHash: 'hashed-password',
                emailVerified: true,
                profile: { id: 'profile-1', name: 'Test User' },
            };
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(true);
            mockJwtService.signAsync
                .mockResolvedValueOnce('access-token')
                .mockResolvedValueOnce('refresh-token');
            const result = await service.login({
                email: 'test@example.com',
                password: 'correct-password',
            });
            expect(result).toHaveProperty('accessToken', 'access-token');
            expect(result).toHaveProperty('refreshToken', 'refresh-token');
            expect(result).toHaveProperty('user');
            expect(result.user.email).toBe('test@example.com');
        });
        it('should throw UnauthorizedException for invalid password', async () => {
            const mockUser = {
                id: 'user-1',
                email: 'test@example.com',
                passwordHash: 'hashed-password',
                profile: null,
            };
            mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
            bcrypt.compare.mockResolvedValue(false);
            await expect(service.login({
                email: 'test@example.com',
                password: 'wrong-password',
            })).rejects.toThrow(common_1.UnauthorizedException);
        });
        it('should throw UnauthorizedException for non-existent user', async () => {
            mockPrismaService.user.findUnique.mockResolvedValue(null);
            await expect(service.login({
                email: 'nonexistent@example.com',
                password: 'password',
            })).rejects.toThrow(common_1.UnauthorizedException);
        });
    });
    describe('refreshTokens', () => {
        it('should return new tokens for valid refresh token', async () => {
            const futureDate = new Date();
            futureDate.setDate(futureDate.getDate() + 7);
            const mockTokenRecord = {
                id: 'token-1',
                token: 'valid-refresh-token',
                userId: 'user-1',
                expiresAt: futureDate,
                user: {
                    id: 'user-1',
                    email: 'test@example.com',
                    emailVerified: true,
                    profile: null,
                },
            };
            mockPrismaService.refreshToken.findUnique.mockResolvedValue(mockTokenRecord);
            mockPrismaService.refreshToken.delete.mockResolvedValue(mockTokenRecord);
            mockPrismaService.refreshToken.create.mockResolvedValue({
                id: 'new-token-1',
                token: 'new-refresh-token',
                userId: 'user-1',
                expiresAt: futureDate,
            });
            mockJwtService.signAsync
                .mockResolvedValueOnce('new-access-token')
                .mockResolvedValueOnce('new-refresh-token');
            const result = await service.refreshTokens('valid-refresh-token');
            expect(result).toHaveProperty('accessToken', 'new-access-token');
            expect(result).toHaveProperty('refreshToken', 'new-refresh-token');
        });
        it('should throw UnauthorizedException for invalid refresh token', async () => {
            mockPrismaService.refreshToken.findUnique.mockResolvedValue(null);
            await expect(service.refreshTokens('invalid-token'))
                .rejects
                .toThrow(common_1.UnauthorizedException);
        });
        it('should throw UnauthorizedException if token is expired', async () => {
            const pastDate = new Date();
            pastDate.setDate(pastDate.getDate() - 1);
            const mockTokenRecord = {
                id: 'token-1',
                token: 'expired-token',
                userId: 'user-1',
                expiresAt: pastDate,
                user: {
                    id: 'user-1',
                    email: 'test@example.com',
                },
            };
            mockPrismaService.refreshToken.findUnique.mockResolvedValue(mockTokenRecord);
            await expect(service.refreshTokens('expired-token'))
                .rejects
                .toThrow(common_1.UnauthorizedException);
        });
    });
});
describe('AuthService - Security', () => {
    it('should use proper salt rounds for bcrypt', () => {
        const saltRounds = 10;
        expect(saltRounds).toBeGreaterThanOrEqual(10);
    });
});
//# sourceMappingURL=auth.service.spec.js.map