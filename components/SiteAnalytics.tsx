"use client";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  CONSENT_KEY,
  GA_MEASUREMENT_ID,
  symbolFromPath,
  trackEvent,
} from "@/utils/analytics";

const CHOICE_EVENT = "toris-analytics-choice";
function subscribe(callback: () => void) {
  window.addEventListener(CHOICE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CHOICE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}
let volatileChoice: string | null = null;
function getChoice() {
  try {
    return localStorage.getItem(CONSENT_KEY) || volatileChoice;
  } catch {
    return volatileChoice;
  }
}
function setChoice(value: "granted" | "denied") {
  volatileChoice = value;
  try {
    localStorage.setItem(CONSENT_KEY, value);
  } catch {}
  window.dispatchEvent(new Event(CHOICE_EVENT));
}
export function AnalyticsSettingsButton() {
  return (
    <button
      type="button"
      className="analytics-settings"
      onClick={() =>
        window.dispatchEvent(new Event("toris-analytics-settings"))
      }
    >
      Analytics settings
    </button>
  );
}
export function SiteAnalytics() {
  const pathname = usePathname();
  const isEmbed = pathname.startsWith("/embed/");
  const consent = useSyncExternalStore(subscribe, getChoice, () => "pending");
  const [settings, setSettings] = useState(false);
  const lastPage = useRef("");
  const initialized = useRef(false);
  useEffect(() => {
    const open = () => setSettings(true);
    window.addEventListener("toris-analytics-settings", open);
    return () => window.removeEventListener("toris-analytics-settings", open);
  }, []);
  useEffect(() => {
    // Local previews never send traffic to the production property.
    if (isEmbed || location.hostname !== "coin.toris.kr") return;
    if (consent !== "granted") {
      window.gtag?.("consent", "update", {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
      lastPage.current = "";
      // Remove this site's GA cookies when an existing choice is revoked.
      if (consent === "denied")
        document.cookie.split(";").forEach((cookie) => {
          const name = cookie.split("=")[0].trim();
          if (name === "_ga" || name.startsWith("_ga_"))
            for (const domain of ["", ";domain=coin.toris.kr"])
              document.cookie = `${name}=;max-age=0;path=/${domain};SameSite=Lax;Secure`;
        });
      return;
    }
    if (!initialized.current) {
      window.dataLayer = window.dataLayer || [];
      // Google tag commands must be queued as Arguments objects, not dataLayer arrays.
      window.gtag = function () {
        // eslint-disable-next-line prefer-rest-params -- gtag.js consumes Arguments command objects.
        window.dataLayer!.push(arguments);
      };
      window.gtag("consent", "default", {
        analytics_storage: "denied",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
      window.gtag("js", new Date());
      window.gtag("consent", "update", {
        analytics_storage: "granted",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      });
      window.gtag("config", GA_MEASUREMENT_ID, {
        send_page_view: false,
        allow_google_signals: false,
        allow_ad_personalization_signals: false,
        cookie_domain: "coin.toris.kr",
      });
      const script = document.createElement("script");
      script.id = "toris-ga4";
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
      document.head.appendChild(script);
      initialized.current = true;
    } else window.gtag?.("consent", "update", { analytics_storage: "granted" });
  }, [consent, isEmbed]);
  useEffect(() => {
    if (
      isEmbed ||
      consent !== "granted" ||
      location.hostname !== "coin.toris.kr" ||
      !initialized.current ||
      lastPage.current === pathname
    )
      return;
    const frame = requestAnimationFrame(() => {
      const query = new URLSearchParams();
      const incoming = new URLSearchParams(location.search);
      for (const name of [
        "utm_source",
        "utm_medium",
        "utm_campaign",
        "utm_content",
        "utm_term",
        "template",
      ]) {
        const value = incoming.get(name);
        if (value) query.set(name, value.slice(0, 100));
      }
      const cleanUrl = `${location.origin}${pathname}${query.size ? `?${query}` : ""}`;
      window.gtag?.("event", "page_view", {
        page_location: cleanUrl,
        page_title: document.title,
        ...(lastPage.current
          ? { page_referrer: `${location.origin}${lastPage.current}` }
          : {}),
      });
      const symbol = symbolFromPath(pathname);
      if (symbol && pathname === `/coin/${symbol}`)
        trackEvent("coin_viewed", { coin_symbol: symbol });
      lastPage.current = pathname;
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname, consent, isEmbed]);
  useEffect(() => {
    if (isEmbed || consent !== "granted") return;
    const click = (event: MouseEvent) => {
      const link = (event.target as Element)?.closest?.(
        "a[href]",
      ) as HTMLAnchorElement | null;
      if (!link) return;
      let url: URL;
      try {
        url = new URL(link.href);
      } catch {
        return;
      }
      if (
        url.origin === location.origin ||
        !["http:", "https:"].includes(url.protocol)
      )
        return;
      const linkType =
        url.hostname === "pump.fun"
          ? url.pathname.startsWith("/profile")
            ? "creator_profile"
            : "pump_listing"
          : url.hostname === "solscan.io"
            ? "explorer"
            : ["x.com", "twitter.com"].includes(url.hostname)
              ? "social"
              : "other";
      trackEvent("outbound_link_clicked", {
        link_type: linkType,
        destination_host: url.hostname,
        ...(symbolFromPath(pathname)
          ? { coin_symbol: symbolFromPath(pathname)! }
          : {}),
      });
      // Studio share intent is tracked by the editor with its active coin.
      // Keeping it out of this generic handler prevents duplicate events.
    };
    document.addEventListener("click", click);
    return () => document.removeEventListener("click", click);
  }, [consent, pathname, isEmbed]);
  if (isEmbed) return null;
  const show = consent !== "pending" && (consent === null || settings);
  return show ? (
    <aside
      className="analytics-choice"
      aria-label="Optional analytics preferences"
    >
      <div>
        <strong>A little insight helps us improve.</strong>
        <p>
          Allow optional Google Analytics to measure visits and interactions?
          Your choice won’t affect the collection.{" "}
          <Link href="/privacy">Privacy details</Link>
        </p>
      </div>
      <div className="analytics-choice-actions">
        <button
          onClick={() => {
            setChoice("denied");
            setSettings(false);
          }}
        >
          Decline
        </button>
        <button
          className="analytics-allow"
          onClick={() => {
            setChoice("granted");
            setSettings(false);
          }}
        >
          Allow analytics
        </button>
        {settings && consent !== null && (
          <button
            aria-label="Close analytics settings"
            onClick={() => setSettings(false)}
          >
            ×
          </button>
        )}
      </div>
    </aside>
  ) : null;
}
