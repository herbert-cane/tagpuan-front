import React from 'react';
import { 
  FlatList, 
  View, 
  Text, 
  StyleSheet, 
  RefreshControl, 
  ActivityIndicator,
  TouchableOpacity 
} from 'react-native';

// ✅ KEEP ONLY FEED AD IMPORT
//import { AdMobFeedAd } from '../components/NewsFeed/AdMobFeed';

import { useNewsfeed, FeedFilter } from '../components/NewsFeed/UseNewsFeed';
import { PostCard } from '../components/NewsFeed/PostCard';
import { CreatePost } from '../components/NewsFeed/CreatePost';
import { User } from '../components/NewsFeed/NewsFeedtypes';

interface NewsfeedProps {
  currentUser: User;
}

export const Newsfeed: React.FC<NewsfeedProps> = ({ currentUser }) => {
  const {
    posts,
    loading,
    refreshing,
    hasMore,
    activeFilter,
    setFilter,
    loadPosts,
    addReaction,
    createPost,
    refresh,
    deletePost
  } = useNewsfeed(currentUser.id);

  const handleDeletePost = async (postId: string) => {
    // The hook now handles the API call and the UI update
    await deletePost(postId);
  };

  const renderFooter = () => {
    if (!loading || refreshing) return null;
    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color="#1877f2" />
        <Text style={styles.footerText}>Loading more posts...</Text>
      </View>
    );
  };

  const renderEmptyComponent = () => {
    if (loading) return null;
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No posts yet</Text>
        <Text style={styles.emptySubtext}>
          {activeFilter === 'friends' 
            ? "Add some friends to see their posts!" 
            : "Be the first to share something!"}
        </Text>
      </View>
    );
  };

  // Custom Tab Component
  const FeedFilterTabs = () => (
    <View style={styles.tabsContainer}>
      <TouchableOpacity 
        style={[styles.tab, activeFilter === 'all' && styles.activeTab]} 
        onPress={() => setFilter('all')}
      >
        <Text style={[styles.tabText, activeFilter === 'all' && styles.activeTabText]}>
          All
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={[styles.tab, activeFilter === 'friends' && styles.activeTab]} 
        onPress={() => setFilter('friends')}
      >
        <Text style={[styles.tabText, activeFilter === 'friends' && styles.activeTabText]}>
          Friends
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Initial Load Spinner
  if (loading && posts.length === 0 && !refreshing) {
     return (
      <View style={styles.container}>
        <FeedFilterTabs />
        <View style={styles.fullCenter}>
          <ActivityIndicator size="large" color="#1877f2" />
          <Text style={styles.loadingText}>Loading feed...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        // ✅ LOGIC: Insert Feed Ad every 5 posts
        renderItem={({ item, index }) => (
          <View>
            <PostCard
              post={item}
              currentUser={currentUser}
              onReaction={addReaction}
              onDelete={handleDeletePost}
            />
            {/* If the current index + 1 is divisible by 5, show the ad */}
            {/*(index + 1) % 5 === 0 && <AdMobFeedAd />*/}
          </View>
        )}
        
        ListHeaderComponent={
          <View style={styles.headerContainer}>
            <FeedFilterTabs />
            <CreatePost currentUser={currentUser} onCreatePost={createPost} />
          </View>
        }

        ListEmptyComponent={renderEmptyComponent}

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

      {/* ❌ BANNER AD REMOVED FROM HERE */}
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
  headerContainer: {
    marginBottom: 10,
  },
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 10,
    marginBottom: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
  },
  tab: {
    marginRight: 20,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f0f2f5',
  },
  activeTab: {
    backgroundColor: '#e7f3ff',
  },
  tabText: {
    fontWeight: '600',
    color: '#666',
  },
  activeTabText: {
    color: '#1877f2',
  },
  fullCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centered: {
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
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
});