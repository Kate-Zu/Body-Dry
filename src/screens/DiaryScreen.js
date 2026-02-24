import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Alert,
  TextInput,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { ProgressRing } from '../components';
import { useDiaryStore } from '../store';
import { useTranslation } from '../i18n';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

// Format nutrition value: calories as integer, macros with 1 decimal
const formatNutrition = (value, isCalories = false) => {
  const num = value || 0;
  if (isCalories) return Math.round(num).toString();
  const fixed = num.toFixed(1);
  return fixed.endsWith('.0') ? Math.round(num).toString() : fixed;
};

// Calendar Component
const CalendarPicker = ({ visible, onClose, selectedDate, onSelectDate, t }) => {
  const [viewDate, setViewDate] = useState(new Date(selectedDate));
  
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
  
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);
  
  // Adjust for Monday start (0 = Monday, 6 = Sunday)
  const adjustedFirstDay = firstDay === 0 ? 6 : firstDay - 1;
  
  const monthNames = [
    'Січень', 'Лютий', 'Березень', 'Квітень', 'Травень', 'Червень',
    'Липень', 'Серпень', 'Вересень', 'Жовтень', 'Листопад', 'Грудень'
  ];
  
  const dayNames = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
  
  const today = new Date().toISOString().split('T')[0];
  
  const days = [];
  // Empty cells for days before month starts
  for (let i = 0; i < adjustedFirstDay; i++) {
    days.push(null);
  }
  // Days of the month
  for (let d = 1; d <= daysInMonth; d++) {
    days.push(d);
  }
  
  const handleDayPress = (day) => {
    if (!day) return;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onSelectDate(dateStr);
  };
  
  const changeMonth = (delta) => {
    const newDate = new Date(viewDate);
    newDate.setMonth(newDate.getMonth() + delta);
    setViewDate(newDate);
  };
  
  const isSelected = (day) => {
    if (!day) return false;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return dateStr === selectedDate;
  };
  
  const isToday = (day) => {
    if (!day) return false;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return dateStr === today;
  };
  
  const isFuture = (day) => {
    if (!day) return false;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return dateStr > today;
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <View style={styles.calendarContainer} onStartShouldSetResponder={() => true}>
          <View style={styles.calendarHeader}>
            <TouchableOpacity onPress={() => changeMonth(-1)}>
              <Ionicons name="chevron-back" size={24} color={Colors.white} />
            </TouchableOpacity>
            <Text style={styles.calendarTitle}>{monthNames[month]} {year}</Text>
            <TouchableOpacity onPress={() => changeMonth(1)}>
              <Ionicons name="chevron-forward" size={24} color={Colors.white} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.dayNamesRow}>
            {dayNames.map((name, i) => (
              <Text key={i} style={styles.dayName}>{name}</Text>
            ))}
          </View>
          
          <View style={styles.daysGrid}>
            {days.map((day, i) => (
              <TouchableOpacity
                key={i}
                style={styles.dayCell}
                onPress={() => handleDayPress(day)}
                disabled={!day}
              >
                <View style={[
                  styles.dayCellInner,
                  isSelected(day) && styles.dayCellSelected,
                  isToday(day) && !isSelected(day) && styles.dayCellToday,
                ]}>
                  <Text style={[
                    styles.dayText,
                    !day && styles.dayTextEmpty,
                    isSelected(day) && styles.dayTextSelected,
                  ]}>
                    {day || ''}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
          
          <TouchableOpacity style={styles.todayButton} onPress={() => onSelectDate(today)}>
            <Text style={styles.todayButtonText}>{t('dates.today')}</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

// Edit Entry Modal
const EditEntryModal = ({ visible, onClose, entry, onSave, onDelete, t }) => {
  const [amount, setAmount] = useState(entry?.amount?.toString() || '100');
  
  useEffect(() => {
    if (entry) {
      setAmount(entry.amount?.toString() || '100');
    }
  }, [entry]);
  
  const handleSave = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert(t('common.error'), t('validation.minOneGram'));
      return;
    }
    onSave(entry.id, numAmount);
  };
  
  const handleDelete = () => {
    Alert.alert(
      t('common.delete'),
      t('diary.deleteConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { text: t('common.delete'), style: 'destructive', onPress: () => onDelete(entry.id) },
      ]
    );
  };
  
  if (!entry) return null;
  
  const food = entry.food || {};
  const numAmount = parseFloat(amount) || 0;
  const multiplier = numAmount / 100;
  
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.editModalOverlay}>
        <View style={styles.editModalContainer}>
          <View style={styles.editModalHeader}>
            <Text style={styles.editModalTitle}>{t('diary.editEntry')}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.white} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.editFoodName}>{food.name}</Text>
          {food.brand && <Text style={styles.editFoodBrand}>{food.brand}</Text>}
          
          <View style={styles.editInputContainer}>
            <Text style={styles.editLabel}>{t('diary.portionSize')}</Text>
            <View style={styles.editInputRow}>
              <TextInput
                style={styles.editInput}
                value={amount}
                onChangeText={setAmount}
                keyboardType="numeric"
                selectTextOnFocus
              />
              <Text style={styles.editUnit}>{t('units.g')}</Text>
            </View>
          </View>
          
          <View style={styles.editNutrition}>
            <View style={styles.editNutritionItem}>
              <Text style={styles.editNutritionValue}>{formatNutrition((food.calories || 0) * multiplier, true)}</Text>
              <Text style={styles.editNutritionLabel}>{t('diary.kcal')}</Text>
            </View>
            <View style={styles.editNutritionItem}>
              <Text style={styles.editNutritionValue}>{formatNutrition((food.protein || 0) * multiplier)}</Text>
              <Text style={styles.editNutritionLabel}>{t('diary.protein')}</Text>
            </View>
            <View style={styles.editNutritionItem}>
              <Text style={styles.editNutritionValue}>{formatNutrition((food.carbs || 0) * multiplier)}</Text>
              <Text style={styles.editNutritionLabel}>{t('diary.carbs')}</Text>
            </View>
            <View style={styles.editNutritionItem}>
              <Text style={styles.editNutritionValue}>{formatNutrition((food.fats || 0) * multiplier)}</Text>
              <Text style={styles.editNutritionLabel}>{t('diary.fats')}</Text>
            </View>
          </View>
          
          <View style={styles.editButtons}>
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
              <Ionicons name="trash-outline" size={20} color="#FF4444" />
              <Text style={styles.deleteButtonText}>{t('common.delete')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>{t('common.save')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const MealSection = ({ title, icon, meal, onAdd, onEditEntry, t }) => {
  const items = meal?.foods || [];
  const totalCalories = meal?.totalCalories || 0;
  
  return (
    <View style={styles.mealSection}>
      <View style={styles.mealHeader}>
        <View style={styles.mealInfo}>
          <Ionicons name={icon} size={20} color={Colors.primary} />
          <Text style={styles.mealTitle}>{title}</Text>
          {totalCalories > 0 && (
            <Text style={styles.mealCalories}>{Math.round(totalCalories)} {t('diary.kcal')}</Text>
          )}
        </View>
        <TouchableOpacity onPress={onAdd}>
          <Ionicons name="add-circle" size={24} color={Colors.primary} />
        </TouchableOpacity>
      </View>
      <View style={styles.mealDivider} />
      {items.length === 0 ? (
        <Text style={styles.emptyText}>{t('diary.noMeals')}</Text>
      ) : (
        items.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.foodItem}
            onPress={() => onEditEntry(item)}
          >
            <View style={styles.foodInfo}>
              <Text style={styles.foodName}>{item.food?.name || item.name}</Text>
              <Text style={styles.foodPortion}>{item.amount}{t('units.g')}</Text>
            </View>
            <View style={styles.foodRight}>
              <Text style={styles.foodCalories}>{Math.round(item.calories)} {t('diary.kcal')}</Text>
              <Ionicons name="chevron-forward" size={16} color={Colors.textSecondary} />
            </View>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
};

export const DiaryScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { 
    currentDate, 
    dayData, 
    isLoading, 
    fetchDay, 
    setDate,
    updateEntry,
    deleteEntry,
  } = useDiaryStore();
  
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);

  // Refetch diary (goals + meals) when screen gains focus
  useFocusEffect(
    useCallback(() => {
      fetchDay();
    }, [fetchDay])
  );

  const totals = dayData?.totals || { calories: 0, protein: 0, carbs: 0, fats: 0 };
  const goals = dayData?.goals || { calories: 2000, protein: 150, carbs: 200, fats: 65 };
  const meals = dayData?.meals || [];

  const waterCurrentL = dayData?.water?.current || 0;
  const waterGoalL = dayData?.water?.goal || 2.7;
  const waterProgress = waterGoalL > 0 ? (waterCurrentL / waterGoalL) * 100 : 0;

  const caloriesRemaining = goals.calories - totals.calories;
  const calorieProgress = (totals.calories / goals.calories) * 100;

  // Group meals by type
  const mealsByType = {
    BREAKFAST: meals.find(m => m.type === 'BREAKFAST'),
    LUNCH: meals.find(m => m.type === 'LUNCH'),
    DINNER: meals.find(m => m.type === 'DINNER'),
    SNACK: meals.find(m => m.type === 'SNACK'),
  };

  const handleAddMeal = (mealType) => {
    navigation.navigate('AddMeal', { mealType });
  };

  const handleDateChange = (days) => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + days);
    const newDate = date.toISOString().split('T')[0];
    setDate(newDate);
  };
  
  const handleDateSelect = (dateStr) => {
    setDate(dateStr);
    setCalendarVisible(false);
  };
  
  const handleEditEntry = (entry) => {
    setSelectedEntry(entry);
    setEditModalVisible(true);
  };
  
  const handleSaveEntry = async (entryId, amount) => {
    const success = await updateEntry(entryId, amount);
    if (success) {
      setEditModalVisible(false);
      setSelectedEntry(null);
    }
  };
  
  const handleDeleteEntry = async (entryId) => {
    const success = await deleteEntry(entryId);
    if (success) {
      setEditModalVisible(false);
      setSelectedEntry(null);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (dateStr === today.toISOString().split('T')[0]) return t('dates.today');
    if (dateStr === yesterday.toISOString().split('T')[0]) return t('dates.yesterday');
    if (dateStr === tomorrow.toISOString().split('T')[0]) return t('dates.tomorrow');
    return date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={fetchDay} />
        }
      >
        <View style={styles.dateHeader}>
          <TouchableOpacity onPress={() => handleDateChange(-1)}>
            <Ionicons name="chevron-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setCalendarVisible(true)} style={styles.dateButton}>
            <Text style={styles.dateText}>{formatDate(currentDate)}</Text>
            <Ionicons name="calendar-outline" size={18} color={Colors.primary} style={styles.calendarIcon} />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDateChange(1)}>
            <Ionicons name="chevron-forward" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.progressContainer}>
          <ProgressRing
            progress={Math.min(calorieProgress, 100)}
            size={117}
            strokeWidth={13}
            centerValue={Math.round(caloriesRemaining)}
            centerLabel={t('diary.kcal')}
          />
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('diary.carbs')}</Text>
            <View style={styles.statValues}>
              <Text style={styles.statCurrent}>{Math.round(totals.carbs)}</Text>
              <Text style={styles.statRemaining}>{Math.round(goals.carbs - totals.carbs)}</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('diary.fats')}</Text>
            <View style={styles.statValues}>
              <Text style={styles.statCurrent}>{Math.round(totals.fats)}</Text>
              <Text style={styles.statRemaining}>{Math.round(goals.fats - totals.fats)}</Text>
            </View>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>{t('diary.protein')}</Text>
            <View style={styles.statValues}>
              <Text style={styles.statCurrent}>{Math.round(totals.protein)}</Text>
              <Text style={styles.statRemaining}>{Math.round(goals.protein - totals.protein)}</Text>
            </View>
          </View>
        </View>

        <MealSection
          title={t('diary.breakfast')}
          icon="sunny-outline"
          meal={mealsByType.BREAKFAST}
          onAdd={() => handleAddMeal('BREAKFAST')}
          onEditEntry={handleEditEntry}
          t={t}
        />
        <MealSection
          title={t('diary.lunch')}
          icon="restaurant-outline"
          meal={mealsByType.LUNCH}
          onAdd={() => handleAddMeal('LUNCH')}
          onEditEntry={handleEditEntry}
          t={t}
        />
        <MealSection
          title={t('diary.dinner')}
          icon="moon-outline"
          meal={mealsByType.DINNER}
          onAdd={() => handleAddMeal('DINNER')}
          onEditEntry={handleEditEntry}
          t={t}
        />
        <MealSection
          title={t('diary.snacks')}
          icon="nutrition-outline"
          meal={mealsByType.SNACK}
          onAdd={() => handleAddMeal('SNACK')}
          onEditEntry={handleEditEntry}
          t={t}
        />

        {/* Water Card */}
        <View style={styles.waterCard}>
          <View style={styles.waterContent}>
            <ProgressRing
              progress={Math.min(waterProgress, 100)}
              size={117}
              strokeWidth={10}
              centerValue={`${waterCurrentL.toFixed(2)} ${t('units.l')}`}
              centerLabel={`${waterGoalL.toFixed(2)} ${t('units.liter')}`}
            />
            <View style={styles.waterInfo}>
              <Text style={styles.waterTitle}>{t('water.title')}</Text>
              <TouchableOpacity
                style={styles.waterButton}
                onPress={() => navigation.navigate('WaterTracker')}
              >
                <Text style={styles.waterButtonText}>{t('water.addWater')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
      
      <CalendarPicker
        visible={calendarVisible}
        onClose={() => setCalendarVisible(false)}
        selectedDate={currentDate}
        onSelectDate={handleDateSelect}
        t={t}
      />
      
      <EditEntryModal
        visible={editModalVisible}
        onClose={() => setEditModalVisible(false)}
        entry={selectedEntry}
        onSave={handleSaveEntry}
        onDelete={handleDeleteEntry}
        t={t}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  dateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    marginTop: 20,
  },
  dateButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.white,
  },
  calendarIcon: {
    marginLeft: 8,
  },
  progressContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 25,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 10,
    padding: 10,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.white,
    marginBottom: 8,
  },
  statValues: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCurrent: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.white,
  },
  statRemaining: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  mealSection: {
    marginBottom: 20,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  mealInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.white,
  },
  mealDivider: {
    height: 0.5,
    backgroundColor: '#A8A8A8',
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: 'italic',
  },
  foodItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(168, 168, 168, 0.3)',
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 14,
    color: Colors.white,
  },
  foodPortion: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  foodRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  foodCalories: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  mealCalories: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  
  // Calendar styles
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  calendarContainer: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 20,
    width: '100%',
    maxWidth: 360,
  },
  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  calendarTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
  },
  dayNamesRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  dayName: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100/7}%`,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCellInner: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayCellSelected: {
    backgroundColor: Colors.primary,
  },
  dayCellToday: {
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  dayText: {
    fontSize: 14,
    color: Colors.white,
  },
  dayTextEmpty: {
    color: 'transparent',
  },
  dayTextSelected: {
    fontWeight: '600',
  },
  dayTextDisabled: {
    color: Colors.textSecondary,
    opacity: 0.4,
  },
  todayButton: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  todayButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.primary,
  },
  
  // Edit Modal styles
  editModalOverlay: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  editModalContainer: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 360,
  },
  editModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  editModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
  },
  editFoodName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.white,
    marginBottom: 4,
  },
  editFoodBrand: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  editInputContainer: {
    marginBottom: 24,
  },
  editLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  editInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  editInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: Colors.white,
    paddingVertical: 16,
  },
  editUnit: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
  editNutrition: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  editNutritionItem: {
    alignItems: 'center',
  },
  editNutritionValue: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
  },
  editNutritionLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF4444',
    gap: 8,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF4444',
  },
  saveButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.background,
  },
  waterCard: {
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  waterContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },
  waterInfo: {
    flex: 1,
    gap: 15,
  },
  waterTitle: {
    fontSize: 18,
    fontWeight: '400',
    color: Colors.white,
  },
  waterButton: {
    backgroundColor: Colors.white,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 50,
    alignSelf: 'flex-start',
  },
  waterButtonText: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.dark,
    textTransform: 'uppercase',
  },
});
