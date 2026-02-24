import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Colors } from '../../constants/colors';
import { useAuthStore, useProgressStore } from '../../store';
import { useTranslation } from '../../i18n';
import { usersApi } from '../../api/endpoints';

const ACTIVITY_LEVELS = [
  { value: 'SEDENTARY', labelKey: 'activityLevels.sedentary' },
  { value: 'LIGHT', labelKey: 'activityLevels.light' },
  { value: 'MODERATE', labelKey: 'activityLevels.moderate' },
  { value: 'ACTIVE', labelKey: 'activityLevels.active' },
  { value: 'VERY_ACTIVE', labelKey: 'activityLevels.veryActive' },
];

const GOALS = [
  { value: 'LOSE_WEIGHT', labelKey: 'goals.loseWeight' },
  { value: 'MAINTAIN', labelKey: 'goals.maintain' },
  { value: 'GAIN_MUSCLE', labelKey: 'goals.gainMuscle' },
  { value: 'DRYING', labelKey: 'goals.drying' },
];

// Get activity level label
const getActivityLabel = (t, level) => {
  const map = {
    SEDENTARY: t('activityLevels.sedentary'),
    LIGHT: t('activityLevels.light'),
    MODERATE: t('activityLevels.moderate'),
    ACTIVE: t('activityLevels.active'),
    VERY_ACTIVE: t('activityLevels.veryActive'),
  };
  return map[level] || t('goals.notSpecified');
};

// Get weekly goal label
const getWeeklyGoalLabel = (t, goal) => {
  const map = {
    LOSE_WEIGHT: t('goalsScreen.loseWeekly'),
    DRYING: t('goalsScreen.dryingWeekly'),
    MAINTAIN: t('goals.maintain'),
    GAIN_MUSCLE: t('goalsScreen.gainWeekly'),
  };
  return map[goal] || t('goals.maintain');
};

// Format date to DD.MM.YYYY
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
};

