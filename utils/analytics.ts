export const GA_MEASUREMENT_ID = "G-ZXLWF2WZ3H";
export const CONSENT_KEY = "toris-coin-analytics";
export type AnalyticsEvent =
  | "coin_selected"
  | "coin_viewed"
  | "outbound_link_clicked"
  | "mint_copied"
  | "meme_downloaded"
  | "meme_share_opened";
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}
export function trackEvent(
  event: AnalyticsEvent,
  properties: Record<string, string | number> = {},
) {
  if (typeof window === "undefined") return;
  try {
    if (localStorage.getItem(CONSENT_KEY) !== "granted") return;
    window.gtag?.("event", event, properties);
  } catch {
    /* Storage-restricted browsers can still use every site feature. */
  }
}
export function symbolFromPath(path: string) {
  return path.match(/^\/coin\/(PEBR|YETI|XMASR)(?:\/|$)/)?.[1];
}
