import * as SecureStore from 'expo-secure-store';
import { expoClient } from '@better-auth/expo/client';
import { createAuthClient } from 'better-auth/react';

 export const handleGoogleSignIn = async () => {
  
  };

 export const handleGoogleSignInError = (error: any) => {
  
  };

 export const sendTokenToServer = async (token: string) => {
  
  };

 
export const { signIn, signUp, signOut, useSession } = createAuthClient({
  baseURL: 'http://localhost:3000',
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  plugins: [
    expoClient({
      scheme: 'note',
      storagePrefix: 'auth',
      storage: SecureStore,
    }),
  ],
});