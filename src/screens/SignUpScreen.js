import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Input, Button } from '../components';
import { useAuthStore } from '../store';
import { useTranslation } from '../i18n';

const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password) => {
  // Пароль має містити велику, малу літеру та цифру, мінімум 8 символів
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasMinLength = password.length >= 8;
  return hasUpperCase && hasLowerCase && hasNumber && hasMinLength;
};

export const SignUpScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  
  const { register, isSubmitting, error, clearError } = useAuthStore();

  // Show API error when it changes
  useEffect(() => {
    if (error) {
      setApiError(error);
      // Автоматично скрити помилку через 5 секунд
      const timer = setTimeout(() => {
        setApiError('');
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Очистити помилку при зміні полів
  const clearApiError = () => {
    if (apiError) {
      setApiError('');
      clearError();
    }
  };

  const handleNameChange = (text) => {
    setName(text);
    clearApiError();
  };

  const handleEmailChange = (text) => {
    setEmail(text);
    clearApiError();
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    clearApiError();
  };

  const handleConfirmPasswordChange = (text) => {
    setConfirmPassword(text);
    clearApiError();
  };

  const handleSignUp = async () => {
    clearError();
    setApiError('');
    const newErrors = {};
    
    if (!name) newErrors.name = t('validation.enterName');
    if (!email) {
      newErrors.email = t('validation.enterEmail');
    } else if (!validateEmail(email)) {
      newErrors.email = t('validation.invalidEmail');
    }
    if (!password) {
      newErrors.password = t('validation.enterPassword');
    } else if (!validatePassword(password)) {
      newErrors.password = t('validation.passwordRequirements');
    }
    if (!confirmPassword) {
      newErrors.confirmPassword = t('validation.confirmPassword');
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = t('validation.passwordsMismatch');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    const success = await register(email, password);
    // If success, navigation will be handled by auth state change
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.dark} />
          </TouchableOpacity>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Створити обліковий запис</Text>

            {apiError ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={20} color="#fff" />
                <Text style={styles.errorBannerText}>{apiError}</Text>
              </View>
            ) : null}

            <View style={styles.form}>
              <Input
                label={t('auth.name')}
                value={name}
                onChangeText={handleNameChange}
                placeholder={t('auth.enterName')}
                error={errors.name}
              />

              <Input
                label="Email"
                value={email}
                onChangeText={handleEmailChange}
                placeholder="Введіть ваш email"
                keyboardType="email-address"
                autoComplete="email"
                textContentType="emailAddress"
                error={errors.email}
              />

              <Input
                label="Пароль"
                value={password}
                onChangeText={handlePasswordChange}
                placeholder="Введіть пароль"
                secureTextEntry
                autoComplete="new-password"
                textContentType="newPassword"
                error={errors.password}
              />

              <Input
                label="Підтвердіть пароль"
                value={confirmPassword}
                onChangeText={handleConfirmPasswordChange}
                placeholder="Повторіть пароль"
                secureTextEntry
                autoComplete="off"
                textContentType="none"
                error={errors.confirmPassword}
              />
            </View>

            <Text style={styles.privacyText}>
              Реєструючись, ви погоджуєтесь з{' '}
              <Text 
                style={styles.privacyLink}
                onPress={() => navigation.navigate('PrivacyPolicy')}
              >
                Політикою конфіденційності
              </Text>
            </Text>

            <Button 
              title={isSubmitting ? "Завантаження..." : "Зареєструватися"} 
              onPress={handleSignUp}
              disabled={isSubmitting}
              variant="dark"
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>або</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtons}>
              <TouchableOpacity style={styles.socialButton} onPress={() => Alert.alert(t('common.info') || 'Інформація', 'Реєстрація через Google буде доступна незабаром')}>
                <Ionicons name="logo-google" size={24} color={Colors.dark} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton} onPress={() => Alert.alert(t('common.info') || 'Інформація', 'Реєстрація через Apple буде доступна незабаром')}>
                <Ionicons name="logo-apple" size={24} color={Colors.dark} />
              </TouchableOpacity>
            </View>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Вже є обліковий запис? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Увійти</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightBackground,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: 20,
  },
  formContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 30,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DC3545',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
    gap: 10,
  },
  errorBannerText: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
  form: {
    marginBottom: 20,
  },
  privacyText: {
    fontSize: 12,
    color: Colors.dark,
    marginBottom: 20,
    lineHeight: 18,
  },
  privacyLink: {
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 30,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.inputBorder,
  },
  dividerText: {
    marginHorizontal: 15,
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.7)',
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 20,
    marginBottom: 30,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    fontSize: 12,
    color: Colors.dark,
  },
  loginLink: {
    fontSize: 12,
    color: Colors.dark,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
