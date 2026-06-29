/**
 * Cloudinary URL builder for Drishtikon project images.
 *
 * Path construction: <folder>/<project-slug>/<filename-without-ext>
 * Set PUBLIC_CLOUDINARY_FOLDER in .env (default: Drishtikon).
 * Set PUBLIC_CLOUDINARY_USE_UNDERSCORES=true if your public_ids use _ instead of spaces.
 *
 * To find the correct format: Cloudinary Console → Media Library → click an image → copy URL.
 * The part after /upload/ is the public_id. Adjust env vars to match.
 */

function getPathSegment(value: string, useUnderscores: boolean): string {
  const normalized = useUnderscores ? value.replace(/\s+/g, "_") : value;
  return encodeURIComponent(normalized);
}

function stripImageExtension(value: string): string {
  // Only strip known image extensions; keep dots that are part of Cloudinary public IDs.
  return value.replace(/\.(jpe?g|png|webp|avif|gif|bmp|tiff?)$/i, "");
}

export function getCloudinaryUrl(
  cloudName: string,
  projectSlug: string,
  filename: string,
  options?: {
    /** Width in pixels (e.g. 800 for thumbnails, 1200 for gallery) */
    width?: number;
    /** Quality: "auto" lets Cloudinary optimize */
    quality?: "auto" | number;
    /** Format: "auto" serves WebP/AVIF when supported */
    format?: "auto" | "webp" | "jpg" | "png";
    /** Custom public_id (overrides path construction) */
    publicId?: string;
  }
): string {
  const useUnderscores = import.meta.env.PUBLIC_CLOUDINARY_USE_UNDERSCORES === "true";
  const baseFolder = (import.meta.env.PUBLIC_CLOUDINARY_FOLDER as string) || "Drishtikon";

  // Cloudinary public_id must NOT include file extension.
  // Important: keep internal dots in IDs like "...1.39.45_PM_qssanq".
  const nameWithoutExt = stripImageExtension(filename);

  const pathParts =
    baseFolder === ""
      ? [getPathSegment(projectSlug, useUnderscores), getPathSegment(nameWithoutExt, useUnderscores)]
      : [
          getPathSegment(baseFolder, useUnderscores),
          getPathSegment(projectSlug, useUnderscores),
          getPathSegment(nameWithoutExt, useUnderscores),
        ];

  const publicId = options?.publicId ?? pathParts.join("/");

  const transforms: string[] = [];
  if (options?.width) transforms.push(`w_${options.width}`);
  if (options?.quality) transforms.push(options.quality === "auto" ? "q_auto" : `q_${options.quality}`);
  if (options?.format) transforms.push(options.format === "auto" ? "f_auto" : `f_${options.format}`);

  const transformStr = transforms.length > 0 ? `${transforms.join(",")}/` : "";

  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformStr}${publicId}`;
}
