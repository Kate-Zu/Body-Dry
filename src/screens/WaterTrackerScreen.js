import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../constants/colors';
import { ProgressRing } from '../components';
import { useDiaryStore } from '../store';
import { useTranslation } from '../i18n';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PORTION_OPTIONS = [
  { ml: 100, liters: 0.1 },
  { ml: 200, liters: 0.2 },
  { ml: 500, liters: 0.5 },
  { ml: 750, liters: 0.75 },
  { ml: 1000, liters: 1.0 },
  { ml: 1500, liters: 1.5 },
  { ml: 2000, liters: 2.0 },
];

const WaterDropIcon = ({ size = 50, color = Colors.primary, filled = false }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 2C12 2 5 10 5 15C5 18.866 8.134 22 12 22C15.866 22 19 18.866 19 15C19 10 12 2 12 2Z"
      stroke={color}
      strokeWidth={1.5}
      fill={filled ? color : 'none'}
    />
  </Svg>
);

export const WaterTrackerScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { dayData, addWater, updateWaterOptimistic } = useDiaryStore();
  const [stepAmount, setStepAmount] = useState(0.25);
  const [stepOptions, setStepOptions] = useState([0.1, 0.25, 0.5]);
  const [localWater, setLocalWater] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const pendingAmount = useRef(0);
  const debounceTimer = useRef(null);
  const scrollRef = useRef(null);

  const waterGoal = dayData?.water?.goal || 2;
  const waterConsumed = dayData?.water?.current || 0;

  useEffect(() => {
    setLocalWater(waterConsumed);
  }, [waterConsumed]);

  // Очистка таймера при розмонтуванні
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
        if (pendingAmount.current !== 0) {
          addWater(pendingAmount.current);
        }
      }
    };
  }, [addWater]);

  const waterProgress = (localWater / waterGoal) * 100;

  const debouncedSave = useCallback((amount) => {
    pendingAmount.current += amount;
    
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      if (pendingAmount.current !== 0) {
        addWater(pendingAmount.current);
        pendingAmount.current = 0;
      }
    }, 500);
  }, [addWater]);

  const handleAdd = useCallback(() => {
    const newValue = localWater + stepAmount;
    setLocalWater(newValue);
    updateWaterOptimistic(newValue);
    debouncedSave(stepAmount);
  }, [localWater, stepAmount, updateWaterOptimistic, debouncedSave]);

  const handleRemove = useCallback(() => {
    const newValue = Math.max(localWater - stepAmount, 0);
    setLocalWater(newValue);
    updateWaterOptimistic(newValue);
    debouncedSave(-stepAmount);
  }, [localWater, stepAmount, updateWaterOptimistic, debouncedSave]);

  const handlePortionSelect = useCallback((liters) => {
    setStepAmount(liters);
    setStepOptions(prev => {
      // Якщо вже є в списку — не змінюємо
      if (prev.includes(liters)) {
        return prev;
      }
      // Видаляємо першу, додаємо нову в кінець, сортуємо за зростанням
      const newOptions = [prev[1], prev[2], liters].sort((a, b) => a - b);
      return newOptions;
    });
    // Повернутись на першу сторінку
    scrollRef.current?.scrollTo({ x: 0, animated: true });
  }, []);

  const handleBack = () => {
    navigation.goBack();
  };

  const handleScroll = (event) => {
    const page = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
    setCurrentPage(page);
  };

  const handleCheckmark = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack}>
          <Ionicons name="chevron-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('water.tracker')}</Text>
        <TouchableOpacity style={styles.checkButton} onPress={handleCheckmark}>
          <Ionicons name="checkmark" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Page 1: Water Tracker */}
        <View style={styles.page}>
          <View style={styles.waterInfo}>
            <Text style={styles.waterLabel}>{t('water.todayConsumption')}</Text>
            <Text style={styles.waterAmount}>
              {localWater.toFixed(1)} {t('water.liters')} / {waterGoal} {t('water.liters')}
            </Text>
          </View>

          <View style={styles.progressContainer}>
            <ProgressRing
              progress={Math.min(waterProgress, 100)}
              size={280}
              strokeWidth={40}
              color={Colors.primary}
              bgColor="rgba(187, 224, 255, 0.1)"
            />
          </View>

          <View style={styles.stepperSection}>
            <View style={styles.stepper}>
              <TouchableOpacity
                style={[styles.stepperButton, localWater <= 0 && styles.stepperButtonDisabled]}
                onPress={handleRemove}
                disabled={localWater <= 0}
              >
                <Ionicons name="remove" size={24} color={Colors.white} />
              </TouchableOpacity>

              <Text style={styles.stepperValue}>{(stepAmount * 1000).toFixed(0)} ml</Text>

              <TouchableOpacity
                style={styles.stepperButton}
                onPress={handleAdd}
              >
                <Ionicons name="add" size={24} color={Colors.white} />
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.stepOptions}>
            {stepOptions.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.stepOption,
                  stepAmount === amount && styles.stepOptionActive,
                ]}
                onPress={() => setStepAmount(amount)}
              >
                <Text
                  style={[
                    styles.stepOptionText,
                    stepAmount === amount && styles.stepOptionTextActive,
                  ]}
                >
                  {(amount * 1000).toFixed(0)} ml
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Page 2: Portion Selector */}
        <View style={styles.page}>
          <View style={styles.waterInfo}>
            <Text style={styles.waterLabel}>{t('water.todayConsumption')}</Text>
            <Text style={styles.waterAmount}>
              {localWater.toFixed(1)} {t('water.liters')} / {waterGoal} {t('water.liters')}
            </Text>
          </View>

          <View style={styles.portionGrid}>
            {PORTION_OPTIONS.map((option) => (
              <TouchableOpacity
                key={option.ml}
                style={styles.portionItem}
                onPress={() => handlePortionSelect(option.liters)}
                activeOpacity={0.7}
              >
                <WaterDropIcon size={50} color={Colors.primary} filled={stepAmount === option.liters} />
                <Text style={styles.portionLabel}>{option.ml} ml</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        <View style={[styles.dot, currentPage === 0 && styles.dotActive]} />
        <View style={[styles.dot, currentPage === 1 && styles.dotActive]} />
      </View>

      <Text style={styles.hintText}>
        {currentPage === 0
          ? t('water.swipeHint')
          : t('water.swipeHint')}
      </Text>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginTop: 20,
  },
  backButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkButton: {
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.white,
    textTransform: 'uppercase',
  },
  page: {
    width: SCREEN_WIDTH,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  waterInfo: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 20,
  },
  waterLabel: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginBottom: 10,
  },
  waterAmount: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white,
  },
  progressContainer: {
    marginBottom: 40,
  },
  stepperSection: {
    width: '100%',
    marginBottom: 30,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 30,
  },
  stepperButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(242, 242, 247, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepperButtonDisabled: {
    opacity: 0.3,
  },
  stepperValue: {
    fontSize: 34,
    fontWeight: '700',
    color: Colors.white,
    minWidth: 120,
    textAlign: 'center',
  },
  stepOptions: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 20,
  },
  stepOption: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
    backgroundColor: 'rgba(242, 242, 247, 0.1)',
  },
  stepOptionActive: {
    backgroundColor: Colors.primary,
  },
  stepOptionText: {
    fontSize: 14,
    color: Colors.white,
    fontWeight: '500',
  },
  stepOptionTextActive: {
    color: Colors.dark,
  },
  portionGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    paddingHorizontal: 10,
    gap: 10,
    marginTop: 10,
  },
  portionItem: {
    width: (SCREEN_WIDTH - 80) / 3,
    alignItems: 'center',
    paddingVertical: 15,
  },
  portionLabel: {
    fontSize: 14,
    color: Colors.white,
    marginTop: 8,
    fontWeight: '500',
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dotActive: {
    backgroundColor: Colors.primary,
  },
  hintText: {
    fontSize: 11,
    color: '#7D7D7D',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 16,
  },
});
