# Body&Dry - Повний план розробки (з ТЗ)

## 📋 АНАЛІЗ ТЕХНІЧНОГО ЗАВДАННЯ

### Загальна інформація
| Параметр | Значення |
|----------|----------|
| **Продукт** | Мобільний додаток для планування харчування з AI |
| **Платформи** | iOS 13.0+, Android 8.0+ |
| **Бюджет** | 1 394 411 грн |
| **Дедлайн** | Травень 2026 (3 фази розробки) |
| **Монетизація** | Підписка BodyPro 274 грн/місяць + реклама |

### Цільова аудиторія
- Особи, зацікавлені в збалансованому харчуванні
- Спортсмени та любителі фітнесу
- Люди, які прагнуть схуднути та підсушити тіло
- Студенти та молоді професіонали
- Технологічно обізнані користувачі

---

## 🏗️ АРХІТЕКТУРА СИСТЕМИ

```
┌─────────────────────────────────────────────────────────────────┐
│                    КЛІЄНТ (React Native + Expo)                  │
├─────────────────────────────────────────────────────────────────┤
│     iOS App              │           Android App                 │
└────────┬─────────────────┴───────────────────┬──────────────────┘
         │                                     │
         └─────────────────┬───────────────────┘
                           │ HTTPS/REST API
         ┌─────────────────▼─────────────────┐
         │            API GATEWAY             │
         │       (Rate Limiting, Auth)        │
         └─────────────────┬─────────────────┘
                           │
    ┌──────────────────────┼──────────────────────┐
    │                      │                      │
    ▼                      ▼                      ▼
┌────────────┐      ┌────────────┐      ┌────────────┐
│   Auth     │      │  Core API  │      │ AI Service │
│  Service   │      │  Service   │      │  (OpenAI)  │
└─────┬──────┘      └─────┬──────┘      └─────┬──────┘
      │                   │                   │
      └───────────────────┼───────────────────┘
                          │
      ┌───────────────────┼───────────────────┐
      │                   │                   │
      ▼                   ▼                   ▼
┌──────────┐       ┌──────────┐       ┌──────────┐
│PostgreSQL│       │  Redis   │       │   S3     │
│(основна) │       │  (кеш)   │       │ (файли)  │
└──────────┘       └──────────┘       └──────────┘
```

---

## 📱 FRONTEND ВИМОГИ (з ТЗ розділ 5)

### Технічний стек (за ТЗ)
| Технологія | Призначення | Статус |
|------------|-------------|--------|
| React Native | Кросплатформна розробка | ✅ Налаштовано |
| JavaScript/TypeScript | Мова програмування | ✅ JS (перехід на TS) |
| Git | Контроль версій | ✅ |
| Expo | Швидка розробка | ✅ Налаштовано |
| React Navigation | Навігація | ✅ Налаштовано |
| Zustand | State Management | ✅ Налаштовано |

### Додаткові технології (рекомендовані)
| Технологія | Призначення |
|------------|-------------|
| React Query | Кешування API запитів |
| React Native Reanimated | Анімації для графіків |
| Expo Notifications | Push-сповіщення |
| AsyncStorage | Локальне кешування |
| React Native SVG | Графіки та діаграми |

### Нефункціональні вимоги Frontend (ТЗ 5.3)
- [ ] Час відгуку додатку: < 3 секунд
- [ ] Адаптивний дизайн для різних екранів
- [ ] Мова інтерфейсу: українська (UA)
- [ ] Доступність для користувачів з обмеженими можливостями

### Інтеграційні вимоги Frontend (ТЗ 5.4)
- [ ] Інтеграція з backend API
- [ ] Локальна база даних (AsyncStorage)
- [ ] Інтеграція з Apple Pay, PayPal

### Додаткові завдання Frontend (ТЗ 5.5)
- [ ] Кешування даних на стороні клієнта
- [ ] Анімації для графіків
- [ ] Push-повідомлення для нагадувань
- [ ] Unit-тести для ключових компонентів
- [ ] Екран помилки відсутності інтернету

---

## 🎯 ФУНКЦІОНАЛЬНІ МОДУЛІ (з ТЗ + дизайну)

### 1. Авторизація та Онбординг
| Екран | Опис | Пріоритет | Фаза |
|-------|------|-----------|------|
| Opening Screen | Стартовий екран з логотипом | P0 | MVP |
| Login | Вхід (email/пароль) | P0 | MVP |
| Sign Up | Реєстрація | P0 | MVP |
| Login/SignUp Error | Помилки при реєстрації/вході | P0 | MVP |
| Forgot Password | Відновлення паролю через email | P1 | MVP |
| Enter Code | Введення коду підтвердження | P1 | MVP |
| Reset Password | Скидання паролю | P1 | MVP |
| User Questions (7 екранів) | Онбординг: цілі, вага, ріст, активність | P0 | MVP |

### 2. Головна сторінка (Dashboard)
| Компонент | Опис | Пріоритет | Фаза |
|-----------|------|-----------|------|
| Calories Ring | Залишок калорій на день | P0 | MVP |
| Macros (3 rings) | Білки/Жири/Вуглеводи | P0 | MVP |
| Water Tracker | Прогрес споживання води | P0 | MVP |
| Weight Graph | Графік зміни ваги | P1 | Фаза 2 |

### 3. Щоденник харчування (Diary)
| Екран | Опис | Пріоритет | Фаза |
|-------|------|-----------|------|
| Diary Page | Перегляд прийомів їжі за день | P0 | MVP |
| Diary Redact | Редагування записів | P0 | MVP |
| Add Meals | Пошук та додавання страв | P0 | MVP |
| Add Meals Search | Пошук продуктів з бази | P0 | MVP |
| Add Info | Деталі страви (КБЖУ, порція) | P0 | MVP |
| Product Size Choice | Вибір розміру порції | P1 | Фаза 2 |
| Product Size Input | Ручне введення порції | P1 | Фаза 2 |
| Add Meal (своя страва) | Створення власного продукту | P1 | Фаза 2 |

### 4. Трекер води
| Екран | Опис | Пріоритет | Фаза |
|-------|------|-----------|------|
| Water Tracker | Додавання води | P0 | MVP |
| Water Progress | Прогрес за період | P1 | Фаза 2 |
| Water Change | Зміна денної норми | P1 | MVP |

### 5. Прогрес та статистика
| Екран | Опис | Пріоритет | Фаза |
|-------|------|-----------|------|
| Progress Week | Статистика за тиждень | P0 | MVP |
| Progress Month | Статистика за місяць | P1 | Фаза 2 |
| Progress Year | Статистика за рік | P2 | Фаза 3 |

