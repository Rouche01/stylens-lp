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

3. **Verify after deploy**

   - Open `https://gostylens.app/scripts/gostylens.config.js` — should return JS, not 404.
   - Browse the site and check PostHog **Live events** for `$pageview` with `surface: landing_page`.
