/**
 * Concatenates a base URL with a path, ensuring no double slashes.
 * @param path The relative path (e.g., '/images/example.jpg')
 * @returns A well-formed URL string.
 */
export function getStaticUrl<T extends string | undefined>(path?: T): T extends string ? string : undefined {
    const base = '/api/static';

    if (path === undefined) {
        // Return undefined if the input is undefined
        return undefined as T extends string ? never : undefined;
    }

    // Ensure base ends without a slash and path starts with one
    const sanitizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
    const sanitizedPath = path.startsWith('/') ? path : '/' + path;

    return (sanitizedBase + sanitizedPath) as T extends string ? string : undefined;
}