### 6. AI Assistant (BodyPro - платно)
| Екран | Опис | Пріоритет |
|-------|------|-----------|
| AI Assistant Page | Головна сторінка AI | P0 |
| AI Dry Plan | Чат з планом сушки | P1 |
| AI Recipes | AI-генерація рецептів | P2 |

### 7. Профіль
| Екран | Опис | Пріоритет |
|-------|------|-----------|
| Profile Page | Налаштування профілю | P0 |
| Goals Page | Редагування цілей | P1 |
| Macro/Calories Edit | Редагування норм | P1 |
| Delete Account | Видалення акаунту | P2 |
| Logout Modal | Підтвердження виходу | P0 |

### 8. Оплата (Subscription)
| Екран | Опис | Пріоритет |
|-------|------|-----------|
| Payment Page | Вибір тарифу | P1 |
| Grateful Pay | Підтвердження оплати | P1 |
| Download | Інструкції після оплати | P2 |

---

## 🏗 Архітектура системи

```
┌─────────────────────────────────────────────────────────────────┐
│                        MOBILE APP                                │
│                    (React Native + Expo)                         │
├─────────────────────────────────────────────────────────────────┤
│  Screens │ Components │ Navigation │ Store (Zustand) │ Services │
└───────────────────────────┬─────────────────────────────────────┘
                            │ HTTPS/REST API
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                  │
│                     (Node.js + Express)                          │
├─────────────────────────────────────────────────────────────────┤
│     Auth    │   Users   │   Diary   │   AI   │   Payments       │
│   (JWT)     │  Service  │  Service  │ Service│   Service        │
└──────┬──────────┬───────────┬──────────┬──────────┬─────────────┘
       │          │           │          │          │
       ▼          ▼           ▼          ▼          ▼
┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────┐ ┌─────────┐
│ Firebase │ │PostgreSQL│ │PostgreSQL│ │OpenAI│ │ Stripe/ │
│   Auth   │ │   Users  │ │   Data   │ │  API │ │ LiqPay  │
└──────────┘ └──────────┘ └──────────┘ └──────┘ └─────────┘
```

---

## 🔧 Технологічний стек

### Frontend (Mobile)
| Технологія | Призначення |
|------------|-------------|
| React Native | Фреймворк мобільної розробки |
| Expo | Інструментарій та збірка |
| React Navigation | Навігація |
| Zustand | State management |
| React Native SVG | Графіки та іконки |
| Expo Linear Gradient | Градієнти |
| React Query | Кешування API запитів |
| Axios | HTTP клієнт |
| AsyncStorage | Локальне сховище |
| Expo Notifications | Push-сповіщення |

### Backend
| Технологія | Призначення |
|------------|-------------|
| Node.js | Runtime |
| Express.js | Web framework |
| TypeScript | Типізація |
| PostgreSQL | Основна БД |
| Prisma | ORM |
| Redis | Кешування |
| Firebase Auth | Автентифікація |
| JWT | Токени сесій |
| OpenAI API | AI функціонал |
| Stripe/LiqPay | Платежі |

### DevOps & Infrastructure
| Технологія | Призначення |
|------------|-------------|
| Docker | Контейнеризація |
| Railway/Render | Хостинг бекенду |
| Expo EAS | Збірка мобільного додатку |
| GitHub Actions | CI/CD |
| Sentry | Моніторинг помилок |
| AWS S3 | Зберігання файлів |

---

## 📊 Схема бази даних

