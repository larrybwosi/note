import React from 'react';
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  TextInputProps, 
  Platform, 
  UIManager,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  interpolateColor,
  withSequence,
  withDelay,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';
import { observer } from '@legendapp/state/react';
import { observable } from '@legendapp/state';
import { CheckCircle, LockIcon, Mail, Phone } from 'lucide-react-native';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

interface ValidationRule {
  test: (value: string) => boolean;
  message: string;
}

interface CustomFormFieldProps extends Omit<TextInputProps, 'onChangeText'> {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  icon?: any;
  required?: boolean;
  helper?: string;
  validation?: ValidationRule[];
  successMessage?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'phone';
  showSuccessCheck?: boolean;
}

// Create observable state
const formState$ = observable({
  fields: {} as Record<string, {
    isFocused: boolean;
    errors: string[];
    showPassword: boolean;
    hasInteracted: boolean;
    value: string;
  }>
});

export const CustomFormField = observer(({
  label,
  value,
  onChangeText,
  icon,
  required = false,
  helper,
  validation = [],
  successMessage,
  type = 'text',
  showSuccessCheck = true,
  ...textInputProps
}: CustomFormFieldProps) => {
  // Initialize field state if it doesn't exist
  if (!formState$.fields[label]) {
    formState$.fields[label] = observable({
      isFocused: false,
      errors: [] as string[],
      showPassword: false,
      hasInteracted: false,
      value: '',
    });
  }

  const fieldState = formState$.fields[label];
  
  const labelPosition = useSharedValue(value ? 1 : 0);
  const focusAnimation = useSharedValue(0);
  const shakeAnimation = useSharedValue(0);
  const successAnimation = useSharedValue(0);

  React.useEffect(() => {
    labelPosition.value = withTiming(value || fieldState.isFocused.get() ? 1 : 0, { duration: 200 });
  }, [value, fieldState.isFocused.get()]);

  React.useEffect(() => {
    if (fieldState.hasInteracted.get() && !fieldState.errors.get().length && value) {
      successAnimation.value = withSpring(1);
    } else {
      successAnimation.value = withTiming(0);
    }
  }, [fieldState.errors.get(), value, fieldState.hasInteracted.get()]);

  const validateInput = (text: string) => {
    const newErrors = validation
      .filter(rule => !rule.test(text))
      .map(rule => rule.message);
    
    fieldState.errors.set(newErrors);

    if (newErrors.length && fieldState.hasInteracted.get()) {
      shakeAnimation.value = withSequence(
        withTiming(-3, { duration: 50 }),
        withTiming(3, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }

    return newErrors.length === 0;
  };

  const handleChangeText = (text: string) => {
    fieldState.hasInteracted.set(true);
    fieldState.value.set(text);
    validateInput(text);
    onChangeText(text);
  };

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeAnimation.value }],
    borderColor: interpolateColor(
      focusAnimation.value,
      [0, 1],
      ['#E2E8F0', fieldState.errors.get().length ? '#EF4444' : '#3B82F6']
    ),
  }));

  const labelStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(
          labelPosition.value,
          [0, 1],
          [0, -28],
          Extrapolation.CLAMP
        ),
      },
      {
        scale: interpolate(
          labelPosition.value,
          [0, 1],
          [1, 0.85],
          Extrapolation.CLAMP
        ),
      },
    ],
    color: interpolateColor(
      focusAnimation.value,
      [0, 1],
      ['#94A3B8', fieldState.errors.get().length ? '#EF4444' : '#3B82F6']
    ),
  }));

  const successIconStyle = useAnimatedStyle(() => ({
    opacity: successAnimation.value,
    transform: [
      { scale: successAnimation.value },
      { rotate: `${interpolate(successAnimation.value, [0, 1], [0, 360])}deg` },
    ],
  }));

  const getKeyboardType = () => {
    switch (type) {
      case 'email':
        return 'email-address';
      case 'phone':
        return 'phone-pad';
      case 'number':
        return 'numeric';
      default:
        return 'default';
    }
  };

  return (
    <View className="mb-6">
      <Animated.View
        className="relative border-2 rounded-xl bg-white dark:bg-gray-800 overflow-hidden"
        style={containerStyle}
      >
        <Animated.View
          className="absolute top-4 left-4"
          style={labelStyle}
        >
          <Text className="text-base">
            {label} {required && <Text className="text-red-500">*</Text>}
          </Text>
        </Animated.View>

        <View className="flex-row items-center">
          {icon && (
            <View className="pl-4">
              {/* <React.cloneElement(icon)
                size={20}
                color={fieldState.errors.get().length ? '#EF4444' : (fieldState.isFocused.get() ? '#3B82F6' : '#94A3B8')}
              /> */}
            </View>
          )}

          <AnimatedTextInput
            className="flex-1 px-4 py-4 text-base text-gray-800 dark:text-gray-200"
            value={value}
            onChangeText={handleChangeText}
            onFocus={() => {
              fieldState.isFocused.set(true);
              focusAnimation.value = withSpring(1);
            }}
            onBlur={() => {
              fieldState.isFocused.set(false);
              focusAnimation.value = withSpring(0);
              validateInput(value);
            }}
            secureTextEntry={type === 'password' && !fieldState.showPassword.get()}
            keyboardType={getKeyboardType()}
            {...textInputProps}
          />

          {type === 'password' && (
            <TouchableOpacity
              onPress={() => fieldState.showPassword.set(!fieldState.showPassword.get())}
              className="pr-4"
            >
              {/* <Ionicons
                name={fieldState.showPassword.get() ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color="#94A3B8"
              /> */}
            </TouchableOpacity>
          )}

          {showSuccessCheck && !fieldState.errors.get().length && fieldState.hasInteracted.get() && value && (
            <Animated.View className="pr-4" style={successIconStyle}>
              <CheckCircle size={20} color="#10B981" />
            </Animated.View>
          )}
        </View>
      </Animated.View>

      {helper && !fieldState.errors.get().length && (
        <Text className="text-sm text-gray-500 mt-1 ml-1">
          {helper}
        </Text>
      )}

      {successMessage && !fieldState.errors.get().length && fieldState.hasInteracted.get() && value && (
        <Animated.Text 
          className="text-sm text-emerald-500 mt-1 ml-1"
        >
          {successMessage}
        </Animated.Text>
      )}

      {fieldState.errors.get().map((error, index) => (
        <Animated.Text
          key={index}
          className="text-sm text-red-500 mt-1 ml-1"
        >
          {error}
        </Animated.Text>
      ))}
    </View>
  );
});

