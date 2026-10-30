import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

// Browser photos can be several MB, so shrink them before they go into the database.
function shrinkOnWeb(uri, maxSide = 1280, quality = 0.7) {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.onload = () => {
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(uri);
    img.src = uri;
  });
}

// Returns photos as data URIs so they are stored inside the database on every platform.
export async function pickPhotos(multiple) {
  const res = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    allowsMultipleSelection: multiple,
    quality: 0.4,
    base64: Platform.OS !== 'web',
  });
  if (res.canceled) return [];
  if (Platform.OS === 'web') return Promise.all(res.assets.map((a) => shrinkOnWeb(a.uri)));
  return res.assets.map((a) => (a.base64 ? `data:${a.mimeType || 'image/jpeg'};base64,${a.base64}` : a.uri));
}
