import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';
import { Colors } from '../../constants/colors';
import { Button } from '../../components';

export const PasswordChangedScreen = ({ navigation }) => {
  const handleBackToLogin = () => {
    // Navigate back to login and reset navigation stack
    navigation.reset({
      index: 0,
      routes: [{ name: 'Login' }],
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <View style={styles.iconInner}>
              <Text style={styles.checkmark}>✓</Text>
            </View>
          </View>
        </View>

        <Text style={styles.title}>Пароль змінено!</Text>
        <Text style={styles.subtitle}>
          Ваш пароль успішно змінено.{'\n'}
          Тепер ви можете увійти з новим паролем.
        </Text>

        <View style={styles.buttonContainer}>
          <Button 
            title="Повернутися до входу" 
            onPress={handleBackToLogin}
          />
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.lightBackground,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  iconContainer: {
    marginBottom: 30,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(33, 150, 83, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconInner: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    fontSize: 36,
    color: '#fff',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.dark,
    marginBottom: 12,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(0, 0, 0, 0.7)',
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 40,
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
});
