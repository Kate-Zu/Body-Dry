import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Button } from '../../components';
import { usersApi } from '../../api';
import { useAuthStore } from '../../store';
import { useTranslation } from '../../i18n';

const getActivityLevels = (t) => [
  {
    id: 'SEDENTARY',
    title: t('activityLevels.sedentary'),
    description: t('onboarding.sedentaryDesc'),
    icon: 'desktop-outline',
  },
  {
    id: 'LIGHT',
    title: t('activityLevels.light'),
    description: t('onboarding.lightDesc'),
    icon: 'walk-outline',
  },
  {
    id: 'MODERATE',
    title: t('activityLevels.moderate'),
    description: t('onboarding.moderateDesc'),
    icon: 'bicycle-outline',
  },
  {
    id: 'ACTIVE',
    title: t('activityLevels.active'),
    description: t('onboarding.activeDesc'),
    icon: 'barbell-outline',
  },
  {
    id: 'VERY_ACTIVE',
    title: t('activityLevels.veryActive'),
    description: t('onboarding.veryActiveDesc'),
    icon: 'trophy-outline',
  },
];

export const ActivityLevelScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const activityLevels = getActivityLevels(t);
  const onboardingData = route?.params?.onboardingData || {};
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { checkAuth } = useAuthStore();

  const handleComplete = async () => {
    if (!selectedLevel) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const profileData = {
        ...onboardingData,
        activityLevel: selectedLevel,
      };
      
      // Remove null values
      if (profileData.targetWeight === null) {
        delete profileData.targetWeight;
      }
      
      await usersApi.createProfile(profileData);
      
      // Refresh user data
      await checkAuth();
      
      // Navigation will be handled by auth state change
    } catch (err) {
      const message = err.response?.data?.message || t('onboarding.profileCreateError');
      
      // If profile already exists, just refresh auth and continue
      if (message.includes('існує') || message.includes('already')) {
        await checkAuth();
        return;
      }
      
      setError(message);
      setIsLoading(false);
    }
  };

  // Skip onboarding if profile already exists
  const handleSkip = async () => {
    setIsLoading(true);
    await checkAuth();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="chevron-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.stepText}>{t('onboarding.step3of3')}</Text>
        </View>

        <Text style={styles.title}>{t('onboarding.yourActivityLevel')}</Text>
        <Text style={styles.subtitle}>
          {t('onboarding.activityLevelDesc')}
        </Text>

        {error ? (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={20} color="#fff" />
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.levelsList}>
          {activityLevels.map((level) => (
            <TouchableOpacity
              key={level.id}
              style={[
                styles.levelCard,
                selectedLevel === level.id && styles.levelCardSelected,
              ]}
              onPress={() => setSelectedLevel(level.id)}
            >
              <View style={styles.levelIcon}>
                <Ionicons
                  name={level.icon}
                  size={24}
                  color={selectedLevel === level.id ? Colors.primary : Colors.white}
                />
              </View>
              <View style={styles.levelInfo}>
                <Text
                  style={[
                    styles.levelTitle,
                    selectedLevel === level.id && styles.levelTitleSelected,
                  ]}
                >
                  {level.title}
                </Text>
                <Text style={styles.levelDescription}>{level.description}</Text>
              </View>
              {selectedLevel === level.id && (
                <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color={Colors.primary} />
            <Text style={styles.loadingText}>{t('onboarding.creatingProfile')}</Text>
          </View>
        ) : (
          <Button
            title={t('onboarding.finishSetup')}
            onPress={handleComplete}
            disabled={!selectedLevel}
            variant="dark"
          />
        )}
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
    marginBottom: 20,
  },
  errorBanner: {
    backgroundColor: Colors.error,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    gap: 8,
  },
  errorBannerText: {
    color: '#fff',
    fontSize: 14,
    flex: 1,
  },
  levelsList: {
    gap: 10,
  },
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  levelCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(187, 224, 255, 0.2)',
  },
  levelIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(187, 224, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  levelInfo: {
    flex: 1,
  },
  levelTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 2,
  },
  levelTitleSelected: {
    color: Colors.primary,
  },
  levelDescription: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  footer: {
    padding: 20,
    paddingBottom: 30,
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.white,
  },
});
