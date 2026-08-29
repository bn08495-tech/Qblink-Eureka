/**
 * Canonical PUBLIC origin for anything a customer will ever open
 * (QR codes, shared join links, kiosk display links, pickup links).
 */
export const PUBLIC_SITE_URL = "https://qblink.vercel.app";

/** Origin that dynamically adapts to the current host every time, with production canonical fallback. */
export function getPublicOrigin(): string {
  const envUrl = import.meta.env.VITE_PUBLIC_SITE_URL as string | undefined;
  if (envUrl) return envUrl.replace(/\/$/, "");
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin;
  }
  return PUBLIC_SITE_URL;
}

/** Build a public customer URL, e.g. publicUrl(`/join/${id}`). */
export function publicUrl(path: string): string {
  return `${getPublicOrigin()}${path.startsWith("/") ? path : `/${path}`}`;
}
