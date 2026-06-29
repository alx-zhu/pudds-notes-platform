/**
 * Resize an image file and return a compressed JPEG `File`, ready to upload to
 * Storage (800px max edge, 0.82 quality).
 */
export const resizeImageToFile = async (
  file: File,
  maxPx = 800,
): Promise<File> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas
        .getContext("2d")!
        .drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(img.src);
      canvas.toBlob(
        (blob) => {
          if (!blob) return reject(new Error("Could not process image."));
          const name = file.name.replace(/\.\w+$/, "") + ".jpg";
          resolve(new File([blob], name, { type: "image/jpeg" }));
        },
        "image/jpeg",
        0.82,
      );
    };
    img.onerror = () => reject(new Error("Could not load image."));
    img.src = URL.createObjectURL(file);
  });
};

// CLEANUP(migration-002, 2026-06-28): only used by migration 002 — remove with it.
/**
 * Decode a base64 data-URL back into a `File`. Used by the photo migration to
 * turn legacy inline photos into uploadable files.
 */
export const dataUrlToFile = (dataUrl: string, name: string): File => {
  const [meta, b64] = dataUrl.split(",");
  const mime = /:(.*?);/.exec(meta)?.[1] ?? "image/jpeg";
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new File([bytes], name, { type: mime });
};
