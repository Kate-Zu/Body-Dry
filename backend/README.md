# Body&Dry Backend API

Backend API для мобільного додатку Body&Dry - трекер харчування з AI-підтримкою сушки.

## Технології

- **NestJS** - Framework
- **TypeScript** - Мова програмування
- **Prisma** - ORM
- **PostgreSQL** - База даних
- **JWT** - Аутентифікація
- **Docker** - Контейнеризація

## Швидкий старт

### 1. Встановіть залежності

```bash
npm install
```

### 2. Налаштуйте змінні середовища

```bash
cp .env.example .env
# Відредагуйте .env файл
```

### 3. Запустіть базу даних

```bash
docker-compose up -d postgres
```

### 4. Виконайте міграції

```bash
npm run prisma:generate
npm run prisma:migrate
```

### 5. Заповніть базу даних продуктами

```bash
npm run prisma:seed
```

### 6. Запустіть сервер

```bash
npm run start:dev
```

API буде доступний на `http://localhost:3000`

## API Endpoints

### Аутентифікація
- `POST /auth/register` - Реєстрація
- `POST /auth/login` - Вхід
- `POST /auth/refresh` - Оновлення токену
- `GET /auth/me` - Поточний користувач

### Користувачі
- `GET /users/profile` - Отримати профіль
- `POST /users/profile` - Створити профіль
- `PATCH /users/profile` - Оновити профіль
- `PATCH /users/goals` - Оновити цілі КБЖУ

### Продукти
- `GET /foods/search?q=назва` - Пошук продуктів
- `GET /foods/barcode/:code` - Пошук за штрих-кодом
- `GET /foods/:id` - Деталі продукту
- `POST /foods` - Додати продукт
- `GET /foods/favorites` - Улюблені продукти
- `POST /foods/:id/favorite` - Додати в улюблені
- `DELETE /foods/:id/favorite` - Видалити з улюблених
- `GET /foods/recent` - Нещодавні продукти

### Щоденник
- `GET /diary?date=YYYY-MM-DD` - Денний звіт
- `POST /diary/entry` - Додати запис
- `PATCH /diary/entry/:id` - Оновити запис
- `DELETE /diary/entry/:id` - Видалити запис

### Вода
- `GET /water?date=YYYY-MM-DD` - Денне споживання
- `POST /water` - Додати воду
- `GET /water/history?start=&end=` - Історія

### Прогрес
- `GET /progress/weight` - Історія ваги
- `POST /progress/weight` - Додати вагу
- `DELETE /progress/weight/:id` - Видалити запис
- `GET /progress/weekly` - Тижневий звіт
- `GET /progress/monthly` - Місячний звіт
- `GET /progress/yearly` - Річний звіт

## Скрипти

```bash
# Розробка
npm run start:dev

# Збірка
npm run build

# Продакшн
npm run start:prod

# Prisma
npm run prisma:generate  # Генерація клієнта
npm run prisma:migrate   # Міграції (dev)
npm run prisma:studio    # GUI для БД
npm run prisma:seed      # Заповнення продуктами

# Скинути БД
npm run db:reset
```

## Структура проекту

```
src/
├── main.ts                    # Entry point
├── app.module.ts              # Root module
├── prisma/                    # Prisma service
├── common/                    # Guards, decorators, pipes
└── modules/
    ├── auth/                  # Аутентифікація
    ├── users/                 # Користувачі та профілі
    ├── foods/                 # База продуктів
    ├── diary/                 # Щоденник харчування
    ├── water/                 # Трекер води
    └── progress/              # Прогрес та статистика
```

## Ліцензія

Приватний проект. Всі права захищені.
