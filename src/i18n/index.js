import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uk from './locales/uk.json';
import en from './locales/en.json';

const LANGUAGE_KEY = '@app_language';

const translations = {
  uk,
  en,
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState('uk');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (savedLanguage && translations[savedLanguage]) {
        setLanguageState(savedLanguage);
      }
    } catch (error) {
      console.error('Error loading language:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setLanguage = async (lang) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, lang);
      setLanguageState(lang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const t = useCallback((key, params) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        // Fallback to Ukrainian if key not found
        let fallback = translations['uk'];
        for (const fk of keys) {
          if (fallback && typeof fallback === 'object' && fk in fallback) {
            fallback = fallback[fk];
          } else {
            return key; // Return key if not found in any language
          }
        }
        value = fallback;
        break;
      }
    }
    
    let result = value || key;
    // Support {{variable}} interpolation
    if (params && typeof result === 'string') {
      Object.keys(params).forEach(p => {
        result = result.replace(new RegExp(`\\{\\{${p}\\}\\}`, 'g'), String(params[p]));
      });
    }
    return result;
  }, [language]);

  const value = {
    language,
    setLanguage,
    t,
    isLoading,
    availableLanguages: [
      { code: 'uk', name: 'Українська', flag: '🇺🇦' },
      { code: 'en', name: 'English', flag: '🇬🇧' },
    ],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return {
    language: context.language,
    setLanguage: context.setLanguage,
    availableLanguages: context.availableLanguages,
  };
};

export default LanguageContext;
