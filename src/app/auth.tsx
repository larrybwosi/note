import { cloneElement, useCallback } from 'react';
import { 
  View, Text, TouchableOpacity, Alert, Platform, ScrollView,  
  ActivityIndicator, KeyboardAvoidingView, useColorScheme,
  TextInput,
} from 'react-native';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, ChevronRight, UserCircle, AlertCircle } from 'lucide-react-native';
import { observer, Memo, useObservable } from '@legendapp/state/react';
import { GoogleSigninButton } from '@react-native-google-signin/google-signin';
import { LinearGradient } from 'expo-linear-gradient';
import { handleGoogleSignIn } from 'src/utils/auth';
import { FormData, THEME } from 'types';
import { account } from 'src/lib/appwrite';
import { useGlobalContext } from 'src/lib/global.context';
import { Redirect } from 'expo-router';


// Validation functions
const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return "Email is required";
  if (!emailRegex.test(email)) return "Invalid email format";
  return "";
};

const validatePassword = (password: string) => {
  if (!password) return "Password is required";
  if (password.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(password)) return "Password must contain an uppercase letter";
  if (!/[a-z]/.test(password)) return "Password must contain a lowercase letter";
  if (!/[0-9]/.test(password)) return "Password must contain a number";
  return "";
};

const validateName = (name: string) => {
  if (!name) return "Name is required";
  if (name.length < 2) return "Name must be at least 2 characters";
  return "";
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
            color: error ? theme.colors.error : theme.colors.textSecondary
          })}
        </View>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          placeholderTextColor={theme.colors.textSecondary}
          className={`
            w-full rounded-xl py-4 px-12 text-base font-aregular
            ${error ? 
              "border-2 border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-950/20" : 
              "border border-gray-200/80 dark:border-gray-700/80 bg-gray-50/90 dark:bg-gray-800/90"
            }
            text-gray-800 dark:text-gray-100
            shadow-sm focus:ring-2 focus:ring-blue-500/50
          `}
        />
        {showToggle && (
          <TouchableOpacity 
            onPress={onToggle}
            className="absolute right-4 top-1/2 -translate-y-1/2"
            activeOpacity={0.7}
          >
            {isPassword ? 
              <Eye size={20} color={error ? theme.colors.error : theme.colors.textSecondary} /> : 
              <EyeOff size={20} color={error ? theme.colors.error : theme.colors.textSecondary} />
            }
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <View className="flex-row items-center ml-4 space-x-1">
          <AlertCircle size={16} color={theme.colors.error} />
          <Text className="text-red-500 dark:text-red-400 text-sm font-medium">
            {error}
          </Text>
        </View>
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
      className={`w-full rounded-xl shadow-lg shadow-blue-700/30 dark:shadow-blue-900/30 
        transform transition-all duration-200 active:scale-98 ${className}`}
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
          <ActivityIndicator color="white" size="small" />
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
      bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl transform transition-all duration-300">
      <LinearGradient
        colors={theme.gradients.header}
        className="w-full px-8 pt-12 pb-8 items-center"
      >
        <View className="w-20 h-20 rounded-full bg-white/20 dark:bg-white/10 backdrop-blur-xl 
          items-center justify-center mb-4 shadow-xl shadow-blue-900/30
          animate-pulse">
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

  const state$ = useObservable({
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
    errors: {},
    touched: {}
  });

  const { refetch, loading, isLoggedIn } = useGlobalContext();

  if (!loading && isLoggedIn) return <Redirect href="/" />;

  const validateForm = () => {
    const errors: Record<string, string> = {};
    const { email, password, confirmPassword, name } = state$.formData.peek();

    errors.email = validateEmail(email);
    errors.password = validatePassword(password);

    if (!state$.isSignIn.peek()) {
      errors.name = validateName(name);
      if (password !== confirmPassword) {
        errors.confirmPassword = "Passwords do not match";
      }
    }

    // Remove empty error messages
    Object.keys(errors).forEach(key => {
      if (!errors[key]) delete errors[key];
    });

    state$.errors.set(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = useCallback(async () => {
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please check your input and try again.');
      return;
    }

    state$.isLoading.set(true);
    try {
      const { email, password, name } = state$.formData.peek();
      const randomValue = Math.random().toString();

      if (state$.isSignIn.peek()) {
        await account.createEmailPasswordSession(email, password);
        Alert.alert('Success!', 'Welcome back!');
      } else {
        const promise = await account.create(randomValue, email, password, name);
        if (promise.status === true) {
          await account.createEmailPasswordSession(email, password);
          Alert.alert('Success!', 'Your account has been created successfully!');
        }
      }
      await refetch();
    } catch (error) {
      Alert.alert('Error', error instanceof Error ? error.message : 'An error occurred');
    } finally {
      state$.isLoading.set(false);
    }
  }, []);

  const handleInputChange = useCallback((key: keyof FormData, value: string) => {
    state$.formData[key].set(value);
    state$.touched[key].set(true);
    
    // Validate on change if field has been touched
    if (state$.touched[key].peek()) {
      const error = key === 'email' ? validateEmail(value) :
                   key === 'password' ? validatePassword(value) :
                   key === 'name' ? validateName(value) :
                   key === 'confirmPassword' && value !== state$.formData.password.peek() ? 
                   "Passwords do not match" : "";
      
      if (error) {
        state$.errors[key].set(error);
      } else {
        state$.errors[key].set("");
      }
    }
  }, []);



  const togglePasswordVisibility = useCallback(() => {
    state$.showPassword.set(!state$.showPassword.peek());
  }, []);

  const toggleConfirmPasswordVisibility = useCallback(() => {
    state$.showConfirmPassword.set(!state$.showConfirmPassword.peek());
  }, []);

  const toggleSignInMode = useCallback(() => {
    state$.isSignIn.set(!state$.isSignIn.peek());
    state$.errors.set({});
  }, []);

  const iconMap = {
    name: <User size={20} />,
    email: <Mail size={20} />,
    password: <Lock size={20} />,
    confirmPassword: <Lock size={20} />
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
          colors={theme.gradients.background}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="flex-1"
        >
          <View className="flex-1 items-center px-4 py-8">
            <AuthCard
              title={state$.isSignIn.get() ? 'Welcome Back' : 'Create Account'}
              subtitle={
                state$.isSignIn.get()
                  ? "We've missed you! Please sign in to continue" 
                  : "Join us! Create your account to get started"
              }
            >
              
              <View className="p-8 space-y-4">
                <Memo>
                  {() => (
                    <>
                      {Object.entries(state$.formData.peek()).map(([key, value]) => {
                        if (key === 'name' && state$.isSignIn.get()) return null;
                        if (key === 'confirmPassword' && state$.isSignIn.get()) return null;
                        
                        return (
                          <StyledInput
                            key={key}
                            icon={iconMap[key as keyof typeof iconMap]}
                            placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
                            value={value}
                            onChangeText={(text: string) => handleInputChange(key as keyof FormData, text)}
                            //@ts-ignore
                            error={state$.errors[key as keyof typeof state$.errors].get()}
                            secureTextEntry={
                              key.includes('password') && 
                              (key === 'password' ? !state$.showPassword.get() : !state$.showConfirmPassword.get())
                            }
                            showToggle={key.includes('password')}
                            onToggle={key === 'password' ? togglePasswordVisibility : toggleConfirmPasswordVisibility}
                            isPassword={
                              key.includes('password') && 
                              (key === 'password' ? state$.showPassword.get() : state$.showConfirmPassword.get())
                            }
                            keyboardType={key === 'email' ? 'email-address' : 'default'}
                          />

                        );
                      })}
                    </>
                  )}
                </Memo>

                {state$.isSignIn.get() && (
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
                  isLoading={state$.isLoading.get()}
                  disabled={state$.isLoading.get()}
                  className="mt-4"
                >
                  <Text className="text-white font-amedium text-center mr-2">
                    {state$.isSignIn.get() ? 'Sign In' : 'Create Account'}
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
                    disabled={state$.isLoading.get()}
                    style={{ width: '100%', height: 48 }}
                  />
                </View>
              </View>
            </AuthCard>

            <View className="mt-8 flex-row justify-center items-center">
              <Text className="text-gray-700 dark:text-gray-300 font-amedium">
                {state$.isSignIn.get() ? "Don't have an account? " : "Already have an account? "}
              </Text>
              <TouchableOpacity 
                onPress={toggleSignInMode}
                className="flex-row items-center"
                activeOpacity={0.7}
              >
                <Text className="text-white font-rbold mr-1">
                  {state$.isSignIn.get() ? 'Create Account' : 'Sign In'}
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