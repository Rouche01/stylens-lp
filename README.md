# GoStylens landing page

Static site for [gostylens.app](https://gostylens.app), deployed on Cloudflare Pages.

## PostHog analytics

The site uses the same PostHog project as the GoStylens mobile app. The project API key (`phc_...`) is loaded from `scripts/gostylens.config.js`, which is gitignored. The filename avoids `analytics` in the URL so ad blockers are less likely to block it during local dev.

### Local development

```bash
cp scripts/gostylens.config.example.js scripts/gostylens.config.js
```

Paste your Project API key from PostHog → **Project settings** → **Project API key**, or copy `POSTHOG_API_KEY` from the Flutter app `.env`.

If scripts fail to load locally with `ERR_BLOCKED_BY_CONTENT_BLOCKER`, disable your content blocker for `127.0.0.1` (Safari, Brave, uBlock, etc. block PostHog endpoints even on custom domains). The landing page only needs pageviews and a few custom events, so production tracking is unaffected for most visitors.

### Cloudflare Pages deploy

1. **Settings → Environment variables** — add for Production (and Preview if you want analytics on preview URLs):

   | Variable | Value |
   |----------|--------|
   | `POSTHOG_API_KEY` | Your `phc_...` project API key |
   | `POSTHOG_HOST` | `https://n.gostylens.com` (optional; this is the default) |

2. **Settings → Builds & deployments → Build configuration**:

   | Setting | Value |
   |---------|--------|
   | **Build command** | `bash scripts/generate-analytics-config.sh` |
   | **Build output directory** | `/` |

   The build command writes `scripts/gostylens.config.js` before deploy. The key stays out of git but is public in the browser (normal for PostHog client keys).

   If `gostylens.config.js` is missing in production, Cloudflare serves `index.html` for that URL and the browser logs a MIME type error (`text/html` is not executable). Check the deploy build log for `Wrote .../gostylens.config.js`.

3. **Verify after deploy**

   - Open `https://gostylens.app/scripts/gostylens.config.js` — should return JS, not 404.
   - Browse the site and check PostHog **Live events** for `$pageview` with `surface: landing_page`.

### Cookie consent

Analytics uses PostHog with `localStorage+cookie` persistence after the visitor accepts the banner. Before acceptance, no analytics cookies are set. If the visitor rejects, PostHog falls back to cookieless mode (`cookieless_mode: on_reject`).

**Consent banner by region:** On Cloudflare Pages, [`functions/_middleware.js`](functions/_middleware.js) sets a `gostylens_consent_required` cookie from `CF-IPCountry`. Visitors in the EU/EEA, UK, or Switzerland see the Accept/Reject banner. Everyone else is opted in automatically (no banner). Local dev without Cloudflare defaults to showing the banner.

**One-time PostHog project setting (required before deploy):** In PostHog → **Project settings**, enable **Cookieless mode**. Without this, events from visitors who reject cookies are ignored.

**Verify locally:**

1. Open the site in a private window — the consent banner should appear at the bottom (local dev has no geo cookie, so banner is shown).
2. Before clicking Accept, check DevTools → Application → Cookies — no `ph_*` cookie should be present.
3. Click **Accept analytics** — a `ph_*` PostHog cookie should appear; reload and confirm the banner stays hidden.
4. Clear site data, reload, click **Reject** — no `ph_*` cookie; events should still appear in PostHog Live (cookieless).
5. Navigate home → pricing → get after accepting — events should share the same `$session_id`.

**Verify geo auto-accept (production):** From a non-EU VPN or by setting `gostylens_consent_required=0` in DevTools, reload — banner should not appear and analytics should start immediately.
