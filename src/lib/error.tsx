import { Component } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { AlertCircle, RefreshCw, Home } from 'lucide-react-native';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  onRetry?: () => void;
  onHomePress?: () => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  fadeAnim: Animated.Value;
  scaleAnim: Animated.Value;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      fadeAnim: new Animated.Value(0),
      scaleAnim: new Animated.Value(0.95),
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.setState({
      error: error,
      errorInfo: errorInfo,
    });
  }

  componentDidUpdate(prevProps: ErrorBoundaryProps, prevState: ErrorBoundaryState): void {
    if (!prevState.hasError && this.state.hasError) {
      this.startAnimation();
    }
  }

  startAnimation = (): void => {
    Animated.parallel([
      Animated.timing(this.state.fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(this.state.scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  };

  handleRetry = (): void => {
    const { onRetry } = this.props;
    if (onRetry) {
      onRetry();
    }
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleHomePress = (): void => {
    const { onHomePress } = this.props;
    if (onHomePress) {
      onHomePress();
    }
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      return (
        <SafeAreaView style={styles.container}>
          <ScrollView contentContainerStyle={styles.scrollContainer}>
            <Animated.View
              style={[
                styles.content,
                {
                  opacity: this.state.fadeAnim,
                  transform: [{ scale: this.state.scaleAnim }],
                },
              ]}
            >
              <View style={styles.iconContainer}>
                <View style={styles.iconBackground}>
                  <AlertCircle size={48} color="#EF4444" />
                </View>
              </View>

              <View style={styles.messageContainer}>
                <Text style={styles.title}>Oops! Something went wrong</Text>
                <Text style={styles.subtitle}>
                  We apologize for the inconvenience. An unexpected error has occurred.
                </Text>
              </View>

              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>{this.state.error?.toString()}</Text>
                {/* <Text style={styles.stackText}>{this.state.errorInfo?.componentStack}</Text> */}
              </View>

              <View style={styles.buttonContainer}>
                <TouchableOpacity
                  style={[styles.button, styles.retryButton]}
                  onPress={this.handleRetry}
                >
                  <RefreshCw size={20} color="#374151" />
                  <Text style={styles.retryButtonText}>Try Again</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, styles.homeButton]}
                  onPress={this.handleHomePress}
                >
                  <Home size={20} color="#FFFFFF" />
                  <Text style={styles.homeButtonText}>Back to Home</Text>
                </TouchableOpacity>
              </View>
            </Animated.View>
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
    backgroundColor: '#F9FAFB',
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  content: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxWidth: 400,
    width: '100%',
    alignSelf: 'center',
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  iconBackground: {
    backgroundColor: '#FEE2E2',
    padding: 16,
    borderRadius: 50,
  },
  messageContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  errorContainer: {
    backgroundColor: '#F3F4F6',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  errorText: {
    fontSize: 14,
    color: '#EF4444',
    fontFamily: 'monospace',
  },
  stackText: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'monospace',
    marginTop: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  retryButton: {
    backgroundColor: '#F3F4F6',
  },
  homeButton: {
    backgroundColor: '#EF4444',
  },
  retryButtonText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
  },
  homeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ErrorBoundary;
