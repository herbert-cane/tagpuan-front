import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Post, Reaction } from './NewsFeedtypes';

interface ReactionBarProps {
  post: Post;
  currentUserReaction?: Reaction;
  onReaction: (type: Reaction['type']) => void; // ✅ Change to specific type
}

const reactions = [
  { type: 'like' as const, emoji: '👍', color: '#1877f2' },
  { type: 'love' as const, emoji: '❤️', color: '#f33e58' },
  { type: 'haha' as const, emoji: '😄', color: '#f7b125' },
  { type: 'wow' as const, emoji: '😲', color: '#f7b125' },
  { type: 'sad' as const, emoji: '😢', color: '#f7b125' },
  { type: 'angry' as const, emoji: '😠', color: '#e9710f' },
];

export const ReactionBar: React.FC<ReactionBarProps> = ({
  post,
  currentUserReaction,
  onReaction
}) => {
  const [showReactions, setShowReactions] = useState(false);

  const handleReactionPress = (type: Reaction['type']) => { // ✅ Update parameter type
    onReaction(type);
    setShowReactions(false);
  };

  const getReactionSummary = () => {
    const counts: Record<string, number> = {};
    post.reactions.forEach(reaction => {
      counts[reaction.type] = (counts[reaction.type] || 0) + 1;
    });

    return Object.entries(counts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([type]) => reactions.find(r => r.type === type)?.emoji)
      .join('');
  };

  return (
    <View style={styles.container}>
      <View style={styles.reactionSummary}>
        <Text style={styles.reactionEmojis}>{getReactionSummary()}</Text>
        <Text style={styles.reactionCount}>{post.reactions.length}</Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setShowReactions(!showReactions)}
          onLongPress={() => setShowReactions(true)}
        >
          <Text style={[
            styles.actionText,
            currentUserReaction && { color: reactions.find(r => r.type === currentUserReaction.type)?.color }
          ]}>
            {currentUserReaction 
              ? reactions.find(r => r.type === currentUserReaction.type)?.emoji
              : '👍'
            } Like
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionText}>↗️ Share</Text>
        </TouchableOpacity>
      </View>

      {showReactions && (
        <View style={styles.reactionsPopup}>
          {reactions.map((reaction) => (
            <TouchableOpacity
              key={reaction.type}
              style={styles.reactionOption}
              onPress={() => handleReactionPress(reaction.type)}
            >
              <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  reactionSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reactionEmojis: {
    fontSize: 16,
    marginRight: 6,
  },
  reactionCount: {
    fontSize: 12,
    color: '#666',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
    paddingVertical: 8,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 6,
  },
  actionText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  reactionsPopup: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 25,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    justifyContent: 'space-around',
  },
  reactionOption: {
    padding: 4,
  },
  reactionEmoji: {
    fontSize: 24,
  },
});