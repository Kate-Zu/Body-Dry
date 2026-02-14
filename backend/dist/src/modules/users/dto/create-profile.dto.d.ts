import { Gender, ActivityLevel, Goal } from '@prisma/client';
export declare class CreateProfileDto {
    name: string;
    gender: Gender;
    birthDate: string;
    height: number;
    currentWeight: number;
    targetWeight?: number;
    activityLevel: ActivityLevel;
    goal: Goal;
    waterGoal?: number;
}
