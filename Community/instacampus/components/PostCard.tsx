import React from 'react';
import { StyleSheet, TouchableOpacity, Image } from 'react-native';
import { router } from 'expo-router';

import { Post } from '@/api/dashboard';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

type PostCardProps = {
  post: Post;
};

export function PostCard({ post }: PostCardProps) {
  const handlePress = () => {
    // You can implement navigation to a detail page here
    // router.push(`/post/${post._id}`);
  };

  return (
    <TouchableOpacity onPress={handlePress}>
      <ThemedView style={styles.card}>
        <ThemedView style={styles.header}>
          <ThemedText type="defaultSemiBold">{post.event_name}</ThemedText>
          <ThemedText>{new Date(post.created_at).toLocaleDateString()}</ThemedText>
        </ThemedView>

        {post.image_url && (
          <Image source={{ uri: post.image_url }} style={styles.image} />
        )}

        {post.content && (
          <ThemedText>{post.content}</ThemedText>
        )}

        <ThemedView style={styles.footer}>
          <ThemedText>Posted by: {post.user_name || 'Anonymous'}</ThemedText>
          <ThemedView style={styles.stats}>
            <ThemedText>{post.comments?.length || 0} comments</ThemedText>
            <ThemedText>{post.likes?.length || 0} likes</ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 4,
    marginVertical: 10,
  },
  footer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
});
