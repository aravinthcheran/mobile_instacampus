import { storage } from '@/utils/storage';
import { Platform } from 'react-native';

// Update API URL to use the dev tunnel URL
const API_URL = 'https://jr3qx5z4-5000.inc1.devtunnels.ms';

// Update the fetchWithRetry function to have a longer timeout and better error handling
const fetchWithRetry = async (url: string, options = {}, retries = 3, timeout = 15000) => {
  try {
    // Create an AbortController for timeout handling
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    console.log(`Fetch attempt failed: ${error.message}`);
    
    if (error.name === 'AbortError') {
      console.log(`Request timed out after ${timeout}ms`);
    }
    
    if (retries > 0) {
      console.log(`Retrying... ${retries} attempts left`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Longer delay between retries
      return fetchWithRetry(url, options, retries - 1, timeout);
    }
    
    throw error;
  }
};

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

// Fetch posts for dashboard with multiple fallback URLs and better error handling
export async function fetchPosts(searchQuery = ''): Promise<Post[]> {
  // Try multiple API endpoints to increase chances of connection
  const apiUrls = [
    'https://jr3qx5z4-5000.inc1.devtunnels.ms',
    Platform.OS === 'web' ? 'http://localhost:5000' : 'http://10.0.2.2:5000',
    // Add any other potential URLs here
  ];
  
  const token = await storage.getItem('authToken');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  let lastError = null;
  
  // Try each API URL in sequence
  for (const baseUrl of apiUrls) {
    const urlString = `${baseUrl}/dashboard${searchQuery ? `?search=${searchQuery}` : ''}`;
    console.log(`Attempting to fetch posts from: ${urlString}`);
    
    try {
      const response = await fetchWithRetry(urlString, {
        method: 'GET',
        headers,
        // Adding mode: 'cors' for web
        ...(Platform.OS === 'web' ? { mode: 'cors' } : {})
      }, 2, 20000); // 2 retries, 20 second timeout
      
      if (!response.ok) {
        console.log(`Server responded with status: ${response.status}`);
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Successfully fetched ${data.posts?.length || 0} posts`);
      return data.posts || [];
    } catch (error) {
      console.error(`Failed to fetch from ${baseUrl}:`, error.message);
      lastError = error;
      
      // Continue to the next URL
      continue;
    }
  }
  
  // If we get here, all URLs failed
  console.error('All API endpoints failed:', lastError);
  
  // In development, return mock data even after all endpoints fail
  if (__DEV__) {
    console.log('Returning mock data as fallback');
    return getMockPosts();
  }
  
  // In production, return empty array to avoid app crashes
  return [];
}

// Mock data for development
function getMockPosts(): Post[] {
  return [
    {
      _id: '1',
      event_name: 'Mock Hackathon 2024',
      caption: 'Join us for an exciting hackathon with great prizes!',
      created_at: new Date().toISOString(),
      user_id: 'user1',
      user_name: 'Demo User',
      user_email: 'demo@example.com',
      event_type: 'Hackathon',
      location: 'University Main Hall',
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 86400000).toISOString(),
      likes: [],
      comments: []
    },
    {
      _id: '2',
      event_name: 'Tech Workshop',
      caption: 'Learn the latest technologies from industry experts',
      created_at: new Date().toISOString(),
      user_id: 'user2',
      user_name: 'Tech Department',
      user_email: 'tech@example.com',
      event_type: 'Workshop',
      location: 'Innovation Lab',
      likes: ['demo@example.com'],
      comments: [
        {
          _id: 'c1',
          text: 'Looking forward to this!',
          user_id: 'user1',
          user_name: 'Demo User',
          user_email: 'demo@example.com',
          created_at: new Date().toISOString()
        }
      ]
    }
  ];
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
