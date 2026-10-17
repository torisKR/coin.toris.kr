# Toris Coin GA4 measurement plan

Configured October 15, 2026 using **aside-browser** and **analytics** skills.

- Google account: ironjustlikethat@gmail.com (user selected).
- Analytics account: **Toris — 325693466**.
- Property: **coin — 559051022**.
- Web stream: **Toris Coin — 16130108173**, `https://coin.toris.kr`.
- Measurement ID: **G-ZXLWF2WZ3H** (public browser configuration, not a secret).
- Reporting timezone: South Korea GMT+09:00; currency KRW.
- Admin: https://analytics.google.com/analytics/web/?authuser=1#/a325693466p559051022/admin

## Decisions this data supports

Compare interest across PEBR, YETI and XMASR. Identify whether visitors reach a coin page, verify its listing/address, and use the PEBR meme maker. Treat these as content engagement, not token purchases or financial conversions.

| Event | Trigger | Parameters |
|---|---|---|
| page_view | Initial accepted visit or client pathname change | page_location, page_title, clean previous internal page_referrer |
| coin_viewed | Arrival at an individual coin landing | coin_symbol |
| coin_selected | A different gallery tab is selected | coin_symbol, selection_method (tab/keyboard) |
| outbound_link_clicked | An external link is clicked | coin_symbol when on a coin page, link_type, destination_host |
| mint_copied | Clipboard write succeeds | coin_symbol |
| meme_downloaded | PNG generated and download initiated | coin_symbol=PEBR, file_format=png |
| meme_share_opened | User opens X draft link | coin_symbol=PEBR, method=x_draft |

`coin_symbol` and `link_type` are registered event-scoped custom dimensions. They can take time to appear in standard reports. No purchase, revenue, signup, or key-event claim is configured for these interactions.

## Pageview and data-quality strategy

`send_page_view:false` in gtag configuration. The website sends explicit page views from the App Router pathname. Enhanced measurement browser-history page changes are **disabled**, preventing a second history-generated pageview. Enhanced page-load support is enabled but default config delivery is suppressed by `send_page_view:false`. Scroll and file download remain enabled.

Enhanced outbound-click measurement is **disabled**. It would otherwise transmit a complete X draft URL, including user-entered meme captions. Instead, a custom event only sends destination hostname and a fixed link classification, with no raw URL, caption, mint or wallet address. Internal page URLs retain only known UTM/template parameters. Localhost/preview hosts do not load the production Google tag.

Official implementation references:
- https://developers.google.com/analytics/devguides/collection/ga4/views
- https://developers.google.com/analytics/devguides/collection/ga4/single-page-applications
- https://developers.google.com/tag-platform/security/guides/consent

## Visitor choices

The Google script does not load before affirmative analytics permission. Allow/Decline have equally accessible controls. Choice persists in local storage and can be changed through the footer's Analytics settings. Consent Mode sets advertising storage, ad user data, and personalization to denied; analytics storage is granted only after permission. Revocation stops custom events and clears this host's GA cookies. Other site features continue to work when analytics is declined. Google Signals and ad personalization are disabled in the tag configuration.

Implementation: `components/SiteAnalytics.tsx`, `utils/analytics.ts`, and action-specific hooks in `CollectionGallery`, `CopyMint`, and `MemeStudio`.

## Promotion attribution

Example collection link: `https://coin.toris.kr/?utm_source=x&utm_medium=organic_social&utm_campaign=collection_launch`.
Example coin link: `https://coin.toris.kr/coin/YETI?utm_source=x&utm_medium=organic_social&utm_campaign=yeti_intro`.
Use lowercase campaign names. Do not put personal information in URLs or UTM values.

## Verification status

Property, exact account ID, stream URL/ID, measurement ID, event dimensions and enhanced-measurement switches were read back in the Analytics Admin UI. Live transport and report verification are recorded in the release appendix/artifacts after the website deployment; an Admin “no data received” setup banner alone is not evidence of a broken implementation or successful receipt.

### Public transport verification

`artifacts/analytics-qa.json`, started **2026-10-14T19:11:42.134Z**:

- All defined events were accepted by Google Analytics with **HTTP 204** and the exact measurement ID `G-ZXLWF2WZ3H`.
- Initial `page_view` and client navigation `page_view` were each sent once.
- `coin_selected`, `coin_viewed`, `mint_copied`, `meme_downloaded` and `meme_share_opened` were each sent once for their deliberate QA action. Two `outbound_link_clicked` events correspond to distinct listing and draft clicks.
- Before consent, no Google tag request, Analytics request, or `_ga` cookie was present.
- A deliberately entered private-caption sentinel did not appear in any captured Analytics payload.
- After permission was revoked, GA cookies were absent and subsequent internal navigation generated no custom view events.
- These were deliberate test visits, not evidence of organic users or promotional conversion performance.

Reproduce with `node artifacts/analytics-verify.mjs` (this sends a small set of real QA events to the production property after exercising the consent controls). Avoid unnecessary reruns to keep test traffic low.

### First Admin readback

The first post-deployment Aside readback of the exact `coin` property still showed **0 debug devices / 0 DebugView events**, with no visible Realtime events. Therefore HTTP 204 transport is confirmed, while report receipt was **not yet demonstrated by that first readback**. A consented diagnostic event with `debug_mode:true` also received HTTP 204, with analytics storage granted (`G101`) and a GA cookie created (`artifacts/ga4-debug-transport.json`). The cause of empty reports is not established by these observations. A bounded normal-browser check follows to distinguish automated QA traffic from ordinary browser behavior; no attribution result or organic traffic is claimed.

### Normal-browser report receipt confirmed

A single consented visit in normal Aside browser then selected YETI, opened its detail page and copied its address. In the exact `coin` property **559051022**, Realtime subsequently displayed:

- `page_view`: **2**, with the actual Toris Coin and Yeti page titles, one view each.
- `coin_selected`: **1**.
- `coin_viewed`: **1**.
- `mint_copied`: **1**.
- `first_visit`: **1** and `session_start`: **1**.

This confirms report-side receipt, beyond the earlier HTTP 204 transport evidence. These counts represent the deliberate QA visit, not organic audience growth. The earlier empty DebugView/Realtime observation is retained above as a dated verification stage, and is superseded for ordinary-browser receipt by this successful readback. The reason headless QA was absent from the initial report is not conclusively established; no production filter was disabled to force test visibility.

The read-only filter check showed `Internal Traffic` with action `Exclude` and state **Testing**. No filter was changed. Report receipt and page titles/counts are recorded in `artifacts/ga4-report-receipt.json` with `artifacts/ga4-realtime-receipt.png`.
