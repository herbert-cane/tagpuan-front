import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Post, User, Reaction } from './NewsFeedtypes';
import { ReactionBar } from './ReactionBar';

interface PostCardProps {
  post: Post;
  currentUser: User;
  onReaction: (postId: string, type: Reaction['type']) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUser,
  onReaction,
}) => {
  const currentUserReaction = post.reactions.find(r => r.userId === currentUser.id);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image source={{ uri: post.user.avatar }} style={styles.avatar} />
        <View style={styles.userInfo}>
          <Text style={styles.userName}>{post.user.name}</Text>
          <Text style={styles.userRole}>{post.user.role}</Text>
          <Text style={styles.timestamp}>
            {post.timestamp.toLocaleDateString()} • {post.timestamp.toLocaleTimeString()}
          </Text>
        </View>
      </View>

      {/* Content */}
      <Text style={styles.content}>{post.content}</Text>

      {/* Image */}
      {post.image && (
        <Image source={{ uri: post.image }} style={styles.postImage} />
      )}

      {/* Stats */}
      <View style={styles.stats}>
        <Text style={styles.statsText}>
          {post.reactions.length} reactions • {post.shares} shares
        </Text>
      </View>

      {/* Reaction Bar */}
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