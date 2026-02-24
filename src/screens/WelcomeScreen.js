import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ImageBackground,
  Image,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/colors';
import { Button } from '../components';

const { width, height } = Dimensions.get('window');

export const WelcomeScreen = ({ navigation }) => {
  return (
    <ImageBackground
      source={require('../../assets/welcome-bg.png')}
      style={styles.container}
      resizeMode="cover"
    >
      <LinearGradient
        colors={['rgba(6, 6, 3, 0.1)', 'rgba(6, 6, 3, 0.7)', Colors.background]}
        style={styles.gradient}
      >
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../../assets/logo.png')}
              style={styles.logoIcon}
              resizeMode="contain"
            />
            <Text style={styles.logoText}>Body&Dry</Text>
          </View>

          <View style={styles.bottomContent}>
            <View style={styles.textContainer}>
              <Text style={styles.titleHighlight}>AI Plan сушки, створений</Text>
              <Text style={styles.title}>під твоє тіло</Text>
              <Text style={styles.description}>
                AI аналізує твої параметри, цілі, спосіб життя та формує персональний план харчування для максимально ефективної та безпечної сушки.{`\n\n`}Жодних шаблонів — тільки точні рішення, адаптовані під тебе.
              </Text>
            </View>

            <View style={styles.buttons}>
              <Button
                title="Увійти"
                onPress={() => navigation.navigate('Login')}
              />
              <Button
                title="Зареєструватися"
                variant="secondary"
                onPress={() => navigation.navigate('SignUp')}
                style={styles.signupButton}
              />
            </View>
          </View>
        </View>
      </LinearGradient>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  gradient: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'space-between',
    padding: 30,
    paddingTop: 60,
    paddingBottom: 50,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    width: 25,
    height: 25,
  },
  logoText: {
    fontSize: 25,
    fontWeight: '500',
    color: Colors.primary,
  },
  bottomContent: {
    gap: 40,
  },
  textContainer: {
    gap: 5,
  },
  description: {
    fontSize: 10,
    fontWeight: '400',
    color: Colors.white,
    marginTop: 10,
    lineHeight: 14,
    textAlign: 'justify',
    textTransform: 'uppercase',
  },
  title: {
    fontSize: 28,
    fontWeight: '500',
    color: Colors.white,
  },
  titleHighlight: {
    fontSize: 28,
    fontWeight: '500',
    color: Colors.primary,
  },
  buttons: {
    gap: 15,
  },
  signupButton: {
    borderColor: Colors.primary,
  },
});
