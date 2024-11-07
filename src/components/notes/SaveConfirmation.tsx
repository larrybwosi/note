import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface SaveConfirmationModalProps {
  saveAlert: boolean;
  setSaveAlert: (show: boolean) => void;
  onClose: () => void;
}

export const SaveConfirmationModal: React.FC<SaveConfirmationModalProps> = ({
  saveAlert,
  setSaveAlert,
  onClose,
}) => (
  <Modal
    transparent
    visible={saveAlert}
    animationType="fade"
    onRequestClose={() => setSaveAlert(false)}
  >
    <View className="flex-1 justify-center items-center bg-black/50">
      <View className="bg-white rounded-2xl p-6 m-4 items-center">
        <View className="bg-green-100 p-4 rounded-full mb-4">
          <MaterialIcons name="check" size={32} color="#22c55e" />
        </View>
        <Text className="text-xl font-bold mb-2">Note Saved!</Text>
        <Text className="text-gray-600 text-center mb-4">
          Your note has been saved successfully
        </Text>
        <TouchableOpacity
          onPress={() => {
            setSaveAlert(false);
            onClose();
          }}
          className="bg-blue-500 py-3 px-6 rounded-full"
        >
          <Text className="text-white font-bold">Done</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);