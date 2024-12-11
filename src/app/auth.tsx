import { cloneElement, useRef, useCallback } from 'react';
import { 
  View, Text, TouchableOpacity, Alert, Platform, ScrollView,  
  ActivityIndicator, KeyboardAvoidingView, useColorScheme,
} from 'react-native';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, ChevronRight, UserCircle } from 'lucide-react-native';
import { observer, Memo, Reactive, useObservable } from '@legendapp/state/react';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { LinearGradient } from 'expo-linear-gradient';
import { authClient, handleGoogleSignIn } from 'src/utils/auth';
import { FormData, THEME } from 'types';
import { Button } from '@/components';

const useAuthState = () => {
  const state = useObservable({
    formData: {
      email: '',
      password: '',
      confirmPassword: '',
      name: ''
    },
    isSignIn: true,
    isLoading: false,
    showPassword: false,
    showConfirmPassword: false,
    errors: {}
  });

  return state;
};

// Form Validation
const validateForm = (formData: FormData, isSignIn: boolean) => {
  const newErrors: { [key: string]: string } = {};
  
  if (!formData.email) {
    newErrors.email = 'Email is required';
  } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
    newErrors.email = 'Please enter a valid email';
  }

  if (!formData.password) {
    newErrors.password = 'Password is required';
  } else if (formData.password.length < 8) {
    newErrors.password = 'Password must be at least 8 characters';
  }

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

  return newErrors;
};


const StyledInput = observer(({ 
  icon, 
  error, 
  showToggle, 
  onToggle, 
  isPassword, 
  value, 
  onChangeText, 
  placeholder, 
  secureTextEntry, 
  keyboardType 
}) => {
  const colorScheme = useColorScheme();
  const theme = THEME[colorScheme ?? 'light'];

  return (
    <View className="space-y-1.5 mt-2 mb-2">
      <View className="relative">
        <View className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
          {cloneElement(icon, {
            color: theme.colors.textSecondary
          })}
        </View>
        <Reactive.TextInput
          $value={value}
          $onChangeText={onChangeText}
          $placeholder={placeholder}
          $secureTextEntry={secureTextEntry}
          $keyboardType={keyboardType}
          $placeholderTextColor={theme.colors.textSecondary}
          $className={`
            w-full rounded-xl py-4 px-12 text-base font-aregular
            ${error ? "border-red-400 dark:border-red-500" : "border-gray-200/80 dark:border-gray-700/80"}
            bg-gray-50/90 dark:bg-gray-800/90
            text-gray-800 dark:text-gray-100
            border shadow-sm
          `}
        />
        {showToggle && (
          <TouchableOpacity 
            onPress={onToggle}
            className="absolute right-4 top-1/2 -translate-y-1/2"
            activeOpacity={0.7}
          >
            {isPassword ? 
              <Eye size={20} color={theme.colors.textSecondary} /> : 
              <EyeOff size={20} color={theme.colors.textSecondary} />
            }
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text className="text-red-500 dark:text-red-400 text-sm ml-4 font-medium">
          {error}
        </Text>
      )}
    </View>
  );
});


const GradientButton = observer(({
  onPress,
  isLoading,
  disabled,
  children,
  className
}) => {
  const colorScheme = useColorScheme();
  const theme = THEME[colorScheme ?? 'light'];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      className={`w-full rounded-xl shadow-md shadow-blue-700/30 dark:shadow-blue-900/30 ${className}`}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={theme.gradients.button}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        className="w-full p-4 flex-row justify-center items-center rounded-xl"
        style={{
          opacity: (disabled || isLoading) ? 0.7 : 1
        }}
      >
        {isLoading ? (
          <ActivityIndicator color="white" />
        ) : children}
      </LinearGradient>
    </TouchableOpacity>
  );
});


const AuthCard = observer(({ children, title, subtitle }) => {
  const colorScheme = useColorScheme();
  const theme = THEME[colorScheme ?? 'light'];

  return (
    <View className="w-full max-w-md mt-8 rounded-3xl shadow-2xl overflow-hidden
      bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
      <LinearGradient
        colors={theme.gradients.header}
        className="w-full px-8 pt-12 pb-8 items-center"
      >
        <View className="w-20 h-20 rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-xl 
          items-center justify-center mb-4 shadow-xl shadow-blue-900/30">
          <UserCircle size={48} color="white" />
        </View>
        <Text className="text-3xl font-abold text-white text-center">
          {title}
        </Text>
        <Text className="text-white/80 mt-2 text-center font-amedium">
          {subtitle}
        </Text>
      </LinearGradient>
      {children}
    </View>
  );
});


