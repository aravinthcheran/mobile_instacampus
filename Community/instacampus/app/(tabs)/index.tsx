import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, FlatList, TouchableOpacity, TextInput, Alert, ActivityIndicator, Image, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Post } from '@/api/dashboard';
import { usePosts } from '@/context/PostContext';
import { useAuth } from '@/context/AuthContext';
import { storage } from '@/utils/storage';
import { PostCard } from '@/components/PostCard';

const API_URL = 'http://localhost:5000';

// Function to handle long usernames in post headers
const formatPostAuthorName = (name: string = 'Unknown') => {
  return (
    <ThemedText 
      type="defaultSemiBold" 
      style={styles.authorName}
      numberOfLines={1}
      ellipsizeMode="tail"
    >
      {name}
    </ThemedText>
  );
};

export default function HomeScreen() {
  const { posts, isLoading, error, loadPosts } = usePosts();
  const { user, token } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [subscriptions, setSubscriptions] = useState<Record<string, boolean>>({});
  const [expandedPostId, setExpandedPostId] = useState<string | null>(null);

  // Load posts on mount
  useEffect(() => {
    loadPosts();
    
    // Load saved subscriptions from storage
    const loadSubscriptions = async () => {
      const savedSubscriptions = await storage.getItem('userSubscriptions');
      if (savedSubscriptions) {
        try {
          setSubscriptions(JSON.parse(savedSubscriptions));
        } catch (e) {
          console.error('Failed to parse saved subscriptions', e);
        }
      }
    };
    
    loadSubscriptions();
  }, []);

  // Handle post refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPosts();
    setRefreshing(false);
  };

  // Handle like/unlike post
  const handleLikeToggle = async (postId: string) => {
    if (!token) {
      Alert.alert('Authentication Required', 'Please log in to like posts');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/like/${postId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to update like status');
      }

      // Optimistically update UI
      const updatedPosts = posts.map(post => {
        if (post._id === postId) {
          const userHasLiked = post.likes?.includes(user?.email || '') || false;
          return {
            ...post,
            likes: userHasLiked 
              ? post.likes?.filter(id => id !== user?.email) 
              : [...(post.likes || []), user?.email]
          };
        }
        return post;
      });

      // Refresh posts to get updated data from server
      loadPosts();
    } catch (error) {
      console.error('Error updating like:', error);
      Alert.alert('Error', 'Failed to update like status');
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (postId: string) => {
    if (!commentInputs[postId] || commentInputs[postId].trim() === '' || !token) {
      if (!token) {
        Alert.alert('Authentication Required', 'Please log in to comment');
      }
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/comment/${postId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ comment: commentInputs[postId] })
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      // Clear input and refresh posts
      setCommentInputs(prev => ({...prev, [postId]: ''}));
      await loadPosts();
      
    } catch (err) {
      console.error('Error adding comment:', err);
      Alert.alert('Error', 'Failed to add comment. Please try again.');
    }
  };
  
  // Handle comment deletion
  const handleDeleteComment = async (postId: string, commentId: string) => {
    if (!token) {
      Alert.alert('Authentication Required', 'Please log in to delete comments');
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/comment/${postId}/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete comment');
      }

      // Refresh posts after deletion
      await loadPosts();
      
    } catch (err) {
      console.error('Error deleting comment:', err);
      Alert.alert('Error', 'Failed to delete comment. Please try again.');
    }
  };

  // Handle subscription toggle
  const handleSubscription = async (postId: string) => {
    if (!token) {
      Alert.alert('Authentication Required', 'Please log in to subscribe');
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/subscribe/${postId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to update subscription');
      }
      
      const data = await response.json();
      
      // Find the post to get user ID
      const post = posts.find(p => p._id === postId);
      if (!post) {
        throw new Error('Post not found');
      }
      
      const userId = post.user_id;
      
      // Toggle subscription status in state
      const newStatus = !subscriptions[userId];
      
      // Update subscriptions state
      setSubscriptions(prev => {
        const updated = { ...prev, [userId]: newStatus };
        storage.setItem('userSubscriptions', JSON.stringify(updated));
        return updated;
      });

      Alert.alert(
        'Subscription Updated', 
        newStatus ? 'You will now receive notifications for new posts' : 'You will no longer receive notifications'
      );
      
    } catch (err) {
      console.error('Error updating subscription:', err);
      Alert.alert('Error', 'Failed to update subscription');
    }
  };

  // Check if user is subscribed to a publisher
  const checkSubscriptionStatus = async (userId: string) => {
    if (!token || !userId) return false;
    
    try {
      const response = await fetch(`${API_URL}/subscribers/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch subscription status');
      }
      
      const data = await response.json();
      
      // Check if current user's email is in the subscribers list
      const isSubscribed = data.subscribers.includes(user?.email);
      
      // Update subscription state
      setSubscriptions(prev => {
        const updated = { ...prev, [userId]: isSubscribed };
        storage.setItem('userSubscriptions', JSON.stringify(updated));
        return updated;
      });
      
      return isSubscribed;
    } catch (err) {
      console.error('Error checking subscription status:', err);
      return subscriptions[userId] || false;
    }
  };

  // Render a post item
  const renderPostItem = ({ item }: { item: Post }) => {
    const isExpanded = expandedPostId === item._id;
    const isSubscribed = subscriptions[item.user_id || ''] || false;
    
    return (
      <ThemedView style={styles.postCard}>
        {/* Post Header with Author Info and Subscribe Button */}
        <ThemedView style={styles.postHeader}>
          {/* Author Info */}
          <ThemedView style={styles.authorContainer}>
            {/* Author Avatar */}
            {item.user_profile_pic ? (
              <Image source={{ uri: item.user_profile_pic }} style={styles.authorImage} />
            ) : (
              <ThemedView style={styles.authorPlaceholder}>
                <ThemedText>{item.user_name ? item.user_name[0].toUpperCase() : 'U'}</ThemedText>
              </ThemedView>
            )}
            
            {/* Author Name and Post Date */}
            <ThemedView style={styles.authorInfo}>
              {formatPostAuthorName(item.user_name)}
              <ThemedText style={styles.dateText}>
                {new Date(item.created_at).toLocaleDateString()}
              </ThemedText>
            </ThemedView>
          </ThemedView>
          
          {/* Subscribe Button with Bell Icon - Only show if not the current user's post */}
          {user && user.email !== item.user_email && (
            <TouchableOpacity 
              style={[
                styles.subscribeButton,
                isSubscribed ? styles.subscribedButton : styles.unsubscribedButton
              ]}
              onPress={() => handleSubscription(item._id)}
            >
              <Ionicons 
                name={isSubscribed ? "notifications" : "notifications-outline"} 
                size={18} 
                color={isSubscribed ? "white" : "#0a7ea4"} 
              />
            </TouchableOpacity>
          )}
        </ThemedView>
        
        {/* Event Info */}
        <ThemedText type="subtitle" style={styles.eventName}>{item.event_name}</ThemedText>
        
        {/* Event Type Tag */}
        {item.event_type && (
          <ThemedView style={styles.eventTypeTag}>
            <ThemedText style={styles.eventTypeText}>{item.event_type}</ThemedText>
          </ThemedView>
        )}
        
        {/* Event Image */}
        {item.image_url && (
          <Image source={{ uri: item.image_url }} style={styles.postImage} />
        )}
        
        {/* Event Caption/Description */}
        {item.caption && (
          <ThemedText style={styles.caption}>{item.caption}</ThemedText>
        )}
        
        {/* Event Details */}
        <ThemedView style={styles.eventDetails}>
          {item.location && (
            <ThemedView style={styles.detailRow}>
              <Ionicons name="location-outline" size={16} color="#666" />
              <ThemedText style={styles.detailText}>{item.location}</ThemedText>
            </ThemedView>
          )}
          
          {item.start_date && (
            <ThemedView style={styles.detailRow}>
              <Ionicons name="calendar-outline" size={16} color="#666" />
              <ThemedText style={styles.detailText}>
                {new Date(item.start_date).toLocaleDateString()} 
                {item.end_date && item.end_date !== item.start_date && 
                  ` - ${new Date(item.end_date).toLocaleDateString()}`}
              </ThemedText>
            </ThemedView>
          )}
          
          {/* Registration Link Button */}
          {item.registration_link && (
            <TouchableOpacity 
              style={styles.registerButton}
              onPress={() => Linking.openURL(item.registration_link || '')}
            >
              <ThemedText style={styles.registerButtonText}>Register Now</ThemedText>
            </TouchableOpacity>
          )}
        </ThemedView>
        
        {/* Post Actions */}
        <ThemedView style={styles.postActions}>
          {/* Like Button */}
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => handleLikeToggle(item._id)}
          >
            <Ionicons 
              name={item.likes?.includes(user?.email || '') ? "heart" : "heart-outline"} 
              size={24} 
              color={item.likes?.includes(user?.email || '') ? "#e74c3c" : "#666"} 
            />
            <ThemedText style={styles.actionText}>{item.likes?.length || 0}</ThemedText>
          </TouchableOpacity>
          
          {/* Comment Button */}
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setExpandedPostId(isExpanded ? null : item._id)}
          >
            <Ionicons name="chatbubble-outline" size={22} color="#666" />
            <ThemedText style={styles.actionText}>{item.comments?.length || 0}</ThemedText>
          </TouchableOpacity>
        </ThemedView>
        
        {/* Comments Section */}
        {isExpanded && (
          <ThemedView style={styles.commentsSection}>
            <ThemedText type="defaultSemiBold" style={styles.commentsHeader}>
              Comments ({item.comments?.length || 0})
            </ThemedText>
            
            {item.comments && item.comments.length > 0 ? (
              item.comments.map(comment => (
                <ThemedView key={comment._id} style={styles.commentItem}>
                  <ThemedView style={styles.commentHeader}>
                    <ThemedText type="defaultSemiBold">{comment.user_name || 'Unknown'}</ThemedText>
                    
                    {/* Delete Comment option */}
                    {user?.email === comment.user_email && (
                      <TouchableOpacity 
                        onPress={() => handleDeleteComment(item._id, comment._id)}
                        style={styles.deleteButton}
                      >
                        <Ionicons name="trash-outline" size={16} color="#e74c3c" />
                      </TouchableOpacity>
                    )}
                  </ThemedView>
                  <ThemedText>{comment.text}</ThemedText>
                  <ThemedText style={styles.commentTime}>
                    {new Date(comment.created_at).toLocaleDateString()}
                  </ThemedText>
                </ThemedView>
              ))
            ) : (
              <ThemedText style={styles.noComments}>No comments yet</ThemedText>
            )}
            
            {/* Comment Input */}
            {user && (
              <ThemedView style={styles.commentInputContainer}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Add a comment..."
                  value={commentInputs[item._id] || ''}
                  onChangeText={(text) => setCommentInputs(prev => ({...prev, [item._id]: text}))}
                />
                <TouchableOpacity 
                  style={styles.commentSubmitButton}
                  onPress={() => handleCommentSubmit(item._id)}
                >
                  <Ionicons name="send" size={20} color="white" />
                </TouchableOpacity>
              </ThemedView>
            )}
          </ThemedView>
        )}
      </ThemedView>
    );
  };

  // Handle errors
  if (error) {
    return (
      <ThemedView style={styles.centerContainer}>
        <ThemedText>Error: {error}</ThemedText>
        <TouchableOpacity style={styles.retryButton} onPress={loadPosts}>
          <ThemedText style={styles.retryButtonText}>Retry</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={posts}
        keyExtractor={(item) => item._id}
        renderItem={renderPostItem}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        ListHeaderComponent={
          <ThemedView style={styles.header}>
            <ThemedText type="title">Dashboard</ThemedText>
          </ThemedView>
        }
        ListEmptyComponent={
          isLoading ? (
            <ThemedView style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#0a7ea4" />
            </ThemedView>
          ) : (
            <ThemedView style={styles.centerContainer}>
              <ThemedText>No posts yet</ThemedText>
            </ThemedView>
          )
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  header: {
    padding: 20,
  },
  retryButton: {
    marginTop: 10,
    backgroundColor: '#0a7ea4',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 4,
  },
  retryButtonText: {
    color: 'white',
  },
  postCard: {
    margin: 10,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 10,
  },
  authorInfo: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 10, // Increased to give more space between text and bell icon
    maxWidth: '85%',  // Ensure it doesn't push too close to the bell icon
  },
  authorName: {
    fontSize: 14,     // Slightly reduced font size to fit more text
    lineHeight: 20,
  },
  authorImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  authorPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0a7ea4',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  dateText: {
    fontSize: 12,
    color: '#666',
  },
  eventName: {
    marginBottom: 8,
  },
  eventTypeTag: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    marginBottom: 10,
  },
  eventTypeText: {
    fontSize: 12,
    color: '#666',
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  caption: {
    marginBottom: 10,
  },
  eventDetails: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  detailText: {
    marginLeft: 5,
    color: '#333',
  },
  registerButton: {
    backgroundColor: '#0a7ea4',
    padding: 10,
    borderRadius: 4,
    alignItems: 'center',
    marginTop: 8,
  },
  registerButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  postActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  actionText: {
    marginLeft: 4,
    color: '#666',
  },
  commentsSection: {
    marginTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 10,
  },
  commentsHeader: {
    marginBottom: 10,
  },
  commentItem: {
    backgroundColor: '#f9f9f9',
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  deleteButton: {
    padding: 5,
  },
  commentTime: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'right',
  },
  noComments: {
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'center',
    marginVertical: 10,
  },
  commentInputContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
  },
  commentSubmitButton: {
    backgroundColor: '#0a7ea4',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subscribeButton: {
    padding: 8,
    borderRadius: 20,  // More rounded for a bell icon
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#0a7ea4',
    marginLeft: 5,
  },
  subscribedButton: {
    backgroundColor: '#0a7ea4',
  },
  unsubscribedButton: {
    backgroundColor: 'transparent',
  },
});
