import { SafeAreaView, Text, TextInput, TouchableOpacity, View, Platform } from 'react-native';
import { ArrowLeft, Eye, EyeOff, CalendarDays, LucideIcon} from 'lucide-react-native';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { router } from 'expo-router';
import { useAuth } from 'src/utils/auth.provider';
import { observer, use$, useObservable } from '@legendapp/state/react';
import { $TextInput } from '@legendapp/state/react-native';

const signupSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
  // phone: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/, 'Invalid phone format (123) 456-7890'),
  phone: z.string(),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

type FormData = z.infer<typeof signupSchema>;

const FormField = ({
	control,
	name,
	label,
	placeholder,
	icon: Icon,
	secureTextEntry,
	keyboardType,
  setShowPassword,
  showPassword
}: {
	control: any;
	name: keyof FormData;
	label: string;
	placeholder: string;
	icon?: LucideIcon;
	secureTextEntry?: boolean;
	keyboardType?: string;
  showPassword?: boolean;
  setShowPassword?: (showPassword: boolean) => void
}) => (
	<View className="mb-4">
		<Text className="text-sm text-gray-500 font-amedium mb-2">{label}</Text>
		<View className="flex-row items-center">
			<Controller
				control={control}
				name={name}
				render={({ field: { onChange, onBlur, value }, formState: { errors } }) => (
					<>
						<$TextInput
							className={`flex-1 p-2 text-base border rounded-lg ${
								errors[name] ? 'border-red-500' : 'border-gray-500'
							}`}
							placeholder={placeholder}
							onBlur={onBlur}
							onChangeText={onChange}
							value={value}
							secureTextEntry={secureTextEntry}
							keyboardType={keyboardType as any}
						/>
						{errors[name] && (
							<Text className="text-red-500 text-xs mt-1">{errors[name]?.message as string}</Text>
						)}
					</>
				)}
			/>
			{Icon && setShowPassword && (
				<TouchableOpacity className="absolute right-2 p-2" onPress={() => setShowPassword(!showPassword)}>
					<Icon size={20} color="#718096" />
				</TouchableOpacity>
			)}
		</View>
	</View>
);

const SignupScreen = () => {

  const state$ = useObservable({
		showPassword: false,
		isLoading: false,
	});

  const { showPassword, isLoading } = use$(state$);
  const setShowPassword = state$.showPassword.set;
  const setIsLoading = state$.isLoading.set;

  const { control, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(signupSchema)
  });

  // const { signup } = useAuth()
  const handleRegister = async(data: FormData) => {
    setIsLoading(true);
    // await signup(data);
    setIsLoading(false);
  };
 

  return (
		<SafeAreaView className="flex-1 bg-amber-50">
			<KeyboardAvoidingView
				behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
				className="flex-1"
			>
				<View className="flex-1 px-6 pt-4">
					{/* Header */}
					<View className="flex-row items-center mb-4">
						<TouchableOpacity className="p-2">
							<ArrowLeft size={24} color="#4a5568" />
						</TouchableOpacity>
					</View>
					<Text className="text-3xl font-rbold text-gray-800 mb-2">Sign up</Text>

					{/* Main Content */}
					<Text className="text-lg font-aregular text-gray-900 mb-6">
						Create an account to continue!
					</Text>

					{/* Form Fields */}
					<View className="space-y-4">
						<FormField control={control} name="fullName" label="Full Name" placeholder="John Doe" />

						<FormField
							control={control}
							name="email"
							label="Email"
							placeholder="someone@example.com"
							keyboardType="email-address"
						/>

						<FormField
							control={control}
							name="dob"
							label="Date of Birth"
							placeholder="YYYY-MM-DD"
							icon={CalendarDays}
						/>

						<FormField
							control={control}
							name="phone"
							label="Phone Number"
							placeholder="(123) 456-7890"
							keyboardType="phone-pad"
						/>

						<FormField
							control={control}
							name="password"
							label="Set Password"
							placeholder="•••••••"
							secureTextEntry={!showPassword}
							setShowPassword={setShowPassword}
							keyboardType="password"
							icon={showPassword ? Eye : EyeOff}
						/>
					</View>

					{/* Register Button */}
					<TouchableOpacity
						className={`bg-blue-600 rounded-lg p-3 mt-8 ${isLoading ? 'opacity-75' : ''}`}
						onPress={handleSubmit(handleRegister)}
						disabled={isLoading}
					>
						<Text className="text-white text-center font-amedium text-sm">
							{isLoading ? 'Registering...' : 'Register'}
						</Text>
					</TouchableOpacity>

					{/* Existing Account Link */}
					<View className="flex-row justify-center mt-6">
						<Text className="text-gray-600 font-aregular">Already have an account? </Text>
						<TouchableOpacity onPress={() => router.navigate('/login')}>
							<Text className="text-blue-600 font-aregular">Login</Text>
						</TouchableOpacity>
					</View>
				</View>
			</KeyboardAvoidingView>
		</SafeAreaView>
	);
};

export default observer(SignupScreen);