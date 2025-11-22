export interface User {
  id: string;
  name: string;
  avatar: string;
  role: string;
}

export interface Reaction {
  userId: string;
  type: 'like' | 'love' | 'haha' | 'wow' | 'sad' | 'angry';
}

export interface Post {
  id: string;
  userId: string;
  user: User;
  content: string;
  image?: string;
  timestamp: Date;
  reactions: Reaction[];
  shares: number;
}

export interface NewsFeedState {
  posts: Post[];
  loading: boolean;
  hasMore: boolean;
}