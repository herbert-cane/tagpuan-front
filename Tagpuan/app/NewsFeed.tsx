import React, { useEffect, useState } from 'react';
import { FlatList, View, Text, StyleSheet, RefreshControl, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNewsfeed } from './NewsFeed/UseNewsFeed';
import { PostCard } from './NewsFeed/PostCard';
import { CreatePost } from './NewsFeed/CreatePost';
import { User } from './NewsFeed/NewsFeedtypes';
import { DatabaseService } from './NewsFeed/DatabaseService';
import { mockPosts, mockUsers } from './NewsFeed/NewsFeedData';

interface NewsfeedProps {
  currentUser: User;
}

export const Newsfeed: React.FC<NewsfeedProps> = ({ currentUser }) => {
  const [initialized, setInitialized] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  // Initialize data only once
  useEffect(() => {
    const initializeData = async () => {
      if (!initialized) {
        try {
          console.log('🔄 Initializing newsfeed data...');
          DatabaseService.initializeWithMockData(mockPosts, mockUsers);
          setInitialized(true);
          setInitError(null);
          console.log('✅ Newsfeed data initialized successfully');
        } catch (error) {
          console.error('❌ Failed to initialize newsfeed data:', error);
          setInitError('Failed to load newsfeed data');
        }
      }
    };

    initializeData();
  }, [initialized]);

  const {
    posts,
    loading,
    refreshing,
    hasMore,
    loadPosts,
    addReaction,
    createPost,
    refresh
  } = useNewsfeed(currentUser.id);

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#1877f2" />
        <Text style={styles.footerText}>Loading more posts...</Text>
      </View>
    );
  };

  // Show initialization error
  if (initError) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>❌ {initError}</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={() => setInitialized(false)}
        >
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show loading until data is initialized AND loaded
  if (!initialized || (loading && posts.length === 0)) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#1877f2" />
        <Text style={styles.loadingText}>
          {!initialized ? 'Initializing newsfeed...' : 'Loading posts...'}
        </Text>
      </View>
    );
  }

  // Show empty state if no posts
  if (posts.length === 0 && initialized && !loading) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No posts yet</Text>
        <Text style={styles.emptySubtext}>Be the first to share something!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CreatePost currentUser={currentUser} onCreatePost={createPost} />
      
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PostCard
            post={item}
            currentUser={currentUser}
            onReaction={addReaction}
          />
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={['#1877f2']}
            tintColor="#1877f2"
          />
        }
        onEndReached={() => {
          if (!loading && hasMore) {
            loadPosts();
          }
        }}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f2f5',
  },
  listContent: {
    paddingBottom: 20,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  errorText: {
    fontSize: 16,
    color: '#e74c3c',
    textAlign: 'center',
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  footer: {
    padding: 20,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    marginLeft: 12,
    fontSize: 14,
    color: '#666',
  },
  retryButton: {
    backgroundColor: '#1877f2',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 6,
    marginTop: 12,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});