
// Types
export interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
}

export interface FormErrors {
  email?: string;
  password?: string;
  name?: string;
  confirmPassword?: string;
}

export interface StyledInputProps {
  icon: React.ReactNode;
  error?: string;
  showToggle?: boolean;
  onToggle?: () => void;
  isPassword?: boolean;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
}

export interface GradientButtonProps {
  onPress: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

export interface AuthCardProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export 
const THEME = {
  light: {
    gradients: {
      background: ['#F8FAFC', '#EFF6FF', '#DBEAFE'],
      header: ['#1E40AF', '#3B82F6', '#60A5FA'],
      button: ['#2563EB', '#3B82F6'],
    },
    colors: {
      text: '#1E293B',
      textSecondary: '#64748B',
      cardBg: 'rgba(255, 255, 255, 0.95)',
      input: {
        bg: 'rgba(241, 245, 249, 0.9)',
        border: 'rgba(226, 232, 240, 0.8)',
        text: '#334155',
      },
      error: '#EF4444',
    },
  },
  dark: {
    gradients: {
      background: ['#0F172A', '#1E293B', '#334155'],
      header: ['#1E40AF', '#2563EB', '#3B82F6'],
      button: ['#1D4ED8', '#2563EB'],
    },
    colors: {
      text: '#F8FAFC',
      textSecondary: '#94A3B8',
      cardBg: 'rgba(30, 41, 59, 0.95)',
      input: {
        bg: 'rgba(51, 65, 85, 0.9)',
        border: 'rgba(71, 85, 105, 0.8)',
        text: '#E2E8F0',
      },
      error: '#FCA5A5',
    },
  },
};

