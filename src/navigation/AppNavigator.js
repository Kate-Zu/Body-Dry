import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useAuthStore, useNetworkStore } from '../store';
import { AuthNavigator } from './AuthNavigator';
import { MainNavigator } from './MainNavigator';
import { OnboardingNavigator } from './OnboardingNavigator';
import { NoInternetScreen } from '../screens/NoInternetScreen';
import { Colors } from '../constants/colors';

export const AppNavigator = () => {
  const { isAuthenticated, isLoading, checkAuth, user } = useAuthStore();
  const isNewUser = useAuthStore((s) => s.isNewUser);
  const { isConnected, isInternetReachable, initialize, checkConnection } = useNetworkStore();

  useEffect(() => {
    // Initialize network monitoring
    const unsubscribe = initialize();
    
    // Check auth
    checkAuth();
    
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Show no internet screen if definitely offline
  // isInternetReachable can be null (unknown), so we only show offline screen when it's explicitly false
  const isOffline = isConnected === false || isInternetReachable === false;

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  // Show offline screen only when definitely no internet
  if (isOffline && !isLoading) {
    return <NoInternetScreen onRetry={checkConnection} />;
  }

  // Determine which navigator to show
  const getNavigator = () => {
    if (!isAuthenticated) {
      return <AuthNavigator />;
    }
    
    // Show onboarding only for new registrations without profile
    if (isNewUser && !user?.profile) {
      return <OnboardingNavigator />;
    }
    
    return <MainNavigator />;
  };

  return (
    <NavigationContainer>
      {getNavigator()}
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});
