import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../constants/colors';
import { useAuthStore } from '../../store';
import { useTranslation } from '../../i18n';
import { useFocusEffect } from '@react-navigation/native';

const PICKER_ITEM_HEIGHT = 40;
const PICKER_VISIBLE_COUNT = 5;
const PICKER_HEIGHT = PICKER_ITEM_HEIGHT * PICKER_VISIBLE_COUNT;
const PERCENT_VALUES = Array.from({ length: 101 }, (_, i) => i);

const FADE_LAYERS = [
  { opacity: 0.85, height: PICKER_ITEM_HEIGHT },
  { opacity: 0.55, height: PICKER_ITEM_HEIGHT },
];

const PercentPicker = ({ value, onChange, color, label }) => {
  const flatListRef = useRef(null);

  const handleScrollEnd = useCallback((e) => {
    const y = e.nativeEvent.contentOffset.y;
    const idx = Math.round(y / PICKER_ITEM_HEIGHT);
    const clamped = Math.max(0, Math.min(100, idx));
    onChange(clamped);
  }, [onChange]);

  const renderItem = useCallback(({ item }) => (
    <View style={{
      height: PICKER_ITEM_HEIGHT,
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <Text style={{
        fontSize: 22,
        color: Colors.white,
        fontWeight: '400',
      }}>{item}</Text>
    </View>
  ), []);

  const getItemLayout = useCallback((_, index) => ({
    length: PICKER_ITEM_HEIGHT,
    offset: PICKER_ITEM_HEIGHT * index,
    index,
  }), []);

  return (
    <View style={{ alignItems: 'center', flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 6 }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: color }} />
        <Text style={{ color: Colors.white, fontSize: 13, fontWeight: '500' }}>{label}</Text>
      </View>
      <View style={{ height: PICKER_HEIGHT, width: 70, overflow: 'hidden' }}>
        <FlatList
          ref={flatListRef}
          data={PERCENT_VALUES}
          keyExtractor={(item) => String(item)}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          snapToInterval={PICKER_ITEM_HEIGHT}
          decelerationRate="fast"
          bounces={false}
          nestedScrollEnabled
          onMomentumScrollEnd={handleScrollEnd}
          onScrollEndDrag={handleScrollEnd}
          initialScrollIndex={value}
          getItemLayout={getItemLayout}
          contentContainerStyle={{
            paddingVertical: PICKER_ITEM_HEIGHT * Math.floor(PICKER_VISIBLE_COUNT / 2),
          }}
        />
        {/* Selection indicator */}
        <View pointerEvents="none" style={{
          position: 'absolute',
          top: PICKER_ITEM_HEIGHT * Math.floor(PICKER_VISIBLE_COUNT / 2),
          left: 0, right: 0,
          height: PICKER_ITEM_HEIGHT,
          borderTopWidth: 0.5,
          borderBottomWidth: 0.5,
          borderColor: 'rgba(255,255,255,0.25)',
        }} />
        {/* Top fade */}
        <View pointerEvents="none" style={{ position: 'absolute', top: 0, left: 0, right: 0 }}>
          {FADE_LAYERS.map((layer, i) => (
            <View key={`t${i}`} style={{ height: layer.height, backgroundColor: `rgba(26,26,26,${layer.opacity})` }} />
          ))}
        </View>
        {/* Bottom fade */}
        <View pointerEvents="none" style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
          {[...FADE_LAYERS].reverse().map((layer, i) => (
            <View key={`b${i}`} style={{ height: layer.height, backgroundColor: `rgba(26,26,26,${layer.opacity})` }} />
          ))}
        </View>
      </View>
    </View>
  );
};

export const MacroCaloriesEditScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { user, updateGoals, isSubmitting, fetchProfile, error: storeError } = useAuthStore();
  const profile = user?.profile;
  
  const [calories, setCalories] = useState('');
  const [proteinPercent, setProteinPercent] = useState('');
  const [carbsPercent, setCarbsPercent] = useState('');
  const [fatsPercent, setFatsPercent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showPercentModal, setShowPercentModal] = useState(false);
  const [editProtein, setEditProtein] = useState('');
  const [editCarbs, setEditCarbs] = useState('');
  const [editFats, setEditFats] = useState('');

  useEffect(() => {
    const loadData = async () => {
      await fetchProfile();
      setIsLoading(false);
    };
    loadData();
  }, []);

  // Refresh when screen regains focus (e.g. after AI plan changes KBJU)
  useFocusEffect(
    useCallback(() => {
      fetchProfile();
    }, [fetchProfile])
  );

  useEffect(() => {
    if (profile) {
      setCalories(String(profile.calorieGoal || 2100));
      const p = parseInt(profile.proteinGoal) || 120;
      const c = parseInt(profile.carbsGoal) || 250;
      const f = parseInt(profile.fatsGoal) || 60;
      const total = p + c + f;
      if (total > 0) {
        const pPct = Math.round(p / total * 100);
        const cPct = Math.round(c / total * 100);
        const fPct = 100 - pPct - cPct; // ensure sum is exactly 100
        setProteinPercent(String(pPct));
        setCarbsPercent(String(cPct));
        setFatsPercent(String(fPct));
      }
    }
  }, [profile]);

  // Calculate grams from percentages and calories
  const cal = parseInt(calories) || 0;
  const pPct = parseInt(proteinPercent) || 0;
  const cPct = parseInt(carbsPercent) || 0;
  const fPct = parseInt(fatsPercent) || 0;
  const totalPercent = pPct + cPct + fPct;

  const proteinGrams = Math.round((cal * pPct / 100) / 4);
  const carbsGrams = Math.round((cal * cPct / 100) / 4);
  const fatsGrams = Math.round((cal * fPct / 100) / 9);

  const openPercentModal = () => {
    setEditProtein(proteinPercent);
    setEditCarbs(carbsPercent);
    setEditFats(fatsPercent);
    setShowPercentModal(true);
  };

  const editTotal = (parseInt(editProtein) || 0) + (parseInt(editCarbs) || 0) + (parseInt(editFats) || 0);

  const handleApplyPercent = async () => {
    if (editTotal !== 100) return;
    const newProtein = editProtein;
    const newCarbs = editCarbs;
    const newFats = editFats;
    setProteinPercent(newProtein);
    setCarbsPercent(newCarbs);
    setFatsPercent(newFats);
    setShowPercentModal(false);

    // Auto-save to server
    const calorieVal = parseInt(calories) || 0;
    const pG = Math.round((calorieVal * parseInt(newProtein) / 100) / 4);
    const cG = Math.round((calorieVal * parseInt(newCarbs) / 100) / 4);
    const fG = Math.round((calorieVal * parseInt(newFats) / 100) / 9);

    const success = await updateGoals({
      calorieGoal: calorieVal,
      proteinGoal: pG,
      carbsGoal: cG,
      fatsGoal: fG,
    });

    if (success) {
      navigation.goBack();
    } else {
      Alert.alert(t('common.error'), storeError || t('macroEdit.saveError'));
    }
  };

  const handleSave = async () => {
    const calorieVal = parseInt(calories) || 0;
    if (calorieVal < 800 || calorieVal > 10000) {
      Alert.alert(t('common.error'), t('macroEdit.caloriesRange'));
      return;
    }
    if (totalPercent !== 100) {
      Alert.alert(t('common.error'), 'Сума відсотків БЖВ повинна дорівнювати 100%');
      return;
    }
    const success = await updateGoals({
      calorieGoal: calorieVal,
      proteinGoal: proteinGrams,
      carbsGoal: carbsGrams,
      fatsGoal: fatsGrams,
    });
    if (success) {
      navigation.goBack();
    } else {
      Alert.alert(t('common.error'), storeError || t('macroEdit.saveError'));
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.title}>Цілі КБЖВ</Text>
          <View style={{ width: 32 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  const MacroRow = ({ label, grams, percent, color, onPress }) => (
    <>
      <TouchableOpacity style={styles.macroItem} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.macroLabel}>
          <View style={[styles.macroIndicator, { backgroundColor: color }]} />
          <Text style={styles.macroLabelText}>{label}</Text>
          <Text style={styles.macroGrams}>{grams} {t('units.g')}</Text>
        </View>
        <View style={styles.macroRight}>
          <Text style={styles.macroPercent}>{percent}%</Text>
          <Ionicons name="chevron-forward" size={16} color="rgba(255,255,255,0.4)" />
        </View>
      </TouchableOpacity>
      <View style={styles.divider} />
    </>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.title}>Цілі КБЖВ</Text>
        <TouchableOpacity
          style={styles.confirmButton}
          onPress={handleSave}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color={Colors.primary} />
          ) : (
            <Ionicons name="checkmark" size={28} color={Colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>{t('goalsScreen.dailyGoals')}</Text>

        {/* Calories */}
        <View style={styles.caloriesRow}>
          <Text style={styles.caloriesLabel}>{t('diary.calories')}</Text>
          <TextInput
            style={styles.caloriesInput}
            value={calories}
            onChangeText={setCalories}
            keyboardType="number-pad"
          />
        </View>
        <View style={styles.divider} />

        {/* Macros — tap to open bottom sheet */}
        <MacroRow
          label={t('diary.protein')}
          grams={proteinGrams}
          percent={pPct}
          color="#FFAD8F"
          onPress={openPercentModal}
        />
        <MacroRow
          label={t('diary.carbs')}
          grams={carbsGrams}
          percent={cPct}
          color="#BBE0FF"
          onPress={openPercentModal}
        />
        <MacroRow
          label={t('diary.fats')}
          grams={fatsGrams}
          percent={fPct}
          color="#FEFFFC"
          onPress={openPercentModal}
        />

        {/* Percentages Summary */}
        <View style={styles.percentSummary}>
          <View style={styles.percentBar}>
            <View style={[styles.percentSegment, { flex: pPct || 1, backgroundColor: '#FFAD8F' }]} />
            <View style={[styles.percentSegment, { flex: cPct || 1, backgroundColor: '#BBE0FF' }]} />
            <View style={[styles.percentSegment, { flex: fPct || 1, backgroundColor: '#FEFFFC' }]} />
          </View>
          {totalPercent !== 100 && (
            <Text style={styles.percentWarning}>
              ⚠ Сума: {totalPercent}% — повинна бути 100%
            </Text>
          )}
          {totalPercent === 100 && (
            <Text style={styles.percentTotal}>100% всього</Text>
          )}
        </View>
      </View>

      {/* Centered Modal for Percentage Editing — matching weight update modal */}
      <Modal visible={showPercentModal} transparent animationType="fade" onRequestClose={() => setShowPercentModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Відсоткове співвідношення БЖВ</Text>

            <View style={styles.pickersContainer}>
              <PercentPicker
                value={parseInt(editProtein) || 0}
                onChange={(v) => setEditProtein(String(v))}
                color="#FFAD8F"
                label={t('diary.protein')}
              />
              <PercentPicker
                value={parseInt(editCarbs) || 0}
                onChange={(v) => setEditCarbs(String(v))}
                color="#BBE0FF"
                label={t('diary.carbs')}
              />
              <PercentPicker
                value={parseInt(editFats) || 0}
                onChange={(v) => setEditFats(String(v))}
                color="#FEFFFC"
                label={t('diary.fats')}
              />
            </View>

            {editTotal !== 100 ? (
              <Text style={styles.sheetWarning}>
                ⚠ Сума: {editTotal}%. Повинна бути 100%
              </Text>
            ) : (
              <Text style={styles.sheetOk}>✓ Сума: 100%</Text>
            )}

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalButtonCancel}
                onPress={() => setShowPercentModal(false)}
              >
                <Text style={styles.modalButtonCancelText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButtonSave, editTotal !== 100 && styles.modalButtonSaveDisabled]}
                onPress={handleApplyPercent}
                disabled={editTotal !== 100}
              >
                <Text style={[styles.modalButtonSaveText, editTotal !== 100 && styles.modalButtonSaveTextDisabled]}>
                  {t('common.save')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
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
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
  },
  confirmButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 23,
    paddingTop: 50,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
    textAlign: 'left',
    marginBottom: 30,
  },
  caloriesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
  },
  caloriesLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.white,
  },
  caloriesInput: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
    backgroundColor: 'transparent',
    textAlign: 'right',
    minWidth: 80,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  divider: {
    height: 0.5,
    backgroundColor: '#A8A8A8',
  },
  macroItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 40,
  },
  macroLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  macroIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  macroLabelText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.white,
  },
  macroGrams: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  macroRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  macroPercent: {
    fontSize: 12,
    fontWeight: '600',
    color: '#BBE0FF',
    minWidth: 35,
    textAlign: 'right',
  },
  percentSummary: {
    marginTop: 30,
    alignItems: 'center',
  },
  percentBar: {
    flexDirection: 'row',
    width: '100%',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  percentSegment: {
    height: '100%',
  },
  percentTotal: {
    marginTop: 10,
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  percentWarning: {
    marginTop: 10,
    fontSize: 12,
    color: '#FF6B6B',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a1a',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    borderWidth: 2,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
    textAlign: 'center',
    marginBottom: 20,
  },
  pickersContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 8,
  },
  sheetWarning: {
    fontSize: 13,
    color: '#FF6B6B',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 16,
  },
  sheetOk: {
    fontSize: 13,
    color: '#4CAF50',
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButtonCancel: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.white,
  },
  modalButtonCancelText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.white,
  },
  modalButtonSave: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.white,
  },
  modalButtonSaveDisabled: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  modalButtonSaveText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.dark,
  },
  modalButtonSaveTextDisabled: {
    color: 'rgba(255,255,255,0.3)',
  },
});
