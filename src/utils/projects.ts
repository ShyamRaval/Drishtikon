import { projects, type Project } from "../data/projects";
import { getCloudinaryUrl } from "./cloudinary";

const CLOUDINARY_CLOUD_NAME = import.meta.env.PUBLIC_CLOUDINARY_CLOUD_NAME as string | undefined;
const CLOUDINARY_FOLDER = (import.meta.env.PUBLIC_CLOUDINARY_FOLDER as string | undefined) || "Drishtikon";
const CLOUDINARY_API_KEY = import.meta.env.CLOUDINARY_API_KEY as string | undefined;
const CLOUDINARY_API_SECRET = import.meta.env.CLOUDINARY_API_SECRET as string | undefined;

function normalizeLookupValue(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function stripKnownImageExtension(value: string): string {
  return value.replace(/\.(jpe?g|png|webp|avif|gif|bmp|tiff?)$/i, "");
}

function resolveThumbnailFromCloudinaryIds(
  imageIds: string[],
  thumbnailHint?: string
): string | null {
  if (imageIds.length === 0) return null;
  if (!thumbnailHint) return imageIds[0];

  // 1) Exact ID match first (preferred for manual control).
  if (imageIds.includes(thumbnailHint)) return thumbnailHint;

  // 2) Backward-compatible matching for legacy values like "01.jpg".
  const normalizedHint = normalizeLookupValue(stripKnownImageExtension(thumbnailHint));
  const normalizedIds = imageIds.map((id) => normalizeLookupValue(stripKnownImageExtension(id)));

  const exactNormalizedIndex = normalizedIds.findIndex((id) => id === normalizedHint);
  if (exactNormalizedIndex >= 0) return imageIds[exactNormalizedIndex];

  // 3) Prefix fallback handles Cloudinary suffixes, e.g. "01" -> "01_tpmtyk".
  const prefixedIndex = normalizedIds.findIndex((id) => id.startsWith(normalizedHint));
  if (prefixedIndex >= 0) return imageIds[prefixedIndex];

  return imageIds[0];
}

async function fetchCloudinaryResourcesByPrefix(prefix: string): Promise<{ public_id: string }[]> {
  const auth = btoa(`${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}`);
  const baseUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/resources/image/upload`;
  const resources: { public_id: string }[] = [];
  let nextCursor: string | undefined;

  for (let page = 0; page < 10; page++) {
    const url = new URL(baseUrl);
    url.searchParams.set("prefix", prefix);
    url.searchParams.set("max_results", "500");
    if (nextCursor) url.searchParams.set("next_cursor", nextCursor);

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Basic ${auth}` },
    });

    if (!response.ok) {
      return [];
    }

    const payload = (await response.json()) as {
      resources?: { public_id: string }[];
      next_cursor?: string;
    };

    resources.push(...(payload.resources ?? []));
    nextCursor = payload.next_cursor;
    if (!nextCursor) break;
  }

  return resources;
}

/**
 * Get all projects from metadata
 */
export function getAllProjects(): Project[] {
  return projects;
}

/**
 * Get a single project by slug
 */
export function getProjectBySlug(slug: string): Project | undefined {
  return projects.find((project) => project.slug === slug);
}

export type ProjectWithDynamicImages = Project & { images: string[] };

/**
 * Get project image public IDs from Cloudinary folder.
 * Returns empty array when Cloudinary credentials are unavailable.
 */
export async function getProjectImagesFromCloudinary(slug: string): Promise<string[]> {
  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return [];
  }

  const exactResources = await fetchCloudinaryResourcesByPrefix(`${CLOUDINARY_FOLDER}/${slug}/`);
  if (exactResources.length > 0) {
    return exactResources
      .map((resource) => resource.public_id.split("/").pop())
      .filter((name): name is string => Boolean(name));
  }

  // Fallback: resolve folder with normalized matching (handles minor naming differences).
  const allFolderResources = await fetchCloudinaryResourcesByPrefix(`${CLOUDINARY_FOLDER}/`);
  const normalizedSlug = normalizeLookupValue(slug);
  const matchedResources = allFolderResources.filter((resource) => {
    const parts = resource.public_id.split("/");
    if (parts.length < 3) return false;
    return normalizeLookupValue(parts[1] ?? "") === normalizedSlug;
  });

  return matchedResources
    .map((resource) => resource.public_id.split("/").pop())
    .filter((name): name is string => Boolean(name));
}

/**
 * Returns project metadata with Cloudinary-fetched image IDs as dynamic images array.
 */
export async function getProjectBySlugWithDynamicImages(
  slug: string
): Promise<ProjectWithDynamicImages | undefined> {
  const project = getProjectBySlug(slug);
  if (!project) return undefined;
  const images = await getProjectImagesFromCloudinary(slug);
  return { ...project, images };
}

/**
 * Resolve project thumbnail from Cloudinary-fetched image IDs.
 * Uses metadata thumbnail if present in fetched images, else first image.
 */
export async function getProjectThumbnailFromCloudinary(slug: string): Promise<string | null> {
  const project = getProjectBySlug(slug);
  const images = await getProjectImagesFromCloudinary(slug);

  return resolveThumbnailFromCloudinaryIds(images, project?.thumbnail);
}

/**
 * Get full image URL for a project image.
 * Uses Cloudinary when PUBLIC_CLOUDINARY_CLOUD_NAME is set.
 */
export function getProjectImagePath(
  slug: string,
  filename: string,
  options?: { thumbnail?: boolean }
): string {
  if (!CLOUDINARY_CLOUD_NAME) {
    throw new Error("PUBLIC_CLOUDINARY_CLOUD_NAME is required for cloud-only image loading.");
  }

  return getCloudinaryUrl(CLOUDINARY_CLOUD_NAME, slug, filename, {
    width: options?.thumbnail ? 600 : 1200,
    quality: "auto",
    format: "auto",
  });
}
