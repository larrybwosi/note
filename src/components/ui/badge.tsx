import { View, Text } from 'react-native';
import { cn } from 'src/lib/utils/cn';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default' }) => {
  return (
    <View
      className={cn(
        'rounded-full px-2.5 py-0.5',
        variant === 'default' && 'bg-primary',
        variant === 'secondary' && 'bg-secondary',
        variant === 'destructive' && 'bg-destructive',
        variant === 'outline' && 'border border-input bg-background'
      )}
    >
      <Text
        className={cn(
          'text-xs font-semibold',
          variant === 'default' && 'text-primary-foreground',
          variant === 'secondary' && 'text-secondary-foreground',
          variant === 'destructive' && 'text-destructive-foreground',
          variant === 'outline' && 'text-foreground'
        )}
      >
        {children}
      </Text>
    </View>
  );
};
