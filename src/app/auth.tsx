import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  Platform, 
  ScrollView, 
  Dimensions, 
  ActivityIndicator, 
  KeyboardAvoidingView,
  TextInputProps
} from 'react-native';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  MaterialIcons,
  FontAwesome5,
  Ionicons,
  MaterialCommunityIcons,
  Feather 
} from '@expo/vector-icons';
import { handleGoogleSignIn, sendTokenToServer } from 'src/utils/auth';
import { Reactive } from '@legendapp/state/react';

// Types
interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  name?: string;
  confirmPassword?: string;
}

interface StyledInputProps extends TextInputProps {
  icon: React.ReactNode;
  error?: string;
  showToggle?: boolean;
  onToggle?: () => void;
  isPassword?: boolean;
}

interface GradientButtonProps {
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

interface AuthCardProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const GRADIENTS = {
  background: ['#1E293B', '#334155', '#475569'],
  header: ['#1E40AF', '#3B82F6', '#60A5FA'],
  button: ['#2563EB', '#3B82F6'],
} as const;

// Reusable Components
const StyledInput: React.FC<StyledInputProps> = ({
  icon,
  error,
  showToggle,
  onToggle,
  isPassword,
  ...props
}) => (
  <View className="space-y-1.5 mt-2 mb-2">
    <View className="relative">
      <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
        {icon}
      </View>
      <Reactive.TextInput
        $className={`w-full bg-gray-50/90 rounded-xl py-4 px-12 text-gray-800 text-base 
          border border-gray-200/80 shadow-sm shadow-gray-200/50",
          ${error && "border-red-400"} placeholder:text-gray-400
        `}
        placeholderTextColor="#94A3B8"
        autoCapitalize="none"
        {...props}
      />
      {showToggle && (
        <TouchableOpacity 
          onPress={onToggle}
          className="absolute right-4 top-1/2 -translate-y-1/2"
          activeOpacity={0.7}
        >
          <Ionicons 
            name={isPassword ? "eye" : "eye-off"} 
            size={20} 
            color="#64748B"
          />
        </TouchableOpacity>
      )}
    </View>
    {error && (
      <Text className="text-red-500 text-sm ml-4 font-medium">
        {error}
      </Text>
    )}
  </View>
);

const GradientButton: React.FC<GradientButtonProps> = ({
  onPress,
  isLoading,
  disabled,
  children,
  className
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled || isLoading}
    className={`w-full ${className}`}
    activeOpacity={0.8}
  >
    <LinearGradient
      colors={GRADIENTS.button}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{
        width: '100%',
        borderRadius: 20,
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: 'rgba(0, 0, 0, 0.5)',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.5,
        shadowRadius: 1,
        elevation: 2,
        ...(disabled || isLoading) && { opacity: 0.7 }
      }}
    >
      {isLoading ? (
        <ActivityIndicator color="white" />
      ) : children}
    </LinearGradient>
  </TouchableOpacity>
);

const AuthCard: React.FC<AuthCardProps> = ({ children, title, subtitle }) => (
  <View className="w-full max-w-sm bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
    <LinearGradient
      colors={GRADIENTS.header}
      className="w-full px-8 pt-12 pb-8 items-center"
    >
      <View className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl items-center justify-center mb-4 shadow-xl shadow-blue-900/30">
        <MaterialCommunityIcons name="account-circle-outline" size={48} color="white" />
      </View>
      <Text className="text-3xl font-bold text-white text-center">
        {title}
      </Text>
      <Text className="text-white/80 mt-2 text-center font-medium">
        {subtitle}
      </Text>
    </LinearGradient>
    {children}
  </View>
);

