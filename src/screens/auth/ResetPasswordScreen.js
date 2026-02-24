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
import { authApi } from '../../api';
import { useTranslation } from '../../i18n';

const validatePassword = (password) => {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasMinLength = password.length >= 8;
  return hasUpperCase && hasLowerCase && hasNumber && hasMinLength;
};

export const ResetPasswordScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { email, code } = route.params;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async () => {
    setApiError('');
    const newErrors = {};

    if (!password) {
      newErrors.password = t('validation.enterPassword');
    } else if (!validatePassword(password)) {
      newErrors.password = t('validation.passwordRequirements');
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = t('validation.passwordsMismatch');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);

    try {
      await authApi.resetPassword({ email, code, password });
      navigation.navigate('PasswordChanged');
    } catch (err) {
      const message = err.response?.data?.message || t('auth.changePasswordError');
      setApiError(message);
    } finally {
      setIsLoading(false);
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
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.dark} />
          </TouchableOpacity>

          <View style={styles.formContainer}>
            <Text style={styles.title}>Новий пароль</Text>
            <Text style={styles.subtitle}>
              Введіть новий пароль для вашого облікового запису
            </Text>

            {apiError ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={20} color="#fff" />
                <Text style={styles.errorBannerText}>{apiError}</Text>
              </View>
            ) : null}

            <View style={styles.form}>
              <Input
                label="Новий пароль"
                value={password}
                onChangeText={setPassword}
                placeholder="Введіть новий пароль"
                secureTextEntry
                error={errors.password}
              />

              <Input
                label="Підтвердіть пароль"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Повторіть пароль"
                secureTextEntry
                error={errors.confirmPassword}
              />

              <View style={styles.requirements}>
                <Text style={styles.requirementsTitle}>Вимоги до пароля:</Text>
                <View style={styles.requirementItem}>
                  <Ionicons 
                    name={password.length >= 8 ? "checkmark-circle" : "ellipse-outline"} 
                    size={16} 
                    color={password.length >= 8 ? Colors.primary : '#999'} 
                  />
                  <Text style={styles.requirementText}>Мінімум 8 символів</Text>
                </View>
                <View style={styles.requirementItem}>
                  <Ionicons 
                    name={/[A-Z]/.test(password) ? "checkmark-circle" : "ellipse-outline"} 
                    size={16} 
                    color={/[A-Z]/.test(password) ? Colors.primary : '#999'} 
                  />
                  <Text style={styles.requirementText}>Велика літера</Text>
                </View>
                <View style={styles.requirementItem}>
                  <Ionicons 
                    name={/[a-z]/.test(password) ? "checkmark-circle" : "ellipse-outline"} 
                    size={16} 
                    color={/[a-z]/.test(password) ? Colors.primary : '#999'} 
                  />
                  <Text style={styles.requirementText}>Мала літера</Text>
                </View>
                <View style={styles.requirementItem}>
                  <Ionicons 
                    name={/\d/.test(password) ? "checkmark-circle" : "ellipse-outline"} 
                    size={16} 
                    color={/\d/.test(password) ? Colors.primary : '#999'} 
                  />
                  <Text style={styles.requirementText}>Цифра</Text>
                </View>
              </View>
            </View>

            <Button 
              title={isLoading ? "Зміна..." : "Змінити пароль"} 
              onPress={handleReset}
              disabled={isLoading}
            />
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
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.7)',
    lineHeight: 20,
    marginBottom: 30,
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
  form: {
    marginBottom: 30,
  },
  requirements: {
    marginTop: 15,
    padding: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 12,
  },
  requirementsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 10,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  requirementText: {
    fontSize: 12,
    color: 'rgba(0, 0, 0, 0.7)',
  },
});
