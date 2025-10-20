'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import en from '@/locales/en.json';
import ru from '@/locales/ru.json';
import uz from '@/locales/uz.json';

type Locale = 'en' | 'ru' | 'uz';

const translations = { en, ru, uz };

interface LanguageContextType {
  language: Locale;
  setLanguage: (language: Locale) => void;
  t: (key: string, options?: { [key: string]: string | number }) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Locale>('uz');

  useEffect(() => {
    const storedLang = localStorage.getItem('language') as Locale;
    if (storedLang && ['en', 'ru', 'uz'].includes(storedLang)) {
      setLanguageState(storedLang);
    }
  }, []);

  const setLanguage = (lang: Locale) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = useCallback((key: string, options?: { [key: string]: string | number }): string => {
    const keys = key.split('.');
    let result: any = translations[language];
    
    // Find the string in the current language
    for (const k of keys) {
      result = result?.[k];
      if (result === undefined) {
        // Fallback to English if not found
        let fallbackResult: any = translations['en'];
        for (const fk of keys) {
            fallbackResult = fallbackResult?.[fk];
        }
        result = fallbackResult;
        break; // Exit loop once fallback is found
      }
    }
    
    let finalString = String(result || key);

    // Replace placeholders
    if (options) {
        Object.keys(options).forEach(optKey => {
            const regex = new RegExp(`{${optKey}}`, 'g');
            finalString = finalString.replace(regex, String(options[optKey]));
        });
    }

    return finalString;
  }, [language]);
  

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
