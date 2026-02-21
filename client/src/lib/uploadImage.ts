/**
 * Uploads an image file to Supabase Storage via the server API.
 * Returns the public URL of the uploaded image, or null on failure.
 */
export async function uploadImage(file: File): Promise<string | null> {
  const reader = new FileReader();
  const dataUrl = await new Promise<string>((resolve, reject) => {
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });

  const res = await fetch("/api/upload-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: dataUrl }),
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.message || `Upload failed (${res.status})`);
  }

  const { url } = await res.json();
  return url || null;
}
