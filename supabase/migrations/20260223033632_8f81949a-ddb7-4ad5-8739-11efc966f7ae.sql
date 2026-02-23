
-- Add event_type, thumbnail_url, and gallery_urls to webinars table
ALTER TABLE public.webinars
ADD COLUMN IF NOT EXISTS event_type text NOT NULL DEFAULT 'webinar',
ADD COLUMN IF NOT EXISTS thumbnail_url text,
ADD COLUMN IF NOT EXISTS gallery_urls text[] DEFAULT '{}';

-- Make youtube_url nullable (seminars/guest lectures may not have it)
ALTER TABLE public.webinars ALTER COLUMN youtube_url DROP NOT NULL;
