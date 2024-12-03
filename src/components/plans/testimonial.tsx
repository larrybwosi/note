import React from 'react';
import { View, Text, Dimensions } from 'react-native';
import { Star } from 'lucide-react-native';
import { Carousel } from '../common/Carousel';

const { width } = Dimensions.get('window');

const testimonials = [
  {
    name: 'John Doe',
    role: 'Freelance Designer',
    text: 'This app has completely transformed my workflow. I\'m now more productive than ever!',
    rating: 5,
  },
  {
    name: 'Jane Smith',
    role: 'Marketing Manager',
    text: 'The Pro plan is a game-changer for our team. We\'ve seen a 30% increase in productivity.',
    rating: 5,
  },
  {
    name: 'Mike Johnson',
    role: 'Startup Founder',
    text: 'I started with the Starter plan and quickly upgraded to Pro. It\'s worth every penny!',
    rating: 4,
  },
];

const TestimonialCard = ({ item }: { item: typeof testimonials[0] }) => (
  <View className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md mx-2">
    {/* <Text className="text-gray-800 dark:text-gray-200 font-aregular text-lg mb-4">
      "{item.text}"
    </Text>
    <View className="flex-row items-center justify-between">
      <View>
        <Text className="text-gray-900 dark:text-white font-rbold">{item.name}</Text>
        <Text className="text-gray-600 dark:text-gray-400 font-aregular">{item.role}</Text>
      </View>
      <View className="flex-row">
        {[...Array(item.rating)].map((_, i) => (
          <Star key={i} size={16} color="#F59E0B" fill="#F59E0B" />
        ))}
      </View>
    </View> */}
  </View>
);

export const TestimonialCarousel: React.FC = () => {
  return (
    <View className="py-8">
      <Text className="text-2xl font-rbold text-gray-900 dark:text-white mb-6 px-6">
        What Our Users Say
      </Text>
      <Carousel
        data={testimonials}
        renderItem={({ item }) => <TestimonialCard item={item} />}
        sliderWidth={width}
        itemWidth={width - 60}
        loop={true}
        autoplay={true}
        autoplayInterval={5000}
      />
    </View>
  );
};

