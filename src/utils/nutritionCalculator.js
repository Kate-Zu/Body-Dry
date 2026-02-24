/**
 * Калькулятор дневных норм калорий, макросов и воды
 * на основе параметров пользователя
 */

// Коэффициенты активности
const ACTIVITY_MULTIPLIERS = {
  SEDENTARY: 1.2,      // Сидячий образ жизни
  LIGHT: 1.375,        // Легкая активность (1-2 тренировки/неделю)
  MODERATE: 1.55,      // Умеренная активность (3-5 тренировок/неделю)
  ACTIVE: 1.725,       // Высокая активность (6-7 тренировок/неделю)
  VERY_ACTIVE: 1.9,    // Очень высокая активность (2 тренировки/день)
};

// Коэффициенты для целей
const GOAL_MULTIPLIERS = {
  LOSE_WEIGHT: 0.8,    // Похудение (-20%)
  MAINTAIN: 1.0,       // Поддержание веса
  GAIN_MUSCLE: 1.15,   // Набор массы (+15%)
  DRYING: 0.75,        // Сушка (-25%)
};

/**
 * Рассчитывает базовый метаболизм (BMR) по формуле Mifflin-St Jeor
 * @param {number} weight - вес в кг
 * @param {number} height - рост в см
 * @param {number} age - возраст в годах
 * @param {string} gender - пол (MALE/FEMALE)
 * @returns {number} BMR в ккал
 */
export const calculateBMR = (weight, height, age, gender) => {
  if (!weight || !height || !age) return 2000;
  
  // Формула Mifflin-St Jeor
  const baseBMR = 10 * weight + 6.25 * height - 5 * age;
  
  if (gender === 'MALE') {
    return baseBMR + 5;
  } else {
    return baseBMR - 161;
  }
};

/**
 * Рассчитывает возраст на основе даты рождения
 * @param {string|Date} birthDate - дата рождения
 * @returns {number} возраст в годах
 */
export const calculateAge = (birthDate) => {
  if (!birthDate) return 25; // Дефолтный возраст
  
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age || 25;
};

/**
 * Рассчитывает дневную норму калорий
 * @param {Object} params - параметры пользователя
 * @param {number} params.weight - вес в кг
 * @param {number} params.height - рост в см
 * @param {string|Date} params.birthDate - дата рождения
 * @param {string} params.gender - пол (MALE/FEMALE)
 * @param {string} params.activityLevel - уровень активности
 * @param {string} params.goal - цель
 * @returns {number} калории в ккал
 */
export const calculateDailyCalories = (params) => {
  const { weight, height, birthDate, gender, activityLevel, goal } = params;
  
  const age = calculateAge(birthDate);
  const bmr = calculateBMR(weight, height, age, gender);
  
  const activityMultiplier = ACTIVITY_MULTIPLIERS[activityLevel] || ACTIVITY_MULTIPLIERS.MODERATE;
  const goalMultiplier = GOAL_MULTIPLIERS[goal] || GOAL_MULTIPLIERS.MAINTAIN;
  
  const tdee = bmr * activityMultiplier;
  const targetCalories = tdee * goalMultiplier;
  
  // Минимум 1200 ккал для женщин, 1500 для мужчин
  const minCalories = gender === 'MALE' ? 1500 : 1200;
  
  return Math.round(Math.max(targetCalories, minCalories));
};

/**
 * Рассчитывает дневные нормы макросов (белки, жиры, углеводы)
 * @param {number} calories - дневная норма калорий
 * @param {string} goal - цель пользователя
 * @param {number} weight - вес в кг
 * @returns {Object} { protein, carbs, fats } в граммах
 */
export const calculateMacros = (calories, goal, weight) => {
  let proteinRatio, carbsRatio, fatsRatio;
  
  switch (goal) {
    case 'LOSE_WEIGHT':
      // Больше белка, меньше углеводов
      proteinRatio = 0.35;  // 35% от калорий
      carbsRatio = 0.35;    // 35%
      fatsRatio = 0.30;     // 30%
      break;
    case 'GAIN_MUSCLE':
      // Больше белка и углеводов
      proteinRatio = 0.30;  // 30%
      carbsRatio = 0.50;    // 50%
      fatsRatio = 0.20;     // 20%
      break;
    case 'DRYING':
      // Максимум белка, минимум углеводов
      proteinRatio = 0.40;  // 40%
      carbsRatio = 0.30;    // 30%
      fatsRatio = 0.30;     // 30%
      break;
    case 'MAINTAIN':
    default:
      // Сбалансированное питание
      proteinRatio = 0.25;  // 25%
      carbsRatio = 0.50;    // 50%
      fatsRatio = 0.25;     // 25%
      break;
  }
  
  // Калории в грамм: белки=4, углеводы=4, жиры=9
  const protein = Math.round((calories * proteinRatio) / 4);
  const carbs = Math.round((calories * carbsRatio) / 4);
  const fats = Math.round((calories * fatsRatio) / 9);
  
  // Альтернативно: белок 1.6-2.2г на кг веса для спортсменов
  // Берем минимум из расчета или 2г на кг при наборе массы
  const minProteinByWeight = goal === 'GAIN_MUSCLE' || goal === 'DRYING' 
    ? Math.round(weight * 2) 
    : Math.round(weight * 1.6);
  
  return {
    protein: Math.max(protein, minProteinByWeight),
    carbs,
    fats,
  };
};

/**
 * Рассчитывает дневную норму воды в мл
 * @param {number} weight - вес в кг
 * @param {string} activityLevel - уровень активности
 * @param {string} goal - цель
 * @returns {number} норма воды в мл
 */
export const calculateWaterGoal = (weight, activityLevel, goal) => {
  if (!weight) return 2500; // Дефолт 2.5л
  
  // Базовый расчет: 30-35 мл на кг веса
  let baseWater = weight * 33;
  
  // Коррекция по активности
  switch (activityLevel) {
    case 'SEDENTARY':
      baseWater *= 0.9;
      break;
    case 'LIGHT':
      baseWater *= 1.0;
      break;
    case 'MODERATE':
      baseWater *= 1.1;
      break;
    case 'ACTIVE':
      baseWater *= 1.2;
      break;
    case 'VERY_ACTIVE':
      baseWater *= 1.3;
      break;
  }
  
  // Коррекция по цели
  if (goal === 'DRYING' || goal === 'LOSE_WEIGHT') {
    baseWater *= 1.1; // Больше воды при похудении/сушке
  }
  
  // Минимум 1.5л, максимум 5л
  return Math.round(Math.min(Math.max(baseWater, 1500), 5000));
};

/**
 * Рассчитывает все дневные нормы
 * @param {Object} profile - профиль пользователя
 * @returns {Object} { calories, protein, carbs, fats, water }
 */
export const calculateAllGoals = (profile) => {
  if (!profile) {
    return {
      calories: 2000,
      protein: 150,
      carbs: 200,
      fats: 65,
      water: 2500,
    };
  }
  
  const { currentWeight, height, birthDate, gender, activityLevel, goal } = profile;
  
  const calories = calculateDailyCalories({
    weight: currentWeight,
    height,
    birthDate,
    gender,
    activityLevel,
    goal,
  });
  
  const macros = calculateMacros(calories, goal, currentWeight);
  const water = calculateWaterGoal(currentWeight, activityLevel, goal);
  
  return {
    calories,
    protein: macros.protein,
    carbs: macros.carbs,
    fats: macros.fats,
    water,
  };
};

export default {
  calculateBMR,
  calculateAge,
  calculateDailyCalories,
  calculateMacros,
  calculateWaterGoal,
  calculateAllGoals,
};