// Main Component
const AuthScreen: React.FC = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [formData, setFormData] = useState<FormData>({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = () => {
    const newErrors: FormErrors = {};
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    // Additional sign-up validations
    if (!isSignIn) {
      if (!formData.name) {
        newErrors.name = 'Name is required';
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setIsLoading(true);
    try {
      console.log(formData)
      const token = 'simulated_token';
      await sendTokenToServer(token);
      Alert.alert(
        'Success!', 
        isSignIn ? 'Welcome back!' : 'Your account has been created successfully!'
      );
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ email: '', password: '', confirmPassword: '', name: '' });
    setErrors({});
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView 
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <LinearGradient
          colors={GRADIENTS.background}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="flex-1"
        >
          <View className="flex-1 justify-center items-center px-2 py-8">
            <AuthCard
              title={isSignIn ? 'Welcome Back' : 'Create Account'}
              subtitle={
                isSignIn 
                  ? "We've missed you! Please sign in to continue" 
                  : "Join us! Create your account to get started"
              }
            >
              <View className="p-8 space-y-4">
                {!isSignIn && (
                  <StyledInput
                    icon={<Feather name="user" size={20} color="#64748B" />}
                    placeholder="Full Name"
                    value={formData.name}
                    onChangeText={(text) => setFormData({...formData, name: text})}
                    error={errors.name}
                  />
                )}

                <StyledInput
                  icon={<MaterialIcons name="email" size={20} color="#64748B" />}
                  placeholder="Email"
                  value={formData.email}
                  onChangeText={(text) => setFormData({...formData, email: text})}
                  error={errors.email}
                  keyboardType="email-address"
                />

                <StyledInput
                  icon={<FontAwesome5 name="lock" size={20} color="#64748B" />}
                  placeholder="Password"
                  value={formData.password}
                  onChangeText={(text) => setFormData({...formData, password: text})}
                  secureTextEntry={!showPassword}
                  showToggle
                  onToggle={() => setShowPassword(!showPassword)}
                  error={errors.password}
                  isPassword={showPassword}
                />

                {!isSignIn && (
                  <StyledInput
                    icon={<FontAwesome5 name="lock" size={20} color="#64748B" />}
                    placeholder="Confirm Password"
                    value={formData.confirmPassword}
                    onChangeText={(text) => setFormData({...formData, confirmPassword: text})}
                    secureTextEntry={!showConfirmPassword}
                    showToggle
                    onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
                    error={errors.confirmPassword}
                    isPassword={showConfirmPassword}
                  />
                )}

                {isSignIn && (
                  <TouchableOpacity
                    className="self-end"
                    onPress={() => Alert.alert('Reset Password', 'Password reset functionality will be available soon!')}
                    activeOpacity={0.7}
                  >
                    <Text className="text-blue-600 text-sm font-semibold">
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>
                )}

                <GradientButton
                  onPress={handleSubmit}
                  isLoading={isLoading}
                  disabled={isLoading}
                  className="mt-4"
                >
                  <Text className="text-white font-semibold text-center mr-2">
                    {isSignIn ? 'Sign In' : 'Create Account'}
                  </Text>
                  <MaterialIcons name="arrow-forward-ios" size={18} color="white" />
                </GradientButton>

                <View className="flex-row items-center my-6">
                  <View className="flex-1 h-[1px] bg-gray-300" />
                  <Text className="mx-4 text-gray-500 font-medium">
                    or continue with
                  </Text>
                  <View className="flex-1 h-[1px] bg-gray-300" />
                </View>

                <View className="items-center">
                  <GoogleSigninButton
                    size={GoogleSigninButton.Size.Wide}
                    color={GoogleSigninButton.Color.Dark}
                    onPress={handleGoogleSignIn}
                    disabled={isLoading}
                    style={{ width: '100%', height: 48 }}
                  />
                </View>
              </View>
            </AuthCard>

            <View className="mt-8 flex-row justify-center items-center">
              <Text className="text-white/90 font-medium">
                {isSignIn ? "Don't have an account? " : "Already have an account? "}
              </Text>
              <TouchableOpacity 
                onPress={() => {
                  setIsSignIn(!isSignIn);
                  resetForm();
                }}
                className="flex-row items-center"
                activeOpacity={0.7}
              >
                <Text className="text-white font-semibold mr-1">
                  {isSignIn ? 'Create Account' : 'Sign In'}
                </Text>
                <MaterialIcons name="arrow-forward-ios" size={14} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default AuthScreen;