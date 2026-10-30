/**
 * Centralized API configuration.
 *
 * In production deployments (e.g. Vercel frontend + Render backend),
 * VITE_API_URL should be configured in Vercel to point to your backend:
 * e.g. https://ai-disaster-response-backend.onrender.com
 *
 * In local development (or when VITE_API_URL is unset), this defaults
 * to an empty string, preserving relative routes like `/api/...`.
 */
const rawApiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.trim() || '';

// Strip any trailing slash so paths like `/api/state` join cleanly
export const API_BASE_URL = rawApiUrl.replace(/\/+$/, '');

/**
 * Returns a fully-qualified or root-relative URL for any given API path.
 * Examples:
 *   apiUrl('/api/state') -> 'https://ai-disaster-response-backend.onrender.com/api/state'
 *   apiUrl('/api/events') -> 'https://ai-disaster-response-backend.onrender.com/api/events'
 */
export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return API_BASE_URL ? `${API_BASE_URL}${normalizedPath}` : normalizedPath;
}
