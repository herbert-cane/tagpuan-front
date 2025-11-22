import { useState, useEffect } from 'react';
import { Post, User } from './NewsFeedtypesnewsfeedTypes';
import { DatabaseService } from './DatabaseService';

export const useNewsfeed = (currentUserId: string) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadPosts = async (isRefreshing: boolean = false) => {
    if (isRefreshing) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const newPosts = await DatabaseService.getPosts(10);
      
      if (isRefreshing) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }
      
      setHasMore(newPosts.length === 10);
    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const addReaction = async (postId: string, type: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry') => {
    try {
      await DatabaseService.addReaction(postId, currentUserId, type);
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
    } catch (error) {
      console.error('Error adding reaction:', error);
    }
  };

  const removeReaction = async (postId: string) => {
    try {
      await DatabaseService.removeReaction(postId, currentUserId);
      setPosts(prev => prev.map(post => 
        post.id === postId 
          ? {
              ...post,
              reactions: post.reactions.filter(r => r.userId !== currentUserId)
            }
          : post
      ));
    } catch (error) {
      console.error('Error removing reaction:', error);
    }
  };

  const createPost = async (content: string, image?: string, user?: User) => {
    if (!user) return;

    try {
      const newPost = await DatabaseService.createPost({
        userId: currentUserId,
        user,
        content,
        image
      });

      setPosts(prev => [newPost, ...prev]);
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  return {
    posts,
    loading,
    refreshing,
    hasMore,
    loadPosts,
    addReaction,
    removeReaction,
    createPost,
    refresh: () => loadPosts(true)
  };
};