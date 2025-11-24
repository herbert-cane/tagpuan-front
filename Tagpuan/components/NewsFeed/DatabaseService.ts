import { auth } from "@/firebaseConfig"; 
import { Post, User, Reaction } from './NewsFeedtypes';

// ---------------------- CONFIGURATION ----------------------
// Ensure this matches your backend IP and Port
const API_URL = process.env.EXPO_PUBLIC_API_URL; 

// ---------------------- HELPERS ----------------------
const getAuthHeader = async (): Promise<HeadersInit> => {
  const token = await auth.currentUser?.getIdToken();
  return token 
    ? { 
        "Authorization": `Bearer ${token}`, 
        "Content-Type": "application/json" 
      } 
    : { 
        "Content-Type": "application/json" 
      };
};

// ---------------------- SERVICE ----------------------

export const DatabaseService = {
  
  /**
   * 1. GET POSTS (NEWS FEED)
   * Fetches paginated posts and maps backend data to frontend types.
   * ✅ UPDATED: Accepts 'filter' parameter ('all' or 'friends')
   */
  getPosts: async (limit: number = 10, lastPostId?: string, filter: 'all' | 'friends' = 'all'): Promise<Post[]> => {
    try {
      const headers = await getAuthHeader();
      
      // ✅ UPDATED: Build Query URL with limit, filter, and pagination
      let url = `${API_URL}/posts/feed?limit=${limit}&filter=${filter}`;
      if (lastPostId) url += `&lastPostId=${lastPostId}`;

      const res = await fetch(url, { headers });
      
      if (!res.ok) {
        console.warn("Failed to fetch posts:", res.status);
        return [];
      }
      
      const posts = await res.json();
      
      // Map Backend Data -> Frontend 'Post' Interface
      return posts.map((p: any) => ({
        id: p.id,
        userId: p.authorId, // Top level userId if needed
        content: p.content,
        image: p.mediaUrl,  // Backend calls it 'mediaUrl', Frontend 'image'
        timestamp: new Date(p.timestamp),
        reactions: p.reactions || [],
        shares: p.shareCount || 0,
        
        // Construct the user object manually to prevent crashes
        user: { 
            id: p.authorId,
            name: p.authorName || "Unknown User",
            avatar: p.authorPhoto || "https://placehold.co/100", 
            role: "User" 
        }
      }));
    } catch (error) {
      console.error("Error in getPosts:", error);
      return [];
    }
  },

  /**
   * 2. CREATE POST
   */
  createPost: async (postData: { content: string, mediaUrl?: string }): Promise<Post | null> => {
    try {
      const headers = await getAuthHeader();
      
      const res = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers,
        body: JSON.stringify(postData),
      });
      
      if (!res.ok) throw new Error("Failed to create post");
      
      const newPost = await res.json();
      
      return { 
        id: newPost.id,
        userId: newPost.authorId,
        content: newPost.content,
        image: newPost.mediaUrl,
        timestamp: new Date(newPost.timestamp),
        reactions: [],
        shares: 0,
        user: {
            id: newPost.authorId,
            name: newPost.authorName,
            avatar: newPost.authorPhoto || "https://placehold.co/100",
            role: "User"
        }
      };
    } catch (error) {
      console.error("Error in createPost:", error);
      return null;
    }
  },

  /**
   * 3. ADD REACTION
   */
  addReaction: async (postId: string, userId: string, type: Reaction['type']): Promise<void> => {
    try {
      const headers = await getAuthHeader();
      await fetch(`${API_URL}/posts/${postId}/react`, {
        method: "POST",
        headers,
        body: JSON.stringify({ type }),
      });
    } catch (error) {
      console.error("Error adding reaction:", error);
    }
  },

  /**
   * 4. REMOVE REACTION
   */
  removeReaction: async (postId: string, userId: string): Promise<void> => {
    try {
      const headers = await getAuthHeader();
      await fetch(`${API_URL}/posts/${postId}/react`, {
        method: "DELETE",
        headers,
      });
    } catch (error) {
      console.error("Error removing reaction:", error);
    }
  },

  /**
   * 5. GET USER DETAILS
   */
  getUser: async (userId: string): Promise<User | null> => {
    try {
      const headers = await getAuthHeader();
      const res = await fetch(`${API_URL}/user/${userId}`, { headers });
      
      if (!res.ok) return null;

      const data = await res.json();

      return {
        id: data.id,
        name: `${data.first_name} ${data.last_name}`,
        avatar: data.profile_picture || "https://placehold.co/100",
        role: data.role || "User",
      };
    } catch (error) {
      console.error("Error fetching user:", error);
      return null; 
    }
  },

  initializeWithMockData: () => { console.log("Mock data disabled"); }
};