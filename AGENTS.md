# AGENTS.md — stylens-lp

Guidance for AI agents working on the GoStylens marketing site.

## What this is

Static landing page for **GoStylens** at [gostylens.app](https://gostylens.app). Entity: **Stylens Lab LLC**.

Deployed on **Cloudflare Pages** (no framework, no npm build). Sibling repos: `stylens` (Flutter app), `stylens-lite-api` (API).

## Stack

| Piece | Detail |
|-------|--------|
| Pages | Plain HTML (`index.html`, `pricing.html`, `get.html`, legal pages) |
| CSS | `styles/globals.css` tokens + page CSS; fonts Clash Display + Metropolis |
| JS | Vanilla IIFEs in `scripts/` (`defer` order matters) |
| Edge | `functions/_middleware.js` (store redirects + consent geo cookie) |
| Analytics | PostHog via `scripts/gostylens.js` + gitignored `gostylens.config.js` |
| Deep links | `.well-known/apple-app-site-association`, `.well-known/assetlinks.json` |

## Layout

```
index.html, pricing.html, get.html, privacy.html, terms.html, support.html
assets/          # logos + phone screenshots (match hero frame size ~480×1038)
fonts/           # Clash Display + Metropolis (.otf — case-sensitive on deploy)
styles/          # globals.css, pricing.css, legal.css, modal.css, consent.css
scripts/         # gostylens.js, consent.js, modal.js, reveal.js, generate-analytics-config.sh
functions/       # Cloudflare Pages Functions middleware
.well-known/     # Universal Links / App Links association files
_headers         # Content-Type for .well-known JSON
_routes.json     # Exclude /.well-known/* from Functions
```

## Local development

- Serve the repo root with any static server (e.g. Live Server). Middleware and geo consent only run on Cloudflare Pages.
- Analytics config (gitignored):

```bash
cp scripts/gostylens.config.example.js scripts/gostylens.config.js
# set apiKey to phc_... (same PostHog project as the Flutter app)
```

- Host default: `https://n.gostylens.com` (PostHog reverse proxy).

## Deploy (Cloudflare Pages)

| Setting | Value |
|---------|--------|
| Build command | `bash scripts/generate-analytics-config.sh` |
| Build output directory | `/` |
| Env | `POSTHOG_API_KEY` (`phc_...`); optional `POSTHOG_HOST` |

Without the env var + build command, `gostylens.config.js` is missing in production and Cloudflare SPA-fallback serves HTML → MIME errors.

Human-facing deploy docs: [README.md](README.md).

## Conventions agents must follow

### Design

- Preserve the existing brand: soft warm/cream backgrounds, green CTA (`--cta`), Clash Display headlines, Metropolis body. Tokens live in `styles/globals.css`.
- Landing hero: brand-first, full-bleed phone visuals, one headline + one supporting line + CTAs. Avoid card clutter in the hero.
- Phone screenshots: keep dimensions consistent with existing assets (~480×1038) so frames align.
- Font URLs are case-sensitive on Cloudflare Linux (`Metropolis-SemiBold.otf`, not `Semibold`).

### HTML / CSS / JS

- Prefer editing existing page CSS or small shared stylesheets over introducing a build tool or framework.
- Keep script load order: config → `gostylens.js` → `consent.js` → page scripts (`modal.js`, etc.).
- Avoid filenames containing `analytics` in public URLs (ad blockers). Use `gostylens.*` names.
- Do not commit `scripts/gostylens.config.js`.

### Analytics events

Use `window.gostylensAnalytics.capture(event, props)`. Existing taxonomy (snake_case):

| Event | When |
|-------|------|
| `$pageview` | Automatic |
| `download_cta_clicked` | Get-app CTAs |
| `store_modal_opened` | Desktop store chooser |
| `store_link_clicked` | App Store / Play (`store`: `ios` \| `android`) |
| `pricing_faq_opened` | Pricing FAQ open |

Super-properties: `surface: landing_page`, `page_name`. Register new events consistently; do not enable session replay on the LP.

### Consent

- `scripts/consent.js` + `styles/consent.css` gate PostHog cookies.
- Middleware sets `gostylens_consent_required` from `CF-IPCountry` (EU/EEA/UK/CH → banner). Locally, banner shows by default.
- PostHog project must have **Cookieless mode** enabled for reject path to work.

### Store / get flow

- Store URLs are duplicated in `scripts/modal.js` and `functions/_middleware.js` — update both when changing App Store / Play links.
- `/get`, `/get.html`, `?download=1`, `?get=1` → mobile store redirect; desktop → `get.html`.

### Deep links

- Do not redirect or wrap `/.well-known/*` (excluded in `_routes.json`; middleware short-circuits).
- Keep `_headers` Content-Type `application/json` for AASA and assetlinks.
- Marketing paths (`/`, `/pricing`, legal) stay in the browser; app paths are claimed in association files.

## What not to do

- Do not add React/Vite/npm unless explicitly requested — this is intentionally static.
- Do not put secrets in the repo. `phc_` Project API Key is public-by-design for client SDKs; still keep it out of git via the generate script.
- Do not force-push or amend commits unless the user asks (follow user git rules).
- Do not “fix” ad-blocker console noise by loading PostHog from a known blocked URL pattern.

## Related plans (local)

If present under `.cursor/plans/` (gitignored): PostHog LP analytics (done), LP deep-link attribution (future). Prefer README + this file for durable instructions.
