import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ═══════════════════════════════════════════════════════════════════════
//  COMPREHENSIVE UKRAINIAN & EUROPEAN FOOD DATABASE
//  ~800+ products: generic foods + Ukrainian brands + European brands
//  All nutritional values per 100g unless noted
// ═══════════════════════════════════════════════════════════════════════

type FoodEntry = {
  name: string;
  brand: string | null;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  fiber: number;
  serving: number;
};

const foods: FoodEntry[] = [

  // ═══════════════════════════════════════
  //  1. М'ЯСО ТА ПТИЦЯ
  // ═══════════════════════════════════════
  { name: 'Куряча грудка', brand: null, category: 'Мʼясо', calories: 110, protein: 23, carbs: 0, fats: 1, fiber: 0, serving: 100 },
  { name: 'Куряче стегно', brand: null, category: 'Мʼясо', calories: 185, protein: 18, carbs: 0, fats: 12, fiber: 0, serving: 100 },
  { name: 'Курячі крильця', brand: null, category: 'Мʼясо', calories: 222, protein: 18, carbs: 0, fats: 16, fiber: 0, serving: 100 },
  { name: 'Курячі гомілки', brand: null, category: 'Мʼясо', calories: 173, protein: 18, carbs: 0, fats: 11, fiber: 0, serving: 100 },
  { name: 'Яловичина (нежирна)', brand: null, category: 'Мʼясо', calories: 158, protein: 22, carbs: 0, fats: 7, fiber: 0, serving: 100 },
  { name: 'Яловичина (лопатка)', brand: null, category: 'Мʼясо', calories: 137, protein: 20, carbs: 0, fats: 6, fiber: 0, serving: 100 },
  { name: 'Стейк рібай', brand: null, category: 'Мʼясо', calories: 291, protein: 24, carbs: 0, fats: 21, fiber: 0, serving: 200 },
  { name: 'Філе міньйон', brand: null, category: 'Мʼясо', calories: 196, protein: 26, carbs: 0, fats: 10, fiber: 0, serving: 150 },
  { name: 'Свинина (нежирна)', brand: null, category: 'Мʼясо', calories: 143, protein: 21, carbs: 0, fats: 6, fiber: 0, serving: 100 },
  { name: 'Свинина (жирна)', brand: null, category: 'Мʼясо', calories: 259, protein: 16, carbs: 0, fats: 21, fiber: 0, serving: 100 },
  { name: 'Свинячий окіст', brand: null, category: 'Мʼясо', calories: 261, protein: 18, carbs: 0, fats: 21, fiber: 0, serving: 100 },
  { name: 'Свиняча шийка', brand: null, category: 'Мʼясо', calories: 343, protein: 14, carbs: 0, fats: 32, fiber: 0, serving: 100 },
  { name: 'Свинячі реберця', brand: null, category: 'Мʼясо', calories: 277, protein: 16, carbs: 0, fats: 23, fiber: 0, serving: 100 },
  { name: 'Індичка (філе)', brand: null, category: 'Мʼясо', calories: 115, protein: 24, carbs: 0, fats: 2, fiber: 0, serving: 100 },
  { name: 'Індичка (стегно)', brand: null, category: 'Мʼясо', calories: 144, protein: 20, carbs: 0, fats: 7, fiber: 0, serving: 100 },
  { name: 'Телятина', brand: null, category: 'Мʼясо', calories: 131, protein: 21, carbs: 0, fats: 5, fiber: 0, serving: 100 },
  { name: 'Баранина', brand: null, category: 'Мʼясо', calories: 209, protein: 17, carbs: 0, fats: 15, fiber: 0, serving: 100 },
  { name: 'Кролятина', brand: null, category: 'Мʼясо', calories: 156, protein: 21, carbs: 0, fats: 8, fiber: 0, serving: 100 },
  { name: 'Качка', brand: null, category: 'Мʼясо', calories: 248, protein: 19, carbs: 0, fats: 19, fiber: 0, serving: 100 },
  { name: 'Гусятина', brand: null, category: 'Мʼясо', calories: 305, protein: 16, carbs: 0, fats: 27, fiber: 0, serving: 100 },
  { name: 'Фарш курячий', brand: null, category: 'Мʼясо', calories: 143, protein: 17, carbs: 0, fats: 8, fiber: 0, serving: 100 },
  { name: 'Фарш яловичий', brand: null, category: 'Мʼясо', calories: 254, protein: 17, carbs: 0, fats: 20, fiber: 0, serving: 100 },
  { name: 'Фарш свинячий', brand: null, category: 'Мʼясо', calories: 263, protein: 15, carbs: 0, fats: 22, fiber: 0, serving: 100 },
  { name: 'Фарш свинячо-яловичий', brand: null, category: 'Мʼясо', calories: 258, protein: 16, carbs: 0, fats: 21, fiber: 0, serving: 100 },
  { name: 'Фарш індичий', brand: null, category: 'Мʼясо', calories: 161, protein: 20, carbs: 0, fats: 9, fiber: 0, serving: 100 },
  { name: 'Печінка куряча', brand: null, category: 'Мʼясо', calories: 136, protein: 19, carbs: 1, fats: 6, fiber: 0, serving: 100 },
  { name: 'Печінка яловича', brand: null, category: 'Мʼясо', calories: 127, protein: 18, carbs: 5, fats: 4, fiber: 0, serving: 100 },
  { name: 'Печінка свиняча', brand: null, category: 'Мʼясо', calories: 109, protein: 19, carbs: 3, fats: 3, fiber: 0, serving: 100 },
  { name: 'Серце куряче', brand: null, category: 'Мʼясо', calories: 159, protein: 16, carbs: 1, fats: 10, fiber: 0, serving: 100 },
  { name: 'Серце яловиче', brand: null, category: 'Мʼясо', calories: 112, protein: 17, carbs: 0, fats: 4, fiber: 0, serving: 100 },
  { name: 'Шлуночки курячі', brand: null, category: 'Мʼясо', calories: 114, protein: 18, carbs: 1, fats: 4, fiber: 0, serving: 100 },
  { name: 'Язик яловичий', brand: null, category: 'Мʼясо', calories: 173, protein: 16, carbs: 0, fats: 12, fiber: 0, serving: 100 },
  { name: 'Язик свинячий', brand: null, category: 'Мʼясо', calories: 208, protein: 16, carbs: 0, fats: 16, fiber: 0, serving: 100 },
  { name: 'Сало', brand: null, category: 'Мʼясо', calories: 797, protein: 2, carbs: 0, fats: 89, fiber: 0, serving: 30 },
  { name: 'Бекон', brand: null, category: 'Мʼясо', calories: 541, protein: 37, carbs: 1, fats: 42, fiber: 0, serving: 30 },
  { name: 'Шашлик свинячий', brand: null, category: 'Мʼясо', calories: 280, protein: 18, carbs: 1, fats: 22, fiber: 0, serving: 150 },
  { name: 'Шашлик курячий', brand: null, category: 'Мʼясо', calories: 150, protein: 22, carbs: 1, fats: 6, fiber: 0, serving: 150 },

  // ═══════════════════════════════════════
  //  2. КОВБАСНІ ВИРОБИ
  // ═══════════════════════════════════════
  { name: 'Сосиски молочні', brand: null, category: 'Ковбаси', calories: 261, protein: 11, carbs: 2, fats: 24, fiber: 0, serving: 50 },
  { name: 'Сосиски курячі', brand: null, category: 'Ковбаси', calories: 198, protein: 14, carbs: 3, fats: 15, fiber: 0, serving: 50 },
  { name: 'Сарделі', brand: null, category: 'Ковбаси', calories: 215, protein: 11, carbs: 2, fats: 18, fiber: 0, serving: 100 },
  { name: 'Ковбаса варена «Лікарська»', brand: null, category: 'Ковбаси', calories: 257, protein: 12, carbs: 2, fats: 22, fiber: 0, serving: 50 },
  { name: 'Ковбаса варена «Молочна»', brand: null, category: 'Ковбаси', calories: 252, protein: 11, carbs: 2, fats: 22, fiber: 0, serving: 50 },
  { name: 'Ковбаса напівкопчена', brand: null, category: 'Ковбаси', calories: 370, protein: 17, carbs: 1, fats: 33, fiber: 0, serving: 30 },
  { name: 'Ковбаса копчена «Салямі»', brand: null, category: 'Ковбаси', calories: 425, protein: 21, carbs: 1, fats: 38, fiber: 0, serving: 30 },
  { name: 'Ковбаса сирокопчена', brand: null, category: 'Ковбаси', calories: 472, protein: 24, carbs: 0, fats: 41, fiber: 0, serving: 30 },
  { name: 'Шинка', brand: null, category: 'Ковбаси', calories: 145, protein: 19, carbs: 1, fats: 7, fiber: 0, serving: 50 },
  { name: 'Балик', brand: null, category: 'Ковбаси', calories: 286, protein: 15, carbs: 1, fats: 25, fiber: 0, serving: 30 },
  { name: 'Буженина', brand: null, category: 'Ковбаси', calories: 272, protein: 16, carbs: 0, fats: 23, fiber: 0, serving: 50 },
  { name: 'Пастрамі', brand: null, category: 'Ковбаси', calories: 133, protein: 22, carbs: 2, fats: 4, fiber: 0, serving: 50 },
  { name: 'Паштет', brand: null, category: 'Ковбаси', calories: 301, protein: 12, carbs: 4, fats: 27, fiber: 0, serving: 50 },
  { name: 'Ковбаски для грилю', brand: null, category: 'Ковбаси', calories: 301, protein: 15, carbs: 3, fats: 26, fiber: 0, serving: 100 },

  // ═══════════════════════════════════════
  //  3. РИБА ТА МОРЕПРОДУКТИ
  // ═══════════════════════════════════════
  { name: 'Лосось', brand: null, category: 'Риба', calories: 208, protein: 20, carbs: 0, fats: 13, fiber: 0, serving: 100 },
  { name: 'Форель', brand: null, category: 'Риба', calories: 119, protein: 20, carbs: 0, fats: 4, fiber: 0, serving: 100 },
  { name: 'Скумбрія', brand: null, category: 'Риба', calories: 205, protein: 19, carbs: 0, fats: 14, fiber: 0, serving: 100 },
  { name: 'Тріска', brand: null, category: 'Риба', calories: 82, protein: 18, carbs: 0, fats: 1, fiber: 0, serving: 100 },
  { name: 'Оселедець', brand: null, category: 'Риба', calories: 203, protein: 18, carbs: 0, fats: 14, fiber: 0, serving: 100 },
  { name: 'Тунець (консервований)', brand: null, category: 'Риба', calories: 116, protein: 26, carbs: 0, fats: 1, fiber: 0, serving: 100 },
  { name: 'Тунець (свіжий)', brand: null, category: 'Риба', calories: 144, protein: 23, carbs: 0, fats: 5, fiber: 0, serving: 100 },
  { name: 'Судак', brand: null, category: 'Риба', calories: 84, protein: 18, carbs: 0, fats: 1, fiber: 0, serving: 100 },
  { name: 'Щука', brand: null, category: 'Риба', calories: 82, protein: 18, carbs: 0, fats: 1, fiber: 0, serving: 100 },
  { name: 'Короп', brand: null, category: 'Риба', calories: 112, protein: 16, carbs: 0, fats: 5, fiber: 0, serving: 100 },
  { name: 'Карась', brand: null, category: 'Риба', calories: 87, protein: 18, carbs: 0, fats: 2, fiber: 0, serving: 100 },
  { name: 'Сом', brand: null, category: 'Риба', calories: 115, protein: 18, carbs: 0, fats: 5, fiber: 0, serving: 100 },
  { name: 'Минтай', brand: null, category: 'Риба', calories: 72, protein: 16, carbs: 0, fats: 1, fiber: 0, serving: 100 },
  { name: 'Хек', brand: null, category: 'Риба', calories: 86, protein: 17, carbs: 0, fats: 2, fiber: 0, serving: 100 },
  { name: 'Пангасіус', brand: null, category: 'Риба', calories: 89, protein: 15, carbs: 0, fats: 3, fiber: 0, serving: 100 },
  { name: 'Тилапія', brand: null, category: 'Риба', calories: 96, protein: 20, carbs: 0, fats: 2, fiber: 0, serving: 100 },
  { name: 'Дорадо', brand: null, category: 'Риба', calories: 96, protein: 18, carbs: 0, fats: 2, fiber: 0, serving: 100 },
  { name: 'Сібас', brand: null, category: 'Риба', calories: 99, protein: 18, carbs: 0, fats: 3, fiber: 0, serving: 100 },
  { name: 'Камбала', brand: null, category: 'Риба', calories: 83, protein: 17, carbs: 0, fats: 1, fiber: 0, serving: 100 },
  { name: 'Палтус', brand: null, category: 'Риба', calories: 111, protein: 19, carbs: 0, fats: 4, fiber: 0, serving: 100 },
  { name: 'Сардини', brand: null, category: 'Риба', calories: 208, protein: 25, carbs: 0, fats: 11, fiber: 0, serving: 100 },
  { name: 'Анчоуси', brand: null, category: 'Риба', calories: 131, protein: 20, carbs: 0, fats: 5, fiber: 0, serving: 30 },
  { name: 'Шпроти', brand: null, category: 'Риба', calories: 363, protein: 17, carbs: 0, fats: 32, fiber: 0, serving: 50 },
  { name: 'Креветки', brand: null, category: 'Риба', calories: 99, protein: 21, carbs: 0, fats: 1, fiber: 0, serving: 100 },
  { name: 'Кальмари', brand: null, category: 'Риба', calories: 92, protein: 18, carbs: 2, fats: 1, fiber: 0, serving: 100 },
  { name: 'Мідії', brand: null, category: 'Риба', calories: 77, protein: 12, carbs: 3, fats: 2, fiber: 0, serving: 100 },
  { name: 'Осьминог', brand: null, category: 'Риба', calories: 82, protein: 15, carbs: 2, fats: 1, fiber: 0, serving: 100 },
  { name: 'Ікра червона', brand: null, category: 'Риба', calories: 252, protein: 32, carbs: 0, fats: 15, fiber: 0, serving: 30 },
  { name: 'Ікра чорна', brand: null, category: 'Риба', calories: 264, protein: 27, carbs: 0, fats: 16, fiber: 0, serving: 30 },
  { name: 'Крабові палички', brand: null, category: 'Риба', calories: 73, protein: 6, carbs: 10, fats: 1, fiber: 0, serving: 100 },
  { name: 'Морська капуста', brand: null, category: 'Риба', calories: 24, protein: 2, carbs: 3, fats: 0, fiber: 1, serving: 100 },

  // ═══════════════════════════════════════
  //  4. ЯЙЦЯ ТА МОЛОЧНІ ПРОДУКТИ
  // ═══════════════════════════════════════
  { name: 'Яйце куряче', brand: null, category: 'Молочне', calories: 155, protein: 13, carbs: 1, fats: 11, fiber: 0, serving: 60 },
  { name: 'Яйце (білок)', brand: null, category: 'Молочне', calories: 52, protein: 11, carbs: 1, fats: 0, fiber: 0, serving: 33 },
  { name: 'Яйце (жовток)', brand: null, category: 'Молочне', calories: 322, protein: 16, carbs: 4, fats: 27, fiber: 0, serving: 17 },
  { name: 'Яйце перепелине', brand: null, category: 'Молочне', calories: 168, protein: 12, carbs: 1, fats: 13, fiber: 0, serving: 10 },
  { name: 'Молоко 0.5%', brand: null, category: 'Молочне', calories: 35, protein: 3, carbs: 5, fats: 0.5, fiber: 0, serving: 250 },
  { name: 'Молоко 1%', brand: null, category: 'Молочне', calories: 42, protein: 3, carbs: 5, fats: 1, fiber: 0, serving: 250 },
  { name: 'Молоко 2.5%', brand: null, category: 'Молочне', calories: 52, protein: 3, carbs: 5, fats: 2.5, fiber: 0, serving: 250 },
  { name: 'Молоко 3.2%', brand: null, category: 'Молочне', calories: 59, protein: 3, carbs: 5, fats: 3.2, fiber: 0, serving: 250 },
  { name: 'Молоко безлактозне 2.5%', brand: null, category: 'Молочне', calories: 51, protein: 3, carbs: 5, fats: 2.5, fiber: 0, serving: 250 },
  { name: 'Молоко козяче', brand: null, category: 'Молочне', calories: 68, protein: 4, carbs: 4, fats: 4, fiber: 0, serving: 250 },
  { name: 'Молоко топлене', brand: null, category: 'Молочне', calories: 84, protein: 3, carbs: 5, fats: 6, fiber: 0, serving: 250 },
  { name: 'Молоко згущене', brand: null, category: 'Молочне', calories: 320, protein: 7, carbs: 56, fats: 8, fiber: 0, serving: 30 },
  { name: 'Молоко сухе', brand: null, category: 'Молочне', calories: 469, protein: 24, carbs: 39, fats: 25, fiber: 0, serving: 20 },
  { name: 'Кефір 1%', brand: null, category: 'Молочне', calories: 40, protein: 3, carbs: 4, fats: 1, fiber: 0, serving: 250 },
  { name: 'Кефір 2.5%', brand: null, category: 'Молочне', calories: 53, protein: 3, carbs: 4, fats: 2.5, fiber: 0, serving: 250 },
  { name: 'Сир кисломолочний 0%', brand: null, category: 'Молочне', calories: 78, protein: 18, carbs: 2, fats: 0, fiber: 0, serving: 100 },
  { name: 'Сир кисломолочний 5%', brand: null, category: 'Молочне', calories: 121, protein: 17, carbs: 2, fats: 5, fiber: 0, serving: 100 },
  { name: 'Сир кисломолочний 9%', brand: null, category: 'Молочне', calories: 159, protein: 16, carbs: 2, fats: 9, fiber: 0, serving: 100 },
  { name: 'Сметана 10%', brand: null, category: 'Молочне', calories: 115, protein: 3, carbs: 3, fats: 10, fiber: 0, serving: 50 },
  { name: 'Сметана 15%', brand: null, category: 'Молочне', calories: 162, protein: 3, carbs: 3, fats: 15, fiber: 0, serving: 50 },
  { name: 'Сметана 20%', brand: null, category: 'Молочне', calories: 206, protein: 3, carbs: 3, fats: 20, fiber: 0, serving: 50 },
  { name: 'Вершки 10%', brand: null, category: 'Молочне', calories: 118, protein: 3, carbs: 4, fats: 10, fiber: 0, serving: 50 },
  { name: 'Вершки 20%', brand: null, category: 'Молочне', calories: 205, protein: 3, carbs: 4, fats: 20, fiber: 0, serving: 50 },
  { name: 'Вершки 33%', brand: null, category: 'Молочне', calories: 322, protein: 2, carbs: 3, fats: 33, fiber: 0, serving: 30 },
  { name: 'Сир твердий', brand: null, category: 'Молочне', calories: 350, protein: 25, carbs: 0, fats: 28, fiber: 0, serving: 30 },
  { name: 'Сир моцарела', brand: null, category: 'Молочне', calories: 280, protein: 22, carbs: 2, fats: 22, fiber: 0, serving: 100 },
  { name: 'Сир бринза', brand: null, category: 'Молочне', calories: 262, protein: 22, carbs: 0, fats: 19, fiber: 0, serving: 50 },
  { name: 'Сир фета', brand: null, category: 'Молочне', calories: 264, protein: 14, carbs: 4, fats: 21, fiber: 0, serving: 50 },
  { name: 'Сир адигейський', brand: null, category: 'Молочне', calories: 240, protein: 18, carbs: 2, fats: 18, fiber: 0, serving: 100 },
  { name: 'Сир пармезан', brand: null, category: 'Молочне', calories: 431, protein: 38, carbs: 4, fats: 29, fiber: 0, serving: 20 },
  { name: 'Сир чеддер', brand: null, category: 'Молочне', calories: 402, protein: 25, carbs: 1, fats: 33, fiber: 0, serving: 30 },
  { name: 'Сир гауда', brand: null, category: 'Молочне', calories: 356, protein: 25, carbs: 2, fats: 27, fiber: 0, serving: 30 },
  { name: 'Сир едам', brand: null, category: 'Молочне', calories: 357, protein: 25, carbs: 1, fats: 28, fiber: 0, serving: 30 },
  { name: 'Сир камамбер', brand: null, category: 'Молочне', calories: 300, protein: 20, carbs: 1, fats: 24, fiber: 0, serving: 30 },
  { name: 'Сир брі', brand: null, category: 'Молочне', calories: 334, protein: 21, carbs: 1, fats: 28, fiber: 0, serving: 30 },
  { name: 'Сир рікотта', brand: null, category: 'Молочне', calories: 174, protein: 11, carbs: 3, fats: 13, fiber: 0, serving: 100 },
  { name: 'Сир маскарпоне', brand: null, category: 'Молочне', calories: 412, protein: 5, carbs: 4, fats: 42, fiber: 0, serving: 50 },
  { name: 'Сир сулугуні', brand: null, category: 'Молочне', calories: 286, protein: 20, carbs: 0, fats: 22, fiber: 0, serving: 50 },
  { name: 'Сир плавлений', brand: null, category: 'Молочне', calories: 257, protein: 14, carbs: 4, fats: 21, fiber: 0, serving: 30 },
  { name: 'Йогурт натуральний', brand: null, category: 'Молочне', calories: 68, protein: 4, carbs: 7, fats: 3, fiber: 0, serving: 150 },
  { name: 'Йогурт грецький', brand: null, category: 'Молочне', calories: 97, protein: 9, carbs: 4, fats: 5, fiber: 0, serving: 150 },
  { name: 'Йогурт знежирений', brand: null, category: 'Молочне', calories: 56, protein: 10, carbs: 4, fats: 0, fiber: 0, serving: 150 },
  { name: 'Ряжанка 2.5%', brand: null, category: 'Молочне', calories: 54, protein: 3, carbs: 4, fats: 2.5, fiber: 0, serving: 200 },
  { name: 'Ряжанка 4%', brand: null, category: 'Молочне', calories: 67, protein: 3, carbs: 4, fats: 4, fiber: 0, serving: 200 },
  { name: 'Масло вершкове 72.5%', brand: null, category: 'Молочне', calories: 661, protein: 1, carbs: 1, fats: 72.5, fiber: 0, serving: 10 },
  { name: 'Масло вершкове 82.5%', brand: null, category: 'Молочне', calories: 748, protein: 1, carbs: 1, fats: 82.5, fiber: 0, serving: 10 },
  { name: 'Масло топлене', brand: null, category: 'Молочне', calories: 892, protein: 0, carbs: 0, fats: 99, fiber: 0, serving: 10 },

  // ═══════════════════════════════════════
  //  5. КРУПИ ТА ЗЕРНОВІ
  // ═══════════════════════════════════════
  { name: 'Гречка', brand: null, category: 'Крупи', calories: 343, protein: 13, carbs: 68, fats: 3, fiber: 10, serving: 80 },
  { name: 'Рис білий', brand: null, category: 'Крупи', calories: 344, protein: 7, carbs: 78, fats: 1, fiber: 1, serving: 80 },
  { name: 'Рис бурий', brand: null, category: 'Крупи', calories: 337, protein: 8, carbs: 73, fats: 2, fiber: 3, serving: 80 },
  { name: 'Рис басматі', brand: null, category: 'Крупи', calories: 348, protein: 8, carbs: 77, fats: 1, fiber: 1, serving: 80 },
  { name: 'Рис жасміновий', brand: null, category: 'Крупи', calories: 350, protein: 7, carbs: 79, fats: 1, fiber: 1, serving: 80 },
  { name: 'Вівсянка', brand: null, category: 'Крупи', calories: 379, protein: 12, carbs: 66, fats: 6, fiber: 10, serving: 50 },
  { name: 'Вівсяні пластівці', brand: null, category: 'Крупи', calories: 366, protein: 12, carbs: 62, fats: 6, fiber: 10, serving: 50 },
  { name: 'Пшоно', brand: null, category: 'Крупи', calories: 348, protein: 11, carbs: 69, fats: 3, fiber: 8, serving: 80 },
  { name: 'Перловка', brand: null, category: 'Крупи', calories: 315, protein: 10, carbs: 66, fats: 1, fiber: 15, serving: 80 },
  { name: 'Кускус', brand: null, category: 'Крупи', calories: 376, protein: 13, carbs: 77, fats: 1, fiber: 5, serving: 80 },
  { name: 'Булгур', brand: null, category: 'Крупи', calories: 342, protein: 12, carbs: 76, fats: 1, fiber: 18, serving: 80 },
  { name: 'Манка', brand: null, category: 'Крупи', calories: 333, protein: 10, carbs: 73, fats: 1, fiber: 4, serving: 50 },
  { name: 'Кіноа', brand: null, category: 'Крупи', calories: 368, protein: 14, carbs: 64, fats: 6, fiber: 7, serving: 80 },
  { name: 'Полба', brand: null, category: 'Крупи', calories: 338, protein: 15, carbs: 70, fats: 2, fiber: 11, serving: 80 },
  { name: 'Кукурудзяна крупа', brand: null, category: 'Крупи', calories: 337, protein: 8, carbs: 75, fats: 1, fiber: 4, serving: 80 },
  { name: 'Пшенична крупа', brand: null, category: 'Крупи', calories: 335, protein: 11, carbs: 68, fats: 2, fiber: 5, serving: 80 },
  { name: 'Ячна крупа', brand: null, category: 'Крупи', calories: 324, protein: 10, carbs: 66, fats: 1, fiber: 8, serving: 80 },

  // ═══════════════════════════════════════
  //  6. ХЛІБОБУЛОЧНІ ВИРОБИ
  // ═══════════════════════════════════════
  { name: 'Хліб білий', brand: null, category: 'Хліб', calories: 265, protein: 9, carbs: 49, fats: 3, fiber: 3, serving: 40 },
  { name: 'Хліб чорний', brand: null, category: 'Хліб', calories: 201, protein: 7, carbs: 40, fats: 1, fiber: 6, serving: 40 },
  { name: 'Хліб зерновий', brand: null, category: 'Хліб', calories: 247, protein: 10, carbs: 43, fats: 4, fiber: 7, serving: 40 },
  { name: 'Хліб житній', brand: null, category: 'Хліб', calories: 259, protein: 9, carbs: 48, fats: 3, fiber: 6, serving: 40 },
  { name: 'Хліб бездріжджовий', brand: null, category: 'Хліб', calories: 230, protein: 8, carbs: 45, fats: 2, fiber: 5, serving: 40 },
  { name: 'Хліб тостовий', brand: null, category: 'Хліб', calories: 261, protein: 9, carbs: 49, fats: 3, fiber: 3, serving: 25 },
  { name: 'Батон', brand: null, category: 'Хліб', calories: 262, protein: 8, carbs: 51, fats: 3, fiber: 2, serving: 40 },
  { name: 'Лаваш', brand: null, category: 'Хліб', calories: 275, protein: 9, carbs: 56, fats: 1, fiber: 2, serving: 50 },
  { name: 'Лаваш вірменський (тонкий)', brand: null, category: 'Хліб', calories: 236, protein: 8, carbs: 47, fats: 1, fiber: 2, serving: 70 },
  { name: 'Хлібці житні', brand: null, category: 'Хліб', calories: 310, protein: 10, carbs: 65, fats: 2, fiber: 16, serving: 30 },
  { name: 'Хлібці рисові', brand: null, category: 'Хліб', calories: 387, protein: 7, carbs: 84, fats: 3, fiber: 4, serving: 30 },
  { name: 'Хлібці кукурудзяні', brand: null, category: 'Хліб', calories: 369, protein: 8, carbs: 78, fats: 3, fiber: 5, serving: 30 },
  { name: 'Піта', brand: null, category: 'Хліб', calories: 275, protein: 10, carbs: 55, fats: 1, fiber: 2, serving: 60 },
  { name: 'Тортилья пшенична', brand: null, category: 'Хліб', calories: 312, protein: 8, carbs: 52, fats: 8, fiber: 3, serving: 65 },
  { name: 'Круасан', brand: null, category: 'Хліб', calories: 406, protein: 8, carbs: 45, fats: 21, fiber: 2, serving: 60 },
  { name: 'Бублик', brand: null, category: 'Хліб', calories: 336, protein: 11, carbs: 60, fats: 6, fiber: 3, serving: 90 },
  { name: 'Сухарі пшеничні', brand: null, category: 'Хліб', calories: 331, protein: 11, carbs: 72, fats: 1, fiber: 3, serving: 30 },
  { name: 'Грісіні', brand: null, category: 'Хліб', calories: 412, protein: 12, carbs: 68, fats: 10, fiber: 3, serving: 30 },
  { name: 'Панірувальні сухарі', brand: null, category: 'Хліб', calories: 395, protein: 13, carbs: 72, fats: 5, fiber: 4, serving: 30 },

  // ═══════════════════════════════════════
  //  7. МАКАРОННІ ВИРОБИ
  // ═══════════════════════════════════════
  { name: 'Макарони (сухі)', brand: null, category: 'Макарони', calories: 350, protein: 12, carbs: 71, fats: 1, fiber: 3, serving: 80 },
  { name: 'Макарони з твердих сортів', brand: null, category: 'Макарони', calories: 338, protein: 13, carbs: 68, fats: 2, fiber: 4, serving: 80 },
  { name: 'Спагетті (варені)', brand: null, category: 'Макарони', calories: 131, protein: 5, carbs: 25, fats: 1, fiber: 2, serving: 200 },
  { name: 'Пенне (сухі)', brand: null, category: 'Макарони', calories: 350, protein: 12, carbs: 71, fats: 2, fiber: 3, serving: 80 },
  { name: 'Фузіллі (сухі)', brand: null, category: 'Макарони', calories: 348, protein: 12, carbs: 71, fats: 1, fiber: 3, serving: 80 },
  { name: 'Фетучіні (сухі)', brand: null, category: 'Макарони', calories: 353, protein: 12, carbs: 70, fats: 2, fiber: 3, serving: 80 },
  { name: 'Лазанья (листи)', brand: null, category: 'Макарони', calories: 356, protein: 13, carbs: 72, fats: 1, fiber: 3, serving: 80 },
  { name: 'Рисова локшина', brand: null, category: 'Макарони', calories: 360, protein: 3, carbs: 83, fats: 0, fiber: 2, serving: 80 },
  { name: 'Гречана локшина (соба)', brand: null, category: 'Макарони', calories: 336, protein: 14, carbs: 69, fats: 1, fiber: 3, serving: 80 },
  { name: 'Яєчна локшина', brand: null, category: 'Макарони', calories: 384, protein: 14, carbs: 71, fats: 5, fiber: 3, serving: 80 },
  { name: 'Макарони цільнозернові', brand: null, category: 'Макарони', calories: 348, protein: 15, carbs: 64, fats: 3, fiber: 8, serving: 80 },

  // ═══════════════════════════════════════
  //  8. ОВОЧІ
  // ═══════════════════════════════════════
  { name: 'Картопля', brand: null, category: 'Овочі', calories: 77, protein: 2, carbs: 17, fats: 0, fiber: 2, serving: 150 },
  { name: 'Батат (солодка картопля)', brand: null, category: 'Овочі', calories: 86, protein: 2, carbs: 20, fats: 0, fiber: 3, serving: 150 },
  { name: 'Буряк', brand: null, category: 'Овочі', calories: 42, protein: 2, carbs: 9, fats: 0, fiber: 3, serving: 100 },
  { name: 'Морква', brand: null, category: 'Овочі', calories: 35, protein: 1, carbs: 7, fats: 0, fiber: 3, serving: 100 },
  { name: 'Капуста білокачанна', brand: null, category: 'Овочі', calories: 27, protein: 2, carbs: 5, fats: 0, fiber: 2, serving: 100 },
  { name: 'Капуста цвітна', brand: null, category: 'Овочі', calories: 30, protein: 3, carbs: 4, fats: 0, fiber: 2, serving: 100 },
  { name: 'Капуста пекінська', brand: null, category: 'Овочі', calories: 13, protein: 1, carbs: 2, fats: 0, fiber: 1, serving: 100 },
  { name: 'Капуста червона', brand: null, category: 'Овочі', calories: 26, protein: 2, carbs: 5, fats: 0, fiber: 2, serving: 100 },
  { name: 'Капуста брюссельська', brand: null, category: 'Овочі', calories: 43, protein: 3, carbs: 8, fats: 0, fiber: 4, serving: 100 },
  { name: 'Кольрабі', brand: null, category: 'Овочі', calories: 27, protein: 2, carbs: 6, fats: 0, fiber: 4, serving: 100 },
  { name: 'Броколі', brand: null, category: 'Овочі', calories: 28, protein: 3, carbs: 4, fats: 0, fiber: 3, serving: 100 },
  { name: 'Помідори', brand: null, category: 'Овочі', calories: 20, protein: 1, carbs: 4, fats: 0, fiber: 1, serving: 150 },
  { name: 'Помідори черрі', brand: null, category: 'Овочі', calories: 18, protein: 1, carbs: 4, fats: 0, fiber: 1, serving: 100 },
  { name: 'Огірки', brand: null, category: 'Овочі', calories: 14, protein: 1, carbs: 3, fats: 0, fiber: 1, serving: 100 },
  { name: 'Огірки мариновані', brand: null, category: 'Овочі', calories: 11, protein: 0, carbs: 2, fats: 0, fiber: 1, serving: 50 },
  { name: 'Перець болгарський', brand: null, category: 'Овочі', calories: 27, protein: 1, carbs: 5, fats: 0, fiber: 2, serving: 100 },
  { name: 'Перець чилі', brand: null, category: 'Овочі', calories: 40, protein: 2, carbs: 9, fats: 0, fiber: 2, serving: 10 },
  { name: 'Цибуля', brand: null, category: 'Овочі', calories: 41, protein: 1, carbs: 9, fats: 0, fiber: 2, serving: 80 },
  { name: 'Цибуля червона', brand: null, category: 'Овочі', calories: 42, protein: 1, carbs: 10, fats: 0, fiber: 2, serving: 80 },
  { name: 'Цибуля зелена', brand: null, category: 'Овочі', calories: 32, protein: 2, carbs: 7, fats: 0, fiber: 3, serving: 30 },
  { name: 'Цибуля-порей', brand: null, category: 'Овочі', calories: 33, protein: 2, carbs: 6, fats: 0, fiber: 2, serving: 100 },
  { name: 'Часник', brand: null, category: 'Овочі', calories: 143, protein: 7, carbs: 30, fats: 1, fiber: 2, serving: 10 },
  { name: 'Кабачки', brand: null, category: 'Овочі', calories: 24, protein: 1, carbs: 5, fats: 0, fiber: 1, serving: 150 },
  { name: 'Цукіні', brand: null, category: 'Овочі', calories: 17, protein: 1, carbs: 3, fats: 0, fiber: 1, serving: 150 },
  { name: 'Баклажани', brand: null, category: 'Овочі', calories: 24, protein: 1, carbs: 5, fats: 0, fiber: 3, serving: 150 },
  { name: 'Гарбуз', brand: null, category: 'Овочі', calories: 22, protein: 1, carbs: 5, fats: 0, fiber: 2, serving: 150 },
  { name: 'Патисон', brand: null, category: 'Овочі', calories: 19, protein: 1, carbs: 4, fats: 0, fiber: 1, serving: 100 },
  { name: 'Редиска', brand: null, category: 'Овочі', calories: 20, protein: 1, carbs: 3, fats: 0, fiber: 2, serving: 50 },
  { name: 'Редька', brand: null, category: 'Овочі', calories: 36, protein: 2, carbs: 7, fats: 0, fiber: 2, serving: 100 },
  { name: 'Ріпа', brand: null, category: 'Овочі', calories: 28, protein: 1, carbs: 6, fats: 0, fiber: 2, serving: 100 },
  { name: 'Сельдера (стебло)', brand: null, category: 'Овочі', calories: 16, protein: 1, carbs: 3, fats: 0, fiber: 2, serving: 100 },
  { name: 'Сельдера (корінь)', brand: null, category: 'Овочі', calories: 42, protein: 2, carbs: 9, fats: 0, fiber: 2, serving: 100 },
  { name: 'Пастернак', brand: null, category: 'Овочі', calories: 75, protein: 1, carbs: 18, fats: 0, fiber: 5, serving: 100 },
  { name: 'Топінамбур', brand: null, category: 'Овочі', calories: 73, protein: 2, carbs: 17, fats: 0, fiber: 2, serving: 100 },
  { name: 'Спаржа', brand: null, category: 'Овочі', calories: 21, protein: 2, carbs: 4, fats: 0, fiber: 2, serving: 100 },
  { name: 'Артишок', brand: null, category: 'Овочі', calories: 47, protein: 3, carbs: 11, fats: 0, fiber: 5, serving: 100 },
  { name: 'Фенхель', brand: null, category: 'Овочі', calories: 31, protein: 1, carbs: 7, fats: 0, fiber: 3, serving: 100 },
  { name: 'Гриби печериці', brand: null, category: 'Овочі', calories: 27, protein: 4, carbs: 1, fats: 1, fiber: 2, serving: 100 },
  { name: 'Гриби шампіньйони', brand: null, category: 'Овочі', calories: 27, protein: 4, carbs: 1, fats: 1, fiber: 2, serving: 100 },
  { name: 'Гриби гливи', brand: null, category: 'Овочі', calories: 38, protein: 3, carbs: 4, fats: 0, fiber: 2, serving: 100 },
  { name: 'Гриби білі', brand: null, category: 'Овочі', calories: 34, protein: 4, carbs: 3, fats: 2, fiber: 1, serving: 100 },
  { name: 'Шпинат', brand: null, category: 'Овочі', calories: 22, protein: 3, carbs: 2, fats: 0, fiber: 2, serving: 50 },
  { name: 'Салат листовий', brand: null, category: 'Овочі', calories: 16, protein: 1, carbs: 2, fats: 0, fiber: 1, serving: 50 },
  { name: 'Салат айсберг', brand: null, category: 'Овочі', calories: 14, protein: 1, carbs: 3, fats: 0, fiber: 1, serving: 50 },
  { name: 'Руккола', brand: null, category: 'Овочі', calories: 25, protein: 3, carbs: 4, fats: 1, fiber: 2, serving: 30 },
  { name: 'Щавель', brand: null, category: 'Овочі', calories: 22, protein: 2, carbs: 3, fats: 0, fiber: 3, serving: 50 },
  { name: 'Кінза (коріандр)', brand: null, category: 'Овочі', calories: 23, protein: 2, carbs: 4, fats: 1, fiber: 3, serving: 20 },
  { name: 'Базилік', brand: null, category: 'Овочі', calories: 23, protein: 3, carbs: 3, fats: 1, fiber: 2, serving: 10 },
  { name: 'Укроп', brand: null, category: 'Овочі', calories: 40, protein: 3, carbs: 6, fats: 1, fiber: 2, serving: 10 },
  { name: 'Петрушка', brand: null, category: 'Овочі', calories: 36, protein: 3, carbs: 6, fats: 1, fiber: 3, serving: 10 },
  { name: 'Імбир', brand: null, category: 'Овочі', calories: 80, protein: 2, carbs: 18, fats: 1, fiber: 2, serving: 10 },
  { name: 'Хрін', brand: null, category: 'Овочі', calories: 59, protein: 3, carbs: 12, fats: 0, fiber: 3, serving: 15 },
  { name: 'Оливки зелені', brand: null, category: 'Овочі', calories: 145, protein: 1, carbs: 4, fats: 15, fiber: 3, serving: 30 },
  { name: 'Оливки чорні (маслини)', brand: null, category: 'Овочі', calories: 115, protein: 1, carbs: 6, fats: 11, fiber: 3, serving: 30 },
  { name: 'Кукурудза (консервована)', brand: null, category: 'Овочі', calories: 83, protein: 3, carbs: 16, fats: 1, fiber: 2, serving: 100 },
  { name: 'Горох зелений', brand: null, category: 'Овочі', calories: 73, protein: 5, carbs: 12, fats: 0, fiber: 4, serving: 80 },
  { name: 'Горошок зелений (конс.)', brand: null, category: 'Овочі', calories: 58, protein: 3, carbs: 10, fats: 0, fiber: 4, serving: 100 },
  { name: 'Квашена капуста', brand: null, category: 'Овочі', calories: 19, protein: 1, carbs: 4, fats: 0, fiber: 3, serving: 100 },

  // ═══════════════════════════════════════
  //  9. ФРУКТИ ТА ЯГОДИ
  // ═══════════════════════════════════════
  { name: 'Яблуко', brand: null, category: 'Фрукти', calories: 52, protein: 0, carbs: 14, fats: 0, fiber: 2, serving: 180 },
  { name: 'Банан', brand: null, category: 'Фрукти', calories: 89, protein: 1, carbs: 23, fats: 0, fiber: 3, serving: 120 },
  { name: 'Апельсин', brand: null, category: 'Фрукти', calories: 43, protein: 1, carbs: 9, fats: 0, fiber: 2, serving: 180 },
  { name: 'Мандарин', brand: null, category: 'Фрукти', calories: 38, protein: 1, carbs: 8, fats: 0, fiber: 2, serving: 100 },
  { name: 'Грейпфрут', brand: null, category: 'Фрукти', calories: 35, protein: 1, carbs: 7, fats: 0, fiber: 2, serving: 200 },
  { name: 'Помело', brand: null, category: 'Фрукти', calories: 38, protein: 1, carbs: 10, fats: 0, fiber: 1, serving: 200 },
  { name: 'Лимон', brand: null, category: 'Фрукти', calories: 34, protein: 1, carbs: 9, fats: 0, fiber: 3, serving: 50 },
  { name: 'Лайм', brand: null, category: 'Фрукти', calories: 30, protein: 1, carbs: 11, fats: 0, fiber: 3, serving: 50 },
  { name: 'Виноград', brand: null, category: 'Фрукти', calories: 65, protein: 1, carbs: 17, fats: 0, fiber: 1, serving: 150 },
  { name: 'Груша', brand: null, category: 'Фрукти', calories: 46, protein: 0, carbs: 12, fats: 0, fiber: 3, serving: 180 },
  { name: 'Персик', brand: null, category: 'Фрукти', calories: 39, protein: 1, carbs: 9, fats: 0, fiber: 2, serving: 150 },
  { name: 'Нектарин', brand: null, category: 'Фрукти', calories: 44, protein: 1, carbs: 11, fats: 0, fiber: 2, serving: 140 },
  { name: 'Абрикос', brand: null, category: 'Фрукти', calories: 44, protein: 1, carbs: 9, fats: 0, fiber: 2, serving: 50 },
  { name: 'Слива', brand: null, category: 'Фрукти', calories: 49, protein: 1, carbs: 11, fats: 0, fiber: 2, serving: 80 },
  { name: 'Вишня', brand: null, category: 'Фрукти', calories: 52, protein: 1, carbs: 11, fats: 0, fiber: 2, serving: 120 },
  { name: 'Черешня', brand: null, category: 'Фрукти', calories: 52, protein: 1, carbs: 12, fats: 0, fiber: 2, serving: 120 },
  { name: 'Кавун', brand: null, category: 'Фрукти', calories: 27, protein: 1, carbs: 6, fats: 0, fiber: 0, serving: 300 },
  { name: 'Диня', brand: null, category: 'Фрукти', calories: 33, protein: 1, carbs: 7, fats: 0, fiber: 1, serving: 200 },
  { name: 'Манго', brand: null, category: 'Фрукти', calories: 60, protein: 1, carbs: 15, fats: 0, fiber: 2, serving: 150 },
  { name: 'Ананас', brand: null, category: 'Фрукти', calories: 50, protein: 1, carbs: 13, fats: 0, fiber: 1, serving: 150 },
  { name: 'Ківі', brand: null, category: 'Фрукти', calories: 48, protein: 1, carbs: 10, fats: 0, fiber: 2, serving: 80 },
  { name: 'Хурма', brand: null, category: 'Фрукти', calories: 67, protein: 1, carbs: 15, fats: 0, fiber: 4, serving: 150 },
  { name: 'Гранат', brand: null, category: 'Фрукти', calories: 72, protein: 1, carbs: 14, fats: 1, fiber: 4, serving: 150 },
  { name: 'Авокадо', brand: null, category: 'Фрукти', calories: 160, protein: 2, carbs: 9, fats: 15, fiber: 7, serving: 100 },
  { name: 'Інжир (свіжий)', brand: null, category: 'Фрукти', calories: 74, protein: 1, carbs: 19, fats: 0, fiber: 3, serving: 50 },
  { name: 'Айва', brand: null, category: 'Фрукти', calories: 57, protein: 0, carbs: 15, fats: 0, fiber: 2, serving: 150 },
  { name: 'Папайя', brand: null, category: 'Фрукти', calories: 39, protein: 1, carbs: 10, fats: 0, fiber: 2, serving: 150 },
  { name: 'Маракуйя', brand: null, category: 'Фрукти', calories: 97, protein: 2, carbs: 23, fats: 1, fiber: 10, serving: 50 },
  { name: 'Кокос (мʼякоть)', brand: null, category: 'Фрукти', calories: 354, protein: 3, carbs: 15, fats: 33, fiber: 9, serving: 50 },
  { name: 'Личі', brand: null, category: 'Фрукти', calories: 66, protein: 1, carbs: 17, fats: 0, fiber: 1, serving: 100 },
  { name: 'Полуниця', brand: null, category: 'Фрукти', calories: 32, protein: 1, carbs: 6, fats: 0, fiber: 2, serving: 150 },
  { name: 'Малина', brand: null, category: 'Фрукти', calories: 46, protein: 1, carbs: 8, fats: 1, fiber: 7, serving: 120 },
  { name: 'Чорниця', brand: null, category: 'Фрукти', calories: 44, protein: 1, carbs: 10, fats: 0, fiber: 2, serving: 100 },
  { name: 'Смородина чорна', brand: null, category: 'Фрукти', calories: 44, protein: 1, carbs: 7, fats: 0, fiber: 4, serving: 100 },
  { name: 'Смородина червона', brand: null, category: 'Фрукти', calories: 43, protein: 1, carbs: 8, fats: 0, fiber: 4, serving: 100 },
  { name: 'Аґрус', brand: null, category: 'Фрукти', calories: 43, protein: 1, carbs: 9, fats: 0, fiber: 4, serving: 100 },
  { name: 'Ожина', brand: null, category: 'Фрукти', calories: 34, protein: 1, carbs: 5, fats: 1, fiber: 5, serving: 100 },
  { name: 'Журавлина', brand: null, category: 'Фрукти', calories: 28, protein: 0, carbs: 7, fats: 0, fiber: 4, serving: 100 },
  { name: 'Брусниця', brand: null, category: 'Фрукти', calories: 46, protein: 1, carbs: 8, fats: 0, fiber: 3, serving: 100 },
  { name: 'Фейхоа', brand: null, category: 'Фрукти', calories: 49, protein: 1, carbs: 11, fats: 1, fiber: 6, serving: 50 },

  // ═══════════════════════════════════════
  //  10. ГОРІХИ ТА НАСІННЯ
  // ═══════════════════════════════════════
  { name: 'Мигдаль', brand: null, category: 'Горіхи', calories: 575, protein: 21, carbs: 10, fats: 49, fiber: 12, serving: 30 },
  { name: 'Волоський горіх', brand: null, category: 'Горіхи', calories: 654, protein: 15, carbs: 7, fats: 65, fiber: 7, serving: 30 },
  { name: 'Фундук', brand: null, category: 'Горіхи', calories: 628, protein: 15, carbs: 10, fats: 61, fiber: 10, serving: 30 },
  { name: 'Кешʼю', brand: null, category: 'Горіхи', calories: 553, protein: 18, carbs: 23, fats: 44, fiber: 3, serving: 30 },
  { name: 'Арахіс', brand: null, category: 'Горіхи', calories: 567, protein: 26, carbs: 10, fats: 49, fiber: 9, serving: 30 },
  { name: 'Фісташки', brand: null, category: 'Горіхи', calories: 562, protein: 20, carbs: 17, fats: 45, fiber: 10, serving: 30 },
  { name: 'Кедровий горіх', brand: null, category: 'Горіхи', calories: 673, protein: 14, carbs: 13, fats: 68, fiber: 4, serving: 20 },
  { name: 'Бразильський горіх', brand: null, category: 'Горіхи', calories: 659, protein: 14, carbs: 4, fats: 67, fiber: 8, serving: 20 },
  { name: 'Макадамія', brand: null, category: 'Горіхи', calories: 718, protein: 8, carbs: 5, fats: 76, fiber: 9, serving: 20 },
  { name: 'Пекан', brand: null, category: 'Горіхи', calories: 691, protein: 9, carbs: 4, fats: 72, fiber: 10, serving: 20 },
  { name: 'Насіння соняшнику', brand: null, category: 'Горіхи', calories: 584, protein: 21, carbs: 11, fats: 51, fiber: 9, serving: 30 },
  { name: 'Насіння гарбуза', brand: null, category: 'Горіхи', calories: 559, protein: 30, carbs: 5, fats: 49, fiber: 6, serving: 30 },
  { name: 'Насіння чіа', brand: null, category: 'Горіхи', calories: 486, protein: 17, carbs: 8, fats: 31, fiber: 34, serving: 20 },
  { name: 'Насіння льону', brand: null, category: 'Горіхи', calories: 534, protein: 18, carbs: 2, fats: 42, fiber: 27, serving: 20 },
  { name: 'Кунжут', brand: null, category: 'Горіхи', calories: 573, protein: 18, carbs: 12, fats: 50, fiber: 12, serving: 20 },
  { name: 'Кокосова стружка', brand: null, category: 'Горіхи', calories: 660, protein: 7, carbs: 24, fats: 65, fiber: 16, serving: 20 },
  { name: 'Арахісова паста', brand: null, category: 'Горіхи', calories: 588, protein: 25, carbs: 20, fats: 50, fiber: 6, serving: 30 },
  { name: 'Мигдальна паста', brand: null, category: 'Горіхи', calories: 614, protein: 21, carbs: 12, fats: 56, fiber: 10, serving: 30 },

  // ═══════════════════════════════════════
  //  11. ОЛІЇ ТА ЖИРИ
  // ═══════════════════════════════════════
  { name: 'Олія соняшникова', brand: null, category: 'Олії', calories: 899, protein: 0, carbs: 0, fats: 100, fiber: 0, serving: 10 },
  { name: 'Олія оливкова', brand: null, category: 'Олії', calories: 884, protein: 0, carbs: 0, fats: 100, fiber: 0, serving: 10 },
  { name: 'Олія кокосова', brand: null, category: 'Олії', calories: 892, protein: 0, carbs: 0, fats: 99, fiber: 0, serving: 10 },
  { name: 'Олія лляна', brand: null, category: 'Олії', calories: 884, protein: 0, carbs: 0, fats: 100, fiber: 0, serving: 10 },
  { name: 'Олія кунжутна', brand: null, category: 'Олії', calories: 884, protein: 0, carbs: 0, fats: 100, fiber: 0, serving: 10 },
  { name: 'Олія з виноградних кісточок', brand: null, category: 'Олії', calories: 884, protein: 0, carbs: 0, fats: 100, fiber: 0, serving: 10 },
  { name: 'Олія авокадо', brand: null, category: 'Олії', calories: 884, protein: 0, carbs: 0, fats: 100, fiber: 0, serving: 10 },
  { name: 'Олія гарбузова', brand: null, category: 'Олії', calories: 896, protein: 0, carbs: 0, fats: 100, fiber: 0, serving: 10 },
  { name: 'Маргарин', brand: null, category: 'Олії', calories: 717, protein: 0, carbs: 1, fats: 80, fiber: 0, serving: 10 },

  // ═══════════════════════════════════════
  //  12–19. (БОБОВІ, СОУСИ, СПЕЦІЇ, НАПОЇ, СОЛОДОЩІ, СУХОФРУКТИ, БОРОШНО, ГОТОВІ СТРАВИ, СНЕКИ, СПОРТХАРЧ)
  // ═══════════════════════════════════════

  // Бобові
  { name: 'Квасоля біла (суха)', brand: null, category: 'Бобові', calories: 333, protein: 21, carbs: 47, fats: 2, fiber: 15, serving: 80 },
  { name: 'Квасоля червона (суха)', brand: null, category: 'Бобові', calories: 337, protein: 22, carbs: 46, fats: 2, fiber: 15, serving: 80 },
  { name: 'Квасоля (варена)', brand: null, category: 'Бобові', calories: 127, protein: 9, carbs: 21, fats: 1, fiber: 6, serving: 150 },
  { name: 'Квасоля червона (конс.)', brand: null, category: 'Бобові', calories: 99, protein: 7, carbs: 17, fats: 0, fiber: 6, serving: 100 },
  { name: 'Сочевиця (суха)', brand: null, category: 'Бобові', calories: 352, protein: 25, carbs: 52, fats: 1, fiber: 11, serving: 80 },
  { name: 'Сочевиця (варена)', brand: null, category: 'Бобові', calories: 116, protein: 9, carbs: 20, fats: 0, fiber: 8, serving: 150 },
  { name: 'Сочевиця червона', brand: null, category: 'Бобові', calories: 358, protein: 24, carbs: 60, fats: 1, fiber: 11, serving: 80 },
  { name: 'Нут (сухий)', brand: null, category: 'Бобові', calories: 364, protein: 19, carbs: 46, fats: 6, fiber: 17, serving: 80 },
  { name: 'Нут (варений)', brand: null, category: 'Бобові', calories: 164, protein: 9, carbs: 27, fats: 3, fiber: 8, serving: 150 },
  { name: 'Маш (сухий)', brand: null, category: 'Бобові', calories: 347, protein: 24, carbs: 46, fats: 1, fiber: 16, serving: 80 },
  { name: 'Соя', brand: null, category: 'Бобові', calories: 446, protein: 36, carbs: 11, fats: 20, fiber: 9, serving: 80 },
  { name: 'Тофу', brand: null, category: 'Бобові', calories: 76, protein: 8, carbs: 2, fats: 5, fiber: 0, serving: 100 },
  { name: 'Едамаме', brand: null, category: 'Бобові', calories: 121, protein: 11, carbs: 9, fats: 5, fiber: 5, serving: 100 },
  { name: 'Горох (сухий)', brand: null, category: 'Бобові', calories: 298, protein: 20, carbs: 50, fats: 2, fiber: 25, serving: 80 },

  // Соуси та приправи
  { name: 'Кетчуп', brand: null, category: 'Соуси', calories: 101, protein: 1, carbs: 24, fats: 0, fiber: 0, serving: 30 },
  { name: 'Майонез', brand: null, category: 'Соуси', calories: 680, protein: 1, carbs: 1, fats: 75, fiber: 0, serving: 20 },
  { name: 'Майонез легкий', brand: null, category: 'Соуси', calories: 260, protein: 1, carbs: 8, fats: 25, fiber: 0, serving: 20 },
  { name: 'Гірчиця', brand: null, category: 'Соуси', calories: 60, protein: 4, carbs: 3, fats: 3, fiber: 3, serving: 10 },
  { name: 'Соєвий соус', brand: null, category: 'Соуси', calories: 53, protein: 8, carbs: 5, fats: 0, fiber: 0, serving: 15 },
  { name: 'Мед', brand: null, category: 'Соуси', calories: 329, protein: 0, carbs: 82, fats: 0, fiber: 0, serving: 20 },
  { name: 'Хумус', brand: null, category: 'Соуси', calories: 166, protein: 8, carbs: 14, fats: 10, fiber: 6, serving: 50 },
  { name: 'Тахіні (кунжутна паста)', brand: null, category: 'Соуси', calories: 595, protein: 17, carbs: 11, fats: 54, fiber: 9, serving: 30 },
  { name: 'Томатна паста', brand: null, category: 'Соуси', calories: 82, protein: 4, carbs: 19, fats: 0, fiber: 4, serving: 30 },
  { name: 'Соус теріякі', brand: null, category: 'Соуси', calories: 89, protein: 6, carbs: 16, fats: 0, fiber: 0, serving: 30 },
  { name: 'Соус BBQ', brand: null, category: 'Соуси', calories: 172, protein: 1, carbs: 40, fats: 1, fiber: 1, serving: 30 },
  { name: 'Соус песто', brand: null, category: 'Соуси', calories: 420, protein: 6, carbs: 4, fats: 42, fiber: 2, serving: 30 },
  { name: 'Гуакамоле', brand: null, category: 'Соуси', calories: 160, protein: 2, carbs: 9, fats: 15, fiber: 7, serving: 50 },
  { name: 'Аджика', brand: null, category: 'Соуси', calories: 59, protein: 1, carbs: 12, fats: 1, fiber: 3, serving: 20 },
  { name: 'Ткемалі', brand: null, category: 'Соуси', calories: 130, protein: 1, carbs: 32, fats: 0, fiber: 0, serving: 20 },
  { name: 'Васабі', brand: null, category: 'Соуси', calories: 109, protein: 5, carbs: 24, fats: 0, fiber: 0, serving: 5 },
  { name: 'Оцет яблучний', brand: null, category: 'Соуси', calories: 21, protein: 0, carbs: 1, fats: 0, fiber: 0, serving: 15 },
  { name: 'Бальзамічний оцет', brand: null, category: 'Соуси', calories: 88, protein: 0, carbs: 17, fats: 0, fiber: 0, serving: 15 },

  // Спеції
  { name: 'Сіль', brand: null, category: 'Спеції', calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, serving: 5 },
  { name: 'Перець чорний мелений', brand: null, category: 'Спеції', calories: 251, protein: 10, carbs: 39, fats: 3, fiber: 26, serving: 2 },
  { name: 'Паприка', brand: null, category: 'Спеції', calories: 282, protein: 14, carbs: 34, fats: 13, fiber: 34, serving: 3 },
  { name: 'Куркума', brand: null, category: 'Спеції', calories: 354, protein: 8, carbs: 65, fats: 10, fiber: 21, serving: 3 },
  { name: 'Кориця', brand: null, category: 'Спеції', calories: 247, protein: 4, carbs: 56, fats: 1, fiber: 53, serving: 3 },
  { name: 'Мускатний горіх', brand: null, category: 'Спеції', calories: 525, protein: 6, carbs: 28, fats: 36, fiber: 21, serving: 2 },
  { name: 'Кмин (зіра)', brand: null, category: 'Спеції', calories: 375, protein: 18, carbs: 44, fats: 22, fiber: 11, serving: 3 },
  { name: 'Орегано', brand: null, category: 'Спеції', calories: 265, protein: 9, carbs: 43, fats: 4, fiber: 43, serving: 2 },
  { name: 'Розмарин', brand: null, category: 'Спеції', calories: 131, protein: 3, carbs: 21, fats: 6, fiber: 14, serving: 2 },
  { name: 'Лавровий лист', brand: null, category: 'Спеції', calories: 313, protein: 8, carbs: 48, fats: 8, fiber: 26, serving: 1 },

  // Напої
  { name: 'Вода', brand: null, category: 'Напої', calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, serving: 250 },
  { name: 'Кава (чорна)', brand: null, category: 'Напої', calories: 2, protein: 0, carbs: 0, fats: 0, fiber: 0, serving: 200 },
  { name: 'Кава з молоком', brand: null, category: 'Напої', calories: 58, protein: 3, carbs: 5, fats: 3, fiber: 0, serving: 200 },
  { name: 'Капучіно', brand: null, category: 'Напої', calories: 45, protein: 3, carbs: 4, fats: 2, fiber: 0, serving: 200 },
  { name: 'Лате', brand: null, category: 'Напої', calories: 56, protein: 3, carbs: 5, fats: 3, fiber: 0, serving: 250 },
  { name: 'Еспресо', brand: null, category: 'Напої', calories: 2, protein: 0, carbs: 0, fats: 0, fiber: 0, serving: 30 },
  { name: 'Чай (без цукру)', brand: null, category: 'Напої', calories: 1, protein: 0, carbs: 0, fats: 0, fiber: 0, serving: 200 },
  { name: 'Чай зелений', brand: null, category: 'Напої', calories: 1, protein: 0, carbs: 0, fats: 0, fiber: 0, serving: 200 },
  { name: 'Какао на молоці', brand: null, category: 'Напої', calories: 79, protein: 4, carbs: 10, fats: 3, fiber: 1, serving: 200 },
  { name: 'Какао-порошок', brand: null, category: 'Напої', calories: 374, protein: 24, carbs: 12, fats: 15, fiber: 35, serving: 15 },
  { name: 'Сік апельсиновий', brand: null, category: 'Напої', calories: 45, protein: 1, carbs: 10, fats: 0, fiber: 0, serving: 200 },
  { name: 'Сік яблучний', brand: null, category: 'Напої', calories: 46, protein: 0, carbs: 11, fats: 0, fiber: 0, serving: 200 },
  { name: 'Сік томатний', brand: null, category: 'Напої', calories: 18, protein: 1, carbs: 4, fats: 0, fiber: 0, serving: 200 },
  { name: 'Сік гранатовий', brand: null, category: 'Напої', calories: 54, protein: 0, carbs: 13, fats: 0, fiber: 0, serving: 200 },
  { name: 'Сік виноградний', brand: null, category: 'Напої', calories: 60, protein: 0, carbs: 14, fats: 0, fiber: 0, serving: 200 },
  { name: 'Компот (без цукру)', brand: null, category: 'Напої', calories: 30, protein: 0, carbs: 7, fats: 0, fiber: 0, serving: 200 },
  { name: 'Квас', brand: null, category: 'Напої', calories: 27, protein: 0, carbs: 5, fats: 0, fiber: 0, serving: 250 },
  { name: 'Смузі (фруктовий)', brand: null, category: 'Напої', calories: 55, protein: 1, carbs: 13, fats: 0, fiber: 2, serving: 300 },
  { name: 'Молоко вівсяне', brand: null, category: 'Напої', calories: 47, protein: 1, carbs: 7, fats: 2, fiber: 1, serving: 200 },
  { name: 'Молоко мигдальне', brand: null, category: 'Напої', calories: 24, protein: 1, carbs: 3, fats: 1, fiber: 0, serving: 200 },
  { name: 'Молоко соєве', brand: null, category: 'Напої', calories: 44, protein: 3, carbs: 4, fats: 2, fiber: 0, serving: 200 },
  { name: 'Молоко кокосове', brand: null, category: 'Напої', calories: 19, protein: 0, carbs: 3, fats: 1, fiber: 0, serving: 200 },
  { name: 'Кола', brand: 'Coca-Cola', category: 'Напої', calories: 42, protein: 0, carbs: 11, fats: 0, fiber: 0, serving: 330 },
  { name: 'Кола Зеро', brand: 'Coca-Cola', category: 'Напої', calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, serving: 330 },

  // Солодощі та кондитерка
  { name: 'Шоколад чорний 70%', brand: null, category: 'Солодощі', calories: 530, protein: 6, carbs: 40, fats: 40, fiber: 8, serving: 25 },
  { name: 'Шоколад чорний 85%', brand: null, category: 'Солодощі', calories: 546, protein: 8, carbs: 30, fats: 43, fiber: 11, serving: 25 },
  { name: 'Шоколад молочний', brand: null, category: 'Солодощі', calories: 535, protein: 8, carbs: 55, fats: 32, fiber: 2, serving: 25 },
  { name: 'Шоколад білий', brand: null, category: 'Солодощі', calories: 539, protein: 6, carbs: 59, fats: 32, fiber: 0, serving: 25 },
  { name: 'Цукор', brand: null, category: 'Солодощі', calories: 387, protein: 0, carbs: 100, fats: 0, fiber: 0, serving: 10 },
  { name: 'Цукор коричневий', brand: null, category: 'Солодощі', calories: 380, protein: 0, carbs: 98, fats: 0, fiber: 0, serving: 10 },
  { name: 'Цукрозамінник (стевія)', brand: null, category: 'Солодощі', calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, serving: 1 },
  { name: 'Зефір', brand: null, category: 'Солодощі', calories: 326, protein: 1, carbs: 79, fats: 0, fiber: 0, serving: 40 },
  { name: 'Пастила', brand: null, category: 'Солодощі', calories: 310, protein: 1, carbs: 76, fats: 0, fiber: 1, serving: 40 },
  { name: 'Мармелад', brand: null, category: 'Солодощі', calories: 321, protein: 0, carbs: 80, fats: 0, fiber: 0, serving: 30 },
  { name: 'Халва соняшникова', brand: null, category: 'Солодощі', calories: 516, protein: 12, carbs: 54, fats: 30, fiber: 6, serving: 30 },
  { name: 'Козинаки', brand: null, category: 'Солодощі', calories: 530, protein: 12, carbs: 52, fats: 32, fiber: 5, serving: 30 },
  { name: 'Рахат-лукум', brand: null, category: 'Солодощі', calories: 316, protein: 1, carbs: 79, fats: 1, fiber: 0, serving: 30 },
  { name: 'Варення', brand: null, category: 'Солодощі', calories: 278, protein: 0, carbs: 68, fats: 0, fiber: 0, serving: 30 },
  { name: 'Джем', brand: null, category: 'Солодощі', calories: 250, protein: 0, carbs: 61, fats: 0, fiber: 1, serving: 30 },
  { name: 'Круасан з шоколадом', brand: null, category: 'Солодощі', calories: 440, protein: 7, carbs: 50, fats: 24, fiber: 2, serving: 70 },
  { name: 'Еклер', brand: null, category: 'Солодощі', calories: 262, protein: 5, carbs: 24, fats: 16, fiber: 0, serving: 80 },
  { name: 'Пончик', brand: null, category: 'Солодощі', calories: 421, protein: 5, carbs: 53, fats: 21, fiber: 2, serving: 60 },
  { name: 'Торт Наполеон', brand: null, category: 'Солодощі', calories: 380, protein: 5, carbs: 40, fats: 23, fiber: 0, serving: 100 },
  { name: 'Тістечко Тірамісу', brand: null, category: 'Солодощі', calories: 283, protein: 5, carbs: 28, fats: 17, fiber: 0, serving: 100 },
  { name: 'Чізкейк', brand: null, category: 'Солодощі', calories: 350, protein: 6, carbs: 27, fats: 25, fiber: 0, serving: 100 },
  { name: 'Вафлі', brand: null, category: 'Солодощі', calories: 396, protein: 6, carbs: 58, fats: 16, fiber: 1, serving: 50 },
  { name: 'Печиво пісочне', brand: null, category: 'Солодощі', calories: 458, protein: 7, carbs: 62, fats: 21, fiber: 1, serving: 30 },
  { name: 'Печиво вівсяне', brand: null, category: 'Солодощі', calories: 437, protein: 7, carbs: 65, fats: 18, fiber: 3, serving: 30 },
  { name: 'Морозиво пломбір', brand: null, category: 'Солодощі', calories: 227, protein: 4, carbs: 23, fats: 13, fiber: 0, serving: 100 },
  { name: 'Морозиво ванільне', brand: null, category: 'Солодощі', calories: 207, protein: 4, carbs: 24, fats: 11, fiber: 0, serving: 100 },
  { name: 'Морозиво фруктове', brand: null, category: 'Солодощі', calories: 127, protein: 2, carbs: 28, fats: 1, fiber: 1, serving: 100 },

  // Сухофрукти
  { name: 'Курага', brand: null, category: 'Сухофрукти', calories: 232, protein: 5, carbs: 51, fats: 0, fiber: 18, serving: 40 },
  { name: 'Чорнослив', brand: null, category: 'Сухофрукти', calories: 231, protein: 2, carbs: 57, fats: 0, fiber: 9, serving: 40 },
  { name: 'Родзинки', brand: null, category: 'Сухофрукти', calories: 299, protein: 3, carbs: 79, fats: 0, fiber: 4, serving: 40 },
  { name: 'Фініки', brand: null, category: 'Сухофрукти', calories: 282, protein: 2, carbs: 69, fats: 0, fiber: 8, serving: 40 },
  { name: 'Інжир сушений', brand: null, category: 'Сухофрукти', calories: 249, protein: 3, carbs: 58, fats: 1, fiber: 10, serving: 40 },
  { name: 'Журавлина сушена', brand: null, category: 'Сухофрукти', calories: 308, protein: 0, carbs: 82, fats: 1, fiber: 6, serving: 30 },
  { name: 'Манго сушене', brand: null, category: 'Сухофрукти', calories: 319, protein: 2, carbs: 78, fats: 1, fiber: 2, serving: 30 },
  { name: 'Банани сушені', brand: null, category: 'Сухофрукти', calories: 346, protein: 4, carbs: 89, fats: 1, fiber: 10, serving: 30 },

  // Борошно
  { name: 'Борошно пшеничне вищий гатунок', brand: null, category: 'Борошно', calories: 334, protein: 10, carbs: 68, fats: 1, fiber: 3, serving: 30 },
  { name: 'Борошно пшеничне цільнозернове', brand: null, category: 'Борошно', calories: 340, protein: 13, carbs: 62, fats: 3, fiber: 11, serving: 30 },
  { name: 'Борошно кукурудзяне', brand: null, category: 'Борошно', calories: 331, protein: 7, carbs: 73, fats: 2, fiber: 5, serving: 30 },
  { name: 'Борошно вівсяне', brand: null, category: 'Борошно', calories: 369, protein: 13, carbs: 65, fats: 7, fiber: 7, serving: 30 },
  { name: 'Борошно рисове', brand: null, category: 'Борошно', calories: 366, protein: 6, carbs: 80, fats: 1, fiber: 2, serving: 30 },
  { name: 'Борошно гречане', brand: null, category: 'Борошно', calories: 335, protein: 13, carbs: 62, fats: 3, fiber: 10, serving: 30 },
  { name: 'Борошно мигдальне', brand: null, category: 'Борошно', calories: 590, protein: 21, carbs: 10, fats: 50, fiber: 10, serving: 30 },
  { name: 'Борошно кокосове', brand: null, category: 'Борошно', calories: 443, protein: 19, carbs: 22, fats: 15, fiber: 39, serving: 20 },
  { name: 'Крохмаль картопляний', brand: null, category: 'Борошно', calories: 313, protein: 0, carbs: 79, fats: 0, fiber: 0, serving: 15 },
  { name: 'Крохмаль кукурудзяний', brand: null, category: 'Борошно', calories: 381, protein: 0, carbs: 91, fats: 0, fiber: 1, serving: 15 },
  { name: 'Дріжджі сухі', brand: null, category: 'Борошно', calories: 325, protein: 40, carbs: 35, fats: 7, fiber: 27, serving: 7 },
  { name: 'Желатин', brand: null, category: 'Борошно', calories: 355, protein: 87, carbs: 0, fats: 0, fiber: 0, serving: 10 },
  { name: 'Розпушувач', brand: null, category: 'Борошно', calories: 53, protein: 0, carbs: 28, fats: 0, fiber: 0, serving: 5 },

  // Готові страви
  { name: 'Борщ з мʼясом', brand: null, category: 'Готові страви', calories: 49, protein: 3, carbs: 4, fats: 2, fiber: 1, serving: 300 },
  { name: 'Борщ зелений', brand: null, category: 'Готові страви', calories: 37, protein: 3, carbs: 3, fats: 2, fiber: 1, serving: 300 },
  { name: 'Суп курячий', brand: null, category: 'Готові страви', calories: 36, protein: 3, carbs: 3, fats: 1, fiber: 0, serving: 300 },
  { name: 'Суп грибний', brand: null, category: 'Готові страви', calories: 34, protein: 2, carbs: 4, fats: 1, fiber: 1, serving: 300 },
  { name: 'Суп гороховий', brand: null, category: 'Готові страви', calories: 53, protein: 4, carbs: 7, fats: 1, fiber: 2, serving: 300 },
  { name: 'Суп-пюре з гарбуза', brand: null, category: 'Готові страви', calories: 40, protein: 1, carbs: 6, fats: 2, fiber: 1, serving: 300 },
  { name: 'Солянка', brand: null, category: 'Готові страви', calories: 46, protein: 4, carbs: 2, fats: 3, fiber: 0, serving: 300 },
  { name: 'Окрошка', brand: null, category: 'Готові страви', calories: 45, protein: 3, carbs: 4, fats: 2, fiber: 1, serving: 300 },
  { name: 'Вареники з картоплею', brand: null, category: 'Готові страви', calories: 148, protein: 4, carbs: 24, fats: 4, fiber: 2, serving: 200 },
  { name: 'Вареники з сиром', brand: null, category: 'Готові страви', calories: 196, protein: 11, carbs: 26, fats: 5, fiber: 1, serving: 200 },
  { name: 'Вареники з вишнею', brand: null, category: 'Готові страви', calories: 165, protein: 4, carbs: 30, fats: 3, fiber: 1, serving: 200 },
  { name: 'Пельмені', brand: null, category: 'Готові страви', calories: 224, protein: 11, carbs: 25, fats: 8, fiber: 1, serving: 200 },
  { name: 'Голубці', brand: null, category: 'Готові страви', calories: 108, protein: 6, carbs: 10, fats: 5, fiber: 2, serving: 200 },
  { name: 'Котлета куряча', brand: null, category: 'Готові страви', calories: 175, protein: 18, carbs: 6, fats: 9, fiber: 0, serving: 100 },
  { name: 'Котлета свиняча', brand: null, category: 'Готові страви', calories: 285, protein: 15, carbs: 8, fats: 22, fiber: 0, serving: 100 },
  { name: 'Котлета по-київськи', brand: null, category: 'Готові страви', calories: 290, protein: 18, carbs: 10, fats: 20, fiber: 0, serving: 150 },
  { name: 'Омлет', brand: null, category: 'Готові страви', calories: 154, protein: 10, carbs: 2, fats: 12, fiber: 0, serving: 120 },
  { name: 'Яєчня', brand: null, category: 'Готові страви', calories: 196, protein: 13, carbs: 1, fats: 15, fiber: 0, serving: 120 },
  { name: 'Сирники', brand: null, category: 'Готові страви', calories: 183, protein: 12, carbs: 16, fats: 8, fiber: 0, serving: 150 },
  { name: 'Млинці з сиром', brand: null, category: 'Готові страви', calories: 195, protein: 9, carbs: 21, fats: 9, fiber: 0, serving: 150 },
  { name: 'Млинці з мʼясом', brand: null, category: 'Готові страви', calories: 220, protein: 13, carbs: 18, fats: 11, fiber: 0, serving: 150 },
  { name: 'Деруни (драники)', brand: null, category: 'Готові страви', calories: 180, protein: 3, carbs: 23, fats: 9, fiber: 2, serving: 150 },
  { name: 'Оладки', brand: null, category: 'Готові страви', calories: 213, protein: 7, carbs: 28, fats: 8, fiber: 1, serving: 100 },
  { name: 'Салат Цезар', brand: null, category: 'Готові страви', calories: 127, protein: 7, carbs: 5, fats: 9, fiber: 1, serving: 200 },
  { name: 'Салат Олівʼє', brand: null, category: 'Готові страви', calories: 198, protein: 4, carbs: 8, fats: 17, fiber: 2, serving: 200 },
  { name: 'Салат Грецький', brand: null, category: 'Готові страви', calories: 87, protein: 3, carbs: 5, fats: 6, fiber: 1, serving: 200 },
  { name: 'Салат Вінегрет', brand: null, category: 'Готові страви', calories: 76, protein: 2, carbs: 10, fats: 3, fiber: 2, serving: 200 },
  { name: 'Каша гречана на воді', brand: null, category: 'Готові страви', calories: 101, protein: 4, carbs: 21, fats: 1, fiber: 3, serving: 200 },
  { name: 'Каша вівсяна на молоці', brand: null, category: 'Готові страви', calories: 102, protein: 3, carbs: 15, fats: 3, fiber: 2, serving: 250 },
  { name: 'Каша вівсяна на воді', brand: null, category: 'Готові страви', calories: 73, protein: 3, carbs: 14, fats: 1, fiber: 2, serving: 250 },
  { name: 'Каша рисова на молоці', brand: null, category: 'Готові страви', calories: 97, protein: 3, carbs: 16, fats: 2, fiber: 0, serving: 250 },
  { name: 'Каша манна на молоці', brand: null, category: 'Готові страви', calories: 98, protein: 3, carbs: 16, fats: 3, fiber: 0, serving: 250 },
  { name: 'Каша пшенична на воді', brand: null, category: 'Готові страви', calories: 90, protein: 3, carbs: 18, fats: 1, fiber: 1, serving: 200 },
  { name: 'Картопляне пюре', brand: null, category: 'Готові страви', calories: 106, protein: 2, carbs: 16, fats: 4, fiber: 2, serving: 200 },
  { name: 'Картопля смажена', brand: null, category: 'Готові страви', calories: 192, protein: 3, carbs: 24, fats: 10, fiber: 2, serving: 150 },
  { name: 'Картопля фрі', brand: null, category: 'Готові страви', calories: 312, protein: 4, carbs: 37, fats: 17, fiber: 3, serving: 150 },
  { name: 'Плов з курятиною', brand: null, category: 'Готові страви', calories: 150, protein: 9, carbs: 18, fats: 5, fiber: 1, serving: 250 },
  { name: 'Рагу овочеве', brand: null, category: 'Готові страви', calories: 52, protein: 2, carbs: 7, fats: 2, fiber: 2, serving: 200 },
  { name: 'Піца Маргарита', brand: null, category: 'Готові страви', calories: 250, protein: 11, carbs: 28, fats: 10, fiber: 2, serving: 150 },
  { name: 'Піца з мʼясом', brand: null, category: 'Готові страви', calories: 290, protein: 14, carbs: 28, fats: 14, fiber: 2, serving: 150 },
  { name: 'Бургер', brand: null, category: 'Готові страви', calories: 264, protein: 14, carbs: 24, fats: 12, fiber: 2, serving: 200 },
  { name: 'Шаурма', brand: null, category: 'Готові страви', calories: 210, protein: 10, carbs: 18, fats: 11, fiber: 2, serving: 250 },
  { name: 'Хот-дог', brand: null, category: 'Готові страви', calories: 260, protein: 10, carbs: 24, fats: 14, fiber: 1, serving: 150 },
  { name: 'Наггетси курячі', brand: null, category: 'Готові страви', calories: 296, protein: 16, carbs: 18, fats: 18, fiber: 1, serving: 100 },
  { name: 'Суші (роли з лососем)', brand: null, category: 'Готові страви', calories: 145, protein: 7, carbs: 21, fats: 3, fiber: 1, serving: 100 },
  { name: 'Стейк з лосося', brand: null, category: 'Готові страви', calories: 206, protein: 22, carbs: 0, fats: 13, fiber: 0, serving: 150 },
  { name: 'Макарони по-флотськи', brand: null, category: 'Готові страви', calories: 158, protein: 8, carbs: 17, fats: 6, fiber: 1, serving: 200 },
  { name: 'Лазанья', brand: null, category: 'Готові страви', calories: 135, protein: 8, carbs: 14, fats: 5, fiber: 1, serving: 250 },
  { name: 'Тушонка (яловича)', brand: null, category: 'Готові страви', calories: 217, protein: 15, carbs: 0, fats: 17, fiber: 0, serving: 100 },

  // Снеки
  { name: 'Чіпси картопляні', brand: null, category: 'Снеки', calories: 536, protein: 7, carbs: 53, fats: 33, fiber: 4, serving: 30 },
  { name: 'Попкорн (без масла)', brand: null, category: 'Снеки', calories: 382, protein: 13, carbs: 62, fats: 5, fiber: 15, serving: 30 },
  { name: 'Сухарики', brand: null, category: 'Снеки', calories: 395, protein: 12, carbs: 72, fats: 7, fiber: 3, serving: 30 },
  { name: 'Крекери', brand: null, category: 'Снеки', calories: 440, protein: 10, carbs: 62, fats: 17, fiber: 2, serving: 30 },
  { name: 'Палички кукурудзяні', brand: null, category: 'Снеки', calories: 518, protein: 6, carbs: 58, fats: 30, fiber: 2, serving: 30 },
  { name: 'Гранола', brand: null, category: 'Снеки', calories: 471, protein: 10, carbs: 64, fats: 20, fiber: 7, serving: 50 },
  { name: 'Батончик-мюслі', brand: null, category: 'Снеки', calories: 420, protein: 8, carbs: 60, fats: 17, fiber: 5, serving: 35 },

  // Спортивне харчування
  { name: 'Протеїн сироватковий', brand: null, category: 'Спортхарч', calories: 375, protein: 80, carbs: 6, fats: 3, fiber: 0, serving: 30 },
  { name: 'Казеїн', brand: null, category: 'Спортхарч', calories: 360, protein: 75, carbs: 5, fats: 2, fiber: 0, serving: 30 },
  { name: 'Гейнер', brand: null, category: 'Спортхарч', calories: 400, protein: 20, carbs: 70, fats: 5, fiber: 2, serving: 100 },
  { name: 'Протеїновий батончик', brand: null, category: 'Спортхарч', calories: 360, protein: 30, carbs: 35, fats: 12, fiber: 5, serving: 60 },
  { name: 'BCAA (порошок)', brand: null, category: 'Спортхарч', calories: 10, protein: 5, carbs: 0, fats: 0, fiber: 0, serving: 10 },

  // ═══════════════════════════════════════════════════════════════
  //  BRANDED PRODUCTS — УКРАЇНСЬКІ БРЕНДИ
  // ═══════════════════════════════════════════════════════════════

  // Наша Ряба
  { name: 'Філе куряче', brand: 'Наша Ряба', category: 'Мʼясо', calories: 110, protein: 23, carbs: 0, fats: 1, fiber: 0, serving: 100 },
  { name: 'Стегно куряче', brand: 'Наша Ряба', category: 'Мʼясо', calories: 185, protein: 18, carbs: 0, fats: 12, fiber: 0, serving: 100 },
  { name: 'Крильця курячі', brand: 'Наша Ряба', category: 'Мʼясо', calories: 222, protein: 18, carbs: 0, fats: 16, fiber: 0, serving: 100 },
  { name: 'Гомілки курячі', brand: 'Наша Ряба', category: 'Мʼясо', calories: 173, protein: 18, carbs: 0, fats: 11, fiber: 0, serving: 100 },
  { name: 'Фарш курячий', brand: 'Наша Ряба', category: 'Мʼясо', calories: 143, protein: 17, carbs: 0, fats: 8, fiber: 0, serving: 100 },

  // Гаврилівські курчата
  { name: 'Філе куряче', brand: 'Гаврилівські курчата', category: 'Мʼясо', calories: 112, protein: 23, carbs: 0, fats: 2, fiber: 0, serving: 100 },
  { name: 'Стегно куряче', brand: 'Гаврилівські курчата', category: 'Мʼясо', calories: 183, protein: 18, carbs: 0, fats: 12, fiber: 0, serving: 100 },

  // Глобіно
  { name: 'Сосиски «Молочні»', brand: 'Глобіно', category: 'Ковбаси', calories: 266, protein: 11, carbs: 2, fats: 24, fiber: 0, serving: 50 },
  { name: 'Ковбаса варена «Лікарська»', brand: 'Глобіно', category: 'Ковбаси', calories: 257, protein: 13, carbs: 2, fats: 22, fiber: 0, serving: 50 },
  { name: 'Шинка «Святкова»', brand: 'Глобіно', category: 'Ковбаси', calories: 148, protein: 19, carbs: 1, fats: 7, fiber: 0, serving: 50 },
  { name: 'Паштет печінковий', brand: 'Глобіно', category: 'Ковбаси', calories: 305, protein: 12, carbs: 4, fats: 27, fiber: 0, serving: 50 },

  // Бащинський
  { name: 'Сосиски курячі', brand: 'Бащинський', category: 'Ковбаси', calories: 200, protein: 14, carbs: 3, fats: 15, fiber: 0, serving: 50 },
  { name: 'Ковбаса варена «Молочна»', brand: 'Бащинський', category: 'Ковбаси', calories: 252, protein: 11, carbs: 2, fats: 22, fiber: 0, serving: 50 },
  { name: 'Сосиски «Баварські»', brand: 'Бащинський', category: 'Ковбаси', calories: 280, protein: 12, carbs: 3, fats: 25, fiber: 0, serving: 80 },

  // Алан
  { name: 'Ковбаса копчена «Салямі»', brand: 'Алан', category: 'Ковбаси', calories: 430, protein: 21, carbs: 1, fats: 38, fiber: 0, serving: 30 },
  { name: 'Ковбаса напівкопчена «Краківська»', brand: 'Алан', category: 'Ковбаси', calories: 370, protein: 17, carbs: 1, fats: 33, fiber: 0, serving: 30 },

  // Яготинське
  { name: 'Молоко 2.5%', brand: 'Яготинське', category: 'Молочне', calories: 52, protein: 3, carbs: 5, fats: 2.5, fiber: 0, serving: 250 },
  { name: 'Молоко безлактозне 2.5%', brand: 'Яготинське', category: 'Молочне', calories: 52, protein: 3, carbs: 5, fats: 2.5, fiber: 0, serving: 250 },
  { name: 'Кефір 1%', brand: 'Яготинське', category: 'Молочне', calories: 40, protein: 3, carbs: 4, fats: 1, fiber: 0, serving: 250 },
  { name: 'Сир кисломолочний 5%', brand: 'Яготинське', category: 'Молочне', calories: 121, protein: 17, carbs: 2, fats: 5, fiber: 0, serving: 200 },
  { name: 'Сир кисломолочний 9%', brand: 'Яготинське', category: 'Молочне', calories: 159, protein: 16, carbs: 2, fats: 9, fiber: 0, serving: 200 },
  { name: 'Сметана 15%', brand: 'Яготинське', category: 'Молочне', calories: 162, protein: 3, carbs: 3, fats: 15, fiber: 0, serving: 50 },
  { name: 'Сметана 20%', brand: 'Яготинське', category: 'Молочне', calories: 206, protein: 3, carbs: 3, fats: 20, fiber: 0, serving: 50 },
  { name: 'Масло вершкове 73%', brand: 'Яготинське', category: 'Молочне', calories: 661, protein: 1, carbs: 1, fats: 73, fiber: 0, serving: 10 },
  { name: 'Йогурт натуральний', brand: 'Яготинське', category: 'Молочне', calories: 62, protein: 4, carbs: 6, fats: 2.5, fiber: 0, serving: 150 },

  // Простоквашино
  { name: 'Молоко 2.5%', brand: 'Простоквашино', category: 'Молочне', calories: 52, protein: 3, carbs: 5, fats: 2.5, fiber: 0, serving: 250 },
  { name: 'Кефір 1%', brand: 'Простоквашино', category: 'Молочне', calories: 40, protein: 3, carbs: 4, fats: 1, fiber: 0, serving: 250 },
  { name: 'Ряжанка 4%', brand: 'Простоквашино', category: 'Молочне', calories: 67, protein: 3, carbs: 4, fats: 4, fiber: 0, serving: 200 },
  { name: 'Сметана 15%', brand: 'Простоквашино', category: 'Молочне', calories: 162, protein: 3, carbs: 3, fats: 15, fiber: 0, serving: 50 },
  { name: 'Сир кисломолочний 5%', brand: 'Простоквашино', category: 'Молочне', calories: 120, protein: 17, carbs: 2, fats: 5, fiber: 0, serving: 200 },

  // Галичина
  { name: 'Молоко 2.5%', brand: 'Галичина', category: 'Молочне', calories: 52, protein: 3, carbs: 5, fats: 2.5, fiber: 0, serving: 250 },
  { name: 'Кефір 1%', brand: 'Галичина', category: 'Молочне', calories: 40, protein: 3, carbs: 4, fats: 1, fiber: 0, serving: 250 },
  { name: 'Сметана 15%', brand: 'Галичина', category: 'Молочне', calories: 162, protein: 3, carbs: 3, fats: 15, fiber: 0, serving: 50 },
  { name: 'Йогурт «Карпатський»', brand: 'Галичина', category: 'Молочне', calories: 91, protein: 3, carbs: 14, fats: 2.5, fiber: 0, serving: 250 },

  // Lactel
  { name: 'Молоко 2.5%', brand: 'Lactel', category: 'Молочне', calories: 52, protein: 3, carbs: 5, fats: 2.5, fiber: 0, serving: 250 },
  { name: 'Молоко безлактозне 1.5%', brand: 'Lactel', category: 'Молочне', calories: 44, protein: 3, carbs: 5, fats: 1.5, fiber: 0, serving: 250 },

  // Président
  { name: 'Масло вершкове 82%', brand: 'Président', category: 'Молочне', calories: 743, protein: 1, carbs: 1, fats: 82, fiber: 0, serving: 10 },
  { name: 'Сир Камамбер', brand: 'Président', category: 'Молочне', calories: 300, protein: 20, carbs: 1, fats: 24, fiber: 0, serving: 30 },
  { name: 'Сир Брі', brand: 'Président', category: 'Молочне', calories: 334, protein: 21, carbs: 1, fats: 28, fiber: 0, serving: 30 },

  // Злагода
  { name: 'Молоко згущене 8.5%', brand: 'Злагода', category: 'Молочне', calories: 320, protein: 7, carbs: 56, fats: 8.5, fiber: 0, serving: 30 },
  { name: 'Молоко згущене варене', brand: 'Злагода', category: 'Молочне', calories: 328, protein: 6, carbs: 56, fats: 8.5, fiber: 0, serving: 30 },

  // Activia
  { name: 'Йогурт натуральний', brand: 'Activia', category: 'Молочне', calories: 75, protein: 4, carbs: 6, fats: 3.5, fiber: 0, serving: 125 },
  { name: 'Йогурт з полуницею', brand: 'Activia', category: 'Молочне', calories: 83, protein: 4, carbs: 12, fats: 2, fiber: 0, serving: 125 },

  // Дольче
  { name: 'Сирок глазурований', brand: 'Дольче', category: 'Молочне', calories: 340, protein: 8, carbs: 34, fats: 20, fiber: 0, serving: 36 },
  { name: 'Пудинг шоколадний', brand: 'Дольче', category: 'Молочне', calories: 140, protein: 3, carbs: 20, fats: 5, fiber: 0, serving: 100 },

  // Торчин
  { name: 'Кетчуп «Лагідний»', brand: 'Торчин', category: 'Соуси', calories: 96, protein: 1, carbs: 22, fats: 0, fiber: 0, serving: 30 },
  { name: 'Кетчуп «Гострий»', brand: 'Торчин', category: 'Соуси', calories: 100, protein: 1, carbs: 23, fats: 0, fiber: 0, serving: 30 },
  { name: 'Майонез «Європейський» 72%', brand: 'Торчин', category: 'Соуси', calories: 636, protein: 1, carbs: 2, fats: 72, fiber: 0, serving: 20 },
  { name: 'Майонез легкий 30%', brand: 'Торчин', category: 'Соуси', calories: 285, protein: 0, carbs: 7, fats: 30, fiber: 0, serving: 20 },
  { name: 'Гірчиця столова', brand: 'Торчин', category: 'Соуси', calories: 110, protein: 5, carbs: 6, fats: 7, fiber: 3, serving: 10 },
  { name: 'Соус часниковий', brand: 'Торчин', category: 'Соуси', calories: 190, protein: 1, carbs: 10, fats: 16, fiber: 0, serving: 30 },
  { name: 'Аджика', brand: 'Торчин', category: 'Соуси', calories: 59, protein: 1, carbs: 12, fats: 1, fiber: 3, serving: 20 },

  // Чумак
  { name: 'Кетчуп «Томатний»', brand: 'Чумак', category: 'Соуси', calories: 92, protein: 1, carbs: 21, fats: 0, fiber: 0, serving: 30 },
  { name: 'Томатна паста', brand: 'Чумак', category: 'Соуси', calories: 82, protein: 4, carbs: 19, fats: 0, fiber: 4, serving: 30 },
  { name: 'Майонез 67%', brand: 'Чумак', category: 'Соуси', calories: 610, protein: 1, carbs: 2, fats: 67, fiber: 0, serving: 20 },

  // Королівський смак
  { name: 'Майонез «Королівський» 72%', brand: 'Королівський смак', category: 'Соуси', calories: 633, protein: 1, carbs: 2, fats: 72, fiber: 0, serving: 20 },
  { name: 'Кетчуп «Шашличний»', brand: 'Королівський смак', category: 'Соуси', calories: 98, protein: 1, carbs: 23, fats: 0, fiber: 0, serving: 30 },

  // Олейна
  { name: 'Олія соняшникова рафінована', brand: 'Олейна', category: 'Олії', calories: 899, protein: 0, carbs: 0, fats: 100, fiber: 0, serving: 10 },
  { name: 'Олія соняшникова нерафінована', brand: 'Олейна', category: 'Олії', calories: 899, protein: 0, carbs: 0, fats: 100, fiber: 0, serving: 10 },

  // Щедрий Дар
  { name: 'Олія соняшникова', brand: 'Щедрий Дар', category: 'Олії', calories: 899, protein: 0, carbs: 0, fats: 100, fiber: 0, serving: 10 },

  // Київхліб
  { name: 'Хліб «Столичний»', brand: 'Київхліб', category: 'Хліб', calories: 220, protein: 7, carbs: 43, fats: 1, fiber: 5, serving: 40 },
  { name: 'Батон нарізний', brand: 'Київхліб', category: 'Хліб', calories: 262, protein: 8, carbs: 51, fats: 3, fiber: 2, serving: 40 },
  { name: 'Хліб «Бородинський»', brand: 'Київхліб', category: 'Хліб', calories: 207, protein: 7, carbs: 40, fats: 1, fiber: 6, serving: 40 },

  // Кулиничі
  { name: 'Хліб тостовий', brand: 'Кулиничі', category: 'Хліб', calories: 261, protein: 9, carbs: 49, fats: 3, fiber: 3, serving: 25 },
  { name: 'Хліб зерновий «Фітнес»', brand: 'Кулиничі', category: 'Хліб', calories: 247, protein: 10, carbs: 43, fats: 4, fiber: 7, serving: 40 },
  { name: 'Булочки для бургерів', brand: 'Кулиничі', category: 'Хліб', calories: 275, protein: 9, carbs: 48, fats: 5, fiber: 2, serving: 60 },

  // Мівіна
  { name: 'Локшина «Курка»', brand: 'Мівіна', category: 'Макарони', calories: 440, protein: 8, carbs: 63, fats: 18, fiber: 2, serving: 60 },
  { name: 'Локшина «Яловичина»', brand: 'Мівіна', category: 'Макарони', calories: 435, protein: 8, carbs: 62, fats: 17, fiber: 2, serving: 60 },

  // Roshen
  { name: 'Шоколад чорний «Brut»', brand: 'Roshen', category: 'Солодощі', calories: 539, protein: 7, carbs: 42, fats: 39, fiber: 8, serving: 25 },
  { name: 'Шоколад молочний', brand: 'Roshen', category: 'Солодощі', calories: 550, protein: 7, carbs: 56, fats: 33, fiber: 2, serving: 25 },
  { name: 'Цукерки «Рошен»', brand: 'Roshen', category: 'Солодощі', calories: 440, protein: 5, carbs: 58, fats: 22, fiber: 1, serving: 30 },
  { name: 'Вафлі «Артек»', brand: 'Roshen', category: 'Солодощі', calories: 492, protein: 6, carbs: 58, fats: 26, fiber: 2, serving: 30 },
  { name: 'Цукерки «Київська помадка»', brand: 'Roshen', category: 'Солодощі', calories: 410, protein: 4, carbs: 62, fats: 17, fiber: 0, serving: 20 },
  { name: 'Торт «Київський»', brand: 'Roshen', category: 'Солодощі', calories: 456, protein: 8, carbs: 47, fats: 27, fiber: 2, serving: 80 },

  // АВК
  { name: 'Батончик «Kresko»', brand: 'АВК', category: 'Солодощі', calories: 480, protein: 5, carbs: 62, fats: 24, fiber: 1, serving: 40 },
  { name: 'Цукерки «Шоколадна ніч»', brand: 'АВК', category: 'Солодощі', calories: 510, protein: 6, carbs: 52, fats: 32, fiber: 2, serving: 30 },

  // Світоч
  { name: 'Шоколад «Світоч» молочний', brand: 'Світоч', category: 'Солодощі', calories: 540, protein: 7, carbs: 55, fats: 33, fiber: 2, serving: 25 },
  { name: 'Цукерки «Бджілка»', brand: 'Світоч', category: 'Солодощі', calories: 460, protein: 5, carbs: 61, fats: 23, fiber: 1, serving: 20 },

  // Конті
  { name: 'Печиво «Артемон»', brand: 'Конті', category: 'Солодощі', calories: 450, protein: 6, carbs: 64, fats: 20, fiber: 1, serving: 30 },
  { name: 'Батончик «Супермакс»', brand: 'Конті', category: 'Солодощі', calories: 490, protein: 5, carbs: 58, fats: 27, fiber: 2, serving: 40 },
  { name: 'Вафлі «Конті»', brand: 'Конті', category: 'Солодощі', calories: 500, protein: 5, carbs: 59, fats: 28, fiber: 1, serving: 40 },

  // Sandora
  { name: 'Сік апельсиновий', brand: 'Sandora', category: 'Напої', calories: 45, protein: 1, carbs: 10, fats: 0, fiber: 0, serving: 200 },
  { name: 'Сік яблучний', brand: 'Sandora', category: 'Напої', calories: 46, protein: 0, carbs: 11, fats: 0, fiber: 0, serving: 200 },
  { name: 'Сік томатний', brand: 'Sandora', category: 'Напої', calories: 18, protein: 1, carbs: 4, fats: 0, fiber: 0, serving: 200 },
  { name: 'Сік мультифрукт', brand: 'Sandora', category: 'Напої', calories: 50, protein: 0, carbs: 12, fats: 0, fiber: 0, serving: 200 },
  { name: 'Нектар вишневий', brand: 'Sandora', category: 'Напої', calories: 56, protein: 0, carbs: 14, fats: 0, fiber: 0, serving: 200 },

  // Galicia
  { name: 'Сік яблучний прямого віджиму', brand: 'Galicia', category: 'Напої', calories: 48, protein: 0, carbs: 12, fats: 0, fiber: 0, serving: 200 },
  { name: 'Сік апельсиновий', brand: 'Galicia', category: 'Напої', calories: 45, protein: 1, carbs: 10, fats: 0, fiber: 0, serving: 200 },
  { name: 'Сік мультифрукт', brand: 'Galicia', category: 'Напої', calories: 52, protein: 0, carbs: 13, fats: 0, fiber: 0, serving: 200 },

  // Живчик
  { name: 'Лимонад «Живчик»', brand: 'Живчик', category: 'Напої', calories: 38, protein: 0, carbs: 9, fats: 0, fiber: 0, serving: 330 },
  { name: 'Лимонад «Живчик» груша', brand: 'Живчик', category: 'Напої', calories: 39, protein: 0, carbs: 10, fats: 0, fiber: 0, serving: 330 },

  // Вода
  { name: 'Вода мінеральна', brand: 'Моршинська', category: 'Напої', calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, serving: 500 },
  { name: 'Вода мінеральна', brand: 'Миргородська', category: 'Напої', calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, serving: 500 },
  { name: 'Вода мінеральна', brand: 'Бонаква', category: 'Напої', calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, serving: 500 },

  // Верес
  { name: 'Варення полуничне', brand: 'Верес', category: 'Солодощі', calories: 265, protein: 0, carbs: 66, fats: 0, fiber: 0, serving: 30 },
  { name: 'Ікра кабачкова', brand: 'Верес', category: 'Овочі', calories: 97, protein: 1, carbs: 9, fats: 7, fiber: 1, serving: 50 },

  // Bonduelle
  { name: 'Горошок зелений', brand: 'Bonduelle', category: 'Овочі', calories: 58, protein: 3, carbs: 10, fats: 0, fiber: 4, serving: 100 },
  { name: 'Кукурудза цукрова', brand: 'Bonduelle', category: 'Овочі', calories: 78, protein: 3, carbs: 14, fats: 1, fiber: 2, serving: 100 },
  { name: 'Квасоля червона', brand: 'Bonduelle', category: 'Бобові', calories: 99, protein: 7, carbs: 17, fats: 0, fiber: 6, serving: 100 },
  { name: 'Квасоля біла', brand: 'Bonduelle', category: 'Бобові', calories: 88, protein: 6, carbs: 16, fats: 0, fiber: 5, serving: 100 },
  { name: 'Овочі «Мексиканська суміш»', brand: 'Bonduelle', category: 'Овочі', calories: 68, protein: 3, carbs: 12, fats: 1, fiber: 3, serving: 100 },

  // ═══════════════════════════════════════════════════════════════
  //  BRANDED PRODUCTS — ЄВРОПЕЙСЬКІ БРЕНДИ
  // ═══════════════════════════════════════════════════════════════

  // Danone
  { name: 'Actimel натуральний', brand: 'Danone', category: 'Молочне', calories: 72, protein: 3, carbs: 11, fats: 2, fiber: 0, serving: 100 },
  { name: 'Actimel полуниця', brand: 'Danone', category: 'Молочне', calories: 79, protein: 3, carbs: 12, fats: 2, fiber: 0, serving: 100 },

  // Alpro
  { name: 'Молоко вівсяне', brand: 'Alpro', category: 'Напої', calories: 46, protein: 1, carbs: 7, fats: 2, fiber: 1, serving: 200 },
  { name: 'Молоко мигдальне', brand: 'Alpro', category: 'Напої', calories: 24, protein: 1, carbs: 3, fats: 1, fiber: 0, serving: 200 },
  { name: 'Молоко соєве', brand: 'Alpro', category: 'Напої', calories: 39, protein: 3, carbs: 3, fats: 2, fiber: 0, serving: 200 },
  { name: 'Молоко кокосове', brand: 'Alpro', category: 'Напої', calories: 20, protein: 0, carbs: 3, fats: 1, fiber: 0, serving: 200 },
  { name: 'Йогурт соєвий натуральний', brand: 'Alpro', category: 'Молочне', calories: 50, protein: 4, carbs: 2, fats: 3, fiber: 1, serving: 150 },

  // Hochland
  { name: 'Сир плавлений вершковий', brand: 'Hochland', category: 'Молочне', calories: 251, protein: 9, carbs: 5, fats: 22, fiber: 0, serving: 30 },
  { name: 'Сир плавлений з грибами', brand: 'Hochland', category: 'Молочне', calories: 243, protein: 9, carbs: 5, fats: 21, fiber: 0, serving: 30 },
  { name: 'Сир плавлений з шинкою', brand: 'Hochland', category: 'Молочне', calories: 236, protein: 11, carbs: 3, fats: 20, fiber: 0, serving: 30 },

  // Philadelphia
  { name: 'Сир вершковий оригінальний', brand: 'Philadelphia', category: 'Молочне', calories: 250, protein: 6, carbs: 4, fats: 24, fiber: 0, serving: 30 },
  { name: 'Сир вершковий легкий', brand: 'Philadelphia', category: 'Молочне', calories: 165, protein: 8, carbs: 5, fats: 13, fiber: 0, serving: 30 },

  // Barilla
  { name: 'Спагетті №5', brand: 'Barilla', category: 'Макарони', calories: 356, protein: 13, carbs: 71, fats: 2, fiber: 3, serving: 80 },
  { name: 'Пенне Рігате', brand: 'Barilla', category: 'Макарони', calories: 354, protein: 13, carbs: 71, fats: 2, fiber: 3, serving: 80 },
  { name: 'Фузіллі', brand: 'Barilla', category: 'Макарони', calories: 353, protein: 13, carbs: 70, fats: 2, fiber: 3, serving: 80 },
  { name: 'Лазанья (листи)', brand: 'Barilla', category: 'Макарони', calories: 356, protein: 13, carbs: 72, fats: 1, fiber: 3, serving: 80 },

  // De Cecco
  { name: 'Спагетті №12', brand: 'De Cecco', category: 'Макарони', calories: 351, protein: 14, carbs: 70, fats: 2, fiber: 3, serving: 80 },

  // Heinz
  { name: 'Кетчуп томатний', brand: 'Heinz', category: 'Соуси', calories: 112, protein: 1, carbs: 26, fats: 0, fiber: 0, serving: 30 },
  { name: 'Соус BBQ', brand: 'Heinz', category: 'Соуси', calories: 165, protein: 1, carbs: 38, fats: 1, fiber: 1, serving: 30 },

  // Hellmann's
  { name: 'Майонез Original', brand: "Hellmann's", category: 'Соуси', calories: 722, protein: 1, carbs: 1, fats: 79, fiber: 0, serving: 15 },
  { name: 'Майонез Light', brand: "Hellmann's", category: 'Соуси', calories: 332, protein: 1, carbs: 5, fats: 33, fiber: 0, serving: 15 },

  // Knorr
  { name: 'Бульйон курячий кубик', brand: 'Knorr', category: 'Соуси', calories: 220, protein: 7, carbs: 19, fats: 13, fiber: 0, serving: 10 },
  { name: 'Бульйон яловичий кубик', brand: 'Knorr', category: 'Соуси', calories: 215, protein: 7, carbs: 18, fats: 12, fiber: 0, serving: 10 },

  // Maggi
  { name: 'Приправа «10 овочів»', brand: 'Maggi', category: 'Спеції', calories: 175, protein: 7, carbs: 25, fats: 5, fiber: 4, serving: 5 },

  // Milka
  { name: 'Шоколад молочний', brand: 'Milka', category: 'Солодощі', calories: 530, protein: 6, carbs: 58, fats: 30, fiber: 1, serving: 25 },
  { name: 'Шоколад з горіхами', brand: 'Milka', category: 'Солодощі', calories: 545, protein: 8, carbs: 53, fats: 33, fiber: 2, serving: 25 },
  { name: 'Шоколад Oreo', brand: 'Milka', category: 'Солодощі', calories: 538, protein: 6, carbs: 57, fats: 31, fiber: 1, serving: 25 },

  // Ritter Sport
  { name: 'Шоколад з горіхами', brand: 'Ritter Sport', category: 'Солодощі', calories: 557, protein: 9, carbs: 47, fats: 37, fiber: 3, serving: 25 },
  { name: 'Шоколад молочний', brand: 'Ritter Sport', category: 'Солодощі', calories: 537, protein: 8, carbs: 56, fats: 31, fiber: 1, serving: 25 },
  { name: 'Шоколад марципановий', brand: 'Ritter Sport', category: 'Солодощі', calories: 477, protein: 7, carbs: 51, fats: 27, fiber: 2, serving: 25 },

  // Lindt
  { name: 'Шоколад Excellence 70%', brand: 'Lindt', category: 'Солодощі', calories: 540, protein: 8, carbs: 35, fats: 41, fiber: 10, serving: 25 },
  { name: 'Шоколад Excellence 85%', brand: 'Lindt', category: 'Солодощі', calories: 555, protein: 10, carbs: 22, fats: 46, fiber: 13, serving: 25 },

  // Kinder
  { name: 'Шоколад Kinder', brand: 'Kinder', category: 'Солодощі', calories: 567, protein: 9, carbs: 52, fats: 36, fiber: 1, serving: 25 },
  { name: 'Bueno', brand: 'Kinder', category: 'Солодощі', calories: 572, protein: 9, carbs: 49, fats: 38, fiber: 2, serving: 43 },
  { name: 'Kinder Surprise', brand: 'Kinder', category: 'Солодощі', calories: 564, protein: 9, carbs: 52, fats: 35, fiber: 0, serving: 20 },

  // Ferrero
  { name: 'Ferrero Rocher', brand: 'Ferrero', category: 'Солодощі', calories: 576, protein: 7, carbs: 48, fats: 40, fiber: 3, serving: 12.5 },
  { name: 'Raffaello', brand: 'Ferrero', category: 'Солодощі', calories: 609, protein: 7, carbs: 40, fats: 47, fiber: 3, serving: 10 },

  // Nutella
  { name: 'Паста горіхова', brand: 'Nutella', category: 'Солодощі', calories: 539, protein: 6, carbs: 58, fats: 31, fiber: 3, serving: 15 },

  // Mars
  { name: 'Батончик Mars', brand: 'Mars', category: 'Солодощі', calories: 449, protein: 4, carbs: 68, fats: 17, fiber: 1, serving: 51 },
  { name: 'Батончик Snickers', brand: 'Mars', category: 'Солодощі', calories: 488, protein: 8, carbs: 58, fats: 25, fiber: 2, serving: 50 },
  { name: 'Батончик Twix', brand: 'Mars', category: 'Солодощі', calories: 495, protein: 5, carbs: 63, fats: 25, fiber: 1, serving: 50 },
  { name: 'Батончик Bounty', brand: 'Mars', category: 'Солодощі', calories: 478, protein: 4, carbs: 55, fats: 27, fiber: 3, serving: 57 },
  { name: 'Батончик Milky Way', brand: 'Mars', category: 'Солодощі', calories: 446, protein: 4, carbs: 68, fats: 17, fiber: 0, serving: 21.5 },
  { name: 'Батончик M&M\'s (арахіс)', brand: 'Mars', category: 'Солодощі', calories: 502, protein: 9, carbs: 60, fats: 25, fiber: 2, serving: 45 },
  { name: 'Батончик KitKat', brand: 'Nestlé', category: 'Солодощі', calories: 518, protein: 7, carbs: 61, fats: 27, fiber: 2, serving: 42 },

  // Haribo
  { name: 'Желейні ведмедики Goldbären', brand: 'Haribo', category: 'Солодощі', calories: 343, protein: 7, carbs: 77, fats: 0, fiber: 0, serving: 30 },

  // Oreo
  { name: 'Печиво Oreo', brand: 'Oreo', category: 'Солодощі', calories: 471, protein: 5, carbs: 69, fats: 20, fiber: 2, serving: 28 },

  // Pringles
  { name: 'Чіпси Original', brand: 'Pringles', category: 'Снеки', calories: 521, protein: 4, carbs: 55, fats: 32, fiber: 3, serving: 30 },
  { name: 'Чіпси Sour Cream & Onion', brand: 'Pringles', category: 'Снеки', calories: 518, protein: 4, carbs: 55, fats: 31, fiber: 3, serving: 30 },

  // Lay's
  { name: 'Чіпси зі смаком сметани і зелені', brand: "Lay's", category: 'Снеки', calories: 528, protein: 6, carbs: 54, fats: 32, fiber: 4, serving: 30 },
  { name: 'Чіпси «Солоні»', brand: "Lay's", category: 'Снеки', calories: 536, protein: 7, carbs: 53, fats: 33, fiber: 4, serving: 30 },

  // Nestlé
  { name: 'Nesquik пластівці шоколадні', brand: 'Nestlé', category: 'Крупи', calories: 381, protein: 7, carbs: 78, fats: 4, fiber: 4, serving: 30 },
  { name: 'Fitness пластівці', brand: 'Nestlé', category: 'Крупи', calories: 367, protein: 8, carbs: 74, fats: 3, fiber: 8, serving: 30 },
  { name: 'Cheerios пластівці', brand: 'Nestlé', category: 'Крупи', calories: 374, protein: 8, carbs: 73, fats: 5, fiber: 8, serving: 30 },

  // Напої (європейські)
  { name: 'Pepsi', brand: 'PepsiCo', category: 'Напої', calories: 42, protein: 0, carbs: 11, fats: 0, fiber: 0, serving: 330 },
  { name: 'Pepsi Zero', brand: 'PepsiCo', category: 'Напої', calories: 0, protein: 0, carbs: 0, fats: 0, fiber: 0, serving: 330 },
  { name: 'Fanta', brand: 'Coca-Cola', category: 'Напої', calories: 42, protein: 0, carbs: 10, fats: 0, fiber: 0, serving: 330 },
  { name: 'Sprite', brand: 'Coca-Cola', category: 'Напої', calories: 33, protein: 0, carbs: 8, fats: 0, fiber: 0, serving: 330 },
  { name: 'Red Bull', brand: 'Red Bull', category: 'Напої', calories: 45, protein: 0, carbs: 11, fats: 0, fiber: 0, serving: 250 },
  { name: 'Red Bull Sugar Free', brand: 'Red Bull', category: 'Напої', calories: 3, protein: 0, carbs: 0, fats: 0, fiber: 0, serving: 250 },
  { name: 'Monster Energy', brand: 'Monster', category: 'Напої', calories: 47, protein: 0, carbs: 12, fats: 0, fiber: 0, serving: 250 },
  { name: 'Burn', brand: 'Coca-Cola', category: 'Напої', calories: 49, protein: 0, carbs: 12, fats: 0, fiber: 0, serving: 250 },

  // Чай та кава
  { name: 'Чай холодний (лимон)', brand: 'Lipton', category: 'Напої', calories: 20, protein: 0, carbs: 5, fats: 0, fiber: 0, serving: 250 },
  { name: 'Чай холодний (персик)', brand: 'Lipton', category: 'Напої', calories: 22, protein: 0, carbs: 5, fats: 0, fiber: 0, serving: 250 },
  { name: 'Кава розчинна Gold', brand: 'Nescafé', category: 'Напої', calories: 82, protein: 13, carbs: 8, fats: 0, fiber: 0, serving: 2 },
  { name: 'Кава розчинна 3в1 Classic', brand: 'Nescafé', category: 'Напої', calories: 449, protein: 6, carbs: 71, fats: 15, fiber: 0, serving: 16 },
  { name: 'Кава розчинна Monarch', brand: 'Jacobs', category: 'Напої', calories: 80, protein: 12, carbs: 9, fats: 0, fiber: 0, serving: 2 },
  { name: 'Кава мелена Crema', brand: 'Lavazza', category: 'Напої', calories: 2, protein: 0, carbs: 0, fats: 0, fiber: 0, serving: 7 },

  // Quaker/Oatly
  { name: 'Вівсянка швидкого приготування', brand: 'Quaker', category: 'Крупи', calories: 367, protein: 12, carbs: 62, fats: 7, fiber: 10, serving: 40 },
  { name: 'Молоко вівсяне Barista', brand: 'Oatly', category: 'Напої', calories: 59, protein: 1, carbs: 7, fats: 3, fiber: 1, serving: 200 },

  // Dr. Oetker
  { name: 'Піца Ristorante Маргарита', brand: 'Dr. Oetker', category: 'Готові страви', calories: 236, protein: 10, carbs: 28, fats: 9, fiber: 2, serving: 150 },
  { name: 'Піца Ristorante 4 сири', brand: 'Dr. Oetker', category: 'Готові страви', calories: 256, protein: 12, carbs: 26, fats: 12, fiber: 1, serving: 150 },
  { name: 'Пудинг шоколадний', brand: 'Dr. Oetker', category: 'Солодощі', calories: 101, protein: 3, carbs: 17, fats: 2, fiber: 1, serving: 100 },
];

// ═══════════════════════════════════════════════════════════════════════

async function main() {
  console.log('🌱 Seeding database...');
  console.log(`📦 Adding ${foods.length} foods (generic + Ukrainian & European brands)...`);

  let created = 0;
  let skipped = 0;

  for (const food of foods) {
    // Check if food already exists (by name + brand combination)
    const existing = food.brand
      ? await prisma.food.findFirst({
          where: {
            name: food.name,
            brand: food.brand,
          },
        })
      : await prisma.food.findFirst({
          where: {
            name: food.name,
            brand: null,
          },
        });

    if (existing) {
      skipped++;
      continue;
    }

    await prisma.food.create({
      data: {
        name: food.name,
        brand: food.brand,
        category: food.category,
        calories: food.calories,
        protein: food.protein,
        carbs: food.carbs,
        fats: food.fats,
        fiber: food.fiber,
        servingSize: food.serving,
        servingUnit: 'г',
        isVerified: true,
        source: food.brand ? 'brand' : 'manual',
      },
    });
    created++;
  }

  console.log('✅ Database seeded successfully!');
  console.log(`📊 Created: ${created}, Skipped: ${skipped}`);
  console.log(`📊 Total foods in database: ${await prisma.food.count()}`);
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
