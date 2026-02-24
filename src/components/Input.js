import React, { useState } from 'react';
import { View, TextInput, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

export const Input = ({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
  error,
  style,
  editable = true,
  variant = 'light', // 'light' или 'dark'
  autoComplete: autoCompleteProp,
  textContentType: textContentTypeProp,
}) => {
  const [isSecure, setIsSecure] = useState(secureTextEntry);
  const [isFocused, setIsFocused] = useState(false);
  
  const isDark = variant === 'dark';

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={[styles.label, isDark && styles.labelDark]}>{label}</Text>}
      <View style={styles.inputWrapper}>
        <TextInput
          style={[
            styles.input,
            isDark && styles.inputDark,
            isFocused && (isDark ? styles.inputFocusedDark : styles.inputFocused),
            error && styles.inputError,
            !editable && styles.inputDisabled,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={isDark ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)"}
          secureTextEntry={isSecure}
          keyboardType={keyboardType}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          editable={editable}
          autoComplete={autoCompleteProp || "off"}
          textContentType={textContentTypeProp || (secureTextEntry ? "oneTimeCode" : "none")}
          autoCorrect={false}
          autoCapitalize="none"
          spellCheck={false}
          importantForAutofill={autoCompleteProp ? "yes" : "no"}
        />
        {secureTextEntry && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setIsSecure(!isSecure)}
          >
            <Ionicons
              name={isSecure ? 'eye-off-outline' : 'eye-outline'}
              size={20}
              color={isDark ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.5)"}
            />
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 15,
  },
  label: {
    fontSize: 12,
    color: Colors.dark,
    marginBottom: 6,
  },
  labelDark: {
    color: Colors.white,
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.inputBorder,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 18,
    fontSize: 14,
    color: Colors.dark,
  },
  inputDark: {
    backgroundColor: Colors.card,
    borderColor: Colors.cardBorder,
    color: Colors.white,
  },
  inputFocused: {
    borderColor: Colors.dark,
  },
  inputFocusedDark: {
    borderColor: Colors.primary,
  },
  inputError: {
    borderColor: Colors.error,
  },
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#999',
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  errorText: {
    fontSize: 12,
    color: Colors.error,
    marginTop: 4,
  },
});
