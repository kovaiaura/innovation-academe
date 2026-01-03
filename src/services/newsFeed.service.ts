import { supabase } from "@/integrations/supabase/client";

export type PostType = 'news' | 'feed';
export type PostStatus = 'draft' | 'published' | 'archived';
export type PostPriority = 'low' | 'medium' | 'high';
export type TargetAudience = 'all' | 'management' | 'officer' | 'student' | 'teacher';

export interface NewsFeedPost {
  id: string;
  type: PostType;
  title: string;
  content: string;
  image_url: string | null;
  status: PostStatus;
  priority: PostPriority;
  target_audience: TargetAudience[];
  institution_id: string | null;
  tags: string[];
  views_count: number;
  published_at: string | null;
  expires_at: string | null;
  created_by: string | null;
  created_by_name: string;
  created_at: string;
  updated_at: string;
}

export interface CreatePostData {
  type: PostType;
  title: string;
  content: string;
  image_url?: string;
  status?: PostStatus;
  priority?: PostPriority;
  target_audience?: TargetAudience[];
  institution_id?: string;
  tags?: string[];
  expires_at?: string;
  created_by: string;
  created_by_name: string;
}

export interface UpdatePostData {
  type?: PostType;
  title?: string;
  content?: string;
  image_url?: string | null;
  status?: PostStatus;
  priority?: PostPriority;
  target_audience?: TargetAudience[];
  institution_id?: string | null;
  tags?: string[];
  expires_at?: string | null;
}

export interface PostFilters {
  type?: PostType;
  status?: PostStatus;
  search?: string;
  limit?: number;
  offset?: number;
}

// Create a new post
export async function createPost(data: CreatePostData): Promise<NewsFeedPost> {
  const { data: post, error } = await supabase
    .from('news_and_feeds')
    .insert({
      type: data.type,
      title: data.title,
      content: data.content,
      image_url: data.image_url,
      status: data.status || 'draft',
      priority: data.priority || 'medium',
      target_audience: data.target_audience || ['all'],
      institution_id: data.institution_id,
      tags: data.tags || [],
      expires_at: data.expires_at,
      created_by: data.created_by,
      created_by_name: data.created_by_name,
    })
    .select()
    .single();

  if (error) throw error;
  return post as NewsFeedPost;
}

// Update a post
export async function updatePost(id: string, data: UpdatePostData): Promise<NewsFeedPost> {
  const { data: post, error } = await supabase
    .from('news_and_feeds')
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return post as NewsFeedPost;
}

// Delete a post
export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase
    .from('news_and_feeds')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

// Publish a post
export async function publishPost(id: string): Promise<NewsFeedPost> {
  const { data: post, error } = await supabase
    .from('news_and_feeds')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return post as NewsFeedPost;
}

// Archive a post
export async function archivePost(id: string): Promise<NewsFeedPost> {
  const { data: post, error } = await supabase
    .from('news_and_feeds')
    .update({
      status: 'archived',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return post as NewsFeedPost;
}

// Get all posts (for admins)
export async function getPosts(filters: PostFilters = {}): Promise<NewsFeedPost[]> {
  let query = supabase
    .from('news_and_feeds')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters.type) {
    query = query.eq('type', filters.type);
  }

  if (filters.status) {
    query = query.eq('status', filters.status);
  }

  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  if (filters.offset) {
    query = query.range(filters.offset, filters.offset + (filters.limit || 50) - 1);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data || []) as NewsFeedPost[];
}

// Get published posts (for viewer roles)
export async function getPublishedPosts(filters: PostFilters = {}): Promise<NewsFeedPost[]> {
  let query = supabase
    .from('news_and_feeds')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  if (filters.type) {
    query = query.eq('type', filters.type);
  }

  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
  }

  if (filters.limit) {
    query = query.limit(filters.limit);
  }

  const { data, error } = await query;

  if (error) throw error;
  return (data || []) as NewsFeedPost[];
}

// Upload image to storage
export async function uploadImage(file: File): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
  const filePath = `posts/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('news-feeds-images')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data } = supabase.storage
    .from('news-feeds-images')
    .getPublicUrl(filePath);

  return data.publicUrl;
}

// Delete image from storage
export async function deleteImage(imageUrl: string): Promise<void> {
  const path = imageUrl.split('/news-feeds-images/')[1];
  if (path) {
    const { error } = await supabase.storage
      .from('news-feeds-images')
      .remove([path]);
    if (error) throw error;
  }
}

// Increment view count - using direct SQL increment
export async function incrementViews(id: string): Promise<void> {
  const { data: post } = await supabase
    .from('news_and_feeds')
    .select('views_count')
    .eq('id', id)
    .single();
  
  if (post) {
    await supabase
      .from('news_and_feeds')
      .update({ views_count: (post.views_count || 0) + 1 })
      .eq('id', id);
  }
}
