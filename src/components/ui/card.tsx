import { View, Text, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  children: React.ReactNode;
}

const Card: React.FC<CardProps> = ({ children, ...props }) => {
  return (
    <View
      className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden my-2"
      {...props}
    >
      {children}
    </View>
  );
};

interface CardHeaderProps extends ViewProps {
  children: React.ReactNode;
}

const CardHeader: React.FC<CardHeaderProps> = ({ children, ...props }) => {
  return (
    <View className="p-4 border-b border-gray-200 dark:border-gray-700" {...props}>
      {children}
    </View>
  );
};

interface CardTitleProps {
  children: React.ReactNode;
}

const CardTitle: React.FC<CardTitleProps> = ({ children }) => {
  return (
    <Text className="text-lg font-abold text-gray-900 dark:text-white">
      {children}
    </Text>
  );
};

interface CardDescriptionProps {
  children: React.ReactNode;
}

const CardDescription: React.FC<CardDescriptionProps> = ({ children }) => {
  return (
    <Text className="text-sm text-gray-600 dark:text-gray-400 mt-1">
      {children}
    </Text>
  );
};

interface CardContentProps extends ViewProps {
  children: React.ReactNode;
}

const CardContent: React.FC<CardContentProps> = ({ children, ...props }) => {
  return (
    <View className="p-4" {...props}>
      {children}
    </View>
  );
};

export { Card, CardHeader, CardTitle, CardDescription, CardContent };

