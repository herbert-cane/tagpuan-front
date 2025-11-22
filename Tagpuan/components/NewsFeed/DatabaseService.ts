import { Post, User, Reaction } from './NewsFeedtypes';

// Local storage simulation (replace with Firebase later)
let posts: Post[] = [];
let users: User[] = [];

export const DatabaseService = {
  // Posts
  getPosts: async (limit: number = 10, lastPostId?: string): Promise<Post[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    let filteredPosts = [...posts];
    if (lastPostId) {
      const lastIndex = posts.findIndex(p => p.id === lastPostId);
      filteredPosts = posts.slice(lastIndex + 1);
    }
    
    return filteredPosts.slice(0, limit);
  },

  createPost: async (post: Omit<Post, 'id' | 'timestamp'>): Promise<Post> => {
    const newPost: Post = {
      ...post,
      id: Date.now().toString(),
      timestamp: new Date(),
      reactions: [],
      shares: 0
    };
    
    posts.unshift(newPost);
    return newPost;
  },

  // Reactions
  addReaction: async (postId: string, userId: string, type: Reaction['type']): Promise<void> => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      // Remove existing reaction from this user
      post.reactions = post.reactions.filter(r => r.userId !== userId);
      // Add new reaction
      post.reactions.push({ userId, type });
    }
  },

  removeReaction: async (postId: string, userId: string): Promise<void> => {
    const post = posts.find(p => p.id === postId);
    if (post) {
      post.reactions = post.reactions.filter(r => r.userId !== userId);
    }
  },

  // Users
  getUser: async (userId: string): Promise<User | null> => {
    return users.find(u => u.id === userId) || null;
  },

  // Initialize with mock data
  initializeWithMockData: (mockPostsData: Post[], mockUsersData: User[]) => {
    posts = [...mockPostsData];
    users = [...mockUsersData];
  }
};