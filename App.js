import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { AppNavigator } from './src/navigation';
import { LanguageProvider } from './src/i18n';
import { ErrorBoundary } from './src/components';

// Global error handler for unhandled promise rejections
const handleGlobalError = (error, errorInfo) => {
  // Log to console in development
  console.error('Global Error:', error);
  
  // TODO: Send to error tracking service (Sentry, Crashlytics, etc.)
  // Example: Sentry.captureException(error, { extra: errorInfo });
};

export default function App() {
  return (
    <ErrorBoundary onError={handleGlobalError}>
      <LanguageProvider>
        <StatusBar style="light" />
        <AppNavigator />
      </LanguageProvider>
    </ErrorBoundary>
  );
}
