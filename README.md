# Body&Dry - Інструкція розгортання на Windows

## 📋 Вимоги до системи

### Обов'язкове ПЗ

| Програма | Версія | Посилання |
|----------|--------|-----------|
| Node.js | 18+ (рекомендовано 20 LTS) | https://nodejs.org/ |
| Docker Desktop | Остання версія | https://www.docker.com/products/docker-desktop/ |
| Git | Остання версія | https://git-scm.com/download/win |

### Для мобільної розробки (додатково)

| Програма | Призначення | Посилання |
|----------|-------------|-----------|
| Android Studio | Android емулятор | https://developer.android.com/studio |
| Expo Go (на телефоні) | Тестування на реальному пристрої | Google Play / App Store |

---

## 🛠️ Встановлення

### Крок 1: Встановіть Node.js

1. Завантажте інсталятор з https://nodejs.org/
2. Виберіть версію **LTS** (рекомендовано)
3. Запустіть інсталятор та дотримуйтесь інструкцій
4. Перевірте встановлення:
   ```powershell
   node --version
   npm --version
   ```

### Крок 2: Встановіть Docker Desktop

1. Завантажте з https://www.docker.com/products/docker-desktop/
2. Запустіть інсталятор
3. Перезавантажте комп'ютер
4. Запустіть Docker Desktop
5. Дочекайтесь повного запуску (іконка в треї стане стабільною)
6. Перевірте встановлення:
   ```powershell
   docker --version
   docker-compose --version
   ```

### Крок 3: Встановіть Git

1. Завантажте з https://git-scm.com/download/win
2. Запустіть інсталятор
3. Перевірте встановлення:
   ```powershell
   git --version
   ```

---

## 🚀 Розгортання Backend

### 1. Перейдіть в директорію backend

```powershell
cd d:\main\body_n_dry\backend
```

### 2. Встановіть залежності

```powershell
npm install
```

### 3. Створіть файл змінних середовища

Створіть файл `.env` в папці `backend`:

```env
# Database
DATABASE_URL="postgresql://bodyndry:bodyndry_secret@localhost:5433/bodyndry"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-change-in-production"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"

# App
PORT=3000
NODE_ENV=development

# Redis (optional)
REDIS_URL="redis://localhost:6379"
```

### 4. Запустіть базу даних PostgreSQL

```powershell
docker-compose up -d postgres
```

Перевірте, що контейнер працює:
```powershell
docker ps
```

### 5. Згенеруйте Prisma клієнт

```powershell
npm run prisma:generate
```

### 6. Виконайте міграції бази даних

```powershell
npm run prisma:migrate
```

### 7. Заповніть базу даних тестовими даними (опціонально)

```powershell
npm run prisma:seed
```

### 8. Запустіть сервер

```powershell
npm run start:dev
```

✅ **Backend доступний на:** http://localhost:3000

### Додаткові команди Backend

```powershell
# Запустити Redis (для кешування)
docker-compose up -d redis

# Відкрити Prisma Studio (GUI для бази даних)
npm run prisma:studio

# Запустити тести
npm test

# Зібрати production версію
npm run build

# Запустити production версію
npm run start:prod
```

---

## 📱 Розгортання Mobile App

### 1. Перейдіть в директорію mobile-app

```powershell
cd d:\main\body_n_dry\mobile-app
```

### 2. Встановіть залежності

```powershell
npm install
```

### 3. Налаштуйте підключення до API

Відкрийте файл `src/api/config.ts` або `src/constants/api.ts` і вкажіть адресу вашого backend:

```typescript
// Для локальної розробки використовуйте IP вашого комп'ютера
// (не localhost, якщо тестуєте на телефоні)
export const API_URL = 'http://192.168.x.x:3000';

// Або для емулятора Android
export const API_URL = 'http://10.0.2.2:3000';
```

> 💡 **Як дізнатися IP комп'ютера:**
> ```powershell
> ipconfig
> ```
> Шукайте "IPv4 Address" в секції вашого мережевого адаптера

### 4. Запустіть Expo

```powershell
npm start
```

### 5. Відкрийте додаток

**На телефоні:**
1. Встановіть Expo Go з магазину додатків
2. Відскануйте QR-код з терміналу

**На емуляторі Android:**
```powershell
npm run android
```

