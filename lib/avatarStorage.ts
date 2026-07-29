import { decode } from 'base64-arraybuffer';
import { supabase } from './supabase';

const BUCKET = 'avatars';

// Хранит только путь в Storage (не URL) — бакет приватный, реальную ссылку для показа
// нужно каждый раз запрашивать заново через createSignedUrl (она с истечением срока).
export async function uploadAvatarPhoto(userId: string, base64Jpeg: string): Promise<string> {
  const path = `${userId}/${Date.now()}.jpg`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, decode(base64Jpeg), {
    contentType: 'image/jpeg',
    upsert: true,
  });
  if (error) throw error;
  return path;
}

export async function getAvatarSignedUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, 3600);
  if (error) throw error;
  return data.signedUrl;
}
