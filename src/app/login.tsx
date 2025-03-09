import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { CheckSquare, Eye, EyeOff, ShieldCheck, Square } from 'lucide-react-native';
import { observer, use$, useObservable } from '@legendapp/state/react';
import { router } from 'expo-router';

// import { useAuth } from 'src/utils/auth.provider';
const LoginScreen = () => {

  const state$ = useObservable({
    email:'',
    password:'',
    showPassword: false,
    rememberMe: false,
    isLoading: false,
  })
  const { email, password, rememberMe, showPassword, isLoading } = use$(state$)
  const setEmail = state$.email.set;
  const setPassword = state$.password.set;
  const setRememberMe = state$.rememberMe.set;
  const setShowPassword = state$.showPassword.set;
  const setIsLoading = state$.isLoading.set;

  // const { login } = useAuth()
  
  // Handle login function
  const handleLogin = async() => {
    setIsLoading(true);
    // await login(email, password);
    // await login('larrydean@gmail.co', 'A2LVs@S3kNqheby');
    setIsLoading(false);
  };

  // Social login handlers
  const handleGoogleLogin = () => console.log('Google login initiated');
  const handleFacebookLogin = () => console.log('Facebook login initiated');

  // Toggle password visibility
  const togglePasswordVisibility = () => setShowPassword(!showPassword);

  const PassWordIcon =showPassword ? Eye : EyeOff;

  return (
    <SafeAreaView className="flex-1 bg-gray-100">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <View className="flex-1 px-6 pt-5 items-center">
          {/* App Logo */}
          <View className="my-5 items-center">
            <View className="w-[50px] h-[50px] rounded-xl bg-blue-600 justify-center items-center">
              <ShieldCheck size={24} color="white" />
            </View>
          </View>

          {/* Header Text */}
          <Text className="text-[40px] font-rbold text-black  mb-2 mr-auto">
            Sign in to your{'\n'}Account
          </Text>
          <Text className="text-sm text-gray-600 text-center mb-8 mr-auto font-aregular">
            Enter your email and password to log in
          </Text>

          {/* Login Form */}
          <View className="w-full">
            {/* Email Input */}
            <TextInput
              className="bg-white rounded-lg p-2 mb-4 text-base"
              value={email}
              onChangeText={setEmail}
              placeholder="someone@me.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            {/* Password Input */}
            <View className="flex-row bg-white rounded-lg mb-4 items-center">
              <TextInput
                className="flex-1 p-2 text-base"
                value={password}
                onChangeText={setPassword}
                placeholder="•••••••"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity
                className="p-4"
                onPress={togglePasswordVisibility}
              >
                <PassWordIcon
                  size={20}
                  color="#999"
                />
              </TouchableOpacity>
            </View>

            {/* Remember me and Forgot Password */}
            <View className="flex-row justify-between items-center mb-6">
              <TouchableOpacity
                className="flex-row items-center"
                onPress={() => setRememberMe(!rememberMe)}
              >
                <View className={`w-[18px] h-[18px] border rounded-sm justify-center items-center mr-2 
                  ${rememberMe ? 'bg-blue-600 border-blue-600' : 'border-gray-300'}`}>
                  {rememberMe ? <CheckSquare size={14} color="white" />: <Square size={14} color="gray"/>}
                </View>
                <Text className="text-sm text-gray-600 font-aregular">Remember me</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => console.log('Forgot password')}>
                <Text className="text-blue-600 text-sm font-amedium">Forgot Password?</Text>
              </TouchableOpacity>
            </View>

            {/* Login Button */}
            <TouchableOpacity
              className={`bg-blue-600 rounded-lg p-4 items-center mb-6 ${isLoading ? 'bg-blue-300' : ''}`}
              onPress={handleLogin}
              disabled={isLoading}
            >
              <Text className="text-white text-base font-amedium">
                {isLoading ? 'Loading...' : 'Log In'}
              </Text>
            </TouchableOpacity>

            {/* Or Divider */}
            <View className="items-center mb-6">
              <Text className="text-gray-500 text-sm">Or</Text>
            </View>

            {/* Social Login Buttons */}
            <TouchableOpacity 
              className="flex-row bg-white rounded-lg p-[14px] mb-4 items-center justify-center"
              onPress={handleGoogleLogin}
            >
              <View className="mr-2">
                <Text className="text-red-600 font-bold text-lg">G</Text>
              </View>
              <Text className="text-gray-800 text-sm font-amedium">Continue with Google</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              className="flex-row bg-white rounded-lg p-[14px] mb-4 items-center justify-center"
              onPress={handleFacebookLogin}
            >
              <View className="mr-2">
                <Text className="text-blue-800 font-bold text-lg">f</Text>
              </View>
              <Text className="text-gray-800 text-sm font-amedium">Continue with Facebook</Text>
            </TouchableOpacity>

            {/* Sign Up Link */}
            <View className="flex-row justify-center mt-4">
              <Text className="text-gray-600 text-sm font-aregular">Don't have an account? </Text>
              <TouchableOpacity onPress={() => router.navigate('signup')}>
                <Text className="text-blue-600 text-sm font-abold">Sign Up</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default observer(LoginScreen);