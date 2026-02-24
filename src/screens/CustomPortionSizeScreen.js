import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';
import { Button } from '../components';
import { useTranslation } from '../i18n';

export const CustomPortionSizeScreen = ({ navigation, route }) => {
  const { t } = useTranslation();
  const { currentSize = 100, onSelect } = route.params || {};
  const [size, setSize] = useState(String(currentSize));
  const [error, setError] = useState('');

  const handleSave = () => {
    const numericSize = parseInt(size, 10);
    
    if (!size || isNaN(numericSize)) {
      setError(t('validation.enterNumber'));
      return;
    }
    
    if (numericSize < 1) {
      setError(t('validation.minOneGram'));
      return;
    }
    
    if (numericSize > 5000) {
      setError(t('validation.maxGrams'));
      return;
    }

    // Call the callback if provided
    if (onSelect) {
      onSelect(numericSize);
    }
    
    navigation.goBack();
  };

  const handleChangeText = (text) => {
    // Only allow numbers
    const numericText = text.replace(/[^0-9]/g, '');
    setSize(numericText);
    setError('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={Colors.white} />
          </TouchableOpacity>
          <Text style={styles.title}>РОЗМІР ПОРЦІЇ</Text>
          <View style={{ width: 42 }} />
        </View>

        <View style={styles.content}>
          <Text style={styles.description}>
            Введіть розмір порції в грамах
          </Text>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, error && styles.inputError]}
              value={size}
              onChangeText={handleChangeText}
              keyboardType="number-pad"
              placeholder="100"
              placeholderTextColor="rgba(255,255,255,0.3)"
              autoFocus
              maxLength={4}
            />
            <Text style={styles.unit}>грам</Text>
          </View>

          {error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : null}

          {/* Quick presets */}
          <View style={styles.presets}>
            <Text style={styles.presetsTitle}>Швидкий вибір:</Text>
            <View style={styles.presetsRow}>
              {[25, 50, 75, 100, 150, 200, 250, 500].map((preset) => (
                <TouchableOpacity
                  key={preset}
                  style={[
                    styles.presetButton,
                    size === String(preset) && styles.presetButtonActive,
                  ]}
                  onPress={() => {
                    setSize(String(preset));
                    setError('');
                  }}
                >
                  <Text style={[
                    styles.presetText,
                    size === String(preset) && styles.presetTextActive,
                  ]}>
                    {preset}г
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Button title="Зберегти" onPress={handleSave} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark,
  },
  keyboardView: {
    flex: 1,
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
    fontSize: 18,
    fontWeight: '500',
    color: Colors.white,
    textTransform: 'uppercase',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  description: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 15,
    marginBottom: 15,
  },
  input: {
    fontSize: 48,
    fontWeight: '600',
    color: Colors.white,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    paddingHorizontal: 25,
    paddingVertical: 15,
    textAlign: 'center',
    minWidth: 150,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: '#E53935',
  },
  unit: {
    fontSize: 24,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
  },
  errorText: {
    color: '#E53935',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
  },
  presets: {
    marginTop: 40,
  },
  presetsTitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 15,
    textAlign: 'center',
  },
  presetsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  presetButton: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  presetButtonActive: {
    backgroundColor: 'rgba(187,224,255,0.2)',
    borderColor: '#BBE0FF',
  },
  presetText: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.8)',
  },
  presetTextActive: {
    color: '#BBE0FF',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
});
