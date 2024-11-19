
const isProduction = process.env.NODE_ENV === 'production';
export const endpoint =isProduction ? process.env.EXPO_PUBLIC_API_ENDPOINT: 'http://192.168.42.236:3000'