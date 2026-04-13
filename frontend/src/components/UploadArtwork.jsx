import { supabase } from '../lib/supabase';
import client from '../api/client';
 
const uploadArtwork = async (file, formData, userId) => {
  // 1. Upload image directly to Supabase Storage
  const fileExt  = file.name.split('.').pop();
  const filePath = `${userId}/${Date.now()}.${fileExt}`;
 
  const { error: uploadError } = await supabase.storage
    .from('artworks')
    .upload(filePath, file, { cacheControl: '3600', upsert: false });
 
  if (uploadError) throw uploadError;
 
  // 2. Get the public URL
  const { data: { publicUrl } } = supabase.storage
    .from('artworks')
    .getPublicUrl(filePath);
 
  // 3. Save metadata to Express → Supabase DB
  const response = await client.post('/artworks', {
    ...formData,
    image_url: publicUrl
  });
 
  return response.data;
};