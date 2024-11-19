import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { 
  FadeIn,
  FadeInDown,
  SlideInRight,
  useAnimatedStyle,
  withSpring
} from 'react-native-reanimated';
import { 
  Book, 
  Link, 
  Video, 
  Newspaper,
  Bookmark,
  BookmarkCheck,
  Calendar,
  ArrowLeft,
  ExternalLink
} from 'lucide-react-native';
import { format } from 'date-fns';
import { Note } from 'src/store/notes/types';
// import Markdown from 'react-native-markdown-display';

interface NoteViewerProps {
  note: Note;
  onBack: () => void;
  onToggleBookmark: (id: string) => void;
}

const ReferenceIcon = ({ type }: { type: Reference['type'] }) => {
  switch (type) {
    case 'book':
      return <Book size={18} color="#6366F1" />;
    case 'website':
      return <Link size={18} color="#8B5CF6" />;
    case 'video':
      return <Video size={18} color="#EC4899" />;
    case 'article':
      return <Newspaper size={18} color="#10B981" />;
    default:
      return null;
  }
};

const Reference: React.FC<{ reference: Reference }> = ({ reference }) => {
  const handlePress = () => {
    if (reference.url) {
      Linking.openURL(reference.url);
    }
  };

  return (
    <Animated.View 
      entering={SlideInRight.delay(200).springify()}
      className="bg-white dark:bg-gray-800 rounded-2xl p-4 mb-3 shadow-sm"
    >
      <TouchableOpacity 
        onPress={handlePress}
        disabled={!reference.url}
        className="flex-row items-center space-x-3"
      >
        <ReferenceIcon type={reference.type} />
        <View className="flex-1">
          <Text className="text-gray-900 dark:text-gray-100 font-rmedium text-base">
            {reference.title}
          </Text>
          {reference.author && (
            <Text className="text-gray-600 dark:text-gray-400 text-sm mt-1">
              by {reference.author}
            </Text>
          )}
          {reference.page && (
            <Text className="text-gray-500 dark:text-gray-500 text-sm mt-1">
              Page: {reference.page}
            </Text>
          )}
        </View>
        {reference.url && (
          <ExternalLink size={18} color="#6B7280" />
        )}
      </TouchableOpacity>
    </Animated.View>
  );
};

const Tag: React.FC<{ label: string }> = ({ label }) => (
  <Animated.View 
    entering={FadeIn.delay(300)}
    className="bg-indigo-100 dark:bg-indigo-900 rounded-full px-3 py-1 mr-2"
  >
    <Text className="text-indigo-700 dark:text-indigo-200 text-sm font-rmedium">
      {label}
    </Text>
  </Animated.View>
);

const NoteViewer: React.FC<NoteViewerProps> = ({ note, onBack, onToggleBookmark }) => {
  const [showReferences, setShowReferences] = useState(false);

  const markdownStyles = {
    body: {
      color: '#1F2937',
      fontSize: 16,
      lineHeight: 24,
      fontFamily: 'aregular',
    },
    heading1: {
      color: '#111827',
      fontSize: 24,
      fontFamily: 'rbold',
      marginBottom: 16,
      marginTop: 24,
    },
    heading2: {
      color: '#1F2937',
      fontSize: 20,
      fontFamily: 'rmedium',
      marginBottom: 12,
      marginTop: 20,
    },
    link: {
      color: '#6366F1',
      textDecorationLine: 'none',
      fontFamily: 'rmedium',
    },
    blockquote: {
      backgroundColor: '#F3F4F6',
      borderLeftColor: '#6366F1',
      borderLeftWidth: 4,
      paddingHorizontal: 16,
      paddingVertical: 12,
      marginVertical: 16,
      borderRadius: 8,
    },
    code_inline: {
      backgroundColor: '#F3F4F6',
      color: '#6366F1',
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
      fontFamily: 'rmedium',
    },
    code_block: {
      backgroundColor: '#F3F4F6',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderRadius: 8,
      marginVertical: 16,
    },
    list_item: {
      marginVertical: 8,
    },
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50 dark:bg-gray-900">
      <Animated.View 
        entering={FadeInDown.duration(500)}
        className="flex-1"
      >
        {/* Header */}
        <LinearGradient
          colors={['#4F46E5', '#6366F1']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="p-6 pb-8 rounded-b-[32px] shadow-lg"
        >
          <View className="flex-row items-center justify-between mb-6">
            <TouchableOpacity 
              onPress={onBack}
              className="bg-white/20 p-2 rounded-xl"
            >
              <ArrowLeft size={24} color="white" />
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => onToggleBookmark(note.id)}
              className="bg-white/20 p-2 rounded-xl"
            >
              {note.isBookmarked ? (
                <BookmarkCheck size={24} color="white" />
              ) : (
                <Bookmark size={24} color="white" />
              )}
            </TouchableOpacity>
          </View>

          <Text className="text-3xl font-rbold text-white mb-4">
            {note.title}
          </Text>

          <View className="flex-row items-center mb-4">
            <Calendar size={16} color="white" className="opacity-80" />
            <Text className="text-white/80 ml-2 font-aregular">
              {format(new Date(note.lastEdited), 'MMM dd, yyyy')}
            </Text>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            className="flex-row"
          >
            {note.tags.map((tag, index) => (
              <Tag key={index} label={tag} />
            ))}
          </ScrollView>
        </LinearGradient>

        {/* Content */}
        <ScrollView 
          className="flex-1 px-6"
          showsVerticalScrollIndicator={false}
        >
          <View className="py-6">
            <Markdown style={markdownStyles}>
              {note.content}
            </Markdown>
          </View>

          {/* References Section */}
          {note.references.length > 0 && (
            <View className="mb-8">
              <TouchableOpacity
                onPress={() => setShowReferences(!showReferences)}
                className="flex-row items-center justify-between mb-4"
              >
                <Text className="text-xl font-rbold text-gray-900 dark:text-gray-100">
                  References
                </Text>
                <Text className="text-indigo-600 dark:text-indigo-400 font-rmedium">
                  {showReferences ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>

              {showReferences && (
                <View>
                  {note.references.map((reference, index) => (
                    <Reference key={index} reference={reference} />
                  ))}
                </View>
              )}
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </SafeAreaView>
  );
};

export default NoteViewer;