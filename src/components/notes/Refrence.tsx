import { View, Text, TextInput, TouchableOpacity, Modal } from 'react-native';
import { FontAwesome5 } from '@expo/vector-icons';
import { Reference } from './ts';

interface ReferenceModalProps {
  showReferenceModal: boolean;
  setShowReferenceModal: (show: boolean) => void;
  newReference: Reference;
  setNewReference: (reference: Reference) => void;
  addReference: () => void;
}

export const ReferenceModal: React.FC<ReferenceModalProps> = ({
  showReferenceModal,
  setShowReferenceModal,
  newReference,
  setNewReference,
  addReference,
}) => (
  <Modal
    animationType="slide"
    transparent
    visible={showReferenceModal}
    onRequestClose={() => setShowReferenceModal(false)}
  >
    <View className="flex-1 justify-end">
      <View className="bg-white rounded-t-3xl p-6">
        <Text className="text-xl font-rbold mb-4">Add Reference</Text>

        <View className="flex-row mb-4">
          {['book', 'website', 'article', 'video'].map((type) => (
            <TouchableOpacity
              key={type}
              onPress={() =>
                setNewReference((prev) => ({ ...prev, type: type as Reference['type'] }))
              }
              className={`mr-4 p-3 rounded-full ${
                newReference.type === type ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            >
              <FontAwesome5
                name={
                  type === 'book'
                    ? 'book'
                    : type === 'website'
                      ? 'globe'
                      : type === 'article'
                        ? 'file-alt'
                        : 'video'
                }
                size={20}
                color={newReference.type === type ? 'white' : 'black'}
              />
            </TouchableOpacity>
          ))}
        </View>

        <TextInput
          className="bg-gray-100 p-3 rounded-lg mb-3"
          placeholder="Title"
          value={newReference.title}
          onChangeText={(text) => setNewReference((prev) => ({ ...prev, title: text }))}
        />

        <TextInput
          className="bg-gray-100 p-3 rounded-lg mb-3"
          placeholder="Author"
          value={newReference.author}
          onChangeText={(text) => setNewReference((prev) => ({ ...prev, author: text }))}
        />

        {newReference.type !== 'book' && (
          <TextInput
            className="bg-gray-100 p-3 rounded-lg mb-3"
            placeholder="URL"
            value={newReference.url}
            onChangeText={(text) => setNewReference((prev) => ({ ...prev, url: text }))}
          />
        )}

        {newReference.type === 'book' && (
          <TextInput
            className="bg-gray-100 p-3 rounded-lg mb-3"
            placeholder="Page Number"
            value={newReference.page}
            onChangeText={(text) => setNewReference((prev) => ({ ...prev, page: text }))}
            keyboardType="number-pad"
          />
        )}

        <View className="flex-row justify-end mt-4">
          <TouchableOpacity
            onPress={() => setShowReferenceModal(false)}
            className="px-4 py-2 mr-2"
          >
            <Text className="text-gray-500 font-plregular">Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={addReference} className="bg-blue-500 px-4 py-2 rounded-lg">
            <Text className="text-white font-plregular">Add Reference</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);