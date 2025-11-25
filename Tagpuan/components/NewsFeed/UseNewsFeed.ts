import { useState, useEffect, useCallback } from 'react';
import { Post, Reaction } from './NewsFeedtypes';
import { DatabaseService } from './DatabaseService';

// ✅ Filter Type
export type FeedFilter = 'all' | 'friends';

export const useNewsfeed = (currentUserId: string) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  
  // ✅ NEW: Track active filter
  const [activeFilter, setActiveFilter] = useState<FeedFilter>('all');

  const loadPosts = useCallback(async (isRefreshing: boolean = false) => {
    if (!isRefreshing && loading && posts.length > 0) return;

    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const lastPostId = !isRefreshing && posts.length > 0 ? posts[posts.length - 1].id : undefined;

      // ✅ Pass activeFilter to the service
      const newPosts = await DatabaseService.getPosts(10, lastPostId, activeFilter);
      
      if (isRefreshing) {
        setPosts(newPosts);
      } else {
        setPosts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const uniqueNewPosts = newPosts.filter(p => !existingIds.has(p.id));
          return [...prev, ...uniqueNewPosts];
        });
      }
      
      setHasMore(newPosts.length >= 10);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [posts, loading, activeFilter]); // Re-create when filter changes

  // ✅ NEW: Function to switch tabs
  const setFilter = (filter: FeedFilter) => {
    if (filter === activeFilter) return;
    
    setActiveFilter(filter);
    setPosts([]); // Clear current posts
    setLoading(true); // Show loading spinner immediately
    setHasMore(true); // Reset pagination
  };

  // Trigger load when filter changes
  useEffect(() => {
    loadPosts(true);
  }, [activeFilter]);

  const addReaction = async (postId: string, type: Reaction['type']) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? {
            ...post,
            reactions: [
              ...post.reactions.filter(r => r.userId !== currentUserId),
              { userId: currentUserId, type }
            ]
          }
        : post
    ));
    try {
      await DatabaseService.addReaction(postId, currentUserId, type);
    } catch (error) {
      removeReaction(postId); 
    }
  };

  const removeReaction = async (postId: string) => {
    setPosts(prev => prev.map(post => 
      post.id === postId 
        ? {
            ...post,
            reactions: post.reactions.filter(r => r.userId !== currentUserId)
          }
        : post
    ));
    try {
      await DatabaseService.removeReaction(postId, currentUserId);
    } catch (error) {
      console.error('Error removing reaction:', error);
    }
  };

  const createPost = async (content: string, image?: string) => {
    try {
      const newPost = await DatabaseService.createPost({
          content,
          mediaUrl: image
      });
      if (newPost) {
        setPosts(prev => [newPost, ...prev]);
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };
  const deletePost = async (postId: string) => {
    // 1. Optimistic Update: Remove it from the screen immediately
    setPosts(prev => prev.filter(p => p.id !== postId));

    try {
      // 2. Call the API
      await DatabaseService.deletePost(postId);
    } catch (error) {
      console.error("Failed to delete, reverting", error);
      // Optional: Reload posts if it failed to resync state
      loadPosts(true); 
    }
  };

  return {
    posts,
    loading,
    refreshing,
    hasMore,
    activeFilter, // Expose current filter
    setFilter,    // Expose switcher
    loadPosts, 
    addReaction,
    removeReaction,
    createPost,
    deletePost,
    refresh: () => loadPosts(true)
  };
};