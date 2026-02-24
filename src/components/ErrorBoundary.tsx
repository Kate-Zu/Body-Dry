import React, { Component, ErrorInfo, ReactNode } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/colors';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

const { width } = Dimensions.get('window');

/**
 * Error Boundary component for catching JavaScript errors in child components
 * and displaying a fallback UI instead of crashing the entire app
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so next render shows fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console in development
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Store error info for display
    this.setState({ errorInfo });

    // Call optional error callback (for analytics/logging services)
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Here you could send error to a logging service like Sentry
    // Sentry.captureException(error, { extra: errorInfo });
  }

  handleReload = (): void => {
    // Reset error state to attempt re-render
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // If custom fallback is provided, use it
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.content}>
              {/* Error Icon */}
              <View style={styles.iconContainer}>
                <Ionicons name="warning-outline" size={80} color={Colors.error || '#FF6B6B'} />
              </View>

              {/* Error Title */}
              <Text style={styles.title}>Упс! Щось пішло не так</Text>
              
              {/* Error Description */}
              <Text style={styles.description}>
                Виникла несподівана помилка. Не хвилюйтесь, ваші дані в безпеці. 
                Спробуйте перезавантажити екран.
              </Text>

              {/* Error Details (dev only) */}
              {__DEV__ && this.state.error && (
                <View style={styles.errorDetails}>
                  <Text style={styles.errorTitle}>Деталі помилки:</Text>
                  <Text style={styles.errorMessage}>
                    {this.state.error.toString()}
                  </Text>
                  {this.state.errorInfo?.componentStack && (
                    <Text style={styles.errorStack}>
                      {this.state.errorInfo.componentStack.slice(0, 500)}...
                    </Text>
                  )}
                </View>
              )}

              {/* Reload Button */}
              <TouchableOpacity style={styles.reloadButton} onPress={this.handleReload}>
                <Ionicons name="refresh-outline" size={20} color={Colors.white} />
                <Text style={styles.reloadButtonText}>Спробувати знову</Text>
              </TouchableOpacity>

              {/* Support Link */}
              <Text style={styles.supportText}>
                Якщо проблема повторюється, зверніться в підтримку
              </Text>
            </View>
          </ScrollView>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background || '#060603',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.white || '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    color: Colors.textSecondary || 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
    paddingHorizontal: 16,
  },
  errorDetails: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.error || '#FF6B6B',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 12,
    color: Colors.white || '#FFFFFF',
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  errorStack: {
    fontSize: 10,
    color: Colors.textSecondary || 'rgba(255, 255, 255, 0.5)',
    fontFamily: 'monospace',
  },
  reloadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary || '#BBE0FF',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 12,
    marginBottom: 16,
    gap: 8,
  },
  reloadButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.white || '#FFFFFF',
  },
  supportText: {
    fontSize: 14,
    color: Colors.textSecondary || 'rgba(255, 255, 255, 0.5)',
    textAlign: 'center',
  },
});

export default ErrorBoundary;
