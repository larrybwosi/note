import { Image, View } from 'react-native';

interface AvatarProps {
  size: number;
  source: { uri: string };
}

export const Avatar: React.FC<AvatarProps> = ({ size, source }) => {
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        overflow: 'hidden',
        backgroundColor: '#E5E7EB',
      }}
    >
      <Image
        source={source}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
      />
    </View>
  );
};