**В браузері:**
```powershell
npm run web
```

### Додаткові команди Mobile App

```powershell
# Запустити тести
npm test

# Запустити тести з покриттям
npm run test:coverage

# Очистити кеш Expo
npx expo start --clear
```

---

## 🌐 Frontend (HTML)

Frontend знаходиться в папці `Frontend/` і складається з статичних HTML файлів.

### Запуск через Live Server (VS Code)

1. Встановіть розширення **Live Server** в VS Code
2. Відкрийте будь-який HTML файл
3. Клікніть "Go Live" в статус-барі

### Запуск через Python HTTP Server

```powershell
cd d:\main\body_n_dry\Frontend
python -m http.server 8080
```

Відкрийте http://localhost:8080

### Запуск через npx serve

```powershell
cd d:\main\body_n_dry\Frontend
npx serve
```

---

## 🔧 Корисні команди

### Docker

```powershell
# Запустити всі сервіси
docker-compose up -d

# Зупинити всі сервіси
docker-compose down

# Переглянути логи
docker-compose logs -f postgres

# Перезапустити сервіс
docker-compose restart postgres

# Видалити всі дані (включаючи volumes)
docker-compose down -v
```

### База даних

```powershell
# Скинути та перестворити базу даних
npm run db:reset

# Застосувати нові міграції
npm run prisma:migrate

# Відкрити GUI для бази даних
npm run prisma:studio
```

### Налагодження

```powershell
# Перевірити порти
netstat -ano | findstr :3000
netstat -ano | findstr :5433

# Перевірити Docker контейнери
docker ps -a

# Переглянути логи контейнера
docker logs bodyndry_db
```

---

## 🚨 Вирішення проблем

### Docker не запускається

1. Переконайтеся, що Docker Desktop запущений
2. Перевірте, чи увімкнена віртуалізація в BIOS
3. Спробуйте перезапустити Docker Desktop

### Порт 5433 зайнятий

```powershell
# Знайти процес
netstat -ano | findstr :5433

# Завершити процес (замініть PID на номер з попередньої команди)
taskkill /PID <PID> /F
```

### Помилка підключення до бази даних

1. Перевірте, чи запущений контейнер: `docker ps`
2. Перевірте DATABASE_URL в `.env` файлі
3. Перезапустіть контейнер: `docker-compose restart postgres`

### Expo не бачить телефон

1. Телефон і комп'ютер повинні бути в одній Wi-Fi мережі
2. Вимкніть VPN
3. Перевірте, чи не блокує firewall порти Expo

### npm install видає помилки

```powershell
# Очистити кеш npm
npm cache clean --force

# Видалити node_modules та встановити заново
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json
npm install
```

---

## 📁 Структура проекту

```
body_n_dry/
├── backend/                 # NestJS API сервер
│   ├── prisma/             # Схема та міграції БД
│   ├── src/
│   │   ├── modules/        # Функціональні модулі
│   │   │   ├── auth/       # Авторизація
│   │   │   ├── diary/      # Щоденник харчування
│   │   │   ├── foods/      # Продукти
│   │   │   ├── progress/   # Прогрес
│   │   │   └── ...
│   │   └── main.ts         # Точка входу
│   └── docker-compose.yml  # Docker конфігурація
│
├── mobile-app/             # React Native / Expo додаток
│   ├── src/
│   │   ├── screens/        # Екрани додатку
│   │   ├── components/     # UI компоненти
│   │   ├── api/            # API клієнт
│   │   ├── store/          # Стан (Zustand)
│   │   └── navigation/     # Навігація
│   └── App.js              # Точка входу
│
└── Frontend/               # HTML макети
    ├── diary/
    ├── profile/
    └── ...
```

---

## 📞 Швидкий старт (TL;DR)

```powershell
# 1. Backend
cd d:\main\body_n_dry\backend
npm install
docker-compose up -d postgres
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
npm run start:dev

# 2. Mobile (в новому терміналі)
cd d:\main\body_n_dry\mobile-app
npm install
npm start
```

---

## 📚 Додаткові ресурси

- [NestJS Documentation](https://docs.nestjs.com/)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Expo Documentation](https://docs.expo.dev/)
- [React Navigation](https://reactnavigation.org/docs/getting-started)
- [Docker Documentation](https://docs.docker.com/)
