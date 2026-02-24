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
  ActivityIndicator,
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

export const LoginScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  
  const { login, isSubmitting, error, clearError } = useAuthStore();

  // Show API error when it changes
  useEffect(() => {
    if (error) {
      setApiError(error);
      // Автоматически скрыть ошибку через 5 секунд
      const timer = setTimeout(() => {
        setApiError('');
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Очистить ошибку при изменении email или пароля
  const handleEmailChange = (text) => {
    setEmail(text);
    if (apiError) {
      setApiError('');
      clearError();
    }
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    if (apiError) {
      setApiError('');
      clearError();
    }
  };

  const handleLogin = async () => {
    clearError();
    setApiError('');
    const newErrors = {};
    
    if (!email) {
      newErrors.email = t('validation.enterEmail');
    } else if (!validateEmail(email)) {
      newErrors.email = t('validation.invalidEmail');
    }
    if (!password) {
      newErrors.password = t('validation.enterPassword');
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    const success = await login(email, password);
    if (!success) {
      // Error will be set from useEffect
    }
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
            onPress={() => navigation.navigate('Welcome')}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.dark} />
          </TouchableOpacity>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Увійти в обліковий запис</Text>

            {apiError ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={20} color="#fff" />
                <Text style={styles.errorBannerText}>{apiError}</Text>
              </View>
            ) : null}

            <View style={styles.form}>
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
                placeholder="Введіть ваш пароль"
                secureTextEntry
                autoComplete="off"
                textContentType="none"
                error={errors.password}
              />

              <TouchableOpacity
                onPress={() => navigation.navigate('ForgotPassword')}
              >
                <Text style={styles.forgotPassword}>Забули пароль?</Text>
              </TouchableOpacity>
            </View>

            <Button 
              title={isSubmitting ? "Завантаження..." : "Увійти"} 
              onPress={handleLogin}
              disabled={isSubmitting}
              variant="dark"
              style={{ backgroundColor: '#060603' }}
              textStyle={{ color: '#FEFFFC' }}
            />

            <View style={styles.divider}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>або</Text>
              <View style={styles.dividerLine} />
            </View>

            <View style={styles.socialButtons}>
              <TouchableOpacity style={styles.socialButton} onPress={() => Alert.alert(t('common.info') || 'Інформація', 'Вхід через Google буде доступний незабаром')}>
                <Ionicons name="logo-google" size={24} color={Colors.dark} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialButton} onPress={() => Alert.alert(t('common.info') || 'Інформація', 'Вхід через Apple буде доступний незабаром')}>
                <Ionicons name="logo-apple" size={24} color={Colors.dark} />
              </TouchableOpacity>
            </View>

            <View style={styles.signupContainer}>
              <Text style={styles.signupText}>Немає облікового запису? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
                <Text style={styles.signupLink}>Зареєструватися</Text>
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
  form: {
    marginBottom: 30,
  },
  forgotPassword: {
    fontSize: 12,
    color: Colors.dark,
    textDecorationLine: 'underline',
    textAlign: 'right',
    marginTop: 5,
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
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signupText: {
    fontSize: 12,
    color: Colors.dark,
  },
  signupLink: {
    fontSize: 12,
    color: Colors.dark,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  errorBanner: {
    backgroundColor: '#E53935',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    gap: 8,
  },
  errorBannerText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    flex: 1,
  },
});