### Users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY,
  firebase_uid VARCHAR(128) UNIQUE,
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(100),
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### User Profiles
```sql
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  gender VARCHAR(10),
  birth_date DATE,
  height_cm INT,
  current_weight_kg DECIMAL(5,2),
  target_weight_kg DECIMAL(5,2),
  activity_level VARCHAR(20), -- sedentary, light, moderate, active, very_active
  goal VARCHAR(20), -- lose_weight, maintain, gain_muscle
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Daily Goals
```sql
CREATE TABLE daily_goals (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  calorie_goal INT DEFAULT 2000,
  protein_goal INT DEFAULT 150,
  carbs_goal INT DEFAULT 200,
  fats_goal INT DEFAULT 65,
  water_goal_ml INT DEFAULT 2700,
  effective_from DATE,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Food Database
```sql
CREATE TABLE foods (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(100),
  barcode VARCHAR(50),
  calories_per_100g INT,
  protein_per_100g DECIMAL(5,2),
  carbs_per_100g DECIMAL(5,2),
  fats_per_100g DECIMAL(5,2),
  fiber_per_100g DECIMAL(5,2),
  is_verified BOOLEAN DEFAULT false,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Food Entries (Diary)
```sql
CREATE TABLE food_entries (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  food_id UUID REFERENCES foods(id),
  date DATE NOT NULL,
  meal_type VARCHAR(20), -- breakfast, lunch, dinner, snack
  serving_size_g DECIMAL(6,2),
  calories INT,
  protein DECIMAL(5,2),
  carbs DECIMAL(5,2),
  fats DECIMAL(5,2),
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Water Entries
```sql
CREATE TABLE water_entries (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  date DATE NOT NULL,
  amount_ml INT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Weight History
```sql
CREATE TABLE weight_history (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  weight_kg DECIMAL(5,2),
  recorded_at TIMESTAMP DEFAULT NOW()
);
```

### Subscriptions
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  plan_type VARCHAR(20), -- free, pro
  status VARCHAR(20), -- active, cancelled, expired
  payment_provider VARCHAR(20), -- stripe, liqpay
  provider_subscription_id VARCHAR(255),
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### AI Conversations
```sql
CREATE TABLE ai_conversations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type VARCHAR(20), -- dry_plan, recipes, analysis
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE ai_messages (
  id UUID PRIMARY KEY,
  conversation_id UUID REFERENCES ai_conversations(id),
  role VARCHAR(10), -- user, assistant
  content TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## 🔌 API Endpoints

### Auth
```
POST   /api/auth/register         - Реєстрація
POST   /api/auth/login            - Вхід
POST   /api/auth/logout           - Вихід
POST   /api/auth/refresh          - Оновлення токена
POST   /api/auth/forgot-password  - Запит на відновлення паролю
POST   /api/auth/reset-password   - Скидання паролю
POST   /api/auth/verify-email     - Верифікація email
```

### Users
```
GET    /api/users/me              - Отримати профіль
PUT    /api/users/me              - Оновити профіль
DELETE /api/users/me              - Видалити акаунт
PUT    /api/users/me/goals        - Оновити цілі
GET    /api/users/me/stats        - Статистика користувача
```

### Diary
```
GET    /api/diary/:date           - Записи за день
POST   /api/diary/entry           - Додати запис
PUT    /api/diary/entry/:id       - Редагувати запис
DELETE /api/diary/entry/:id       - Видалити запис
GET    /api/diary/summary/:date   - Підсумок за день
```

### Foods
```
GET    /api/foods/search?q=       - Пошук продуктів
GET    /api/foods/:id             - Деталі продукту
POST   /api/foods                 - Створити продукт
GET    /api/foods/recent          - Нещодавні продукти
GET    /api/foods/favorites       - Улюблені продукти
POST   /api/foods/:id/favorite    - Додати в улюблені
```

### Water
```
GET    /api/water/:date           - Вода за день
POST   /api/water                 - Додати воду
DELETE /api/water/:id             - Видалити запис
GET    /api/water/stats           - Статистика води
```

### Weight
```
GET    /api/weight                - Історія ваги
POST   /api/weight                - Додати вагу
DELETE /api/weight/:id            - Видалити запис
GET    /api/weight/stats          - Статистика ваги
```

### Progress
```
GET    /api/progress/week         - Прогрес за тиждень
GET    /api/progress/month        - Прогрес за місяць
GET    /api/progress/year         - Прогрес за рік
```

### AI
```
POST   /api/ai/dry-plan           - Генерація плану сушки
POST   /api/ai/recipes            - Генерація рецептів
POST   /api/ai/analysis           - Аналіз прогресу
GET    /api/ai/conversations      - Історія розмов
GET    /api/ai/conversations/:id  - Деталі розмови
```

### Subscriptions
```
GET    /api/subscriptions/plans   - Доступні плани
GET    /api/subscriptions/current - Поточна підписка
POST   /api/subscriptions/create  - Створити підписку
POST   /api/subscriptions/cancel  - Скасувати підписку
POST   /api/subscriptions/webhook - Webhook від платіжної системи
```

---

## 📱 Frontend - Детальна структура

```
mobile-app/
├── App.js
├── app.json
├── package.json
├── src/
│   ├── api/
│   │   ├── client.js          # Axios instance
│   │   ├── auth.js            # Auth API
│   │   ├── diary.js           # Diary API
│   │   ├── foods.js           # Foods API
│   │   ├── water.js           # Water API
│   │   ├── weight.js          # Weight API
│   │   ├── progress.js        # Progress API
│   │   ├── ai.js              # AI API
│   │   └── subscriptions.js   # Subscriptions API
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.js
│   │   │   ├── Card.js
│   │   │   ├── Input.js
│   │   │   ├── Modal.js
│   │   │   ├── Loading.js
│   │   │   └── ErrorBoundary.js
│   │   ├── charts/
│   │   │   ├── ProgressRing.js
│   │   │   ├── WeightGraph.js
│   │   │   ├── BarChart.js
│   │   │   └── MacroRings.js
│   │   ├── diary/
│   │   │   ├── MealSection.js
│   │   │   ├── FoodItem.js
│   │   │   └── DateSelector.js
│   │   ├── water/
│   │   │   ├── WaterRing.js
│   │   │   └── WaterStepper.js
│   │   └── ai/
│   │       ├── ChatBubble.js
│   │       └── AICard.js
│   │
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── WelcomeScreen.js
│   │   │   ├── LoginScreen.js
│   │   │   ├── SignUpScreen.js
│   │   │   └── ForgotPasswordScreen.js
│   │   ├── onboarding/
│   │   │   ├── GoalsScreen.js
│   │   │   ├── ObstaclesScreen.js
│   │   │   ├── BodyInfoScreen.js
│   │   │   ├── ActivityScreen.js
│   │   │   └── TargetsScreen.js
│   │   ├── main/
│   │   │   ├── HomeScreen.js
│   │   │   ├── DiaryScreen.js
│   │   │   ├── ProgressScreen.js
│   │   │   └── AIScreen.js
│   │   ├── diary/
│   │   │   ├── AddMealScreen.js
│   │   │   ├── FoodSearchScreen.js
│   │   │   ├── FoodDetailsScreen.js
│   │   │   └── CreateFoodScreen.js
│   │   ├── water/
│   │   │   └── WaterTrackerScreen.js
│   │   ├── ai/
│   │   │   ├── DryPlanScreen.js
│   │   │   └── RecipesScreen.js
│   │   ├── profile/
│   │   │   ├── ProfileScreen.js
│   │   │   ├── GoalsEditScreen.js
│   │   │   ├── MacroEditScreen.js
│   │   │   └── SettingsScreen.js
│   │   └── payment/
│   │       ├── PaymentScreen.js
│   │       └── SuccessScreen.js
│   │
│   ├── navigation/
│   │   ├── AppNavigator.js
│   │   ├── AuthNavigator.js
│   │   ├── OnboardingNavigator.js
│   │   └── MainNavigator.js
│   │
│   ├── store/
│   │   ├── useAuthStore.js
│   │   ├── useDiaryStore.js
│   │   ├── useWaterStore.js
│   │   ├── useProgressStore.js
│   │   └── useAIStore.js
│   │
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useDiary.js
│   │   ├── useWater.js
│   │   └── useAI.js
│   │
│   ├── utils/
│   │   ├── calculations.js    # КБЖУ розрахунки
│   │   ├── formatters.js      # Форматування дат/чисел
│   │   ├── validators.js      # Валідація форм
│   │   └── storage.js         # AsyncStorage helpers
│   │
│   └── constants/
│       ├── colors.js
│       ├── fonts.js
│       ├── api.js
│       └── config.js
│
└── assets/
    ├── images/
    ├── fonts/
    └── icons/
```

---

## 🖥 Backend - Детальна структура

```
backend/
├── package.json
├── tsconfig.json
├── prisma/
│   └── schema.prisma
├── src/
│   ├── index.ts              # Entry point
│   ├── app.ts                # Express app
│   │
│   ├── config/
│   │   ├── database.ts
│   │   ├── firebase.ts
│   │   ├── openai.ts
│   │   ├── stripe.ts
│   │   └── redis.ts
│   │
│   ├── middleware/
│   │   ├── auth.ts           # JWT verification
│   │   ├── validation.ts     # Request validation
│   │   ├── rateLimit.ts      # Rate limiting
│   │   └── errorHandler.ts   # Global error handler
│   │
│   ├── routes/
│   │   ├── index.ts
│   │   ├── auth.routes.ts
│   │   ├── users.routes.ts
│   │   ├── diary.routes.ts
│   │   ├── foods.routes.ts
│   │   ├── water.routes.ts
│   │   ├── weight.routes.ts
│   │   ├── progress.routes.ts
│   │   ├── ai.routes.ts
│   │   └── subscriptions.routes.ts
│   │
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── users.controller.ts
│   │   ├── diary.controller.ts
│   │   ├── foods.controller.ts
│   │   ├── water.controller.ts
│   │   ├── weight.controller.ts
│   │   ├── progress.controller.ts
│   │   ├── ai.controller.ts
│   │   └── subscriptions.controller.ts
│   │
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── users.service.ts
│   │   ├── diary.service.ts
│   │   ├── foods.service.ts
│   │   ├── water.service.ts
│   │   ├── weight.service.ts
│   │   ├── progress.service.ts
│   │   ├── ai.service.ts
│   │   ├── openai.service.ts
│   │   └── payment.service.ts
│   │
│   ├── utils/
│   │   ├── calculations.ts   # TDEE, BMR calculations
│   │   ├── validators.ts
│   │   └── helpers.ts
│   │
│   └── types/
│       ├── auth.types.ts
│       ├── user.types.ts
│       ├── diary.types.ts
│       └── ai.types.ts
│
├── tests/
│   ├── unit/
│   └── integration/
│
└── docker-compose.yml
```

---

## �️ BACKEND ВИМОГИ (з ТЗ розділ 7)

### Технічний стек (за ТЗ 7.1)
| Технологія | Призначення | Статус |
|------------|-------------|--------|
| Node.js / Python | Мова програмування | 🔲 Вибрати |
| Express / NestJS | Web framework | 🔲 Вибрати |
| PostgreSQL / MS SQL | База даних | 🔲 PostgreSQL |
| Git | Контроль версій | ✅ |
| Хмарний сервер | Хостинг | 🔲 Railway/Render |

### Нефункціональні вимоги Backend (ТЗ 7.3)
- [ ] Час відгуку API: < 200 мс
- [ ] Масштабованість: до 500 000 активних користувачів
- [ ] Шифрування даних користувача
- [ ] Двофакторна автентифікація
- [ ] Відповідність GDPR та українському законодавству

### Інтеграційні вимоги Backend (ТЗ 7.4)
- [ ] Apple Pay, PayPal інтеграція
- [ ] Push-сповіщення (Firebase)
- [ ] База даних продуктів (Open Food Facts API)

### Додаткові завдання Backend (ТЗ 7.5)
- [ ] Кешування на сервері (Redis)
- [ ] Система логування та моніторингу
- [ ] Unit-тести та інтеграційні тести
- [ ] Горизонтальне масштабування
- [ ] Обробка помилок (реєстрація, логін, інтернет)

---

## 📊 API Endpoints (детально)

### Auth
```
POST   /api/auth/register         - Реєстрація
POST   /api/auth/login            - Вхід
POST   /api/auth/logout           - Вихід
POST   /api/auth/refresh          - Оновлення токена
POST   /api/auth/forgot-password  - Запит на відновлення паролю
POST   /api/auth/reset-password   - Скидання паролю
POST   /api/auth/verify-email     - Верифікація email
POST   /api/auth/verify-code      - Перевірка коду підтвердження
GET    /api/auth/me               - Поточний користувач
```

### Users & Profile (ТЗ 7.2.1)
```
GET    /api/users/me              - Отримати профіль
PUT    /api/users/me              - Оновити профіль
DELETE /api/users/me              - Видалити акаунт
PUT    /api/users/me/goals        - Оновити цілі
PUT    /api/users/me/macros       - Оновити норми КБЖУ
GET    /api/users/me/calculate    - Розрахунок BMR/TDEE
GET    /api/users/me/stats        - Статистика користувача
POST   /api/users/me/2fa          - Увімкнути 2FA
```

### Diary (ТЗ 7.2.2)
```
GET    /api/diary/:date           - Записи за день
GET    /api/diary/range           - Записи за період
POST   /api/diary/entry           - Додати запис
PUT    /api/diary/entry/:id       - Редагувати запис
DELETE /api/diary/entry/:id       - Видалити запис
GET    /api/diary/summary/:date   - Підсумок КБЖУ за день
GET    /api/diary/meals           - Прийоми їжі
```

### Foods (База продуктів)
```
GET    /api/foods/search?q=       - Пошук продуктів
GET    /api/foods/:id             - Деталі продукту
POST   /api/foods                 - Створити продукт
GET    /api/foods/recent          - Нещодавні продукти
GET    /api/foods/favorites       - Улюблені продукти
POST   /api/foods/:id/favorite    - Додати в улюблені
DELETE /api/foods/:id/favorite    - Видалити з улюблених
GET    /api/foods/barcode/:code   - Пошук за штрихкодом
```

### Water
```
GET    /api/water/:date           - Вода за день
POST   /api/water                 - Додати воду
PUT    /api/water/:id             - Редагувати
DELETE /api/water/:id             - Видалити запис
GET    /api/water/stats           - Статистика води
PUT    /api/water/goal            - Змінити ціль
```

### Progress (ТЗ 7.2.3)
```
GET    /api/progress/week         - Прогрес за тиждень
GET    /api/progress/month        - Прогрес за місяць
GET    /api/progress/year         - Прогрес за рік
GET    /api/progress/weight       - Історія ваги
POST   /api/progress/weight       - Додати вагу
GET    /api/progress/calories     - Статистика калорій
GET    /api/progress/macros       - Статистика макро
```

### AI / Plan Sushky (ТЗ 7.2.4)
```
POST   /api/ai/dry-plan           - Генерація плану сушки
GET    /api/ai/dry-plan           - Поточний план
PUT    /api/ai/dry-plan           - Оновити план
POST   /api/ai/recipes            - Генерація рецептів
GET    /api/ai/recipes            - Історія рецептів
POST   /api/ai/analysis           - AI аналіз прогресу
GET    /api/ai/recommendations    - AI рекомендації
GET    /api/ai/conversations      - Історія розмов
```

### Subscriptions (Оплата)
```
GET    /api/subscriptions/plans   - Доступні плани
GET    /api/subscriptions/current - Поточна підписка
POST   /api/subscriptions/create  - Створити підписку
POST   /api/subscriptions/cancel  - Скасувати підписку
POST   /api/subscriptions/webhook - Webhook платежів
```

### Support (ТЗ 7.2.5)
```
POST   /api/support/contact       - Email запит в підтримку
GET    /api/support/tickets       - Історія запитів
```

### Notifications
```
POST   /api/notifications/token   - Зберегти FCM токен
GET    /api/notifications/settings - Налаштування сповіщень
PUT    /api/notifications/settings - Оновити налаштування
```

---

## 🚀 ПЛАН РОЗРОБКИ ПО ФАЗАХ (з ТЗ)

## ФАЗА 1: MVP (8-10 тижнів)

### Backend Завдання (ТЗ розділ 8, Фаза 1)

#### Тиждень 1-2: Налаштування інфраструктури
- [ ] Ініціалізація проекту (NestJS/Express + TypeScript)
- [ ] Налаштування PostgreSQL (хмарний - Railway/Supabase)
- [ ] Prisma ORM + схема бази даних
- [ ] Docker configuration
- [ ] Базова структура проекту

#### Тиждень 2-3: Auth Module
- [ ] Моделі для користувача
- [ ] Реєстрація (email + password)
- [ ] Логін з JWT токенами
- [ ] Refresh token механізм
- [ ] Помилки реєстрації/входу
- [ ] Forgot password flow
- [ ] Email verification

#### Тиждень 3-4: Users & Profile
- [ ] CRUD операції для профілю
- [ ] Заповнення/редагування профілю
- [ ] Видалення акаунту
- [ ] BMR/TDEE калькулятор
- [ ] Збереження цілей та норм КБЖУ

#### Тиждень 4-5: Diary Module
- [ ] Моделі для щоденника
- [ ] CRUD для прийомів їжі
- [ ] Розрахунок КБЖУ для порцій
- [ ] Агрегація за день

#### Тиждень 5-6: Foods Module
- [ ] База даних продуктів (seed)
- [ ] Пошук продуктів
- [ ] Open Food Facts API інтеграція
- [ ] Створення власних продуктів
- [ ] Улюблені продукти

#### Тиждень 6-7: Water & Progress
- [ ] Water tracking CRUD
- [ ] Weight logging
- [ ] Базова агрегація для графіків
- [ ] Статистика за день/тиждень

#### Тиждень 7-8: Тестування
- [ ] Unit tests для сервісів
- [ ] Integration tests для API
- [ ] Swagger документація
- [ ] Система логування

### Frontend Завдання (ТЗ розділ 6, Фаза 1)

#### Тиждень 1-2: Налаштування проекту
- [ ] Оновлення структури (TypeScript)
- [ ] API client (Axios + React Query)
- [ ] Error handling глобальний
- [ ] Покращені UI компоненти

#### Тиждень 2-3: Авторизація
- [ ] Login/SignUp з API
- [ ] Error states для форм
- [ ] Forgot Password flow
- [ ] Token storage (SecureStore)
- [ ] Auth state management

#### Тиждень 3-4: Onboarding
- [ ] Goals screen (ціль: схуднення/сушка/набір)
- [ ] Personal data (вік, стать, вага, ріст)
- [ ] Activity level selection
- [ ] Targets calculation
- [ ] API інтеграція

#### Тиждень 4-5: Home & Diary
- [ ] Home з реальними даними API
- [ ] Diary з CRUD операціями
- [ ] Add meals з пошуком
- [ ] КБЖУ розрахунки
- [ ] Редагування/видалення

#### Тиждень 5-6: Water & Profile
- [ ] Water tracker з API
- [ ] Profile screen
- [ ] Goals editing
- [ ] Macro editing
- [ ] Settings

#### Тиждень 6-7: Progress
- [ ] Progress week screen
- [ ] Графіки з реальними даними
- [ ] Pull-to-refresh
- [ ] Loading states

#### Тиждень 7-8: Testing & Polish
- [ ] UI testing на різних пристроях
- [ ] Bug fixes
- [ ] Performance optimization
- [ ] Offline fallbacks

---

## ФАЗА 2: Розширена функціональність (6-8 тижнів)

### Backend Завдання (ТЗ розділ 8, Фаза 2)

#### Тиждень 1-2: Фільтрація та розширений пошук
- [ ] Фільтрація щоденника за датами
- [ ] Розширений пошук продуктів
- [ ] Barcode lookup API
- [ ] Категорії продуктів

#### Тиждень 2-3: AI Module
- [ ] OpenAI API інтеграція
- [ ] План сушки генерація
- [ ] Рецепти генерація
- [ ] AI conversations storage
- [ ] Rate limiting для AI

#### Тиждень 3-4: Payments
- [ ] Stripe/LiqPay інтеграція
- [ ] Subscription creation
- [ ] Webhook обробка
- [ ] Feature gating middleware
- [ ] Subscription management

#### Тиждень 4-5: Security
- [ ] 2FA implementation (TOTP)
- [ ] Data encryption
- [ ] Security headers
- [ ] Rate limiting
- [ ] Audit logging

#### Тиждень 5-6: Email & Support
- [ ] SendGrid/AWS SES інтеграція
- [ ] Email templates
- [ ] Support tickets API
- [ ] Contact form

### Frontend Завдання (ТЗ розділ 6, Фаза 2)

#### Тиждень 1-2: Розширений Diary
- [ ] Фільтрація за датами
- [ ] Календар для вибору дати
- [ ] Barcode scanner (expo-camera)
- [ ] Product size selection

#### Тиждень 2-3: AI Screens
- [ ] AI Assistant page
- [ ] Dry plan generation UI
- [ ] Chat interface
- [ ] Recipe cards
- [ ] Loading animations

#### Тиждень 3-4: Payments
- [ ] Payment screen
- [ ] Plan selection
- [ ] Stripe/LiqPay checkout
- [ ] Success/failure screens
- [ ] Subscription status

#### Тиждень 4-5: Progress Extended
- [ ] Monthly progress
- [ ] Yearly progress
- [ ] Enhanced charts
- [ ] Export data

#### Тиждень 5-6: Animations & UX
- [ ] Screen transitions
- [ ] Chart animations
- [ ] Micro-interactions
- [ ] Haptic feedback

#### Тиждень 6: Push Notifications
- [ ] FCM integration
- [ ] Meal reminders
- [ ] Water reminders
- [ ] Notification settings

---

## ФАЗА 3: Оптимізація та масштабування (4-6 тижнів)

### Backend Завдання (ТЗ розділ 8, Фаза 3)

#### Тиждень 1-2: Аналітика
- [ ] Моделі для зберігання прогресу
- [ ] Алгоритми аналізу прогресивності
- [ ] Прогнозування результатів
- [ ] Weekly/monthly reports

#### Тиждень 2-3: Оптимізація
- [ ] Redis кешування
- [ ] Database query optimization
- [ ] Connection pooling
- [ ] Load balancing setup

#### Тиждень 3-4: Масштабування
- [ ] Horizontal scaling
- [ ] Database replicas
- [ ] CDN для статики
- [ ] Kubernetes (optional)

#### Тиждень 4-5: Безпека
- [ ] Security audit
- [ ] GDPR compliance
- [ ] Data export endpoint
- [ ] Data deletion endpoint
- [ ] Privacy policy updates

#### Тиждень 5-6: Фінальне тестування
- [ ] Load testing (k6)
- [ ] Penetration testing
- [ ] Performance benchmarks
- [ ] Stress testing

### Frontend Завдання (ТЗ розділ 6, Фаза 3)

#### Тиждень 1-2: Оптимізація
- [ ] Lazy loading screens
- [ ] Bundle size optimization
- [ ] Image optimization
- [ ] Memory management

#### Тиждень 2-3: Offline Mode
- [ ] Offline data sync
- [ ] Queue for offline actions
- [ ] Conflict resolution
- [ ] No internet screen

#### Тиждень 3-4: Accessibility
- [ ] Screen reader support
- [ ] High contrast mode
- [ ] Font scaling
- [ ] Voice control

#### Тиждень 4-5: Final Testing
- [ ] Usability testing
- [ ] UI/UX optimization
- [ ] Performance testing
- [ ] Cross-device testing

#### Тиждень 5-6: Release Preparation
- [ ] App Store assets
- [ ] Play Store assets
- [ ] Marketing screenshots
- [ ] App review submission

---

## � ІНТЕГРАЦІЇ (детально)

### 1. Платіжні системи (ТЗ 7.4.1)

#### Stripe (рекомендовано)
```javascript
// Підписка BodyPro - 274 UAH/місяць
{
  priceId: "price_bodypro_monthly",
  currency: "UAH",
  amount: 27400, // в копійках
  interval: "month"
}
```
- Customer portal для управління підпискою
- Webhooks для оновлення статусу
- Apple Pay / Google Pay через Stripe

#### LiqPay (альтернатива для України)
- Популярна в Україні
- Підтримує гривню
- Checkout widget

### 2. AI - OpenAI (ТЗ 7.2.4)
```javascript
// Модель для плану сушки
model: "gpt-4-turbo-preview"
temperature: 0.7
max_tokens: 2000
```

**Ліміти для BodyPro:**
- 5 генерацій плану сушки/місяць
- 20 AI рецептів/місяць
- Необмежені AI рекомендації

### 3. Push-сповіщення (ТЗ 7.4.2)
```
Firebase Cloud Messaging (FCM)
├── Нагадування про прийом їжі (сніданок, обід, вечеря)
├── Нагадування про воду (кожні 2 години)
├── Мотиваційні повідомлення
├── Оновлення плану сушки
└── Акції та знижки
```

### 4. База продуктів (ТЗ 7.4.3)
```
Open Food Facts API (безкоштовно)
├── Пошук за назвою
├── Пошук за штрихкодом
├── КБЖУ на 100г
└── Локалізація (українська)

Власна база даних
├── Seed з популярних українських продуктів
├── User-generated products
└── Верифікація модераторами
```

### 5. Email сервіс
```
SendGrid / AWS SES
├── Email verification
├── Password reset
├── Welcome email
├── Subscription receipts
└── Support responses
```

---

## 🗄️ СХЕМА БАЗИ ДАНИХ (Prisma)

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id              String         @id @default(uuid())
  email           String         @unique
  passwordHash    String?
  emailVerified   Boolean        @default(false)
  twoFactorEnabled Boolean       @default(false)
  
  profile         Profile?
  subscription    Subscription?
  meals           Meal[]
  waterLogs       WaterLog[]
  weightLogs      WeightLog[]
  dryingPlans     DryingPlan[]
  customFoods     Food[]
  favorites       FavoriteFood[]
  fcmTokens       FcmToken[]
  
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
}

model Profile {
  id              String         @id @default(uuid())
  userId          String         @unique
  user            User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  name            String
  gender          Gender
  birthDate       DateTime
  height          Float          // см
  currentWeight   Float          // кг
  targetWeight    Float?         // кг
  activityLevel   ActivityLevel
  goal            Goal
  
  // Розраховані значення
  bmr             Float          // Базовий метаболізм
  tdee            Float          // Денна норма калорій
  
  // Кастомні цілі КБЖУ
  calorieGoal     Int
  proteinGoal     Int            // грам
  carbsGoal       Int            // грам
  fatsGoal        Int            // грам
  waterGoal       Float          // літрів
  
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
}

enum Gender {
  MALE
  FEMALE
}

enum ActivityLevel {
  SEDENTARY
  LIGHT
  MODERATE
  ACTIVE
  VERY_ACTIVE
}

enum Goal {
  LOSE_WEIGHT
  MAINTAIN
  GAIN_MUSCLE
  DRYING
}

model Food {
  id              String         @id @default(uuid())
  name            String
  brand           String?
  barcode         String?        @unique
  
  calories        Float          // на 100г
  protein         Float
  carbs           Float
  fats            Float
  fiber           Float?
  sugar           Float?
  
  servingSize     Float          @default(100)
  servingUnit     String         @default("г")
  
  isVerified      Boolean        @default(false)
  createdByUserId String?
  createdByUser   User?          @relation(fields: [createdByUserId], references: [id])
  
  mealFoods       MealFood[]
  favorites       FavoriteFood[]
  
  createdAt       DateTime       @default(now())
}

model Meal {
  id              String         @id @default(uuid())
  userId          String
  user            User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  date            DateTime       @db.Date
  type            MealType
  
  foods           MealFood[]
  
  totalCalories   Float          @default(0)
  totalProtein    Float          @default(0)
  totalCarbs      Float          @default(0)
  totalFats       Float          @default(0)
  
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  
  @@unique([userId, date, type])
}

enum MealType {
  BREAKFAST
  LUNCH
  DINNER
  SNACK
}

model MealFood {
  id              String         @id @default(uuid())
  mealId          String
  meal            Meal           @relation(fields: [mealId], references: [id], onDelete: Cascade)
  foodId          String
  food            Food           @relation(fields: [foodId], references: [id])
  
  servingAmount   Float          // кількість порцій
  
  calories        Float
  protein         Float
  carbs           Float
  fats            Float
  
  createdAt       DateTime       @default(now())
}

model FavoriteFood {
  id              String         @id @default(uuid())
  userId          String
  user            User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  foodId          String
  food            Food           @relation(fields: [foodId], references: [id])
  
  createdAt       DateTime       @default(now())
  
  @@unique([userId, foodId])
}

model WaterLog {
  id              String         @id @default(uuid())
  userId          String
  user            User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  date            DateTime       @db.Date
  amount          Float          // мл
  
  createdAt       DateTime       @default(now())
}

model WeightLog {
  id              String         @id @default(uuid())
  userId          String
  user            User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  date            DateTime       @db.Date
  weight          Float          // кг
  note            String?
  
  createdAt       DateTime       @default(now())
  
  @@unique([userId, date])
}

model DryingPlan {
  id              String         @id @default(uuid())
  userId          String
  user            User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  startDate       DateTime
  endDate         DateTime
  durationWeeks   Int
  
  startWeight     Float
  targetWeight    Float
  
  phases          DryingPhase[]
  
  isActive        Boolean        @default(true)
  
  createdAt       DateTime       @default(now())
}

model DryingPhase {
  id              String         @id @default(uuid())
  planId          String
  plan            DryingPlan     @relation(fields: [planId], references: [id], onDelete: Cascade)
  
  weekNumber      Int
  calorieGoal     Int
  proteinGoal     Int
  carbsGoal       Int
  fatsGoal        Int
  
  mealPlan        Json?          // JSON з меню на тиждень
  recommendations String?
}

model Subscription {
  id                   String             @id @default(uuid())
  userId               String             @unique
  user                 User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  stripeCustomerId     String?
  stripeSubscriptionId String?
  
  plan                 SubscriptionPlan   @default(FREE)
  status               SubscriptionStatus @default(ACTIVE)
  
  currentPeriodStart   DateTime?
  currentPeriodEnd     DateTime?
  
  createdAt            DateTime           @default(now())
  updatedAt            DateTime           @updatedAt
}

enum SubscriptionPlan {
  FREE
  BODY_PRO
}

enum SubscriptionStatus {
  ACTIVE
  CANCELED
  PAST_DUE
  EXPIRED
}

model FcmToken {
  id              String         @id @default(uuid())
  userId          String
  user            User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  token           String
  platform        String         // ios, android
  
  createdAt       DateTime       @default(now())
  
  @@unique([userId, token])
}
```

---

## 🔐 БЕЗПЕКА ТА GDPR (ТЗ 4.2, 7.3)

### Безпека
| Вимога | Реалізація | Фаза |
|--------|------------|------|
| Шифрування даних | AES-256 для sensitive data | Фаза 2 |
| Шифрування паролів | bcrypt (salt rounds: 12) | MVP |
| JWT токени | access: 15min, refresh: 7 days | MVP |
| HTTPS | SSL/TLS обов'язково | MVP |
| Rate limiting | 100 req/min per IP | MVP |
| Input validation | class-validator / Zod | MVP |
| SQL injection | Prisma ORM | MVP |
| XSS protection | Helmet.js | MVP |
| 2FA | TOTP (Google Authenticator) | Фаза 2 |

### GDPR Compliance (ТЗ 4.2.3)
- [ ] Згода на обробку персональних даних (при реєстрації)
- [ ] Право на видалення даних (DELETE /users/me)
- [ ] Право на експорт даних (GET /users/me/export)
- [ ] Політика конфіденційності (Privacy Policy)
- [ ] Cookie policy
- [ ] Data retention policy (зберігання 2 роки після видалення)
- [ ] Медичні застереження щодо планів сушки

---

## 💰 ОРІЄНТОВНИЙ БЮДЖЕТ НА ІНФРАСТРУКТУРУ

| Сервіс | Вартість/місяць | Примітка |
|--------|-----------------|----------|
| Railway (backend) | $20-50 | Scaling on demand |
| Supabase (PostgreSQL) | $25 | Free tier до 500MB |
| Upstash (Redis) | $10 | Free tier до 10k req/day |
| OpenAI API | $50-200 | ~$0.01 per request |
| Firebase (push) | $0 | Free tier достатньо |
| SendGrid (email) | $15 | 40k emails/month |
| Sentry (errors) | $26 | 5k events/month |
| Stripe | 2.9% + $0.30 | Per transaction |
| **Разом** | **~$150-350/міс** | На старті |

---

## 📊 МОНІТОРИНГ ТА АНАЛІТИКА

| Інструмент | Призначення |
|------------|-------------|
| Sentry | Error tracking |
| Prometheus + Grafana | Backend metrics |
| Firebase Analytics | Mobile analytics |
| Mixpanel / Amplitude | Product analytics |
| Uptime Robot | Uptime monitoring |

---

## 📝 ЧЕКЛИСТ ПЕРЕД РЕЛІЗОМ

### Технічна готовність
- [ ] Всі API endpoints працюють
- [ ] Unit tests > 80% coverage
- [ ] Integration tests
- [ ] Performance tests (< 200ms API response)
- [ ] Security audit passed
- [ ] Load testing (до 500k users)

### Продуктова готовність
- [ ] Всі екрани реалізовані за дизайном
- [ ] Українська локалізація
- [ ] Анімації працюють
- [ ] Push-сповіщення працюють
- [ ] Платежі працюють
- [ ] Offline режим працює
- [ ] Error handling всюди

### Документація
- [ ] API документація (Swagger/OpenAPI)
- [ ] README для розробників
- [ ] Privacy Policy (українською)
- [ ] Terms of Service (українською)
- [ ] Медичні застереження

### App Store / Play Store
- [ ] App icons (1024x1024)
- [ ] Screenshots (всі розміри)
- [ ] App description (українською)
- [ ] Keywords/Tags
- [ ] Privacy policy URL
- [ ] Support email
- [ ] Age rating (4+)

---

## 🎯 РЕЗУЛЬТАТИ ПО ФАЗАХ

### MVP (Травень 2025)
✅ Реєстрація/вхід
✅ Профіль з розрахунком КБЖУ
✅ Щоденник харчування
✅ Пошук продуктів
✅ Трекер води
✅ Базові графіки
✅ Profile management

### Фаза 2 (Серпень 2025)
✅ AI план сушки (BodyPro)
✅ AI рецепти
✅ Підписка та платежі
✅ 2FA
✅ Push-сповіщення
✅ Розширені графіки
✅ Email підтримка
✅ Barcode scanner

### Фаза 3 (Листопад 2025)
✅ Продуктивність < 3 сек
✅ Масштабованість 500K users
✅ GDPR compliance
✅ Offline режим
✅ Accessibility
✅ **Готовність до релізу**

### Реліз (Травень 2026)
🚀 App Store
🚀 Google Play Store

---

## 📋 AI PROMPTS (OpenAI)

### Dry Plan Generation
```javascript
const dryPlanPrompt = `
Ти - персональний дієтолог та тренер з досвідом сушки тіла.
Створи персоналізований план сушки для користувача.

ДАНІ КОРИСТУВАЧА:
- Стать: ${gender}
- Вік: ${age} років
- Зріст: ${height} см
- Поточна вага: ${currentWeight} кг
- Цільова вага: ${targetWeight} кг
- Рівень активності: ${activityLevel}
- Поточна калорійність: ${tdee} ккал/день

ВИМОГИ ДО ПЛАНУ (ТЗ 3.6):
1. Розрахуй поетапне зниження калорійності на 8-12 тижнів
2. Адаптуй КБЖУ під кожну фазу сушки
3. Для кожного тижня вкажи:
   - Калорійність
   - Білки (2-2.5г на кг ваги)
   - Жири (0.8-1г на кг ваги)
   - Вуглеводи (залишок)
4. Додай готові меню/рецепти для сушки
5. Дай прогноз результатів

ФОРМАТ ВІДПОВІДІ: JSON
{
  "duration_weeks": 10,
  "phases": [
    {
      "week": 1,
      "calories": 2200,
      "protein": 180,
      "fats": 70,
      "carbs": 180,
      "meals": {
        "breakfast": "Вівсянка з протеїном...",
        "lunch": "Куряча грудка з рисом...",
        "dinner": "Риба з овочами...",
        "snacks": ["Сир 5%", "Яблуко"]
      },
      "recommendations": "..."
    }
  ],
  "predicted_weight_loss": "5-7 кг",
  "warnings": ["Медичне застереження..."]
}
`;
```

### Recipe Generation
```javascript
const recipePrompt = `
Створи здоровий рецепт страви для сушки тіла.

КРИТЕРІЇ:
- Максимум калорій: ${maxCalories}
- Мінімум білка: ${minProtein}г
- Максимум вуглеводів: ${maxCarbs}г
- Час приготування: до ${maxTime} хвилин
- Тип прийому їжі: ${mealType}

ФОРМАТ ВІДПОВІДІ:
{
  "name": "Назва страви",
  "cooking_time": 25,
  "servings": 2,
  "ingredients": [
    {"name": "Куряча грудка", "amount": 300, "unit": "г"}
  ],
  "steps": [
    "Крок 1: ...",
    "Крок 2: ..."
  ],
  "nutrition_per_serving": {
    "calories": 350,
    "protein": 45,
    "carbs": 15,
    "fats": 12
  }
}
`;
```

---

## 💰 МОДЕЛЬ МОНЕТИЗАЦІЇ (ТЗ 2.3)

### Free Plan
| Функція | Ліміт |
|---------|-------|
| Відстеження калорій | ✅ Без обмежень |
| Трекер води | ✅ Без обмежень |
| Базова статистика | ✅ Тижнева |
| База продуктів | 🔸 Обмежена (1000) |
| Barcode scanner | ❌ |
| AI функції | ❌ |
| Реклама | ✅ Показується |

### BodyPro Plan (274 UAH/місяць)
| Функція | Ліміт |
|---------|-------|
| Все з Free | ✅ |
| AI план сушки | ✅ 5 генерацій/місяць |
| AI рецепти | ✅ 20 генерацій/місяць |
| AI аналітика | ✅ Без обмежень |
| Повна база продуктів | ✅ 500,000+ |
| Barcode scanner | ✅ |
| Детальна статистика | ✅ Рік |
| Експорт даних | ✅ CSV/PDF |
| Пріоритетна підтримка | ✅ |
| Реклама | ❌ Без реклами |

---

## 🧪 ТЕСТУВАННЯ

### Backend Testing
| Тип | Інструмент | Coverage Target |
|-----|------------|-----------------|
| Unit tests | Jest | > 80% |
| Integration tests | Supertest | > 70% |
| E2E tests | Playwright | Critical paths |
| Load tests | k6 | 500k users |

### Frontend Testing
| Тип | Інструмент | Coverage Target |
|-----|------------|-----------------|
| Unit tests | Jest + RTL | > 70% |
| Component tests | Storybook | All components |
| E2E tests | Detox | Critical paths |
| Manual QA | - | All screens |

---

## 📱 UI/UX ВИМОГИ (ТЗ розділ 9-11)

### Кольорова палітра (ТЗ 9.3)
| Елемент | Колір |
|---------|-------|
| Фон (основний) | #060603 (темна тема) |
| Фон (картки) | #FEFFFC |
| Заголовки | #060603 / #FFFFFF |
| Кнопки (primary) | #060603 |
| Акцент | #BBE0FF |
| Успіх (оплата) | gradient gold/silver |

### Типографіка (ТЗ 9.5)
| Елемент | Шрифт | Розмір |
|---------|-------|--------|
| Заголовки | Montserrat / Castoro Titling | 20-40px |
| Текст | Montserrat | 14-20px |
| Кнопки | Montserrat | 16px |

### UI Компоненти (ТЗ 10.2)
- [ ] Кнопки (primary, secondary, text)
- [ ] Поля введення
- [ ] Перемикачі та чекбокси
- [ ] Випадаючі списки
- [ ] Графіки та діаграми
- [ ] Навігаційна панель
- [ ] Модальні вікна

### Анімації (ТЗ 10.4)
- [ ] Переходи між екранами
- [ ] Анімації графіків
- [ ] Мікро-взаємодії (кнопки, toggle)
- [ ] Loading states
- [ ] Pull-to-refresh

---

## 📄 ДОДАТКОВІ МАТЕРІАЛИ (ТЗ 10.5)

- [ ] Логотип додатку
- [ ] Графічні матеріали для App Store / Google Play
- [ ] Гайдлайни для розробників (Design System)
- [ ] Юзабіліті-тестування
- [ ] Прототипи (Figma)

---

## 🔗 КОРИСНІ ПОСИЛАННЯ

### API Документація
- OpenAI: https://platform.openai.com/docs
- Open Food Facts: https://world.openfoodfacts.org/data
- Stripe: https://stripe.com/docs
- Firebase: https://firebase.google.com/docs

### Design Guidelines
- Material Design: https://material.io
- Human Interface Guidelines: https://developer.apple.com/design/human-interface-guidelines

### Інструменти
- Figma: https://figma.com
- Expo: https://expo.dev
- Railway: https://railway.app
- Supabase: https://supabase.com
