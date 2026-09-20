import { supabase } from '@/integrations/supabase/client';

const BUCKET_NAME = 'course-content';

/**
 * Course content should be stored as an object path. Older records may contain
 * a full public, authenticated, or signed Storage URL instead, so normalize
 * those values before asking Storage for a fresh signed URL.
 */
function normalizeCourseContentPath(filePath: string): string {
  const trimmedPath = filePath.trim();

  if (!/^https?:\/\//i.test(trimmedPath)) {
    return trimmedPath.replace(/^\/+/, '');
  }

  try {
    const url = new URL(trimmedPath);
    const decodedPath = decodeURIComponent(url.pathname);
    const storagePathMatch = decodedPath.match(
      /\/storage\/v1\/object\/(?:public|authenticated|sign)\/[^/]+\/(.+)$/
    );

    if (storagePathMatch?.[1]) {
      return storagePathMatch[1].replace(/^\/+/, '');
    }

    const bucketMarker = `/${BUCKET_NAME}/`;
    const bucketIndex = decodedPath.indexOf(bucketMarker);

    if (bucketIndex >= 0) {
      return decodedPath.slice(bucketIndex + bucketMarker.length).replace(/^\/+/, '');
    }
  } catch (error) {
    console.error('Failed to parse course content URL:', error);
  }

  return trimmedPath;
}

export interface UploadResult {
  path: string;
  publicUrl: string | null;
  signedUrl: string | null;
  fileSizeMb: number;
}

/**
 * Upload a course thumbnail to storage
 */
export async function uploadCourseThumbnail(
  file: File,
  courseId: string
): Promise<UploadResult> {
  const timestamp = Date.now();
  const ext = file.name.split('.').pop() || 'jpg';
  const filePath = `${courseId}/thumbnails/${timestamp}.${ext}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: true
    });

  if (error) {
    throw new Error(`Failed to upload thumbnail: ${error.message}`);
  }

  // Get signed URL for the thumbnail
  const { data: signedUrlData } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(data.path, 3600 * 24 * 7); // 7 days for thumbnails

  return {
    path: data.path,
    publicUrl: null,
    signedUrl: signedUrlData?.signedUrl || null,
    fileSizeMb: file.size / (1024 * 1024)
  };
}

/**
 * Upload a file to the course-content storage bucket
 */
export async function uploadCourseContent(
  file: File,
  courseId: string,
  contentType: 'pdf' | 'ppt'
): Promise<UploadResult> {
  // Generate unique file path
  const timestamp = Date.now();
  const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `${courseId}/${contentType}/${timestamp}_${sanitizedFileName}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  // Get signed URL (valid for 1 hour - will be refreshed when viewing)
  const { data: signedUrlData } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(data.path, 3600);

  return {
    path: data.path,
    publicUrl: null, // Bucket is private
    signedUrl: signedUrlData?.signedUrl || null,
    fileSizeMb: file.size / (1024 * 1024)
  };
}

/**
 * Get a signed URL for viewing content (short-lived for security)
 * The URL expires after the specified seconds (default 10 minutes)
 */
export async function getContentSignedUrl(
  filePath: string,
  expiresInSeconds: number = 600 // 10 minutes
): Promise<string | null> {
  const normalizedPath = normalizeCourseContentPath(filePath);

  // Preserve external URLs that are not Storage object URLs.
  if (/^https?:\/\//i.test(normalizedPath)) {
    return normalizedPath;
  }

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(normalizedPath, expiresInSeconds);

  if (error) {
    console.error('Failed to get signed URL:', error);
    return null;
  }

  return data.signedUrl;
}

/**
 * Download a file through a fresh signed URL. This avoids the authenticated
 * object endpoint used by storage.download(), which can be routed to a stale
 * or missing bucket on legacy/custom API domains.
 */
async function fetchAsBlob(url: string): Promise<Blob | null> {
  try {
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-store'
    });

    if (!response.ok) {
      const details = await response.text();
      console.error(`Failed to fetch signed course content [${response.status}]:`, details);
      return null;
    }

    return await response.blob();
  } catch (error) {
    console.error('Failed to fetch signed course content:', error);
    return null;
  }
}

export async function downloadCourseContent(filePath: string): Promise<Blob | null> {
  const signedUrl = await getContentSignedUrl(filePath, 600);
  const originalIsUrl = /^https?:\/\//i.test(filePath.trim());

  if (signedUrl) {
    const blob = await fetchAsBlob(signedUrl);
    if (blob) return blob;
  } else if (!originalIsUrl) {
    console.error('Failed to create a signed URL for course content');
  }

  // Legacy records may hold a full signed/public URL from another storage
  // project or custom domain. If the fresh signed URL is unavailable or the
  // fetch failed, fall back to fetching the stored URL directly.
  if (originalIsUrl && filePath.trim() !== signedUrl) {
    return await fetchAsBlob(filePath.trim());
  }

  return null;
}

/**
 * Delete a file from storage
 */
export async function deleteCourseContent(filePath: string): Promise<boolean> {
  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([filePath]);

  if (error) {
    console.error('Failed to delete file:', error);
    return false;
  }

  return true;
}

/**
 * List files in a course folder
 */
export async function listCourseFiles(courseId: string): Promise<{ name: string; path: string }[]> {
  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .list(courseId, {
      limit: 100,
      sortBy: { column: 'created_at', order: 'desc' }
    });

  if (error) {
    console.error('Failed to list files:', error);
    return [];
  }

  return data.map(file => ({
    name: file.name,
    path: `${courseId}/${file.name}`
  }));
}
