import { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Plus } from 'lucide-react-native';
import { Comment } from 'src/store/notes/types';

interface CommentsListProps {
  comments: Comment[];
  onAddComment: (comment: Comment) => void;
  onDeleteComment: (commentId: string) => void;
}

export const CommentsList: React.FC<CommentsListProps> = ({ comments, onAddComment }) => {
  const [newComment, setNewComment] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  const handleAddComment = () => {
    if (newComment) {
      onAddComment({ id:'', createdAt:new Date, content: newComment, author: '' });
      setNewComment('');
      setIsAdding(false);
    }
  };

  return (
    <View>
      {comments.map((comment) => (
        <View key={comment.id} className="mb-4 bg-white dark:bg-gray-800 p-3 rounded-lg">
          <Text className="text-gray-900 dark:text-white">{comment.content}</Text>
          <View className="flex-row justify-between mt-2">
            <Text className="text-sm text-gray-600 dark:text-gray-400">{comment.author}</Text>
            <Text className="text-sm text-gray-500 dark:text-gray-500">
              {comment.createdAt.toLocaleDateString()}
            </Text>
          </View>
        </View>
      ))}
      {isAdding ? (
        <View className="mt-2">
          <TextInput
            className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-2 rounded-lg mb-2"
            placeholder="Add a comment..."
            placeholderTextColor="#9CA3AF"
            value={newComment}
            onChangeText={setNewComment}
            multiline
          />
          <TouchableOpacity 
            onPress={handleAddComment}
            className="bg-blue-500 p-2 rounded-lg items-center"
          >
            <Text className="text-white font-rbold">Add Comment</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
          onPress={() => setIsAdding(true)}
          className="flex-row items-center mt-2"
        >
          <Plus size={20} color="#9CA3AF" />
          <Text className="ml-2 text-gray-600 dark:text-gray-400">Add Comment</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

