import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Post } from '@/api/dashboard';
import { addComment, deleteComment } from '@/api/dashboard';

// Function to handle long names
const formatUsername = (name: string = 'Unknown') => {
  // If name is shorter than 20 chars, return as is
  if (name.length <= 20) return name;
  
  // Otherwise, find a good breaking point (space) near the middle
  const space = name.indexOf(' ', name.length / 2 - 5);
  if (space !== -1) {
    // Return the name broken into two parts
    return (
      <>
        <ThemedText type="defaultSemiBold" style={styles.commentAuthorName}>
          {name.substring(0, space)}
        </ThemedText>
        <ThemedText type="defaultSemiBold" style={styles.commentAuthorName}>
          {name.substring(space)}
        </ThemedText>
      </>
    );
  }
  
  // If no good breaking point, break at 20 chars
  return (
    <>
      <ThemedText type="defaultSemiBold" style={styles.commentAuthorName}>
        {name.substring(0, 20)}
      </ThemedText>
      <ThemedText type="defaultSemiBold" style={styles.commentAuthorName}>
        {name.substring(20)}
      </ThemedText>
    </>
  );
};

export default function CommentSection({ post, currentUserEmail, isAdmin = false, onCommentUpdate }) {
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddComment = async () => {
    if (!commentText.trim()) {
      Alert.alert('Error', 'Comment cannot be empty');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await addComment(post._id, commentText);
      Alert.alert('Success', response.message);
      setCommentText('');
      onCommentUpdate();
    } catch (error) {
      Alert.alert('Error', error.message || 'Failed to add comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    Alert.alert(
      'Confirm Delete',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await deleteComment(post._id, commentId);
              Alert.alert('Success', response.message);
              onCommentUpdate();
            } catch (error) {
              Alert.alert('Error', error.message || 'Failed to delete comment');
            }
          },
        },
      ]
    );
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="defaultSemiBold" style={styles.title}>
        Comments ({post.comments?.length || 0})
      </ThemedText>
      
      {post.comments && post.comments.length > 0 ? (
        <ThemedView>
          {post.comments.map(comment => (
            <ThemedView key={comment._id} style={styles.commentItem}>
              <ThemedView style={styles.commentHeader}>
                <ThemedView style={styles.authorInfo}>
                  {formatUsername(comment.user_name)}
                </ThemedView>
                
                {(currentUserEmail === comment.user_email || isAdmin) && (
                  <TouchableOpacity 
                    onPress={() => handleDeleteComment(comment._id)}
                    style={styles.deleteButton}
                  >
                    <Ionicons name="trash-outline" size={18} color="#e74c3c" />
                  </TouchableOpacity>
                )}
              </ThemedView>
              
              <ThemedText style={styles.commentText}>{comment.text}</ThemedText>
              
              <ThemedText style={styles.commentDate}>
                {new Date(comment.created_at).toLocaleDateString()}
              </ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
      ) : (
        <ThemedText style={styles.noComments}>No comments yet</ThemedText>
      )}
      
      <ThemedView style={styles.addCommentContainer}>
        <TextInput
          style={styles.commentInput}
          placeholder="Add a comment..."
          value={commentText}
          onChangeText={setCommentText}
        />
        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleAddComment}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Ionicons name="send" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 10,
  },
  title: {
    fontSize: 16,
    marginBottom: 10,
  },
  commentItem: {
    marginBottom: 15,
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 5,
  },
  authorInfo: {
    flex: 1,
    marginRight: 10,
  },
  commentAuthorName: {
    lineHeight: 20,
  },
  commentText: {
    fontSize: 14,
    marginBottom: 5,
  },
  commentDate: {
    fontSize: 12,
    color: '#888',
  },
  noComments: {
    textAlign: 'center',
    color: '#888',
    marginVertical: 10,
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  submitButton: {
    backgroundColor: '#007BFF',
    borderRadius: 5,
    padding: 10,
  },
  deleteButton: {
    padding: 5,
  },
});