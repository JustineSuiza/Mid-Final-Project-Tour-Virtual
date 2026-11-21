import { Platform } from 'react-native';
import { launchImageLibrary } from 'react-native-image-picker';

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
  if (Platform.OS === 'web') {
    const files = await new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = multiple;
      input.onchange = () => resolve(Array.from(input.files || []));
      input.click();
    });
    const images = await Promise.all(files.map((file) => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error('Could not read the selected image.'));
      reader.readAsDataURL(file);
    })));
    return Promise.all(images.map((uri) => shrinkOnWeb(uri)));
  }

  const result = await launchImageLibrary({
    mediaType: 'photo',
    selectionLimit: multiple ? 0 : 1,
    quality: 0.4,
    includeBase64: true,
  });
  if (result.didCancel) return [];
  if (result.errorCode) {
    throw new Error(result.errorMessage || `Image selection failed (${result.errorCode}).`);
  }
  return (result.assets || []).map((asset) => (
    asset.base64 ? `data:${asset.type || 'image/jpeg'};base64,${asset.base64}` : asset.uri
  )).filter(Boolean);
}
