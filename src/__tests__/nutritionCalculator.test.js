/**
 * Tests for nutritionCalculator utility functions
 */
import {
  calculateBMR,
  calculateAge,
  calculateDailyCalories,
  calculateMacros,
  calculateWaterGoal,
  calculateAllGoals,
} from '../utils/nutritionCalculator';

describe('nutritionCalculator', () => {
  describe('calculateBMR', () => {
    it('should calculate BMR for male correctly', () => {
      // 80kg, 180cm, 30 years old, male
      // BMR = 10 * 80 + 6.25 * 180 - 5 * 30 + 5 = 800 + 1125 - 150 + 5 = 1780
      const bmr = calculateBMR(80, 180, 30, 'MALE');
      expect(bmr).toBe(1780);
    });

    it('should calculate BMR for female correctly', () => {
      // 60kg, 165cm, 25 years old, female
      // BMR = 10 * 60 + 6.25 * 165 - 5 * 25 - 161 = 600 + 1031.25 - 125 - 161 = 1345.25
      const bmr = calculateBMR(60, 165, 25, 'FEMALE');
      expect(bmr).toBeCloseTo(1345.25, 1);
    });

    it('should return default 2000 when values are missing', () => {
      expect(calculateBMR(null, 180, 30, 'MALE')).toBe(2000);
      expect(calculateBMR(80, null, 30, 'MALE')).toBe(2000);
      expect(calculateBMR(80, 180, null, 'MALE')).toBe(2000);
    });

    it('should handle edge case weights', () => {
      const bmrLow = calculateBMR(40, 150, 20, 'FEMALE');
      const bmrHigh = calculateBMR(150, 200, 40, 'MALE');
      expect(bmrLow).toBeGreaterThan(0);
      expect(bmrHigh).toBeGreaterThan(bmrLow);
    });
  });

  describe('calculateAge', () => {
    it('should calculate age correctly', () => {
      const today = new Date();
      const birthYear = today.getFullYear() - 30;
      const birthDate = new Date(birthYear, 0, 1); // January 1st, 30 years ago
      expect(calculateAge(birthDate)).toBe(30);
    });

    it('should handle birthday not yet passed this year', () => {
      const today = new Date();
      const futureMonth = today.getMonth() + 2; // 2 months in the future
      const birthDate = new Date(today.getFullYear() - 25, futureMonth > 11 ? 0 : futureMonth, 15);
      const expectedAge = futureMonth > 11 ? 25 : 24;
      expect(calculateAge(birthDate)).toBe(expectedAge);
    });

    it('should return default 25 when birthDate is null/undefined', () => {
      expect(calculateAge(null)).toBe(25);
      expect(calculateAge(undefined)).toBe(25);
    });

    it('should handle string date format', () => {
      const today = new Date();
      const birthDateStr = `${today.getFullYear() - 28}-06-15`;
      const age = calculateAge(birthDateStr);
      expect(age).toBeGreaterThanOrEqual(27);
      expect(age).toBeLessThanOrEqual(28);
    });
  });

  describe('calculateDailyCalories', () => {
    const baseParams = {
      weight: 75,
      height: 175,
      birthDate: new Date(1995, 5, 15),
      gender: 'MALE',
      activityLevel: 'MODERATE',
      goal: 'MAINTAIN',
    };

    it('should calculate calories for maintenance goal', () => {
      const calories = calculateDailyCalories(baseParams);
      expect(calories).toBeGreaterThan(2000);
      expect(calories).toBeLessThan(3500);
    });

    it('should reduce calories for weight loss goal', () => {
      const maintainCals = calculateDailyCalories({ ...baseParams, goal: 'MAINTAIN' });
      const loseCals = calculateDailyCalories({ ...baseParams, goal: 'LOSE_WEIGHT' });
      expect(loseCals).toBeLessThan(maintainCals);
    });

    it('should increase calories for muscle gain goal', () => {
      const maintainCals = calculateDailyCalories({ ...baseParams, goal: 'MAINTAIN' });
      const gainCals = calculateDailyCalories({ ...baseParams, goal: 'GAIN_MUSCLE' });
      expect(gainCals).toBeGreaterThan(maintainCals);
    });

    it('should apply activity level multiplier', () => {
      const sedentaryCals = calculateDailyCalories({ ...baseParams, activityLevel: 'SEDENTARY' });
      const activeCals = calculateDailyCalories({ ...baseParams, activityLevel: 'VERY_ACTIVE' });
      expect(activeCals).toBeGreaterThan(sedentaryCals);
    });

    it('should enforce minimum calories for males', () => {
      const lowParams = {
        weight: 50,
        height: 160,
        birthDate: new Date(1990, 0, 1),
        gender: 'MALE',
        activityLevel: 'SEDENTARY',
        goal: 'DRYING',
      };
      const calories = calculateDailyCalories(lowParams);
      expect(calories).toBeGreaterThanOrEqual(1500);
    });

    it('should enforce minimum calories for females', () => {
      const lowParams = {
        weight: 45,
        height: 155,
        birthDate: new Date(1990, 0, 1),
        gender: 'FEMALE',
        activityLevel: 'SEDENTARY',
        goal: 'DRYING',
      };
      const calories = calculateDailyCalories(lowParams);
      expect(calories).toBeGreaterThanOrEqual(1200);
    });
  });

  describe('calculateMacros', () => {
    it('should return macros that sum approximately to total calories', () => {
      const calories = 2000;
      const macros = calculateMacros(calories, 'MAINTAIN', 75);
      
      const totalMacroCalories = 
        macros.protein * 4 + 
        macros.carbs * 4 + 
        macros.fats * 9;
      
      // Allow 10% variance due to rounding and min protein adjustments
      expect(totalMacroCalories).toBeGreaterThan(calories * 0.9);
      expect(totalMacroCalories).toBeLessThan(calories * 1.3);
    });

    it('should return higher protein for drying goal', () => {
      const maintainMacros = calculateMacros(2000, 'MAINTAIN', 75);
      const dryingMacros = calculateMacros(2000, 'DRYING', 75);
      expect(dryingMacros.protein).toBeGreaterThanOrEqual(maintainMacros.protein);
    });

    it('should return same carbs for muscle gain and maintain (both 50%)', () => {
      const maintainMacros = calculateMacros(2000, 'MAINTAIN', 75);
      const gainMacros = calculateMacros(2000, 'GAIN_MUSCLE', 75);
      // Both have 50% carbs ratio, so carbs should be equal
      expect(gainMacros.carbs).toEqual(maintainMacros.carbs);
    });

    it('should enforce minimum protein based on weight', () => {
      const macros = calculateMacros(1500, 'DRYING', 80);
      // For drying, minimum is 2g per kg = 160g
      expect(macros.protein).toBeGreaterThanOrEqual(160);
    });

    it('should handle all goal types', () => {
      const goals = ['LOSE_WEIGHT', 'MAINTAIN', 'GAIN_MUSCLE', 'DRYING'];
      goals.forEach(goal => {
        const macros = calculateMacros(2000, goal, 70);
        expect(macros.protein).toBeGreaterThan(0);
        expect(macros.carbs).toBeGreaterThan(0);
        expect(macros.fats).toBeGreaterThan(0);
      });
    });
  });

  describe('calculateWaterGoal', () => {
    it('should calculate water based on weight', () => {
      const water60 = calculateWaterGoal(60, 'MODERATE', 'MAINTAIN');
      const water90 = calculateWaterGoal(90, 'MODERATE', 'MAINTAIN');
      expect(water90).toBeGreaterThan(water60);
    });

    it('should increase water for high activity', () => {
      const sedentary = calculateWaterGoal(75, 'SEDENTARY', 'MAINTAIN');
      const veryActive = calculateWaterGoal(75, 'VERY_ACTIVE', 'MAINTAIN');
      expect(veryActive).toBeGreaterThan(sedentary);
    });

    it('should increase water for drying/weight loss', () => {
      const maintain = calculateWaterGoal(75, 'MODERATE', 'MAINTAIN');
      const drying = calculateWaterGoal(75, 'MODERATE', 'DRYING');
      expect(drying).toBeGreaterThan(maintain);
    });

    it('should return default when weight is missing', () => {
      expect(calculateWaterGoal(null, 'MODERATE', 'MAINTAIN')).toBe(2500);
      expect(calculateWaterGoal(undefined, 'MODERATE', 'MAINTAIN')).toBe(2500);
    });

    it('should enforce minimum 1500ml', () => {
      const water = calculateWaterGoal(30, 'SEDENTARY', 'MAINTAIN');
      expect(water).toBeGreaterThanOrEqual(1500);
    });

    it('should enforce maximum 5000ml', () => {
      const water = calculateWaterGoal(200, 'VERY_ACTIVE', 'DRYING');
      expect(water).toBeLessThanOrEqual(5000);
    });
  });

  describe('calculateAllGoals', () => {
    it('should return default values when profile is null', () => {
      const goals = calculateAllGoals(null);
      expect(goals).toEqual({
        calories: 2000,
        protein: 150,
        carbs: 200,
        fats: 65,
        water: 2500,
      });
    });

    it('should calculate all goals from complete profile', () => {
      const profile = {
        currentWeight: 75,
        height: 180,
        birthDate: new Date(1995, 5, 15),
        gender: 'MALE',
        activityLevel: 'MODERATE',
        goal: 'MAINTAIN',
      };
      
      const goals = calculateAllGoals(profile);
      
      expect(goals.calories).toBeGreaterThan(0);
      expect(goals.protein).toBeGreaterThan(0);
      expect(goals.carbs).toBeGreaterThan(0);
      expect(goals.fats).toBeGreaterThan(0);
      expect(goals.water).toBeGreaterThan(0);
    });

    it('should return different goals for different profiles', () => {
      const maleProfile = {
        currentWeight: 85,
        height: 185,
        birthDate: new Date(1990, 0, 1),
        gender: 'MALE',
        activityLevel: 'ACTIVE',
        goal: 'GAIN_MUSCLE',
      };
      
      const femaleProfile = {
        currentWeight: 55,
        height: 160,
        birthDate: new Date(1998, 6, 20),
        gender: 'FEMALE',
        activityLevel: 'LIGHT',
        goal: 'LOSE_WEIGHT',
      };
      
      const maleGoals = calculateAllGoals(maleProfile);
      const femaleGoals = calculateAllGoals(femaleProfile);
      
      expect(maleGoals.calories).toBeGreaterThan(femaleGoals.calories);
      expect(maleGoals.water).toBeGreaterThan(femaleGoals.water);
    });
  });
});
