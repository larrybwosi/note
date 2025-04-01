import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  Switch,
  Platform,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

// Mock hostel data
const hostelDetails = {
  id: 'hs-001',
  name: 'Sunshine Heights Hostel',
  location: 'North Campus Block C',
  semesterPrice: 2400,
  minPaymentPercentage: 85,
  semesterName: 'Spring 2025',
  semesterPeriod: 'January 15 - May 30, 2025',
  amenities: ['WiFi', 'Study Room', 'Laundry', 'Kitchen', 'Gym', 'Recreation Area'],
  images: [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg',
  ],
  rules: [
    'Quiet hours from 10:00 PM to 6:00 AM',
    'No smoking or alcohol consumption on premises',
    'Visitors allowed only in common areas and must leave by 8:00 PM',
    'Keep your personal belongings secure at all times',
    'Report any issues to reception immediately',
    'Cooking only allowed in designated kitchen areas',
    'Maintain cleanliness in shared spaces'
  ]
};

const windowWidth = Dimensions.get('window').width;

const SemesterHostelBookingScreen = () => {
  const navigation = useNavigation();
  const [paymentAmount, setPaymentAmount] = useState(hostelDetails.semesterPrice);
  const [mobileNumber, setMobileNumber] = useState('');
  const [acceptRules, setAcceptRules] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('mpesa'); // mpesa, card, bank
  const [specialRequests, setSpecialRequests] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Calculate minimum payment amount (85% of total)
  const minPaymentAmount = Math.ceil(hostelDetails.semesterPrice * (hostelDetails.minPaymentPercentage / 100));
  
  // Validate mobile number
  const isMobileValid = () => {
    return /^\d{9}$/.test(mobileNumber.replace(/\s/g, ''));
  };
  
  // Validate payment amount
  const isPaymentValid = () => {
    return paymentAmount >= minPaymentAmount && paymentAmount <= hostelDetails.semesterPrice;
  };

  const handleSubmit = () => {
    if (!acceptRules) {
      Alert.alert("Required", "You must accept the hostel rules to continue");
      return;
    }
    
    if (!isMobileValid()) {
      Alert.alert("Invalid", "Please enter a valid 10-digit mobile number");
      return;
    }
    
    if (!isPaymentValid()) {
      Alert.alert("Invalid Payment", `Payment amount must be between ${minPaymentAmount} and ${hostelDetails.semesterPrice}`);
      return;
    }
    
    const bookingDetails = {
      hostelId: hostelDetails.id,
      hostelName: hostelDetails.name,
      semesterName: hostelDetails.semesterName,
      semesterPeriod: hostelDetails.semesterPeriod,
      paymentAmount: paymentAmount,
      mobileNumber: mobileNumber,
      paymentMethod: paymentMethod,
      balanceAmount: hostelDetails.semesterPrice - paymentAmount,
      specialRequests: specialRequests
    };
    
    // Simulate payment initiation
    Alert.alert(
      "Payment Initiated",
      `A payment request of $${paymentAmount} has been sent to your mobile number. Complete the payment to confirm your booking.`,
      // [{ text: "OK", onPress: () => navigation.navigate('BookingConfirmation', { booking: bookingDetails }) }]
    );
  };

  // Function to change displayed image
  const changeImage = (forward = true) => {
    if (forward) {
      setCurrentImageIndex((currentImageIndex + 1) % hostelDetails.images.length);
    } else {
      setCurrentImageIndex(currentImageIndex === 0 ? hostelDetails.images.length - 1 : currentImageIndex - 1);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView className="flex-1 bg-purple-50 mb-4">
        {/* Header with Gradient */}
        <LinearGradient
          colors={['#8B5CF6', '#6366F1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="px-4 pt-12 pb-6 rounded-b-3xl"
        >
          <View className="flex-row justify-between items-center mb-2">
            <View>
              <Text className="text-white text-2xl font-bold">{hostelDetails.name}</Text>
              <View className="flex-row items-center mt-1">
                <Ionicons name="location-outline" size={16} color="white" />
                <Text className="text-white ml-1">{hostelDetails.location}</Text>
              </View>
            </View>
            <View className="bg-white h-12 w-12 rounded-full items-center justify-center">
              <FontAwesome5 name="building" size={24} color="#8B5CF6" />
            </View>
          </View>
          
          <View className="bg-white/20 rounded-xl p-3 mt-2">
            <Text className="text-white font-medium">{hostelDetails.semesterName} Booking</Text>
            <Text className="text-white/80 text-sm mt-1">{hostelDetails.semesterPeriod}</Text>
          </View>
        </LinearGradient>
        
        {/* Gallery Section */}
        <View className="mx-4 mt-6 mb-2">
          <Text className="text-lg font-semibold text-gray-800 mb-2">Hostel Gallery</Text>
          
          <View className="bg-white rounded-2xl overflow-hidden shadow-md">
            <View className="h-56 bg-gray-200">
              {/* This would actually display images, but we're using a placeholder here */}
              <View className="w-full h-full items-center justify-center bg-indigo-100">
                <MaterialCommunityIcons name="image" size={48} color="#8B5CF6" />
                <Text className="text-indigo-600 mt-2">Hostel Image {currentImageIndex + 1}</Text>
              </View>
              
              {/* Gallery navigation buttons */}
              <View className="absolute top-0 bottom-0 left-0 right-0 flex-row justify-between items-center px-2">
                <TouchableOpacity 
                  className="h-8 w-8 bg-black/30 rounded-full items-center justify-center"
                  onPress={() => changeImage(false)}
                >
                  <Ionicons name="chevron-back" size={20} color="white" />
                </TouchableOpacity>
                <TouchableOpacity 
                  className="h-8 w-8 bg-black/30 rounded-full items-center justify-center"
                  onPress={() => changeImage(true)}
                >
                  <Ionicons name="chevron-forward" size={20} color="white" />
                </TouchableOpacity>
              </View>
              
              {/* Image indicators */}
              <View className="absolute bottom-3 left-0 right-0 flex-row justify-center">
                {hostelDetails.images.map((_, index) => (
                  <View 
                    key={index} 
                    className={`h-2 w-2 rounded-full mx-1 ${index === currentImageIndex ? 'bg-white' : 'bg-white/50'}`}
                  />
                ))}
              </View>
            </View>
          </View>
        </View>
        
        {/* Amenities */}
        <View className="mx-4 mb-4">
          <Text className="text-lg font-semibold text-gray-800 mb-2">Amenities</Text>
          <View className="flex-row flex-wrap">
            {hostelDetails.amenities.map((amenity, index) => (
              <View key={index} className="bg-white rounded-full px-3 py-1 mr-2 mb-2 shadow-sm flex-row items-center">
                <View className="h-2 w-2 rounded-full bg-indigo-400 mr-1" />
                <Text className="text-gray-700">{amenity}</Text>
              </View>
            ))}
          </View>
        </View>
        
        {/* Booking Form */}
        <View className="px-4 pb-4">
          <Text className="text-lg font-semibold text-gray-800 mb-3">Complete Your Booking</Text>
          
          {/* Semester Info Card */}
          <View className="bg-teal-50 rounded-2xl p-4 shadow-sm mb-4 border border-teal-100">
            <View className="flex-row items-center mb-3">
              <Ionicons name="calendar" size={24} color="#0D9488" className="mr-2" />
              <Text className="text-teal-700 font-medium text-lg ml-2">Semester Details</Text>
            </View>
            
            <View className="bg-white/60 rounded-xl p-3">
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">Semester:</Text>
                <Text className="font-medium text-gray-800">{hostelDetails.semesterName}</Text>
              </View>
              
              <View className="flex-row justify-between mb-2">
                <Text className="text-gray-600">Period:</Text>
                <Text className="font-medium text-gray-800">{hostelDetails.semesterPeriod}</Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Total Fee:</Text>
                <Text className="font-medium text-gray-800">${hostelDetails.semesterPrice}</Text>
              </View>
            </View>
          </View>
          
          {/* Payment Details */}
          <View className="bg-pink-50 rounded-2xl p-4 shadow-sm mb-4 border border-pink-100">
            <View className="flex-row items-center mb-3">
              <FontAwesome5 name="money-bill-wave" size={20} color="#DB2777" className="mr-2" />
              <Text className="text-pink-700 font-medium text-lg ml-2">Payment Details</Text>
            </View>
            
            <View className="mb-4">
              <Text className="text-gray-600 mb-2">Payment Amount (min. {hostelDetails.minPaymentPercentage}% required)</Text>
              <View className="flex-row items-center">
                <View className="bg-white/60 h-12 w-12 rounded-l-lg items-center justify-center border border-pink-200">
                  <Text className="font-bold text-gray-700">$</Text>
                </View>
                <TextInput
                  className="flex-1 h-12 bg-white/60 rounded-r-lg px-3 border border-l-0 border-pink-200 text-gray-700"
                  keyboardType="number-pad"
                  value={paymentAmount.toString()}
                  onChangeText={(value) => {
                    const numValue = parseInt(value || "0");
                    setPaymentAmount(numValue);
                  }}
                />
              </View>
              <View className="flex-row justify-between mt-2">
                <Text className="text-xs text-gray-500">Minimum: ${minPaymentAmount}</Text>
                <Text className="text-xs text-gray-500">Full amount: ${hostelDetails.semesterPrice}</Text>
              </View>
            </View>
            
            {/* Payment Progress Bar */}
            <View className="mb-4">
              <View className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                <View 
                  className="h-full bg-gradient-to-r from-pink-400 to-indigo-500"
                  style={{ width: `${Math.min(100, (paymentAmount / hostelDetails.semesterPrice) * 100)}%` }}
                />
              </View>
              <View className="flex-row justify-between mt-1">
                <Text className="text-xs text-gray-500">0%</Text>
                <Text className="text-xs text-gray-500">
                  {Math.round((paymentAmount / hostelDetails.semesterPrice) * 100)}%
                </Text>
                <Text className="text-xs text-gray-500">100%</Text>
              </View>
            </View>
            
            {/* Payment Methods */}
            <Text className="text-gray-600 mb-2">Payment Method</Text>
            <View className="flex-row mb-4">
              <TouchableOpacity 
                className={`flex-1 p-3 mr-2 rounded-xl border items-center ${
                  paymentMethod === 'mpesa' 
                    ? 'bg-indigo-100 border-indigo-300' 
                    : 'bg-white/60 border-gray-200'
                }`}
                onPress={() => setPaymentMethod('mpesa')}
              >
                <MaterialCommunityIcons 
                  name="cash" 
                  size={24} 
                  color={paymentMethod === 'mpesa' ? '#6366F1' : '#9CA3AF'} 
                />
                <Text className={`mt-1 ${
                  paymentMethod === 'mpesa' ? 'text-indigo-700' : 'text-gray-600'
                }`}>M-Pesa</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className={`flex-1 p-3 mr-2 rounded-xl border items-center ${
                  paymentMethod === 'card' 
                    ? 'bg-indigo-100 border-indigo-300' 
                    : 'bg-white/60 border-gray-200'
                }`}
                onPress={() => setPaymentMethod('card')}
              >
                <FontAwesome5 
                  name="credit-card" 
                  size={24} 
                  color={paymentMethod === 'card' ? '#6366F1' : '#9CA3AF'} 
                />
                <Text className={`mt-1 ${
                  paymentMethod === 'card' ? 'text-indigo-700' : 'text-gray-600'
                }`}>Card</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                className={`flex-1 p-3 rounded-xl border items-center ${
                  paymentMethod === 'bank' 
                    ? 'bg-indigo-100 border-indigo-300' 
                    : 'bg-white/60 border-gray-200'
                }`}
                onPress={() => setPaymentMethod('bank')}
              >
                <FontAwesome5 
                  name="university" 
                  size={24} 
                  color={paymentMethod === 'bank' ? '#6366F1' : '#9CA3AF'} 
                />
                <Text className={`mt-1 ${
                  paymentMethod === 'bank' ? 'text-indigo-700' : 'text-gray-600'
                }`}>Bank</Text>
              </TouchableOpacity>
            </View>
            
            {/* Mobile Number */}
            <Text className="text-gray-600 mb-2">Mobile Number (for payment)</Text>
            <View className="flex-row items-center mb-1">
              <View className="bg-white/60 rounded-l-lg h-12 px-3 items-center justify-center border border-pink-200">
                <Text className="font-medium text-gray-700">+254</Text>
              </View>
              <TextInput
                className="flex-1 h-12 bg-white/60 rounded-r-lg px-3 border border-l-0 border-pink-200 text-gray-700"
                keyboardType="phone-pad"
                placeholder="7XX XXX XXX"
                value={mobileNumber}
                onChangeText={setMobileNumber}
                maxLength={10}
              />
            </View>
            <Text className="text-xs text-gray-500 mb-2">Enter your mobile number without the country code</Text>
          </View>
          
          {/* Special Requests */}
          <View className="bg-amber-50 rounded-2xl p-4 shadow-sm mb-4 border border-amber-100">
            <View className="flex-row items-center mb-3">
              <Ionicons name="chatbubble-ellipses-outline" size={24} color="#D97706" className="mr-2" />
              <Text className="text-amber-700 font-medium text-lg ml-2">Special Requests</Text>
            </View>
            
            <TextInput
              className="bg-white/60 border border-amber-200 rounded-xl p-3 text-gray-700 h-24"
              multiline
              placeholder="Any special requirements or accommodation needs? (optional)"
              value={specialRequests}
              onChangeText={setSpecialRequests}
            />
          </View>
          
          {/* Hostel Rules */}
          <View className="bg-indigo-50 rounded-2xl p-4 shadow-sm mb-4 border border-indigo-100">
            <View className="flex-row items-center mb-3">
              <Ionicons name="shield-checkmark-outline" size={24} color="#4F46E5" className="mr-2" />
              <Text className="text-indigo-700 font-medium text-lg ml-2">Hostel Rules</Text>
            </View>
            
            <View className="bg-white/60 p-3 rounded-xl mb-3">
              {hostelDetails.rules.map((rule, index) => (
                <View key={index} className="flex-row mb-2">
                  <Text className="text-indigo-400 mr-2">•</Text>
                  <Text className="text-gray-600 flex-1">{rule}</Text>
                </View>
              ))}
            </View>
            
            <View className="flex-row items-center">
              <TouchableOpacity 
                className="mr-2"
                onPress={() => setAcceptRules(!acceptRules)}
              >
                <View className={`w-6 h-6 border rounded-md flex items-center justify-center ${
                  acceptRules 
                    ? 'bg-indigo-600 border-indigo-600' 
                    : 'border-gray-400 bg-white/60'
                }`}>
                  {acceptRules && <Ionicons name="checkmark" size={16} color="white" />}
                </View>
              </TouchableOpacity>
              <Text className="text-gray-700 flex-1">I agree to the hostel rules and regulations</Text>
            </View>
          </View>
          
          {/* Payment Summary */}
          <View className="bg-white rounded-2xl p-4 shadow mb-4 border-l-4 border-green-500">
            <Text className="font-semibold text-gray-800 mb-3">Payment Summary</Text>
            
            <View className="mb-2">
              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-600">Total Semester Fee</Text>
                <Text className="text-gray-700">${hostelDetails.semesterPrice}</Text>
              </View>
              
              <View className="flex-row justify-between mb-1">
                <Text className="text-gray-600">Initial Payment</Text>
                <Text className="text-green-600 font-medium">${paymentAmount}</Text>
              </View>
              
              <View className="flex-row justify-between">
                <Text className="text-gray-600">Remaining Balance</Text>
                <Text className="text-orange-600 font-medium">${hostelDetails.semesterPrice - paymentAmount}</Text>
              </View>
            </View>
          </View>
          
          {/* Submit Button */}
          <TouchableOpacity
            className={`rounded-xl py-2 px-4 mb-10`}
            style={{ backgroundColor: acceptRules && isMobileValid() && isPaymentValid() ? '#4f46e5': '#9ca3af'}}
            onPress={handleSubmit}
            disabled={!acceptRules || !isMobileValid() || !isPaymentValid()}
          >
            <Text className="text-white font-bold text-center text-lg">
              Confirm & Pay ${paymentAmount}
            </Text>
            <Text className="text-white/80 text-xs text-center mt-1">
              Payment will be processed via {
                paymentMethod === 'mpesa' ? 'M-Pesa' :
                paymentMethod === 'card' ? 'Credit/Debit Card' : 'Bank Transfer'
              }
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView> 
  );
};

export default SemesterHostelBookingScreen;