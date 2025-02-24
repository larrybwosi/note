import { View, Text } from 'react-native'
import React from 'react'
import CurrencySelector from 'src/components/currency-selector'
import SecuritySettings from 'src/components/security';

export default function Settings() {
  return (
    <View>
      <CurrencySelector/>
      <SecuritySettings />
    </View>
  )
}