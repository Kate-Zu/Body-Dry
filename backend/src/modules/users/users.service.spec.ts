import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Gender, ActivityLevel, Goal } from '@prisma/client';

describe('UsersService', () => {
  let service: UsersService;
  let prismaService: jest.Mocked<PrismaService>;

  const mockPrismaService = {
    profile: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    user: {
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prismaService = module.get(PrismaService);
    
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return profile when found', async () => {
      const mockProfile = {
        id: 'profile-1',
        userId: 'user-1',
        name: 'Test User',
        gender: 'MALE' as Gender,
        birthDate: new Date('1995-06-15'),
        height: 180,
        currentWeight: 80,
        targetWeight: 75,
        activityLevel: 'MODERATE' as ActivityLevel,
        goal: 'LOSE_WEIGHT' as Goal,
        bmr: 1780,
        tdee: 2759,
        calorieGoal: 2200,
        proteinGoal: 160,
        carbsGoal: 200,
        fatsGoal: 72,
        waterGoal: 2.6,
      };

      mockPrismaService.profile.findUnique.mockResolvedValue(mockProfile);

      const result = await service.getProfile('user-1');

      expect(result).toEqual(mockProfile);
      expect(mockPrismaService.profile.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      });
    });

    it('should return null when profile not found', async () => {
      mockPrismaService.profile.findUnique.mockResolvedValue(null);

      const result = await service.getProfile('user-1');

      expect(result).toBeNull();
    });
  });

  describe('createProfile', () => {
    const createProfileDto = {
      name: 'Test User',
      gender: 'MALE' as Gender,
      birthDate: '1995-06-15',
      height: 180,
      currentWeight: 80,
      targetWeight: 75,
      activityLevel: 'MODERATE' as ActivityLevel,
      goal: 'LOSE_WEIGHT' as Goal,
    };

    it('should create profile with calculated values', async () => {
      mockPrismaService.profile.findUnique.mockResolvedValue(null);
      mockPrismaService.profile.create.mockResolvedValue({
        id: 'profile-1',
        userId: 'user-1',
        ...createProfileDto,
        birthDate: new Date(createProfileDto.birthDate),
        bmr: expect.any(Number),
        tdee: expect.any(Number),
        calorieGoal: expect.any(Number),
        proteinGoal: expect.any(Number),
        carbsGoal: expect.any(Number),
        fatsGoal: expect.any(Number),
        waterGoal: expect.any(Number),
      });

      const result = await service.createProfile('user-1', createProfileDto);

      expect(result).toBeDefined();
      expect(mockPrismaService.profile.create).toHaveBeenCalled();
    });

    it('should throw error if profile already exists', async () => {
      mockPrismaService.profile.findUnique.mockResolvedValue({ id: 'existing' });

      await expect(service.createProfile('user-1', createProfileDto))
        .rejects
        .toThrow(BadRequestException);
    });
  });

  describe('updateProfile', () => {
    const existingProfile = {
      id: 'profile-1',
      userId: 'user-1',
      name: 'Test User',
      gender: 'MALE' as Gender,
      birthDate: new Date('1995-06-15'),
      height: 180,
      currentWeight: 80,
      targetWeight: 75,
      activityLevel: 'MODERATE' as ActivityLevel,
      goal: 'LOSE_WEIGHT' as Goal,
      bmr: 1780,
      tdee: 2759,
      calorieGoal: 2200,
      proteinGoal: 160,
      carbsGoal: 200,
      fatsGoal: 72,
      waterGoal: 2.6,
    };

    it('should update profile successfully', async () => {
      mockPrismaService.profile.findUnique.mockResolvedValue(existingProfile);
      mockPrismaService.profile.update.mockResolvedValue({
        ...existingProfile,
        name: 'Updated Name',
      });

      const result = await service.updateProfile('user-1', { name: 'Updated Name' });

      expect(result.name).toBe('Updated Name');
      expect(mockPrismaService.profile.update).toHaveBeenCalled();
    });

    it('should recalculate TDEE when weight changes', async () => {
      mockPrismaService.profile.findUnique.mockResolvedValue(existingProfile);
      mockPrismaService.profile.update.mockResolvedValue({
        ...existingProfile,
        currentWeight: 85,
      });

      await service.updateProfile('user-1', { currentWeight: 85 });

      expect(mockPrismaService.profile.update).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: expect.objectContaining({
          currentWeight: 85,
          bmr: expect.any(Number),
          tdee: expect.any(Number),
          calorieGoal: expect.any(Number),
          proteinGoal: expect.any(Number),
          carbsGoal: expect.any(Number),
          fatsGoal: expect.any(Number),
          waterGoal: expect.any(Number),
        }),
      });
    });

    it('should throw error if profile not found', async () => {
      mockPrismaService.profile.findUnique.mockResolvedValue(null);

      await expect(service.updateProfile('user-1', { name: 'Test' }))
        .rejects
        .toThrow(NotFoundException);
    });
  });

  describe('updateGoals', () => {
    it('should update custom goals', async () => {
      const newGoals = {
        calorieGoal: 2500,
        proteinGoal: 180,
        carbsGoal: 250,
        fatsGoal: 80,
      };

      mockPrismaService.profile.update.mockResolvedValue(newGoals);

      const result = await service.updateGoals('user-1', newGoals);

      expect(mockPrismaService.profile.update).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        data: newGoals,
      });
    });
  });

  describe('deleteAccount', () => {
    it('should delete user account', async () => {
      mockPrismaService.user.delete.mockResolvedValue({ id: 'user-1' });

      const result = await service.deleteAccount('user-1');

      expect(result).toEqual({ message: 'Акаунт видалено' });
      expect(mockPrismaService.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-1' },
      });
    });
  });
});

