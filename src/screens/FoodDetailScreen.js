import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle, Path } from 'react-native-svg';
import { Colors } from '../constants/colors';
import { useDiaryStore } from '../store';
import { useTranslation } from '../i18n';

const getMealTypes = (t) => [
  { key: 'BREAKFAST', label: t('diary.breakfast') },
  { key: 'LUNCH', label: t('diary.lunch') },
  { key: 'DINNER', label: t('diary.dinner') },
  { key: 'SNACK', label: t('diary.snacks') },
];

const getPortionSizes = (t) => [
  { value: 50, label: `50 ${t('units.g')}` },
  { value: 100, label: `100 ${t('units.g')}` },
  { value: 150, label: `150 ${t('units.g')}` },
  { value: 200, label: `200 ${t('units.g')}` },
];

// Circular progress chart component
const NutritionChart = ({ calories, carbs, protein, fats, kcalLabel }) => {
  const size = 100;
  const strokeWidth = 6;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  // Calculate percentages
  const total = carbs + protein + fats;
  const carbsPercent = total > 0 ? carbs / total : 0.33;
  const proteinPercent = total > 0 ? protein / total : 0.33;
  const fatsPercent = total > 0 ? fats / total : 0.34;

  // Calculate arc lengths
  const carbsArc = circumference * carbsPercent;
  const proteinArc = circumference * proteinPercent;
  const fatsArc = circumference * fatsPercent;

  // Calculate offsets
  const carbsOffset = 0;
  const proteinOffset = -carbsArc;
  const fatsOffset = -(carbsArc + proteinArc);

  return (
    <View style={styles.chartContainer}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth={strokeWidth}
        />
        {/* Carbs - Blue */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#BBE0FF"
          strokeWidth={strokeWidth}
          strokeDasharray={`${carbsArc} ${circumference}`}
          strokeDashoffset={carbsOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        {/* Protein - Orange */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#FFAD8F"
          strokeWidth={strokeWidth}
          strokeDasharray={`${proteinArc} ${circumference}`}
          strokeDashoffset={proteinOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
        {/* Fats - White */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#FEFFFC"
          strokeWidth={strokeWidth}
          strokeDasharray={`${fatsArc} ${circumference}`}
          strokeDashoffset={fatsOffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.chartCenter}>
        <Text style={styles.caloriesNumber}>{Math.round(calories)}</Text>
        <Text style={styles.caloriesLabel}>{kcalLabel}</Text>
      </View>
    </View>
  );
};

export const FoodDetailScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { food, mealType: initialMealType = 'BREAKFAST' } = route.params;
  
  const MEAL_TYPES = getMealTypes(t);
  
  const [customGrams, setCustomGrams] = useState('100');
  const [selectedMealType, setSelectedMealType] = useState(initialMealType);
  const [showMealPicker, setShowMealPicker] = useState(false);
  
  const { addFoodEntry } = useDiaryStore();

  const stepGrams = (delta) => {
    const current = parseFloat(customGrams.replace(',', '.')) || 0;
    const next = Math.max(1, current + delta);
    setCustomGrams(String(Math.round(next)));
  };

  // Calculate nutrition based on grams
  const nutrition = useMemo(() => {
    const grams = parseFloat(customGrams.replace(',', '.')) || 0;
    const multiplier = grams / 100;
    
    return {
      calories: food.calories * multiplier,
      carbs: food.carbs * multiplier,
      protein: food.protein * multiplier,
      fats: food.fats * multiplier,
    };
  }, [food, customGrams]);

  // Calculate percentages for display
  const percentages = useMemo(() => {
    const total = nutrition.carbs + nutrition.protein + nutrition.fats;
    if (total === 0) return { carbs: 0, protein: 0, fats: 0 };
    
    return {
      carbs: Math.round((nutrition.carbs / total) * 100),
      protein: Math.round((nutrition.protein / total) * 100),
      fats: Math.round((nutrition.fats / total) * 100),
    };
  }, [nutrition]);

  const handleSave = async () => {
    const grams = parseFloat(customGrams.replace(',', '.')) || 100;
    
    const success = await addFoodEntry({
      foodId: food.id,
      mealType: selectedMealType,
      amount: grams,
    });
    
    if (success) {
      navigation.goBack();
    }
  };

  const selectedMealLabel = MEAL_TYPES.find(m => m.key === selectedMealType)?.label || t('diary.breakfast');

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('food.addFood').toUpperCase()}</Text>
        <TouchableOpacity style={styles.checkButton} onPress={handleSave}>
          <Ionicons name="checkmark" size={28} color="#BBE0FF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Food Info */}
        <View style={styles.foodHeader}>
          <Text style={styles.foodName}>{food.name}</Text>
          {food.brand && <Text style={styles.foodBrand}>{food.brand}</Text>}
        </View>

        <View style={styles.divider} />

        {/* Input Section */}
        <View style={styles.inputSection}>
          {/* Grams input */}
          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>{t('food.amount')} ({t('units.g')})</Text>
            <View style={styles.stepperRow}>
              <TouchableOpacity
                style={styles.stepperButton}
                onPress={() => stepGrams(-10)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="remove" size={18} color="#BBE0FF" />
              </TouchableOpacity>
              <View style={styles.gramsInputContainer}>
                <TextInput
                  style={styles.gramsInput}
                  value={customGrams}
                  onChangeText={setCustomGrams}
                  keyboardType="decimal-pad"
                  placeholder="100"
                  placeholderTextColor="rgba(255,255,255,0.5)"
                  selectTextOnFocus
                />
                <Text style={styles.gramsUnit}>{t('units.g')}</Text>
              </View>
              <TouchableOpacity
                style={styles.stepperButton}
                onPress={() => stepGrams(10)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="add" size={18} color="#BBE0FF" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Quick portion buttons */}
          <View style={styles.quickPortionsRow}>
            {[50, 100, 150, 200, 250].map((grams) => (
              <TouchableOpacity
                key={grams}
                style={[
                  styles.quickPortionButton,
                  customGrams === String(grams) && styles.quickPortionButtonActive,
                ]}
                onPress={() => setCustomGrams(String(grams))}
              >
                <Text style={[
                  styles.quickPortionText,
                  customGrams === String(grams) && styles.quickPortionTextActive,
                ]}>
                  {grams}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.inputRow}>
            <Text style={styles.inputLabel}>{t('food.mealType')}</Text>
            <TouchableOpacity 
              style={styles.inputField}
              onPress={() => setShowMealPicker(!showMealPicker)}
            >
              <Text style={styles.inputValue}>{selectedMealLabel}</Text>
              <Ionicons name="chevron-down" size={16} color="rgba(255,255,255,0.7)" />
            </TouchableOpacity>
          </View>

          {showMealPicker && (
            <View style={styles.picker}>
              {MEAL_TYPES.map((meal) => (
                <TouchableOpacity
                  key={meal.key}
                  style={[
                    styles.pickerItem,
                    selectedMealType === meal.key && styles.pickerItemSelected,
                  ]}
                  onPress={() => {
                    setSelectedMealType(meal.key);
                    setShowMealPicker(false);
                  }}
                >
                  <Text style={[
                    styles.pickerItemText,
                    selectedMealType === meal.key && styles.pickerItemTextSelected,
                  ]}>
                    {meal.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Nutrition Section */}
        <View style={styles.nutritionSection}>
          <NutritionChart 
            calories={nutrition.calories}
            carbs={nutrition.carbs}
            protein={nutrition.protein}
            fats={nutrition.fats}
            kcalLabel={t('diary.kcal')}
          />

          <View style={styles.macrosCard}>
            <View style={styles.macroItem}>
              <Text style={styles.macroPercent}>{percentages.carbs}%</Text>
              <Text style={[styles.macroValue, { color: '#BBE0FF' }]}>
                {nutrition.carbs.toFixed(1)} {t('units.g')}
              </Text>
              <Text style={styles.macroLabel}>{t('food.carbsShort')}</Text>
            </View>

            <View style={styles.macroItem}>
              <Text style={styles.macroPercent}>{percentages.fats}%</Text>
              <Text style={[styles.macroValue, { color: '#FEFFFC' }]}>
                {nutrition.fats.toFixed(1)} {t('units.g')}
              </Text>
              <Text style={styles.macroLabel}>{t('diary.fats')}</Text>
            </View>

            <View style={styles.macroItem}>
              <Text style={styles.macroPercent}>{percentages.protein}%</Text>
              <Text style={[styles.macroValue, { color: '#FFAD8F' }]}>
                {nutrition.protein.toFixed(1)} {t('units.g')}
              </Text>
              <Text style={styles.macroLabel}>{t('diary.protein')}</Text>
            </View>
          </View>
        </View>

        {/* Additional nutrition info */}
        <View style={styles.additionalInfo}>
          <Text style={styles.additionalTitle}>{t('food.per100g')}:</Text>
          <View style={styles.additionalRow}>
            <Text style={styles.additionalLabel}>{t('diary.calories')}</Text>
            <Text style={styles.additionalValue}>{food.calories} {t('diary.kcal')}</Text>
          </View>
          <View style={styles.additionalRow}>
            <Text style={styles.additionalLabel}>{t('diary.protein')}</Text>
            <Text style={styles.additionalValue}>{food.protein} {t('units.g')}</Text>
          </View>
          <View style={styles.additionalRow}>
            <Text style={styles.additionalLabel}>{t('diary.carbs')}</Text>
            <Text style={styles.additionalValue}>{food.carbs} {t('units.g')}</Text>
          </View>
          <View style={styles.additionalRow}>
            <Text style={styles.additionalLabel}>{t('diary.fats')}</Text>
            <Text style={styles.additionalValue}>{food.fats} {t('units.g')}</Text>
          </View>
        </View>
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
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  backButton: {
    width: 42,
    height: 42,
    backgroundColor: 'rgba(244,244,244,0.1)',
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: '500',
    color: Colors.white,
    textTransform: 'uppercase',
  },
  checkButton: {
    width: 42,
    height: 42,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  foodHeader: {
    marginBottom: 15,
  },
  foodName: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.white,
    lineHeight: 24,
  },
  foodBrand: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  divider: {
    height: 0.5,
    backgroundColor: '#A8A8A8',
    marginBottom: 20,
  },
  inputSection: {
    marginBottom: 25,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 44,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.white,
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 6,
  },
  inputFieldText: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    fontSize: 14,
    fontWeight: '500',
    color: Colors.white,
    textAlign: 'right',
    minWidth: 70,
  },
  inputValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.white,
  },
  picker: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 8,
    marginTop: 5,
    marginBottom: 10,
    overflow: 'hidden',
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  pickerItemSelected: {
    backgroundColor: 'rgba(187,224,255,0.2)',
  },
  pickerItemText: {
    fontSize: 14,
    color: Colors.white,
  },
  pickerItemTextSelected: {
    color: '#BBE0FF',
    fontWeight: '500',
  },
  nutritionSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 30,
  },
  chartContainer: {
    width: 100,
    height: 100,
    position: 'relative',
  },
  chartCenter: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  caloriesNumber: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.white,
  },
  caloriesLabel: {
    fontSize: 14,
    fontWeight: '400',
    color: Colors.white,
  },
  macrosCard: {
    flex: 1,
    backgroundColor: 'rgba(187,224,255,0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 12,
  },
  macroItem: {
    alignItems: 'center',
  },
  macroPercent: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 4,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  macroLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.white,
  },
  additionalInfo: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 12,
    padding: 15,
    marginBottom: 30,
  },
  additionalTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 12,
  },
  additionalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  additionalLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  additionalValue: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.white,
  },
  gramsInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    paddingHorizontal: 15,
  },
  gramsInput: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
    paddingVertical: 12,
    minWidth: 60,
    textAlign: 'right',
  },
  gramsUnit: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
    marginLeft: 8,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepperButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(187,224,255,0.5)',
    backgroundColor: 'rgba(187,224,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickPortionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 10,
  },
  quickPortionButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  quickPortionButtonActive: {
    backgroundColor: 'rgba(187,224,255,0.2)',
    borderColor: '#BBE0FF',
  },
  quickPortionText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
  },
  quickPortionTextActive: {
    color: '#BBE0FF',
    fontWeight: '600',
  },
});
