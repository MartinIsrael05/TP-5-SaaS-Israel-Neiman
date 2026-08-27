import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { getClientStorage } from "@/lib/firebase/client";

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_IMAGE_SIZE = 2 * 1024 * 1024;

function getExtension(fileName) {
  return fileName.split(".").pop()?.toLowerCase() || "jpg";
}

function cleanSegment(value, fallback) {
  return String(value || fallback)
    .trim()
    .replace(/^\/+|\/+$/g, "")
    .replace(/[^a-zA-Z0-9_-]/g, "-");
}

export async function uploadEntityImage({
  file,
  userId,
  entity = "items",
  itemId = "uploads",
}) {
  if (!file || file.size === 0) {
    return null;
  }

  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("La imagen debe ser JPG, PNG, WEBP o GIF.");
  }

  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("La imagen no puede superar los 2 MB.");
  }

  const safeEntity = cleanSegment(entity, "items");
  const safeUserId = cleanSegment(userId, "user");
  const safeItemId = cleanSegment(itemId, "uploads");
  const imagePath = `${safeEntity}/${safeUserId}/${safeItemId}/${Date.now()}.${getExtension(file.name)}`;
  const imageRef = ref(getClientStorage(), imagePath);

  await uploadBytes(imageRef, file, { contentType: file.type });

  return {
    imagePath,
    imageUrl: await getDownloadURL(imageRef),
  };
}