const AuthScreen = observer(() => {
  const colorScheme = useColorScheme();
  const theme = THEME[colorScheme ?? 'light'];
  const state = useAuthState();

  
  const renders = useRef(0);
  console.log(`Auth Screen: ${++renders.current}`);

  // Memoized handlers
  const handleSubmit = useCallback(async () => {
    const newErrors = validateForm(state.formData.peek(), state.isSignIn.peek());
    state.errors.set(newErrors);
    
    if (Object.keys(newErrors).length > 0) return;
    
    state.isLoading.set(true);
    try {
      const formData = state.formData.peek();
      const res = await authClient.signUp.email({
        email: formData.email,
        password: formData.password,
        name: formData.name
      });
      console.log(res);
      Alert.alert(
        'Success!', 
        state.isSignIn.peek() ? 'Welcome back!' : 'Your account has been created successfully!'
      );
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'An error occurred');
    } finally {
      state.isLoading.set(false);
    }
  }, []);

  const handleInputChange = useCallback((key: keyof FormData, value: string) => {
    state.formData[key].set(value);
  }, []);

  const togglePasswordVisibility = useCallback(() => {
    state.showPassword.set(!state.showPassword.peek());
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    state.showConfirmPassword.set(!state.showConfirmPassword.peek());
  }, []);

  const toggleSignInMode = useCallback(() => {
    state.isSignIn.set(!state.isSignIn.peek());
    state.errors.set({});
  }, []);

  const iconMap = {
    name: <User size={20} />,
    email: <Mail size={20} />,
    password: <Lock size={20} />,
    confirmPassword: <Lock size={20} />
  };

  const handleTest =async()=>{
    const res = await authClient.signIn.social({
      provider:"google"
    })
    console.log(res)
  }

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
          colors={theme.gradients.background}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="flex-1"
        >
          <View className="flex-1 items-center px-4 py-8">
            <AuthCard
              title={state.isSignIn.get() ? 'Welcome Back' : 'Create Account'}
              subtitle={
                state.isSignIn.get()
                  ? "We've missed you! Please sign in to continue" 
                  : "Join us! Create your account to get started"
              }
            >
              <TouchableOpacity onPress={async()=>{
                authClient.signIn.social({provider:'github'})
              }}>
                <Text className='text-xl'>Google</Text>
              </TouchableOpacity>
              <View className="p-8 space-y-4">
                <Memo>
                  {() => (
                    <>
                      {Object.entries(state.formData.peek()).map(([key, value]) => {
                        if (key === 'name' && state.isSignIn.get()) return null;
                        if (key === 'confirmPassword' && state.isSignIn.get()) return null;
                        
                        return (
                          <StyledInput
                            key={key}
                            icon={iconMap[key as keyof typeof iconMap]}
                            placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                            value={value}
                            onChangeText={(text: string) => handleInputChange(key as keyof FormData, text)}
                            //@ts-ignore
                            error={state.errors[key as keyof typeof state.errors].get()}
                            secureTextEntry={
                              key.includes('password') && 
                              (key === 'password' ? !state.showPassword.get() : !state.showConfirmPassword.get())
                            }
                            showToggle={key.includes('password')}
                            onToggle={key === 'password' ? togglePasswordVisibility : toggleConfirmPasswordVisibility}
                            isPassword={
                              key.includes('password') && 
                              (key === 'password' ? state.showPassword.get() : state.showConfirmPassword.get())
                            }
                            keyboardType={key === 'email' ? 'email-address' : 'default'}
                          />

                        );
                      })}
                    </>
                  )}
                </Memo>

                {state.isSignIn.get() && (
                  <TouchableOpacity
                    className="self-end"
                    onPress={() => Alert.alert('Reset Password', 'Password reset functionality will be available soon!')}
                    activeOpacity={0.7}
                  >
                    <Text className="text-blue-600 dark:text-blue-400 text-sm font-amedium">
                      Forgot Password?
                    </Text>
                  </TouchableOpacity>
                )}

                <GradientButton
                  onPress={handleSubmit}
                  isLoading={state.isLoading.get()}
                  disabled={state.isLoading.get()}
                  className="mt-4"
                >
                  <Text className="text-white font-amedium text-center mr-2">
                    {state.isSignIn.get() ? 'Sign In' : 'Create Account'}
                  </Text>
                  <ArrowRight size={18} color="white" />
                </GradientButton>

                <View className="flex-row items-center my-6">
                  <View className="flex-1 h-[1px] bg-gray-300 dark:bg-gray-600" />
                  <Text className="mx-4 text-gray-500 dark:text-gray-400 font-amedium">
                    or continue with
                  </Text>
                  <View className="flex-1 h-[1px] bg-gray-300 dark:bg-gray-600" />
                </View>

                <View className="items-center">
                  <GoogleSigninButton
                    size={GoogleSigninButton.Size.Wide}
                    color={colorScheme === 'dark' ? GoogleSigninButton.Color.Light : GoogleSigninButton.Color.Dark}
                    onPress={handleGoogleSignIn}
                    disabled={state.isLoading.get()}
                    style={{ width: '100%', height: 48 }}
                  />
                </View>
              </View>
            </AuthCard>

            <View className="mt-8 flex-row justify-center items-center">
              <Text className="text-gray-700 dark:text-gray-300 font-amedium">
                {state.isSignIn.get() ? "Don't have an account? " : "Already have an account? "}
              </Text>
              <TouchableOpacity 
                onPress={toggleSignInMode}
                className="flex-row items-center"
                activeOpacity={0.7}
              >
                <Text className="text-white font-rbold mr-1">
                  {state.isSignIn.get() ? 'Create Account' : 'Sign In'}
                </Text>
                <ChevronRight size={14} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </LinearGradient>
      </ScrollView>
    </KeyboardAvoidingView>
  );
});

export default AuthScreen;