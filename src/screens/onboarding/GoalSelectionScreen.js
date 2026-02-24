import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { Button } from '../../components';
import { useAuthStore } from '../../store';
import { useTranslation } from '../../i18n';

const getGoals = (t) => [
  {
    id: 'LOSE_WEIGHT',
    title: t('goals.loseWeight'),
    description: t('onboarding.loseWeightDesc'),
    icon: 'trending-down-outline',
  },
  {
    id: 'MAINTAIN',
    title: t('goals.maintain'),
    description: t('onboarding.maintainDesc'),
    icon: 'fitness-outline',
  },
  {
    id: 'GAIN_MUSCLE',
    title: t('onboarding.gainWeight'),
    description: t('onboarding.gainWeightDesc'),
    icon: 'trending-up-outline',
  },
];

export const GoalSelectionScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const goals = getGoals(t);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const onboardingData = route?.params?.onboardingData || {};
  const { logout } = useAuthStore();

  const handleContinue = () => {
    if (!selectedGoal) return;
    navigation.navigate('BodyParams', {
      onboardingData: { ...onboardingData, goal: selectedGoal },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={logout}>
            <Ionicons name="chevron-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.stepText}>{t('onboarding.step1of3')}</Text>
          <View style={{ width: 32 }} />
        </View>

        <Text style={styles.title}>{t('onboarding.whatIsYourGoal')}</Text>
        <Text style={styles.subtitle}>
          {t('onboarding.chooseGoalDesc')}
        </Text>

        <View style={styles.goalsList}>
          {goals.map((goal) => (
            <TouchableOpacity
              key={goal.id}
              style={[
                styles.goalCard,
                selectedGoal === goal.id && styles.goalCardSelected,
              ]}
              onPress={() => setSelectedGoal(goal.id)}
            >
              <View style={styles.goalIcon}>
                <Ionicons
                  name={goal.icon}
                  size={28}
                  color={selectedGoal === goal.id ? Colors.primary : Colors.dark}
                />
              </View>
              <View style={styles.goalInfo}>
                <Text
                  style={[
                    styles.goalTitle,
                    selectedGoal === goal.id && styles.goalTitleSelected,
                  ]}
                >
                  {goal.title}
                </Text>
                <Text style={styles.goalDescription}>{goal.description}</Text>
              </View>
              {selectedGoal === goal.id && (
                <Ionicons name="checkmark-circle" size={24} color={Colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title={t('common.next')}
          onPress={handleContinue}
          disabled={!selectedGoal}
          variant="dark"
        />
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
    padding: 4,
  },
  stepText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    color: Colors.white,
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
    lineHeight: 20,
  },
  goalsList: {
    gap: 15,
  },
  goalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  goalCardSelected: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(187, 224, 255, 0.2)',
  },
  goalIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(187, 224, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  goalInfo: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 4,
  },
  goalTitleSelected: {
    color: Colors.primary,
  },
  goalDescription: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  footer: {
    padding: 20,
    paddingBottom: 30,
  },
});
