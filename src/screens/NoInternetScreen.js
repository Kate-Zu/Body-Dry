import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import { Colors } from '../constants/colors';
import { useTranslation } from '../i18n';

// Wifi-off icon
const WifiOffIcon = ({ size = 80, color = Colors.textSecondary }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M1 1L23 23"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
    />
    <Path
      d="M16.72 11.06C17.82 11.38 18.86 11.9 19.77 12.58"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M5 12.55C6.94 10.96 9.39 10 12 10C12.68 10 13.35 10.06 14 10.18"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M10.71 5.05C11.13 5.02 11.56 5 12 5C16.42 5 20.35 6.93 23 10"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M1 10C2.47 8.34 4.26 7 6.28 6.05"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M8.53 16.11C9.52 15.45 10.71 15.07 12 15.07C13.29 15.07 14.48 15.45 15.47 16.11"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Circle cx={12} cy={20} r={1} fill={color} />
  </Svg>
);

export const NoInternetScreen = ({ onRetry }) => {
  const { t } = useTranslation();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <WifiOffIcon size={100} color={Colors.textSecondary} />
        </View>
        
        <Text style={styles.title}>{t('errors.noInternet')}</Text>
        <Text style={styles.subtitle}>{t('errors.noInternetDescription')}</Text>
        
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryButtonText}>{t('common.retry')}</Text>
        </TouchableOpacity>
        
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>{t('errors.checkConnection')}</Text>
          <Text style={styles.tipItem}>• {t('errors.tipWifi')}</Text>
          <Text style={styles.tipItem}>• {t('errors.tipMobile')}</Text>
          <Text style={styles.tipItem}>• {t('errors.tipAirplane')}</Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  iconContainer: {
    marginBottom: 32,
    opacity: 0.7,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 24,
  },
  retryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 48,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 48,
  },
  retryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
  },
  tipsContainer: {
    backgroundColor: Colors.card,
    padding: 20,
    borderRadius: 16,
    width: '100%',
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 12,
  },
  tipItem: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
    lineHeight: 20,
  },
});
