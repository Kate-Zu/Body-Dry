# Body&Dry - Мобільний додаток

MVP мобільного додатку для відстеження харчування, води та прогресу схуднення.

## 🚀 Швидкий старт

### Встановлення залежностей
```bash
cd mobile-app
npm install
```

### Запуск додатку
```bash
# Запуск Expo dev server
npm start

# Запуск на Android
npm run android

# Запуск на iOS (тільки macOS)
npm run ios

# Запуск в браузері
npm run web
```

## 📱 Функціонал MVP

### Авторизація
- ✅ Екран вітання
- ✅ Вхід в акаунт
- ✅ Реєстрація

### Головна сторінка
- ✅ Відстеження калорій
- ✅ Відстеження макронутрієнтів (білки, жири, вуглеводи)
- ✅ Трекер води
- ✅ Графік ваги

### Щоденник харчування
- ✅ Перегляд прийомів їжі за день
- ✅ Додавання страв до прийомів їжі
- ✅ База даних популярних страв

### Трекер води
- ✅ Відстеження споживання води
- ✅ Налаштування кроку додавання
- ✅ Візуальний прогрес

### Прогрес
- ✅ Статистика за тиждень/місяць/рік
- ✅ Графік ваги
- ✅ Середні показники

### Профіль
- ✅ Інформація користувача
- ✅ Налаштування
- ✅ Вихід з акаунту

### AI Assistant
- ✅ План сушки
- ✅ AI рецепти
- ✅ Аналіз прогресу

## 🛠 Технології

- **React Native** + **Expo** - фреймворк для мобільної розробки
- **React Navigation** - навігація між екранами
- **Zustand** - state management
- **Expo Linear Gradient** - градієнти
- **React Native SVG** - SVG графіка

## 📁 Структура проекту

```
mobile-app/
├── App.js                 # Точка входу
├── src/
│   ├── components/        # UI компоненти
│   │   ├── Button.js
│   │   ├── Card.js
│   │   ├── Input.js
│   │   └── ProgressRing.js
│   ├── screens/           # Екрани додатку
│   │   ├── WelcomeScreen.js
│   │   ├── LoginScreen.js
│   │   ├── SignUpScreen.js
│   │   ├── HomeScreen.js
│   │   ├── DiaryScreen.js
│   │   ├── AddMealScreen.js
│   │   ├── WaterTrackerScreen.js
│   │   ├── ProgressScreen.js
│   │   ├── ProfileScreen.js
│   │   └── AIScreen.js
│   ├── navigation/        # Навігація
│   │   ├── AppNavigator.js
│   │   ├── AuthNavigator.js
│   │   └── MainNavigator.js
│   ├── store/             # State management
│   │   └── useStore.js
│   └── constants/         # Константи
│       └── colors.js
└── assets/                # Ресурси
```

## 🎨 Дизайн

Додаток використовує темну тему з акцентним кольором `#BBE0FF`.

- Фон: `#060603`
- Основний колір: `#BBE0FF`
- Текст: `#FEFFFC`
- Картки: `rgba(187, 224, 255, 0.1)`

## 📝 TODO для продакшну

- [ ] Інтеграція з бекендом
- [ ] Firebase Authentication
- [ ] Реальна база даних продуктів
- [ ] Push-сповіщення
- [ ] Синхронізація даних
- [ ] Офлайн режим
- [ ] Інтеграція AI (OpenAI API)
