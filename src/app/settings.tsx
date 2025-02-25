import { useLocalSearchParams } from 'expo-router'
import { Text } from 'react-native'
import CurrencySelector from 'src/components/currency-selector'
import NotificationsSettings from 'src/components/notification-channels'
import SecuritySettings from 'src/components/security'

export default function Settings() {
  const{ type } = useLocalSearchParams()
  const COMPONENT_MAP = {
    'currency': CurrencySelector,
    'security': SecuritySettings,
    'notifications': NotificationsSettings,
  }
  //@ts-ignore
  const Component = COMPONENT_MAP[type]
  if(!type) return <Text>What are you trying to do.</Text>
  
  return <Component />;
}