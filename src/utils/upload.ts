import { supabase } from './supabase';

export const uploadImage = async (
  file: File, 
  username: string, 
  bucket: string = 'media',
  onProgress?: (progress: number) => void
): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${username}-${Date.now()}.${fileExt}`;
    
    // For small files, upload directly
    if (file.size < 5 * 1024 * 1024) { // 5MB
      onProgress?.(50);
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(fileName, file);
      
      if (error) throw error;
      onProgress?.(100);
      return fileName;
    }
    
    // For large files, use chunked upload simulation
    const chunkSize = 1024 * 1024; // 1MB chunks
    const totalChunks = Math.ceil(file.size / chunkSize);
    
    // Simulate chunked progress
    for (let i = 0; i < totalChunks; i++) {
      const progress = Math.round((i / totalChunks) * 90); // Up to 90%
      onProgress?.(progress);
      
      // Small delay to show progress
      if (i < totalChunks - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
    // Actual upload
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);
    
    if (error) throw error;
    onProgress?.(100);
    return fileName;
  } catch (error) {
    console.error('Upload error:', error);
    throw error;
  }
};

export const validateImageFile = (file: File): boolean => {
  const maxSize = 100 * 1024 * 1024; // 100MB for videos
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'video/mp4', 'video/webm', 'video/mov'];
  
  if (file.size > maxSize) {
    alert('File size must be less than 100MB');
    return false;
  }
  
  if (!allowedTypes.includes(file.type)) {
    alert('Only images (JPEG, PNG, WebP) and videos (MP4, WebM, MOV) are allowed');
    return false;
  }
  
  return true;
};