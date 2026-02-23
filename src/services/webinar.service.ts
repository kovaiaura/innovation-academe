import { supabase } from '@/integrations/supabase/client';

export type MetaEventType = 'webinar' | 'seminar' | 'guest_lecture';

export interface Webinar {
  id: string;
  title: string;
  description: string | null;
  youtube_url: string | null;
  guest_name: string | null;
  guest_details: string | null;
  webinar_date: string;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  event_type: MetaEventType;
  thumbnail_url: string | null;
  gallery_urls: string[];
}

export interface WebinarFormData {
  title: string;
  description?: string;
  youtube_url?: string;
  guest_name?: string;
  guest_details?: string;
  webinar_date: string;
  event_type: MetaEventType;
  thumbnail_url?: string;
  gallery_urls?: string[];
}

export const EVENT_TYPE_LABELS: Record<MetaEventType, string> = {
  webinar: 'Webinar',
  seminar: 'Seminar',
  guest_lecture: 'Guest Lecture',
};

export const webinarService = {
  async getWebinars(): Promise<Webinar[]> {
    const { data, error } = await (supabase as any)
      .from('webinars')
      .select('*')
      .eq('is_active', true)
      .order('webinar_date', { ascending: false });
    
    if (error) throw error;
    return (data || []) as Webinar[];
  },

  async getAllWebinars(): Promise<Webinar[]> {
    const { data, error } = await (supabase as any)
      .from('webinars')
      .select('*')
      .order('webinar_date', { ascending: false });
    
    if (error) throw error;
    return (data || []) as Webinar[];
  },

  async getWebinar(id: string): Promise<Webinar | null> {
    const { data, error } = await (supabase as any)
      .from('webinars')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data as Webinar;
  },

  async createWebinar(webinar: WebinarFormData): Promise<Webinar> {
    const { data: user } = await supabase.auth.getUser();
    
    const { data, error } = await (supabase as any)
      .from('webinars')
      .insert({
        title: webinar.title,
        description: webinar.description || null,
        youtube_url: webinar.youtube_url || null,
        guest_name: webinar.guest_name || null,
        guest_details: webinar.guest_details || null,
        webinar_date: webinar.webinar_date,
        created_by: user?.user?.id,
        is_active: true,
        event_type: webinar.event_type,
        thumbnail_url: webinar.thumbnail_url || null,
        gallery_urls: webinar.gallery_urls || [],
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as Webinar;
  },

  async updateWebinar(id: string, webinar: Partial<WebinarFormData>): Promise<Webinar> {
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    if (webinar.title !== undefined) updateData.title = webinar.title;
    if (webinar.description !== undefined) updateData.description = webinar.description;
    if (webinar.youtube_url !== undefined) updateData.youtube_url = webinar.youtube_url || null;
    if (webinar.guest_name !== undefined) updateData.guest_name = webinar.guest_name;
    if (webinar.guest_details !== undefined) updateData.guest_details = webinar.guest_details;
    if (webinar.webinar_date !== undefined) updateData.webinar_date = webinar.webinar_date;
    if (webinar.event_type !== undefined) updateData.event_type = webinar.event_type;
    if (webinar.thumbnail_url !== undefined) updateData.thumbnail_url = webinar.thumbnail_url || null;
    if (webinar.gallery_urls !== undefined) updateData.gallery_urls = webinar.gallery_urls || [];

    const { data, error } = await (supabase as any)
      .from('webinars')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data as Webinar;
  },

  async deleteWebinar(id: string): Promise<void> {
    const { error } = await (supabase as any)
      .from('webinars')
      .update({ is_active: false })
      .eq('id', id);
    
    if (error) throw error;
  },

  async hardDeleteWebinar(id: string): Promise<void> {
    const { error } = await (supabase as any)
      .from('webinars')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  },

  async uploadImage(file: File, folder: string = 'webinar-images'): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { error } = await supabase.storage
      .from('event-files')
      .upload(fileName, file);
    
    if (error) throw error;
    
    const { data: urlData } = supabase.storage
      .from('event-files')
      .getPublicUrl(fileName);
    
    return urlData.publicUrl;
  },

  // Extract YouTube video ID from URL
  getYouTubeVideoId(url: string | null): string | null {
    if (!url) return null;
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /^([a-zA-Z0-9_-]{11})$/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  },

  // Get embed URL for YouTube video
  getEmbedUrl(url: string | null): string | null {
    if (!url) return null;
    const videoId = this.getYouTubeVideoId(url);
    if (!videoId) return null;
    return `https://www.youtube.com/embed/${videoId}`;
  }
};
