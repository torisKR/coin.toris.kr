import type { Metadata } from "next";
import { CollectionNav, CollectionFooter } from "@/components/CollectionChrome";
import { AnalyticsSettingsButton } from "@/components/SiteAnalytics";
export const metadata: Metadata = {
  title: "Privacy & Optional Analytics",
  description:
    "How optional Google Analytics works on Toris Coin and how to change your choice.",
  alternates: { canonical: "/privacy" },
};
export default function PrivacyPage() {
  return (
    <div className="collection-site">
      <CollectionNav />
      <main id="main" className="collection-privacy collection-width">
        <span className="collection-eyebrow">
          LAST UPDATED / OCTOBER 15, 2026
        </span>
        <h1>
          Privacy &<br />
          <span>your choices.</span>
        </h1>
        <p>
          Toris Coin is a public collection website. Browsing the coin pages and
          using the PEPEBear meme maker do not require an account or wallet
          connection.
        </p>
        <h2>Optional Google Analytics</h2>
        <p>
          If you choose “Allow analytics,” this site loads Google Analytics 4 to
          measure page visits and interactions such as coin selection,
          token-address copying, external-link clicks, meme downloads, and
          opening an X draft. Analytics can use cookies and process technical
          information about your browser, device, and visit. These measurements
          help us understand which coins and tools visitors explore.
        </p>
        <p>
          The site does not send your meme captions, downloaded image contents,
          wallet addresses, names, or email addresses as custom analytics
          parameters. Google Signals and advertising personalization are
          disabled in this implementation. Google processes analytics data
          according to its{" "}
          <a
            href="https://policies.google.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
          >
            Privacy Policy
          </a>
          .
        </p>
        <h2>Your choice</h2>
        <p>
          Google Analytics is not loaded until you allow it. Declining leaves
          all collection features available. Your analytics preference is stored
          in this browser’s local storage. You can change it using the button
          below or “Analytics settings” in the footer. Revoking permission stops
          custom measurement and clears this site’s Google Analytics cookies.
        </p>
        <AnalyticsSettingsButton />
        <h2>Meme studio & external sites</h2>
        <p>
          Meme editing and PNG generation happen in your browser. Clicking an
          external link opens a separate website with its own policies. Opening
          an X draft does not publish it automatically.
        </p>
      </main>
      <CollectionFooter />
    </div>
  );
}
