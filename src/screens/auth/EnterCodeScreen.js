import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Button } from '../../components';
import { authApi } from '../../api';
import { useTranslation } from '../../i18n';

export const EnterCodeScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { email } = route.params;
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleCodeChange = (value, index) => {
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError('');

    // Автоматичний перехід до наступного поля
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Автоматична перевірка коду коли всі цифри введено
    if (newCode.every(digit => digit) && value) {
      verifyCode(newCode.join(''));
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verifyCode = async (fullCode) => {
    setIsLoading(true);
    try {
      await authApi.verifyCode({ email, code: fullCode });
      navigation.navigate('ResetPassword', { email, code: fullCode });
    } catch (err) {
      const message = err.response?.data?.message || t('auth.invalidCode');
      setError(message);
      // Очистити код при помилці
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    
    try {
      await authApi.forgotPassword(email);
      setResendTimer(60);
      setError('');
    } catch (err) {
      setError(t('auth.resendError'));
    }
  };

  const handleVerify = () => {
    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError(t('auth.enterAllDigits'));
      return;
    }
    verifyCode(fullCode);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={Colors.dark} />
        </TouchableOpacity>

        <View style={styles.content}>
          <Text style={styles.title}>Введіть код</Text>
          <Text style={styles.subtitle}>
            Ми надіслали 6-значний код на {email}
          </Text>

          {error ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={20} color="#fff" />
              <Text style={styles.errorBannerText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.codeContainer}>
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputRefs.current[index] = ref)}
                style={[
                  styles.codeInput,
                  digit && styles.codeInputFilled,
                  error && styles.codeInputError,
                ]}
                value={digit}
                onChangeText={(value) => handleCodeChange(value.replace(/[^0-9]/g, ''), index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={1}
                selectTextOnFocus
              />
            ))}
          </View>

          <Button 
            title={isLoading ? "Перевірка..." : "Підтвердити"} 
            onPress={handleVerify}
            disabled={isLoading || code.some(d => !d)}
          />

          <View style={styles.resendContainer}>
            <Text style={styles.resendText}>Не отримали код? </Text>
            {resendTimer > 0 ? (
              <Text style={styles.resendTimer}>Надіслати знову через {resendTimer}с</Text>
            ) : (
              <TouchableOpacity onPress={handleResend}>
                <Text style={styles.resendLink}>Надіслати знову</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
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
    padding: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    marginBottom: 20,
  },
  content: {
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
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    gap: 10,
  },
  codeInput: {
    flex: 1,
    height: 56,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: 12,
    backgroundColor: Colors.white,
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    color: Colors.dark,
  },
  codeInputFilled: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight + '20',
  },
  codeInputError: {
    borderColor: '#E53935',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
    flexWrap: 'wrap',
  },
  resendText: {
    fontSize: 14,
    color: Colors.dark,
  },
  resendTimer: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.5)',
  },
  resendLink: {
    fontSize: 14,
    color: Colors.primary,
    fontWeight: '600',
  },
});
