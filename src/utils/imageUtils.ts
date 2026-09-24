export interface ProcessedImageResult {
  dataUrl: string;
  aspectRatio: 'square' | 'portrait' | 'landscape';
}

export function processImageFile(
  file: File,
  maxWidth = 1400,
  maxHeight = 1400,
  quality = 0.86
): Promise<ProcessedImageResult> {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      return reject(new Error('File is not an image'));
    }

    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));

    reader.onload = (event) => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to load image data'));

      img.onload = () => {
        let width = img.naturalWidth || img.width;
        let height = img.naturalHeight || img.height;

        let aspectRatio: 'square' | 'portrait' | 'landscape' = 'landscape';
        const ratio = width / height;
        if (ratio > 1.15) {
          aspectRatio = 'landscape';
        } else if (ratio < 0.88) {
          aspectRatio = 'portrait';
        } else {
          aspectRatio = 'square';
        }

        // Scale down if larger than maximum dimensions
        if (width > maxWidth || height > maxHeight) {
          if (width / height > maxWidth / maxHeight) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve({
            dataUrl: event.target?.result as string,
            aspectRatio,
          });
        }

        // Crisp render
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to webp or jpeg
        const mime = 'image/jpeg';
        const dataUrl = canvas.toDataURL(mime, quality);

        resolve({ dataUrl, aspectRatio });
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}
