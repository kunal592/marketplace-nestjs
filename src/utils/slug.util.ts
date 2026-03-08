/**
 * Generate a URL-friendly slug from a string.
 * Handles unicode characters, multiple spaces, and special characters.
 *
 * @example generateSlug("Red T-Shirt XL") → "red-t-shirt-xl"
 * @example generateSlug("iPhone 15 Pro Max") → "iphone-15-pro-max"
 */
export function generateSlug(text: string): string {
    return text
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')   // Remove special characters
        .replace(/[\s_]+/g, '-')     // Replace spaces / underscores with hyphens
        .replace(/-+/g, '-')         // Collapse multiple hyphens
        .replace(/^-+|-+$/g, '');    // Remove leading/trailing hyphens
}

/**
 * Generate a unique slug by appending a random suffix.
 */
export function generateUniqueSlug(text: string): string {
    const base = generateSlug(text);
    const suffix = Math.random().toString(36).substring(2, 8);
    return `${base}-${suffix}`;
}
