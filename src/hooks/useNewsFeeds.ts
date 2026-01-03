import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  getPosts,
  getPublishedPosts,
  createPost,
  updatePost,
  deletePost,
  publishPost,
  archivePost,
  uploadImage,
  deleteImage,
  PostFilters,
  CreatePostData,
  UpdatePostData,
  NewsFeedPost,
} from "@/services/newsFeed.service";
import { useToast } from "@/hooks/use-toast";

// Hook for fetching all posts (admin view)
export function useNewsFeeds(filters: PostFilters = {}) {
  return useQuery({
    queryKey: ['news-feeds', filters],
    queryFn: () => getPosts(filters),
  });
}

// Hook for fetching published posts (viewer roles)
export function usePublishedNewsFeeds(filters: PostFilters = {}) {
  return useQuery({
    queryKey: ['published-news-feeds', filters],
    queryFn: () => getPublishedPosts(filters),
  });
}

// Hook for real-time news feeds subscription
export function useRealtimeNewsFeeds() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('news-feeds-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'news_and_feeds',
        },
        () => {
          // Invalidate both admin and published queries
          queryClient.invalidateQueries({ queryKey: ['news-feeds'] });
          queryClient.invalidateQueries({ queryKey: ['published-news-feeds'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);
}

// Mutations hook for all CRUD operations
export function useNewsFeedMutations() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const createMutation = useMutation({
    mutationFn: (data: CreatePostData) => createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-feeds'] });
      toast({
        title: "Success",
        description: "Post created successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePostData }) => updatePost(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-feeds'] });
      queryClient.invalidateQueries({ queryKey: ['published-news-feeds'] });
      toast({
        title: "Success",
        description: "Post updated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deletePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-feeds'] });
      queryClient.invalidateQueries({ queryKey: ['published-news-feeds'] });
      toast({
        title: "Success",
        description: "Post deleted successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const publishMutation = useMutation({
    mutationFn: publishPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-feeds'] });
      queryClient.invalidateQueries({ queryKey: ['published-news-feeds'] });
      toast({
        title: "Success",
        description: "Post published successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const archiveMutation = useMutation({
    mutationFn: archivePost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news-feeds'] });
      queryClient.invalidateQueries({ queryKey: ['published-news-feeds'] });
      toast({
        title: "Success",
        description: "Post archived successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const uploadImageMutation = useMutation({
    mutationFn: uploadImage,
    onError: (error: Error) => {
      toast({
        title: "Error uploading image",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteImageMutation = useMutation({
    mutationFn: deleteImage,
  });

  return {
    createPost: createMutation,
    updatePost: updateMutation,
    deletePost: deleteMutation,
    publishPost: publishMutation,
    archivePost: archiveMutation,
    uploadImage: uploadImageMutation,
    deleteImage: deleteImageMutation,
  };
}
