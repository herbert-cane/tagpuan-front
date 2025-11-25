import React, { useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Post, User, Reaction } from './NewsFeedtypes';
import { ReactionBar } from './ReactionBar';
import { FontAwesome } from '@expo/vector-icons';

interface PostCardProps {
  post: Post;
  currentUser: User;
  onReaction: (postId: string, type: Reaction['type']) => void;
  // Updated to allow Promise for async handling (spinner support)
  onDelete?: (postId: string) => Promise<void> | void; 
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUser,
  onReaction,
  onDelete,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const currentUserReaction = post.reactions.find(r => r.userId === currentUser.id);

  // Check if current user is the post author
  const isAuthor = post.userId === currentUser.id;

  const handleDelete = async () => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        { 
          text: "Delete", 
          style: "destructive",
          onPress: async () => {
            if (!onDelete) return;

            try {
              setIsDeleting(true);
              // ✅ FIX: Only call the prop. 
              // The hook (parent) handles the API call and State update.
              // Calling DatabaseService here directly would cause a double-delete error.
              await onDelete(post.id);
            } catch (error) {
              console.error('Error deleting post:', error);
              Alert.alert("Error", "Failed to delete post");
              setIsDeleting(false); // Only stop loading if it failed (and component is still mounted)
            }
            // Note: If success, component usually unmounts due to optimistic update, 
            // so setIsDeleting(false) isn't strictly needed there.
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image 
            source={{ uri: post.user.avatar || "https://placehold.co/100" }} 
            style={styles.avatar} 
        />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{post.user.name}</Text>
          <Text style={styles.userRole}>{post.user.role || 'User'}</Text>
          <Text style={styles.timestamp}>
            {post.timestamp.toLocaleDateString()} • {post.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        
        {/* Delete Button - Only show if user is author */}
        {isAuthor && (
          <TouchableOpacity 
            style={styles.deleteButton}
            onPress={handleDelete}
            disabled={isDeleting}
          >
            {isDeleting ? (
                <View style={{ padding: 2 }}>
                    {/* Simple activity indicator substitute using text or your preferred Spinner */}
                     <FontAwesome name="circle-o-notch" size={16} color="#ccc" />
                </View>
            ) : (
                <FontAwesome name="trash" size={16} color="#666" />
            )}
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.content}>{post.content}</Text>

      {post.image && (
        <Image source={{ uri: post.image }} style={styles.postImage} resizeMode="cover" />
      )}

      <View style={styles.stats}>
        <Text style={styles.statsText}>
          {post.reactions.length} reactions • {post.shares} shares
        </Text>
      </View>

      <ReactionBar
        post={post}
        currentUserReaction={currentUserReaction}
        onReaction={(type) => onReaction(post.id, type)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    marginHorizontal: 10,
    marginVertical: 5,
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#eee',
  },
  userInfo: {
    marginLeft: 10,
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  userRole: {
    fontSize: 12,
    color: '#666',
  },
  timestamp: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 20,
    marginLeft: 5,
  },
  content: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
    marginBottom: 10,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#f0f0f0',
  },
  stats: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    paddingBottom: 10,
    marginBottom: 10,
  },
  statsText: {
    fontSize: 12,
    color: '#666',
  },
});