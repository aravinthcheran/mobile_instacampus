import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { Alert } from 'react-native';
import { Post, fetchPosts, toggleLike, addComment, deleteComment, toggleSubscription, checkSubscription } from '@/api/dashboard';

interface PostContextType {
  posts: Post[];
  isLoading: boolean;
  error: string | null;
  loadPosts: (searchQuery?: string) => Promise<void>;
  likePost: (postId: string) => Promise<void>;
  commentOnPost: (postId: string, comment: string) => Promise<void>;
  removeComment: (postId: string, commentId: string) => Promise<void>;
  subscribeToUser: (postId: string) => Promise<void>;
  checkUserSubscription: (userId: string) => Promise<boolean>;
}

const PostContext = createContext<PostContextType>({
  posts: [],
  isLoading: false,
  error: null,
  loadPosts: async () => {},
  likePost: async () => {},
  commentOnPost: async () => {},
  removeComment: async () => {},
  subscribeToUser: async () => {},
  checkUserSubscription: async () => false,
});

export const usePosts = () => useContext(PostContext);

export function PostProvider({ children }: { children: ReactNode }) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPosts = useCallback(async (searchQuery = '') => {
    try {
      setIsLoading(true);
      setError(null);
      const postsData = await fetchPosts(searchQuery);
      setPosts(postsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load posts');
      console.error('Error loading posts:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const likePost = useCallback(async (postId: string) => {
    try {
      await toggleLike(postId);
      // Optimistic update
      setPosts(currentPosts => 
        currentPosts.map(post => {
          if (post._id === postId) {
            // This is a simplified update - in a real app you'd need
            // to check if the user has already liked the post
            return {
              ...post,
              likes: post.likes ? [...post.likes, 'temp-like'] : ['temp-like']
            };
          }
          return post;
        })
      );
      // Reload posts to get accurate data
      await loadPosts();
    } catch (err) {
      console.error('Error liking post:', err);
      Alert.alert('Error', 'Failed to update like status');
    }
  }, [loadPosts]);

  const commentOnPost = useCallback(async (postId: string, comment: string) => {
    try {
      await addComment(postId, comment);
      await loadPosts();
    } catch (err) {
      console.error('Error commenting on post:', err);
      Alert.alert('Error', 'Failed to add comment');
    }
  }, [loadPosts]);

  const removeComment = useCallback(async (postId: string, commentId: string) => {
    try {
      await deleteComment(postId, commentId);
      await loadPosts();
    } catch (err) {
      console.error('Error removing comment:', err);
      Alert.alert('Error', 'Failed to delete comment');
    }
  }, [loadPosts]);

  const subscribeToUser = useCallback(async (postId: string) => {
    try {
      await toggleSubscription(postId);
      // Refetch posts to get updated data
      await loadPosts();
    } catch (err) {
      console.error('Error updating subscription:', err);
      Alert.alert('Error', 'Failed to update subscription');
    }
  }, [loadPosts]);

  const checkUserSubscription = useCallback(async (userId: string): Promise<boolean> => {
    try {
      const result = await checkSubscription(userId);
      return result.subscribers.includes('current-user-email'); // This would need the current user's email
    } catch (err) {
      console.error('Error checking subscription:', err);
      return false;
    }
  }, []);

  return (
    <PostContext.Provider 
      value={{ 
        posts, 
        isLoading, 
        error, 
        loadPosts, 
        likePost,
        commentOnPost,
        removeComment,
        subscribeToUser,
        checkUserSubscription
      }}
    >
      {children}
    </PostContext.Provider>
  );
}
