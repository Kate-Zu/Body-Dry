import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { useFoodsStore, useDiaryStore } from '../store';
import { useTranslation } from '../i18n';
import { useFocusEffect } from '@react-navigation/native';

// Format nutrition value: calories as integer, macros with 1 decimal
const formatNutrition = (value, isCalories = false) => {
  const num = value || 0;
  if (isCalories) return Math.round(num).toString();
  const fixed = num.toFixed(1);
  // Remove .0 but keep meaningful decimals like .8
  return fixed.endsWith('.0') ? Math.round(num).toString() : fixed;
};

// Modal for entering grams
const AddGramsModal = ({ visible, onClose, food, mealType, onAdd, t }) => {
  const [grams, setGrams] = useState('100');
  
  useEffect(() => {
    if (visible) {
      setGrams('100');
    }
  }, [visible]);
  
  if (!food) return null;
  
  const numGrams = parseFloat(grams) || 0;
  const multiplier = numGrams / 100;
  
  const handleAdd = () => {
    const amount = parseFloat(grams) || 100;
    onAdd(food, amount);
  };

  const stepGrams = (delta) => {
    const current = parseFloat(grams) || 0;
    const next = Math.max(1, current + delta);
    setGrams(String(Math.round(next)));
  };
  
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.modalOverlay}
      >
        <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={onClose} />
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('food.addFood')}</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.white} />
            </TouchableOpacity>
          </View>
          
          <Text style={styles.modalFoodName}>{food.name}</Text>
          {food.brand && <Text style={styles.modalFoodBrand}>{food.brand}</Text>}
          
          <View style={styles.modalInputContainer}>
            <Text style={styles.modalLabel}>{t('food.amount')} ({t('units.g')})</Text>
            <View style={styles.modalInputRow}>
              <TouchableOpacity
                style={styles.stepperButton}
                onPress={() => stepGrams(-10)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Ionicons name="remove" size={18} color="#BBE0FF" />
              </TouchableOpacity>
              <TextInput
                style={styles.modalInput}
                value={grams}
                onChangeText={setGrams}
                keyboardType="numeric"
                selectTextOnFocus
                autoFocus
              />
              <Text style={styles.modalUnit}>{t('units.g')}</Text>
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
          <View style={styles.quickButtons}>
            {[50, 100, 150, 200, 250].map((g) => (
              <TouchableOpacity
                key={g}
                style={[styles.quickButton, grams === String(g) && styles.quickButtonActive]}
                onPress={() => setGrams(String(g))}
              >
                <Text style={[styles.quickButtonText, grams === String(g) && styles.quickButtonTextActive]}>
                  {g}{t('units.g')}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          
          <View style={styles.modalNutrition}>
            <View style={styles.modalNutritionItem}>
              <Text style={styles.modalNutritionValue}>{formatNutrition((food.calories || 0) * multiplier, true)}</Text>
              <Text style={styles.modalNutritionLabel}>{t('diary.kcal')}</Text>
            </View>
            <View style={styles.modalNutritionItem}>
              <Text style={styles.modalNutritionValue}>{formatNutrition((food.protein || 0) * multiplier)}</Text>
              <Text style={styles.modalNutritionLabel}>{t('diary.protein')}</Text>
            </View>
            <View style={styles.modalNutritionItem}>
              <Text style={styles.modalNutritionValue}>{formatNutrition((food.carbs || 0) * multiplier)}</Text>
              <Text style={styles.modalNutritionLabel}>{t('diary.carbs')}</Text>
            </View>
            <View style={styles.modalNutritionItem}>
              <Text style={styles.modalNutritionValue}>{formatNutrition((food.fats || 0) * multiplier)}</Text>
              <Text style={styles.modalNutritionLabel}>{t('diary.fats')}</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
            <Ionicons name="checkmark" size={22} color={Colors.background} />
            <Text style={styles.addButtonText}>{t('common.add')}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

export const AddMealScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { mealType } = route.params || { mealType: 'BREAKFAST' };
  
  const { 
    searchResults, 
    recentFoods, 
    isLoading, 
    search, 
    fetchRecent,
    clearSearch,
  } = useFoodsStore();
  
  const { addFoodEntry } = useDiaryStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [showGramsModal, setShowGramsModal] = useState(false);

  const mealTypeLabels = {
    BREAKFAST: t('diary.breakfast').toLowerCase(),
    LUNCH: t('diary.lunch').toLowerCase(),
    DINNER: t('diary.dinner').toLowerCase(),
    SNACK: t('diary.snacks').toLowerCase(),
  };

  useEffect(() => {
    fetchRecent();
    return () => clearSearch();
  }, []);

  // Refresh recent foods when screen gains focus (e.g. after creating a food)
  useFocusEffect(
    useCallback(() => {
      fetchRecent();
    }, [])
  );

  // Debounced search
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const timer = setTimeout(() => {
        search(searchQuery);
      }, 300);
      return () => clearTimeout(timer);
    } else if (searchQuery.length === 0) {
      clearSearch();
    }
  }, [searchQuery]);

  // Navigate to food detail page
  const handleSelectFood = (food) => {
    navigation.navigate('FoodDetail', { food, mealType });
  };

  // Open modal for quick add
  const handleQuickAdd = (food) => {
    setSelectedFood(food);
    setShowGramsModal(true);
  };

  // Add food with specified grams
  const handleAddFood = async (food, grams) => {
    setShowGramsModal(false);
    navigation.goBack();
    addFoodEntry({
      foodId: food.id,
      mealType: mealType,
      amount: grams,
    });
  };

  const displayFoods = searchQuery.length >= 2 ? searchResults : recentFoods;

  const renderFoodItem = ({ item }) => (
    <TouchableOpacity style={styles.foodItem} onPress={() => handleSelectFood(item)}>
      <View style={styles.foodInfo}>
        <Text style={styles.foodName}>{item.name}</Text>
        <Text style={styles.foodDetails}>
          {t('diary.nutritionPer100g')} · {formatNutrition(item.calories, true)} {t('diary.kcal')} · {t('diary.protein').charAt(0)}:{formatNutrition(item.protein)} {t('diary.carbs').charAt(0)}:{formatNutrition(item.carbs)} {t('diary.fats').charAt(0)}:{formatNutrition(item.fats)}
        </Text>
      </View>
      <TouchableOpacity 
        style={styles.quickAddButton}
        onPress={() => handleQuickAdd(item)}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="add-circle" size={28} color={Colors.primary} />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('food.addTo')} {mealTypeLabels[mealType] || t('diary.food')}</Text>
        <View style={{ width: 42 }} />
      </View>

      <View style={styles.content}>
        <View style={styles.searchRow}>
          <View style={styles.searchBox}>
            <Ionicons name="search" size={20} color={Colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder={t('food.searchPlaceholder')}
              placeholderTextColor={Colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={Colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity 
            style={styles.scanButton} 
            onPress={() => navigation.navigate('BarcodeScanner')}
          >
            <Ionicons name="barcode-outline" size={24} color={Colors.white} />
          </TouchableOpacity>
        </View>

        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>
              {searchQuery.length >= 2 ? t('food.searchResults') : t('food.recentFoods')}
            </Text>
          </View>
          <View style={styles.divider} />

          {isLoading ? (
            <ActivityIndicator size="large" color={Colors.primary} style={{ marginTop: 20 }} />
          ) : displayFoods.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={48} color={Colors.textSecondary} style={{ marginBottom: 12 }} />
              <Text style={styles.emptyText}>
                {searchQuery.length >= 2 ? t('food.nothingFound') : t('food.noRecentFoods')}
              </Text>
              {searchQuery.length >= 2 && (
                <Text style={styles.emptySubtext}>
                  {t('food.createFoodHint')}
                </Text>
              )}
              <TouchableOpacity
                style={styles.createFoodButton}
                onPress={() => navigation.navigate('CreateFood', { mealType })}
              >
                <Ionicons name="add-circle-outline" size={20} color={Colors.background} />
                <Text style={styles.createFoodButtonText}>{t('food.createOwnFood')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <FlatList
                data={displayFoods}
                renderItem={renderFoodItem}
                keyExtractor={(item) => item.id}
                ItemSeparatorComponent={() => <View style={styles.divider} />}
                showsVerticalScrollIndicator={false}
                ListFooterComponent={() => (
                  <View style={styles.listFooter}>
                    <View style={styles.divider} />
                    <TouchableOpacity
                      style={styles.createFoodInlineButton}
                      onPress={() => navigation.navigate('CreateFood', { mealType })}
                    >
                      <Ionicons name="add-circle-outline" size={18} color={Colors.primary} />
                      <Text style={styles.createFoodInlineText}>{t('food.createOwnFood')}</Text>
                    </TouchableOpacity>
                  </View>
                )}
              />
            </>
          )}
        </View>
      </View>

      {/* Grams input modal */}
      <AddGramsModal
        visible={showGramsModal}
        food={selectedFood}
        onClose={() => setShowGramsModal(false)}
        onAdd={handleAddFood}
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
  title: {
    fontSize: 18,
    fontWeight: '500',
    color: Colors.white,
    textTransform: 'uppercase',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 20,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    borderRadius: 10,
    height: 45,
    paddingHorizontal: 15,
    gap: 10,
  },
  scanButton: {
    width: 45,
    height: 45,
    borderRadius: 10,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.white,
  },
  searchPlaceholder: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  recentSection: {
    flex: 1,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  recentTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.white,
  },
  divider: {
    height: 0.5,
    backgroundColor: '#A8A8A8',
    marginVertical: 5,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 40,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    opacity: 0.7,
  },
  createFoodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: Colors.primary,
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    marginTop: 20,
    width: '100%',
  },
  createFoodButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.background,
  },
  createFoodInlineButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
  },
  createFoodInlineText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.primary,
  },
  listFooter: {
    paddingBottom: 20,
  },
  foodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.white,
    marginBottom: 3,
  },
  foodDetails: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  quickAddButton: {
    padding: 5,
  },
  
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalContainer: {
    backgroundColor: Colors.card,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 360,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
  },
  modalFoodName: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.white,
    marginBottom: 4,
  },
  modalFoodBrand: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
  },
  modalInputContainer: {
    marginTop: 16,
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  modalInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.background,
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 50,
  },
  modalInput: {
    flex: 1,
    fontSize: 24,
    fontWeight: '600',
    color: Colors.white,
    textAlign: 'center',
  },
  modalUnit: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginLeft: 8,
  },
  quickButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    gap: 8,
  },
  quickButton: {
    flex: 1,
    paddingVertical: 10,
    backgroundColor: Colors.background,
    borderRadius: 8,
    alignItems: 'center',
  },
  quickButtonActive: {
    backgroundColor: Colors.primary,
  },
  quickButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  quickButtonTextActive: {
    color: Colors.background,
  },
  modalNutrition: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    marginBottom: 20,
  },
  modalNutritionItem: {
    alignItems: 'center',
  },
  modalNutritionValue: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 4,
  },
  modalNutritionLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: Colors.primary,
    borderRadius: 12,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.background,
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
});
