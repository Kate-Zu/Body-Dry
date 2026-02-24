import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Input, Button } from '../../components';
import { useTranslation } from '../../i18n';

export const BodyParamsScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const onboardingData = route?.params?.onboardingData || {};
  
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [height, setHeight] = useState('');
  const [currentWeight, setCurrentWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [errors, setErrors] = useState({});

  // Функция форматирования даты ДД-ММ-РРРР
  const formatBirthDate = (text) => {
    // Убираем все не-цифры
    let cleaned = text.replace(/\D/g, '');
    
    // Ограничиваем длину до 8 цифр
    if (cleaned.length > 8) {
      cleaned = cleaned.slice(0, 8);
    }
    
    // Валидация дня (01-31)
    if (cleaned.length >= 2) {
      let day = parseInt(cleaned.slice(0, 2));
      if (day > 31) day = 31;
      if (day < 1) day = 1;
      cleaned = day.toString().padStart(2, '0') + cleaned.slice(2);
    }
    
    // Валидация месяца (01-12)
    if (cleaned.length >= 4) {
      let month = parseInt(cleaned.slice(2, 4));
      if (month > 12) month = 12;
      if (month < 1) month = 1;
      cleaned = cleaned.slice(0, 2) + month.toString().padStart(2, '0') + cleaned.slice(4);
    }
    
    // Валидация года (1900-2025)
    if (cleaned.length >= 8) {
      let year = parseInt(cleaned.slice(4, 8));
      if (year > 2025) year = 2025;
      if (year < 1900) year = 1900;
      cleaned = cleaned.slice(0, 4) + year.toString();
    }
    
    // Добавляем разделители
    let formatted = '';
    if (cleaned.length > 0) {
      formatted = cleaned.slice(0, 2);
    }
    if (cleaned.length > 2) {
      formatted += '-' + cleaned.slice(2, 4);
    }
    if (cleaned.length > 4) {
      formatted += '-' + cleaned.slice(4, 8);
    }
    
    return formatted;
  };

  const handleBirthDateChange = (text) => {
    const formatted = formatBirthDate(text);
    setBirthDate(formatted);
  };

  // Валідація дати
  const isValidDate = (dateStr) => {
    if (!/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) return false;
    const [day, month, year] = dateStr.split('-').map(Number);
    if (month < 1 || month > 12) return false;
    if (day < 1 || day > 31) return false;
    if (year < 1900 || year > 2025) return false;
    
    // Перевірка кількості днів у місяці
    const daysInMonth = new Date(year, month, 0).getDate();
    if (day > daysInMonth) return false;
    
    return true;
  };

  // Конвертация ДД-ММ-РРРР в РРРР-ММ-ДД для API
  const convertDateForApi = (dateStr) => {
    if (!/^\d{2}-\d{2}-\d{4}$/.test(dateStr)) return null;
    const [day, month, year] = dateStr.split('-');
    return `${year}-${month}-${day}`;
  };

  const handleContinue = () => {
    const newErrors = {};
    
    if (!name.trim()) newErrors.name = t('validation.nameRequired');
    if (!gender) newErrors.gender = t('validation.selectGender');
    if (!birthDate) {
      newErrors.birthDate = t('validation.enterBirthDate');
    } else if (!isValidDate(birthDate)) {
      newErrors.birthDate = t('validation.invalidDateFormat');
    }
    if (!height) {
      newErrors.height = t('validation.enterHeight');
    } else if (parseInt(height) < 100 || parseInt(height) > 250) {
      newErrors.height = t('validation.heightRange');
    }
    if (!currentWeight) {
      newErrors.currentWeight = t('validation.enterWeight');
    } else if (parseFloat(currentWeight) < 30 || parseFloat(currentWeight) > 300) {
      newErrors.currentWeight = t('validation.weightRange');
    }
    
    // Валідація цільової ваги
    if (targetWeight) {
      const targetW = parseFloat(targetWeight);
      if (isNaN(targetW) || targetW < 30 || targetW > 300) {
        newErrors.targetWeight = t('validation.targetWeightRange');
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    navigation.navigate('ActivityLevel', {
      onboardingData: {
        ...onboardingData,
        name: name.trim(),
        gender,
        birthDate: convertDateForApi(birthDate),
        height: parseInt(height),
        currentWeight: parseFloat(currentWeight),
        targetWeight: targetWeight ? parseFloat(targetWeight) : null,
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="chevron-back" size={24} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.stepText}>{t('onboarding.step2of3')}</Text>
          </View>

          <Text style={styles.title}>{t('onboarding.step1Title')}</Text>
          <Text style={styles.subtitle}>
            {t('onboarding.paramsDesc')}
          </Text>

          <View style={styles.form}>
            <Input
              label={t('profile.name')}
              placeholder={t('auth.enterName')}
              value={name}
              onChangeText={setName}
              error={errors.name}
              maxLength={50}
              variant="dark"
            />

            <Text style={styles.label}>{t('profile.gender')}</Text>
            <View style={styles.genderContainer}>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === 'MALE' && styles.genderButtonSelected,
                ]}
                onPress={() => setGender('MALE')}
              >
                <Ionicons
                  name="male"
                  size={24}
                  color={gender === 'MALE' ? Colors.primary : Colors.white}
                />
                <Text
                  style={[
                    styles.genderText,
                    gender === 'MALE' && styles.genderTextSelected,
                  ]}
                >
                  {t('profile.male')}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.genderButton,
                  gender === 'FEMALE' && styles.genderButtonSelected,
                ]}
                onPress={() => setGender('FEMALE')}
              >
                <Ionicons
                  name="female"
                  size={24}
                  color={gender === 'FEMALE' ? Colors.primary : Colors.white}
                />
                <Text
                  style={[
                    styles.genderText,
                    gender === 'FEMALE' && styles.genderTextSelected,
                  ]}
                >
                  {t('profile.female')}
                </Text>
              </TouchableOpacity>
            </View>
            {errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}

            <Input
              label={t('profile.birthDate')}
              value={birthDate}
              onChangeText={handleBirthDateChange}
              placeholder={t('onboarding.dateFormat')}
              keyboardType="numeric"
              error={errors.birthDate}
              variant="dark"
            />

            <View style={styles.row}>
              <View style={styles.halfInput}>
                <Input
                  label={`${t('profile.height')} (${t('units.cm')})`}
                  value={height}
                  onChangeText={setHeight}
                  placeholder="170"
                  keyboardType="numeric"
                  error={errors.height}
                  variant="dark"
                />
              </View>
              <View style={styles.halfInput}>
                <Input
                  label={`${t('profile.weight')} (${t('units.kg')})`}
                  value={currentWeight}
                  onChangeText={setCurrentWeight}
                  placeholder="70"
                  keyboardType="numeric"
                  error={errors.currentWeight}
                  variant="dark"
                />
              </View>
            </View>

            <Input
              label={t('onboarding.targetWeightOptional')}
              value={targetWeight}
              onChangeText={setTargetWeight}
              placeholder="65"
              keyboardType="numeric"
              error={errors.targetWeight}
              variant="dark"
            />
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <Button title={t('common.next')} onPress={handleContinue} variant="dark" />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
  },
  stepText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    color: Colors.white,
    marginRight: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 30,
  },
  form: {
    flex: 1,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.white,
    marginBottom: 8,
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  genderButtonSelected: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(187, 224, 255, 0.2)',
  },
  genderText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.white,
  },
  genderTextSelected: {
    color: Colors.primary,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: -15,
    marginBottom: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 15,
  },
  halfInput: {
    flex: 1,
  },
  footer: {
    padding: 20,
    paddingBottom: 30,
  },
});
