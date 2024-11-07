import { GoogleSignin } from "@react-native-google-signin/google-signin";
import { statusCodes } from "@react-native-google-signin/google-signin";
import { Alert } from "react-native";

 export const handleGoogleSignIn = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      console.log(userInfo);
      await sendTokenToServer(userInfo?.data?.idToken!);
    } catch (error: any) {
      handleGoogleSignInError(error);
    }
  };

 export const handleGoogleSignInError = (error: any) => {
    const errorMessages = {
      [statusCodes.SIGN_IN_CANCELLED]: 'Sign in was cancelled',
      [statusCodes.IN_PROGRESS]: 'Sign in is already in progress',
      [statusCodes.PLAY_SERVICES_NOT_AVAILABLE]: 'Google Play services not available'
    };
    console.log(errorMessages)
    const message = errorMessages[error.code] || 'Something went wrong. Please try again.';
    Alert.alert('Authentication Error', message);
  };

 export const sendTokenToServer = async (token: string) => {
    try {
      const response = await fetch('https://your-server-url.com/verify-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();
      if (data.success) {
        Alert.alert('Welcome Back! 👋', "We're glad to see you again!");
      } else {
        Alert.alert('Authentication Failed', 'Please check your credentials and try again.');
      }
    } catch (error) {
      Alert.alert('Connection Error', 'Please check your internet connection and try again.');
    }
  };