// Additional tests for calculation methods
describe('UsersService - Calculations', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: {
            profile: {
              findUnique: jest.fn(),
              create: jest.fn(),
              update: jest.fn(),
            },
            user: { delete: jest.fn() },
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  // Access private methods for testing via prototype
  describe('calculateBMR (private)', () => {
    it('should calculate correct BMR for male', () => {
      // Access private method
      const bmr = (service as any).calculateBMR('MALE', 80, 180, 30);
      // 10 * 80 + 6.25 * 180 - 5 * 30 + 5 = 800 + 1125 - 150 + 5 = 1780
      expect(bmr).toBe(1780);
    });

    it('should calculate correct BMR for female', () => {
      const bmr = (service as any).calculateBMR('FEMALE', 60, 165, 25);
      // 10 * 60 + 6.25 * 165 - 5 * 25 - 161 = 600 + 1031.25 - 125 - 161 = 1345.25
      expect(bmr).toBeCloseTo(1345.25, 1);
    });
  });

  describe('calculateTDEE (private)', () => {
    it('should apply correct activity multiplier', () => {
      const resultSedentary = (service as any).calculateTDEE('MALE', 80, 180, 30, 'SEDENTARY');
      const resultActive = (service as any).calculateTDEE('MALE', 80, 180, 30, 'VERY_ACTIVE');
      
      expect(resultActive.tdee).toBeGreaterThan(resultSedentary.tdee);
      // Sedentary: 1780 * 1.2 = 2136
      expect(resultSedentary.tdee).toBe(2136);
      // Very Active: 1780 * 1.9 = 3382
      expect(resultActive.tdee).toBe(3382);
    });
  });

  describe('calculateMacros (private)', () => {
    it('should reduce calories for weight loss', () => {
      const maintainMacros = (service as any).calculateMacros(2500, 'MAINTAIN', 80);
      const loseMacros = (service as any).calculateMacros(2500, 'LOSE_WEIGHT', 80);
      
      expect(loseMacros.calories).toBeLessThan(maintainMacros.calories);
      expect(loseMacros.calories).toBe(2000); // 80% of 2500
    });

    it('should increase calories for muscle gain', () => {
      const maintainMacros = (service as any).calculateMacros(2500, 'MAINTAIN', 80);
      const gainMacros = (service as any).calculateMacros(2500, 'GAIN_MUSCLE', 80);
      
      expect(gainMacros.calories).toBeGreaterThan(maintainMacros.calories);
    });

    it('should use higher protein for drying', () => {
      const maintainMacros = (service as any).calculateMacros(2000, 'MAINTAIN', 80);
      const dryingMacros = (service as any).calculateMacros(2000, 'DRYING', 80);
      
      // Drying: 2.2g/kg = 176g
      expect(dryingMacros.protein).toBe(176);
      // Maintain: 1.6g/kg = 128g
      expect(maintainMacros.protein).toBe(128);
    });
  });

  describe('calculateWaterGoal (private)', () => {
    it('should calculate water based on weight', () => {
      const water60 = (service as any).calculateWaterGoal(60, 'MODERATE', 'MAINTAIN');
      const water90 = (service as any).calculateWaterGoal(90, 'MODERATE', 'MAINTAIN');
      
      expect(water90).toBeGreaterThan(water60);
    });

    it('should increase water for high activity', () => {
      const waterSedentary = (service as any).calculateWaterGoal(75, 'SEDENTARY', 'MAINTAIN');
      const waterActive = (service as any).calculateWaterGoal(75, 'VERY_ACTIVE', 'MAINTAIN');
      
      expect(waterActive).toBeGreaterThan(waterSedentary);
    });

    it('should increase water for drying goal', () => {
      const waterMaintain = (service as any).calculateWaterGoal(75, 'MODERATE', 'MAINTAIN');
      const waterDrying = (service as any).calculateWaterGoal(75, 'MODERATE', 'DRYING');
      
      expect(waterDrying).toBeGreaterThan(waterMaintain);
    });

    it('should enforce minimum 1.5L', () => {
      const water = (service as any).calculateWaterGoal(30, 'SEDENTARY', 'MAINTAIN');
      expect(water).toBeGreaterThanOrEqual(1.5);
    });

    it('should enforce maximum 5L', () => {
      const water = (service as any).calculateWaterGoal(200, 'VERY_ACTIVE', 'DRYING');
      expect(water).toBeLessThanOrEqual(5);
    });
  });
});
