/**
 * Resize an image file and convert it to a base64 JPEG data URL.
 * Used for compressing uploaded photos before storing in localStorage.
 */
export async function resizeImageToBase64(
  file: File,
  maxPx = 800,
): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas
        .getContext("2d")!
        .drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
      URL.revokeObjectURL(img.src);
    };
    img.src = URL.createObjectURL(file);
  });
}