// Usage Example with Legend State
export const FormFieldExample = observer(() => {
  const formData$ = observable({
    email: '',
    password: '',
    phone: ''
  });

  const emailValidation = [
    {
      test: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      message: 'Please enter a valid email address'
    },
    {
      test: (value: string) => value.length >= 5,
      message: 'Email must be at least 5 characters long'
    }
  ];

  const passwordValidation = [
    {
      test: (value: string) => value.length >= 8,
      message: 'Password must be at least 8 characters long'
    },
    {
      test: (value: string) => /[A-Z]/.test(value),
      message: 'Password must contain at least one uppercase letter'
    },
    {
      test: (value: string) => /[0-9]/.test(value),
      message: 'Password must contain at least one number'
    }
  ];

  const phoneValidation = [
    {
      test: (value: string) => /^\d{10}$/.test(value.replace(/[^0-9]/g, '')),
      message: 'Please enter a valid 10-digit phone number'
    }
  ];

  return (
    <View className="p-4">
      <CustomFormField
        label="Email Address"
        value={formData$.email.get()}
        onChangeText={(text) => formData$.email.set(text)}
        icon={Mail}
        required
        helper="We'll never share your email address"
        validation={emailValidation}
        successMessage="Email format is valid"
        type="email"
        autoCapitalize="none"
      />

      <CustomFormField
        label="Password"
        value={formData$.password.get()}
        onChangeText={(text) => formData$.password.set(text)}
        icon={LockIcon}
        required
        helper="Use a strong password to secure your account"
        validation={passwordValidation}
        type="password"
      />

      <CustomFormField
        label="Phone Number"
        value={formData$.phone.get()}
        onChangeText={(text) => formData$.phone.set(text)}
        icon={Phone}
        helper="For account recovery and notifications"
        validation={phoneValidation}
        type="phone"
      />
    </View>
  );
});