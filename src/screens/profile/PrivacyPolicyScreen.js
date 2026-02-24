import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useTranslation, useLanguage } from '../../i18n';

const PRIVACY_POLICY_UK = `
BODY&DRY ПОЛІТИКА КОНФІДЕНЦІЙНОСТІ

Вступ
Ця Політика конфіденційності описує, як мобільний додаток Body&Dry збирає, використовує, зберігає та захищає персональні дані користувачів. Конфіденційність та безпека наших користувачів є нашим пріоритетом. Політика відповідає GDPR та Закону України "Про захист персональних даних".

Зібрані дані

2.1. Персональні дані
• Дані профілю (вік, стать, вага, зріст, рівень активності, цілі)
• Email
• Пароль (зашифрований)
• Дані харчування (продукти, КБЖУ, норми води)
• Дані прогресу (графіки, прогнози сушки)
• Платіжні дані (обробка через третіх осіб)

2.2. Технічні дані
• IP-адреса
• Тип пристрою
• Версія ОС (iOS 13.0+, Android 8.0+)
• Логи використання (взаємодія, помилки)
• Геолокація (за згодою)

2.3. Аналітика
• Активність (частота функцій)
• Час у додатку
• Взаємодія (КБЖУ, графіки, плани сушки)
• Дані від третіх сторін (анонімізовані кліки)

Мета збору даних
Ми збираємо дані з наступних причин:
• Надання функцій (розрахунок BMR/TDEE, плани сушки, графіки)
• Персоналізація (рекомендації страв)
• Аналіз та покращення (виявлення помилок)
• Моніторинг KPI та безпеки
• Обробка платежів (BodyPro) та реклама
• Комунікація (сповіщення, підтримка)

Правові підстави для обробки даних
3.1. Згода користувача
3.2. Виконання договору (сервіси додатку)
3.3. Відповідність GDPR та українському законодавству

Обмін та передача даних

4.1. Треті сторони
Ми передаємо анонімізовані дані до:
• Платіжних систем (Apple Pay, PayPal)
• Партнерів (дієтологи)
• Хмарних сервісів (Azure)
• Рекламодавців (спортивні товари)
• Регуляторів (за запитом)

4.2. Умови передачі
• Тільки необхідні дані
• Угоди про конфіденційність
• Безпека (шифрування, GDPR)

Права користувачів
Користувачі мають право:
5.1. Отримувати дані
5.2. Виправляти неточності
5.3. Видаляти дані (профіль)
5.4. Обмежувати обробку
5.5. Заперечувати (маркетинг, аналітика)
5.6. Переносити дані
5.7. Відкликати згоду
5.8. Скаржитися регуляторам

Безпека даних

6.1. Технічні заходи
• Шифрування (HTTPS, AES-256)
• 2FA
• Аудити безпеки
• Моніторинг вразливостей

6.2. Організаційні заходи
• Обмежений доступ
• Навчання персоналу
• Мінімізація даних
• Повідомлення про витоки (72 години)

Cookies та відстеження
7.1. Функціональні cookies (кешування)
7.2. Відмова через налаштування
7.3. Анонімізація для аналітики

Діти та конфіденційність
8.1. Не для осіб до 16 років
8.2. Дані від неповнолітніх не збираються

Зміни політики
• Регулярні оновлення
• Повідомлення про зміни

Останнє оновлення: 20.05.2026

Контактна інформація
Email: support@bodyndry.app
Адреса: Україна, Дніпро, "Дніпровський технологічний університет "IT STEP""

Згода користувача
Використання додатку означає згоду з Політикою.

Дякуємо за довіру!
`;

const PRIVACY_POLICY_EN = `
BODY&DRY PRIVACY POLICY

Introduction
This Privacy Policy describes how the Body&Dry mobile application collects, uses, stores and protects users' personal data. The privacy and security of our users is our priority. The Policy complies with the GDPR and the Law of Ukraine "On Personal Data Protection".

Collected data

2.1. Personal data
• Profile data (age, gender, weight, height, activity level, goals)
• Email
• Password (encrypted)
• Nutrition data (foods, KBJU, water norms)
• Progress data (graphs, drying forecasts)
• Payment data (processing through third parties)

2.2. Technical data
• IP address
• Device type
• OS version (iOS 13.0+, Android 8.0+)
• Usage logs (interaction, errors)
• Location (with consent)

2.3. Analytics
• Activity (frequency of functions)
• Time in the application
• Interaction (KBZHU, graphs, drying plans)
• Data from third parties (anonymized clicks)

Purpose of data collection
We collect data for the following reasons:
• Providing features (BMR/TDEE calculation, drying plans, graphs)
• Personalization (meal recommendations)
• Analysis and improvement (error detection)
• KPI and security monitoring
• Payment processing (BodyPro) and advertising
• Communication (notifications, support)

Legal grounds for data processing
3.1. User consent
3.2. Contract performance (application services)
3.3. Compliance with GDPR and Ukrainian legislation

Data exchange and transmission

4.1. Third parties
We transfer anonymized data to:
• Payment systems (Apple Pay, PayPal)
• Partners (nutritionists)
• Cloud services (Azure)
• Advertisers (sporting goods)
• Regulators (upon request)

4.2. Terms of Transfer
• Only Necessary Data
• Confidentiality Agreements
• Security (Encryption, GDPR)

User rights
Users have the right to:
5.1. Receive data
5.2. Correct inaccuracies
5.3. Delete data (profile)
5.4. Restrict processing
5.5. Object (marketing, analytics)
5.6. Port data
5.7. Withdraw consent
5.8. Complain to regulators

Data security

6.1. Technical measures
• Encryption (HTTPS, AES-256)
• 2FA
• Security audits
• Vulnerability monitoring

6.2. Organizational measures
• Limited access
• Staff training
• Data minimization
• Notification of leaks (72 hours)

Cookies and tracking
7.1. Functionality cookies (caching)
7.2. Opt-out via settings
7.3. Anonymization for analytics

Children and privacy
8.1. Not for persons under 16 years of age
8.2. Data from minors is not collected

Policy changes
• Regular updates
• Notification of changes

Last update: 05/20/2026

Contact information
Email: support@bodyndry.app
Address: Ukraine, Dnipro, "Dnipro Technological University 'IT STEP'"

User consent
Using the application constitutes agreement to the Policy.

Thank you for your trust!
`;

export const PrivacyPolicyScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { language } = useLanguage();
  
  const policyText = language === 'uk' ? PRIVACY_POLICY_UK : PRIVACY_POLICY_EN;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('profile.privacyPolicy')}</Text>
        <View style={{ width: 42 }} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.policyText}>
          {policyText.split(/(support@bodyndry\.app)/).map((part, index) =>
            part === 'support@bodyndry.app' ? (
              <Text
                key={index}
                style={styles.emailLink}
                onPress={() => Linking.openURL('mailto:support@bodyndry.app')}
              >
                {part}
              </Text>
            ) : (
              part
            )
          )}
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.white,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  policyText: {
    fontSize: 14,
    lineHeight: 22,
    color: 'rgba(255,255,255,0.85)',
  },
  emailLink: {
    color: Colors.primary,
    textDecorationLine: 'underline',
  },
});
