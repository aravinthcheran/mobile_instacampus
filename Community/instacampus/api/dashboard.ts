import { storage } from '@/utils/storage';

const API_URL = 'http://localhost:5000'; // Replace with your actual API URL

// Comment interface
export interface Comment {
  _id: string;
  text: string;
  user_id: string;
  user_name: string;
  user_email: string;
  created_at: string;
}

// Post interface
export interface Post {
  _id: string;
  event_name: string;
  caption?: string;
  created_at: string;
  user_id?: string;
  user_name?: string;
  user_email?: string;
  user_profile_pic?: string;
  image_url?: string;
  image_id?: string;
  comments?: Comment[];
  likes?: string[];
  event_type?: string;
  location?: string;
  start_date?: string;
  end_date?: string;
  registration_link?: string;
}

// Fetch posts for dashboard
export async function fetchPosts(searchQuery = ''): Promise<Post[]> {
  try {
    const token = await storage.getItem('authToken');
    const url = new URL(`${API_URL}/dashboard`);
    
    if (searchQuery) {
      url.searchParams.append('search', searchQuery);
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch posts');
    }

    const data = await response.json();
    return data.posts;
  } catch (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
}

// Like/unlike a post
export async function toggleLike(postId: string): Promise<{ message: string }> {
  try {
    const token = await storage.getItem('authToken');
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/like/${postId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update like status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error toggling like:', error);
    throw error;
  }
}

// Add a comment to a post
export async function addComment(postId: string, comment: string): Promise<{ message: string }> {
  try {
    const token = await storage.getItem('authToken');
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/comment/${postId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ comment })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to add comment');
    }

    return await response.json();
  } catch (error) {
    console.error('Error adding comment:', error);
    throw error;
  }
}

// Delete a comment
export async function deleteComment(postId: string, commentId: string): Promise<{ message: string }> {
  try {
    const token = await storage.getItem('authToken');
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/comment/${postId}/${commentId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to delete comment');
    }

    return await response.json();
  } catch (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
}

// Subscribe/unsubscribe to a user's posts
export async function toggleSubscription(postId: string): Promise<{ message: string }> {
  try {
    const token = await storage.getItem('authToken');
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/subscribe/${postId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to update subscription');
    }

    return await response.json();
  } catch (error) {
    console.error('Error toggling subscription:', error);
    throw error;
  }
}

// Check subscription status
export async function checkSubscription(userId: string): Promise<{ subscribers: string[] }> {
  try {
    const token = await storage.getItem('authToken');
    
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`${API_URL}/subscribers/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to check subscription');
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking subscription:', error);
    throw error;
  }
}
