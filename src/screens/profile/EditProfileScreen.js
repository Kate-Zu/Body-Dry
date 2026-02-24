import React, { useState, useCallback, useEffect } from 'react';
import { useIsFocused } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from '../../i18n';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

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

export const EditProfileScreen = ({ navigation }) => {
  const { t } = useTranslation();
  // Use individual selectors to prevent unnecessary re-renders
  const user = useAuthStore(state => state.user);
  const updateProfile = useAuthStore(state => state.updateProfile);
  const fetchProfile = useAuthStore(state => state.fetchProfile);
  const isSubmitting = useAuthStore(state => state.isSubmitting);
  const storeAvatarUri = useAuthStore(state => state.avatarUri);
  const setStoreAvatar = useAuthStore(state => state.setAvatar);
  const profile = user?.profile;

  const [name, setName] = useState(profile?.name || '');
  const [gender, setGender] = useState(profile?.gender || 'MALE');
  const [birthDate, setBirthDate] = useState(
    profile?.birthDate ? new Date(profile.birthDate) : new Date(2000, 0, 1)
  );
  const [height, setHeight] = useState(profile?.height?.toString() || '');
  const [currentWeight, setCurrentWeight] = useState(profile?.currentWeight?.toString() || '');
  const [targetWeight, setTargetWeight] = useState(profile?.targetWeight?.toString() || '');
  const [activityLevel, setActivityLevel] = useState(profile?.activityLevel || 'MODERATE');
  const [goal, setGoal] = useState(profile?.goal || 'MAINTAIN');
  
  // Local avatar state — decoupled from store to prevent form reset
  const [localAvatarUri, setLocalAvatarUri] = useState(storeAvatarUri);

  // Track screen focus via useIsFocused (more reliable than useFocusEffect with native stack)
  const isFocused = useIsFocused();

  // Helper to sync all local state from a profile object
  const syncFromProfile = useCallback((p) => {
    if (!p) return;
    setName(p.name || '');
    setGender(p.gender || 'MALE');
    setBirthDate(p.birthDate ? new Date(p.birthDate) : new Date(2000, 0, 1));
    setHeight(p.height?.toString() || '');
    setCurrentWeight(p.currentWeight?.toString() || '');
    setTargetWeight(p.targetWeight?.toString() || '');
    setActivityLevel(p.activityLevel || 'MODERATE');
    setGoal(p.goal || 'MAINTAIN');
  }, []);

  // Every time the screen gains focus: read Zustand store directly + fetch from server
  useEffect(() => {
    if (isFocused) {
      // 1. Immediately sync from the Zustand store (bypasses React selector pipeline)
      const freshProfile = useAuthStore.getState().user?.profile;
      if (freshProfile) syncFromProfile(freshProfile);

      // 2. Then fetch latest from server and sync again
      fetchProfile().then((serverProfile) => {
        if (serverProfile) syncFromProfile(serverProfile);
      });
    }
  }, [isFocused, fetchProfile, syncFromProfile]);

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showActivityPicker, setShowActivityPicker] = useState(false);
  const [showGoalPicker, setShowGoalPicker] = useState(false);
  const [errors, setErrors] = useState({});

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('common.error'), t('profile.photoPermission') || 'Потрібен доступ до галереї');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      setLocalAvatarUri(uri);
      // Sync to store in background — doesn't affect form state
      setStoreAvatar(uri);
    }
  };

  const handleRemovePhoto = async () => {
    Alert.alert(
      t('profile.removePhoto') || 'Видалити фото',
      t('profile.removePhotoConfirm') || 'Ви впевнені, що хочете видалити фото профілю?',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete') || 'Видалити',
          style: 'destructive',
          onPress: () => {
            setLocalAvatarUri(null);
            // Sync to store in background — doesn't affect form state
            setStoreAvatar(null);
          },
        },
      ]
    );
  };

  const handleAvatarPress = () => {
    if (localAvatarUri) {
      Alert.alert(
        t('profile.profilePhoto') || 'Фото профілю',
        '',
        [
          { text: t('profile.changePhoto') || 'Змінити фото', onPress: handlePickImage },
          { text: t('profile.removePhoto') || 'Видалити фото', onPress: handleRemovePhoto, style: 'destructive' },
          { text: t('common.cancel'), style: 'cancel' },
        ]
      );
    } else {
      handlePickImage();
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = t('errors.requiredField');
    }
    
    const heightNum = parseFloat(height);
    if (!height || isNaN(heightNum) || heightNum < 100 || heightNum > 250) {
      newErrors.height = t('errors.invalidHeight');
    }
    
    const currentWeightNum = parseFloat(currentWeight);
    if (!currentWeight || isNaN(currentWeightNum) || currentWeightNum < 30 || currentWeightNum > 300) {
      newErrors.currentWeight = t('errors.invalidWeight');
    }
    
    if (targetWeight) {
      const targetWeightNum = parseFloat(targetWeight);
      if (isNaN(targetWeightNum) || targetWeightNum < 30 || targetWeightNum > 300) {
        newErrors.targetWeight = t('errors.invalidTargetWeight');
      }
    }
    
    const today = new Date();
    const minDate = new Date(today.getFullYear() - 100, 0, 1);
    const maxDate = new Date(today.getFullYear() - 10, 11, 31);
    if (birthDate < minDate || birthDate > maxDate) {
      newErrors.birthDate = t('errors.invalidBirthDate');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) {
      return;
    }

    const success = await updateProfile({
      name: name.trim(),
      gender,
      birthDate: birthDate.toISOString(),
      height: parseFloat(height),
      currentWeight: parseFloat(currentWeight),
      targetWeight: targetWeight ? parseFloat(targetWeight) : null,
      activityLevel,
      goal,
    });

    if (success) {
      Alert.alert(t('common.success'), '', [
        { text: t('common.ok'), onPress: () => navigation.goBack() }
      ]);
    } else {
      Alert.alert(t('common.error'), t('errors.serverError'));
    }
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('uk-UA');
  };

  const getActivityLabel = (value) => {
    const level = ACTIVITY_LEVELS.find(l => l.value === value);
    return level ? t(level.labelKey) : value;
  };

  const getGoalLabel = (value) => {
    const g = GOALS.find(item => item.value === value);
    return g ? t(g.labelKey) : value;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('profile.editProfile')}</Text>
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={handleSave}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Ionicons name="checkmark" size={24} color={Colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Photo */}
        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handleAvatarPress} style={styles.avatarContainer}>
            {localAvatarUri ? (
              <Image source={{ uri: localAvatarUri }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarInitial}>
                  {name ? name.charAt(0).toUpperCase() : '?'}
                </Text>
              </View>
            )}
            <View style={styles.avatarBadge}>
              <Ionicons name="camera" size={14} color={Colors.white} />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarHint}>
            {t('profile.tapToChangePhoto') || 'Натисніть, щоб змінити фото'}
          </Text>
        </View>

        {/* Name */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('profile.name')}</Text>
          <TextInput
            style={[styles.input, errors.name && styles.inputError]}
            value={name}
            onChangeText={(text) => {
              setName(text);
              if (errors.name) setErrors(prev => ({ ...prev, name: null }));
            }}
            placeholder={t('profile.name')}
            placeholderTextColor="rgba(255,255,255,0.4)"
          />
          {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}
        </View>

        {/* Gender */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('profile.gender')}</Text>
          <View style={styles.genderButtons}>
            <TouchableOpacity
              style={[styles.genderButton, gender === 'MALE' && styles.genderButtonActive]}
              onPress={() => setGender('MALE')}
            >
              <Ionicons 
                name="male" 
                size={20} 
                color={gender === 'MALE' ? Colors.dark : Colors.white} 
              />
              <Text style={[
                styles.genderButtonText,
                gender === 'MALE' && styles.genderButtonTextActive
              ]}>
                {t('profile.male')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.genderButton, gender === 'FEMALE' && styles.genderButtonActive]}
              onPress={() => setGender('FEMALE')}
            >
              <Ionicons 
                name="female" 
                size={20} 
                color={gender === 'FEMALE' ? Colors.dark : Colors.white} 
              />
              <Text style={[
                styles.genderButtonText,
                gender === 'FEMALE' && styles.genderButtonTextActive
              ]}>
                {t('profile.female')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Birth Date */}
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t('profile.birthDate')}</Text>
          <TouchableOpacity 
            style={styles.input}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.inputText}>{formatDate(birthDate)}</Text>
          </TouchableOpacity>
          {Platform.OS === 'ios' && showDatePicker && (
            <Modal transparent animationType="slide" visible={showDatePicker}>
              <View style={styles.datePickerOverlay}>
                <View style={styles.datePickerContainer}>
                  <View style={styles.datePickerHeader}>
                    <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                      <Text style={styles.datePickerDone}>{t('common.ok') || 'OK'}</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={birthDate}
                    mode="date"
                    display="spinner"
                    onChange={(event, date) => {
                      if (date) setBirthDate(date);
                    }}
                    maximumDate={new Date()}
                    minimumDate={new Date(1920, 0, 1)}
                    themeVariant="dark"
                    textColor={Colors.white}
                    style={{ backgroundColor: '#1C1C1E' }}
                  />
                </View>
              </View>
            </Modal>
          )}
          {Platform.OS === 'android' && showDatePicker && (
            <DateTimePicker
              value={birthDate}
              mode="date"
              display="default"
              onChange={(event, date) => {
                setShowDatePicker(false);
                if (date) setBirthDate(date);
              }}
              maximumDate={new Date()}
              minimumDate={new Date(1920, 0, 1)}
              themeVariant="dark"
            />
          )}
        </View>

        {/* Height & Weight Row */}
        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
            <Text style={styles.label}>{t('profile.height')} ({t('units.cm')})</Text>
            <TextInput
              style={[styles.input, errors.height && styles.inputError]}
              value={height}
              onChangeText={(text) => {
                setHeight(text);
                if (errors.height) setErrors(prev => ({ ...prev, height: null }));
              }}
              placeholder="175"
              placeholderTextColor="rgba(255,255,255,0.4)"
              keyboardType="decimal-pad"
            />
            {errors.height && <Text style={styles.errorText}>{errors.height}</Text>}
          </View>
          <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
            <Text style={styles.label}>{t('profile.currentWeight')} ({t('units.kg')})</Text>
            <TextInput
              style={[styles.input, errors.currentWeight && styles.inputError]}
              value={currentWeight}
              onChangeText={(text) => {
                setCurrentWeight(text);
                if (errors.currentWeight) setErrors(prev => ({ ...prev, currentWeight: null }));
              }}
              placeholder="75"
              placeholderTextColor="rgba(255,255,255,0.4)"
              keyboardType="decimal-pad"
            />
            {errors.currentWeight && <Text style={styles.errorText}>{errors.currentWeight}</Text>}
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitial: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.dark,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderWidth: 2,
    borderColor: Colors.dark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarHint: {
    fontSize: 12,
    color: Colors.textSecondary || 'rgba(255,255,255,0.5)',
    marginTop: 8,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 8,
  },
  input: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: Colors.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inputText: {
    fontSize: 16,
    color: Colors.white,
    flex: 1,
  },
  row: {
    flexDirection: 'row',
  },
  genderButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  genderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  genderButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  genderButtonText: {
    fontSize: 16,
    color: Colors.white,
  },
  genderButtonTextActive: {
    color: Colors.dark,
    fontWeight: '600',
  },
  pickerContainer: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    marginTop: 8,
    overflow: 'hidden',
  },
  pickerOption: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  pickerOptionActive: {
    backgroundColor: 'rgba(187, 224, 255, 0.2)',
  },
  pickerOptionText: {
    fontSize: 15,
    color: Colors.white,
  },
  pickerOptionTextActive: {
    color: Colors.primary,
    fontWeight: '600',
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 4,
  },
  datePickerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  datePickerContainer: {
    backgroundColor: '#1C1C1E',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingBottom: 20,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  datePickerDone: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.primary,
  },
});