export const GoalsScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { user, fetchProfile } = useAuthStore();
  const { weightHistory, fetchWeightHistory } = useProgressStore();
  const [isLoading, setIsLoading] = useState(true);
  const [showEditWeight, setShowEditWeight] = useState(false);
  const [editWeight, setEditWeight] = useState('');
  const [editingField, setEditingField] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const [showActivityPicker, setShowActivityPicker] = useState(false);
  const [startWeightDate, setStartWeightDate] = useState(null);
  const profile = user?.profile;

  // Get the latest actual weight from history
  const getLatestWeight = () => {
    if (!weightHistory || !Array.isArray(weightHistory) || weightHistory.length === 0) {
      return profile?.currentWeight || '-';
    }
    // Find the last non-expected entry
    for (let i = weightHistory.length - 1; i >= 0; i--) {
      if (!weightHistory[i].isExpected) {
        return weightHistory[i].weight;
      }
    }
    return profile?.currentWeight || '-';
  };

  // Refresh profile when screen is focused
  useFocusEffect(
    useCallback(() => {
      const loadProfile = async () => {
        setIsLoading(true);
        await Promise.all([fetchProfile(), fetchWeightHistory()]);
        setIsLoading(false);
      };
      loadProfile();
    }, [fetchProfile, fetchWeightHistory])
  );

  const handleEditStartWeight = () => {
    setEditWeight(String(profile?.currentWeight || ''));
    setEditingField('startWeight');
    setShowEditWeight(true);
  };

  const handleEditCurrentWeight = () => {
    setEditWeight(String(getLatestWeight() || ''));
    setEditingField('currentWeight');
    setShowEditWeight(true);
  };

  const handleEditTargetWeight = () => {
    setEditWeight(String(profile?.targetWeight || ''));
    setEditingField('targetWeight');
    setShowEditWeight(true);
  };

  const getModalTitle = () => {
    if (editingField === 'startWeight') return t('progress.startWeight');
    if (editingField === 'currentWeight') return t('profile.currentWeight');
    if (editingField === 'targetWeight') return t('profile.targetWeight');
    return '';
  };

  const handleSaveWeight = async () => {
    const weight = parseFloat(editWeight);
    if (isNaN(weight) || weight < 30 || weight > 300) {
      Alert.alert(t('common.error'), 'Вага має бути від 30 до 300 кг');
      return;
    }
    setIsSaving(true);
    try {
      if (editingField === 'targetWeight') {
        await usersApi.updateProfile({ targetWeight: weight });
      } else {
        await usersApi.updateProfile({ currentWeight: weight });
        if (editingField === 'startWeight') {
          setStartWeightDate(formatDate(new Date().toISOString()));
        }
      }
      await fetchProfile();
      setShowEditWeight(false);
    } catch (e) {
      Alert.alert(t('common.error'), 'Не вдалося зберегти');
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangeGoal = async (value) => {
    setShowGoalPicker(false);
    try {
      await usersApi.updateProfile({ goal: value });
      await fetchProfile();
    } catch (e) {
      Alert.alert(t('common.error'), 'Не вдалося зберегти');
    }
  };

  const handleChangeActivity = async (value) => {
    setShowActivityPicker(false);
    try {
      await usersApi.updateProfile({ activityLevel: value });
      await fetchProfile();
    } catch (e) {
      Alert.alert(t('common.error'), 'Не вдалося зберегти');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.title}>{t('goals.title').toUpperCase()}</Text>
          <View style={{ width: 42 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const goals = {
    startWeight: profile?.currentWeight || '-',
    startDate: startWeightDate || formatDate(profile?.createdAt),
    currentWeight: getLatestWeight(),
    targetWeight: profile?.targetWeight || '-',
    weeklyGoal: getWeeklyGoalLabel(t, profile?.goal),
    lifestyle: getActivityLabel(t, profile?.activityLevel),
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('goals.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Weight Section */}
        <View style={styles.weightSection}>
          <TouchableOpacity style={styles.weightRow} onPress={handleEditStartWeight}>
            <Text style={styles.weightLabel}>{t('progress.startWeight')}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.weightValue}>{goals.startWeight} {t('units.kg')}, {goals.startDate}</Text>
              <Ionicons name="create-outline" size={14} color="rgba(255,255,255,0.4)" style={{ marginLeft: 6 }} />
            </View>
          </TouchableOpacity>
          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.weightRow} onPress={handleEditCurrentWeight}>
            <Text style={styles.weightLabel}>{t('profile.currentWeight')}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.weightValue}>{goals.currentWeight} {t('units.kg')}</Text>
              <Ionicons name="create-outline" size={14} color="rgba(255,255,255,0.4)" style={{ marginLeft: 6 }} />
            </View>
          </TouchableOpacity>
          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.weightRow} onPress={handleEditTargetWeight}>
            <Text style={styles.weightLabel}>{t('profile.targetWeight')}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.weightValue}>{goals.targetWeight} {t('units.kg')}</Text>
              <Ionicons name="create-outline" size={14} color="rgba(255,255,255,0.4)" style={{ marginLeft: 6 }} />
            </View>
          </TouchableOpacity>
          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.weightRow} onPress={() => setShowGoalPicker(!showGoalPicker)}>
            <Text style={styles.weightLabel}>{t('goalsScreen.weeklyGoal')}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.weightValueHighlight}>{goals.weeklyGoal}</Text>
              <Ionicons name="chevron-down" size={14} color="rgba(187,224,255,0.6)" style={{ marginLeft: 4 }} />
            </View>
          </TouchableOpacity>
          {showGoalPicker && (
            <View style={styles.pickerContainer}>
              {GOALS.map((item) => (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    styles.pickerOption,
                    profile?.goal === item.value && styles.pickerOptionActive,
                  ]}
                  onPress={() => handleChangeGoal(item.value)}
                >
                  <Text style={[
                    styles.pickerOptionText,
                    profile?.goal === item.value && styles.pickerOptionTextActive,
                  ]}>
                    {t(item.labelKey)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <View style={styles.divider} />
          
          <TouchableOpacity style={styles.weightRow} onPress={() => setShowActivityPicker(!showActivityPicker)}>
            <Text style={styles.weightLabel}>{t('goalsScreen.lifestyle')}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.weightValueHighlight}>{goals.lifestyle}</Text>
              <Ionicons name="chevron-down" size={14} color="rgba(187,224,255,0.6)" style={{ marginLeft: 4 }} />
            </View>
          </TouchableOpacity>
          {showActivityPicker && (
            <View style={styles.pickerContainer}>
              {ACTIVITY_LEVELS.map((level) => (
                <TouchableOpacity
                  key={level.value}
                  style={[
                    styles.pickerOption,
                    profile?.activityLevel === level.value && styles.pickerOptionActive,
                  ]}
                  onPress={() => handleChangeActivity(level.value)}
                >
                  <Text style={[
                    styles.pickerOptionText,
                    profile?.activityLevel === level.value && styles.pickerOptionTextActive,
                  ]}>
                    {t(level.labelKey)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Nutrition Goals Section */}
        <View style={styles.nutritionSection}>
          <Text style={styles.sectionTitle}>{t('goalsScreen.nutritionGoals')}</Text>
          
          <TouchableOpacity 
            style={styles.nutritionItem}
            onPress={() => navigation.navigate('MacroCaloriesEdit')}
          >
            <View style={styles.nutritionText}>
              <Text style={styles.nutritionTitle}>
                {t('goalsScreen.macroGoals')}
              </Text>
              <Text style={styles.nutritionDesc}>
                {t('goalsScreen.macroGoalsDesc')}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={Colors.white} />
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Edit Start Weight Modal */}
      <Modal
        visible={showEditWeight}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditWeight(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{getModalTitle()}</Text>
            <TextInput
              style={styles.modalInput}
              value={editWeight}
              onChangeText={setEditWeight}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="rgba(255,255,255,0.3)"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setShowEditWeight(false)}
              >
                <Text style={styles.modalCancelText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleSaveWeight}
                disabled={isSaving}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color={Colors.dark} />
                ) : (
                  <Text style={styles.modalSaveText}>{t('common.save')}</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
  },
  placeholder: {
    width: 32,
  },
  content: {
    flex: 1,
    paddingHorizontal: 22,
  },
  weightSection: {
    marginBottom: 30,
  },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
  },
  weightLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
  },
  weightValue: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.white,
  },
  weightValueHighlight: {
    fontSize: 12,
    fontWeight: '500',
    color: '#BBE0FF',
  },
  divider: {
    height: 0.5,
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
  },
  nutritionSection: {
    gap: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.white,
  },
  nutritionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 15,
  },
  nutritionText: {
    flex: 1,
    marginRight: 10,
  },
  nutritionTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.white,
    marginBottom: 5,
  },
  nutritionDesc: {
    fontSize: 10,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 24,
    width: '80%',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 16,
    textAlign: 'center',
  },
  modalInput: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
  },
  modalSaveButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    alignItems: 'center',
  },
  modalSaveText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.dark,
  },
  pickerContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    marginTop: 4,
    marginBottom: 4,
    overflow: 'hidden',
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  pickerOptionActive: {
    backgroundColor: 'rgba(187, 224, 255, 0.2)',
  },
  pickerOptionText: {
    fontSize: 13,
    color: Colors.white,
  },
  pickerOptionTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
});
