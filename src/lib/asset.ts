/**
 * Public files are referenced by a path with no leading slash so the same
 * build works at `/` (local, Docker) and at `/cover-studio/` (GitHub Pages).
 */
export function assetUrl(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\.?\//, '')}`
}
