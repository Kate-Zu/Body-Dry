import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ToastAndroid,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTranslation } from '../i18n';
import { useFoodsStore } from '../store/foodsStore';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

export const CreateFoodScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { createFood } = useFoodsStore();
  
  // Barcode from scanner if coming from there
  const barcodeFromScanner = route.params?.barcode || '';
  const mealType = route.params?.mealType;
  
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    barcode: barcodeFromScanner,
    calories: '',
    protein: '',
    carbs: '',
    fats: '',
    fiber: '',
    servingSize: '100',
    servingUnit: 'г',
  });
  
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = t('createFood.nameRequired');
    }
    
    if (!formData.calories || isNaN(Number(formData.calories)) || Number(formData.calories) < 0) {
      newErrors.calories = t('createFood.caloriesRequired');
    }
    
    if (formData.protein && (isNaN(Number(formData.protein)) || Number(formData.protein) < 0)) {
      newErrors.protein = t('createFood.invalidValue');
    }
    
    if (formData.carbs && (isNaN(Number(formData.carbs)) || Number(formData.carbs) < 0)) {
      newErrors.carbs = t('createFood.invalidValue');
    }
    
    if (formData.fats && (isNaN(Number(formData.fats)) || Number(formData.fats) < 0)) {
      newErrors.fats = t('createFood.invalidValue');
    }
    
    if (!formData.servingSize || isNaN(Number(formData.servingSize)) || Number(formData.servingSize) <= 0) {
      newErrors.servingSize = t('createFood.servingSizeRequired');
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm() || isSaving) {
      return;
    }
    
    setIsSaving(true);
    try {
      const foodData = {
        name: formData.name.trim(),
        brand: formData.brand.trim() || undefined,
        barcode: formData.barcode.trim() || undefined,
        calories: Number(formData.calories),
        protein: Number(formData.protein) || 0,
        carbs: Number(formData.carbs) || 0,
        fats: Number(formData.fats) || 0,
        fiber: formData.fiber ? Number(formData.fiber) : undefined,
        servingSize: Number(formData.servingSize),
        servingUnit: formData.servingUnit || 'г',
      };
      
      const newFood = await createFood(foodData);
      
      if (newFood) {
        navigation.goBack();
      } else {
        Alert.alert(t('common.error'), t('createFood.errorMessage'));
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('createFood.errorMessage'));
    } finally {
      setIsSaving(false);
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const renderInput = (field, label, placeholder, keyboardType = 'default', required = false) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>
        {label}
        {required && <Text style={styles.required}> *</Text>}
      </Text>
      <TextInput
        style={[styles.input, errors[field] && styles.inputError]}
        value={formData[field]}
        onChangeText={(value) => updateField(field, value)}
        placeholder={placeholder}
        placeholderTextColor={Colors.textSecondary}
        keyboardType={keyboardType}
      />
      {errors[field] && <Text style={styles.errorText}>{errors[field]}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.white} />
        </TouchableOpacity>
        <Text style={styles.headerText}>{t('createFood.title')}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <KeyboardAvoidingView 
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Info */}
          <View style={styles.headerInfo}>
            <Ionicons name="nutrition-outline" size={40} color={Colors.primary} />
            <Text style={styles.headerTitle}>{t('createFood.title')}</Text>
            <Text style={styles.headerSubtitle}>{t('createFood.subtitle')}</Text>
          </View>

          {/* Basic Info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('createFood.basicInfo')}</Text>
            {renderInput('name', t('createFood.name'), t('createFood.namePlaceholder'), 'default', true)}
            {renderInput('brand', t('createFood.brand'), t('createFood.brandPlaceholder'))}
            {renderInput('barcode', t('createFood.barcode'), t('createFood.barcodePlaceholder'), 'numeric')}
          </View>

          {/* Nutrition Info - per 100g */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('createFood.nutritionPer100g')}</Text>
            
            <View style={styles.row}>
              <View style={styles.halfInput}>
                {renderInput('calories', t('createFood.calories'), '0', 'numeric', true)}
              </View>
              <View style={styles.halfInput}>
                {renderInput('protein', t('createFood.protein'), '0', 'decimal-pad')}
              </View>
            </View>
            
            <View style={styles.row}>
              <View style={styles.halfInput}>
                {renderInput('carbs', t('createFood.carbs'), '0', 'decimal-pad')}
              </View>
              <View style={styles.halfInput}>
                {renderInput('fats', t('createFood.fats'), '0', 'decimal-pad')}
              </View>
            </View>
            
            <View style={styles.row}>
              <View style={styles.halfInput}>
                {renderInput('fiber', t('createFood.fiber'), '0', 'decimal-pad')}
              </View>
              <View style={styles.halfInput} />
            </View>
          </View>

          {/* Serving Size */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('createFood.servingInfo')}</Text>
            <View style={styles.row}>
              <View style={styles.halfInput}>
                {renderInput('servingSize', t('createFood.servingSize'), '100', 'numeric', true)}
              </View>
              <View style={styles.halfInput}>
                <Text style={styles.label}>{t('createFood.servingUnit')}</Text>
                <View style={styles.unitButtons}>
                  {['г', 'мл', 'шт'].map(unit => (
                    <TouchableOpacity
                      key={unit}
                      style={[
                        styles.unitButton,
                        formData.servingUnit === unit && styles.unitButtonActive,
                      ]}
                      onPress={() => updateField('servingUnit', unit)}
                    >
                      <Text style={[
                        styles.unitButtonText,
                        formData.servingUnit === unit && styles.unitButtonTextActive,
                      ]}>
                        {unit}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>

          {/* Tip */}
          <View style={styles.tipContainer}>
            <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
            <Text style={styles.tipText}>{t('createFood.tip')}</Text>
          </View>
        </ScrollView>

        {/* Save Button */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
            onPress={handleSave}
            disabled={isSaving}
          >
            <Text style={styles.saveButtonText}>
              {isSaving ? t('common.loading') : t('common.save')}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
  },
  backButton: {
    padding: 8,
  },
  headerText: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.white,
  },
  headerSpacer: {
    width: 40,
  },
  flex: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  headerInfo: {
    alignItems: 'center',
    marginBottom: 24,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.white,
    marginTop: 12,
  },
  headerSubtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  section: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white,
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  required: {
    color: Colors.error,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    color: Colors.white,
  },
  inputError: {
    borderColor: Colors.error,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    marginHorizontal: -6,
  },
  halfInput: {
    flex: 1,
    paddingHorizontal: 6,
  },
  unitButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  unitButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  unitButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  unitButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  unitButtonTextActive: {
    color: Colors.background,
  },
  tipContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: Colors.card,
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
  },
  tipText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.background,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: 'rgba(187, 224, 255, 0.3)',
  },
  saveButtonText: {
    color: Colors.background,
    fontSize: 16,
    fontWeight: '600',
  },
});
