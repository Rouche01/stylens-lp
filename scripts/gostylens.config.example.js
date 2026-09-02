// Local dev: copy to gostylens.config.js and set your PostHog Project API Key (phc_...).
// Deploy: Cloudflare Pages runs scripts/generate-analytics-config.sh (see README.md).
// Same project as the GoStylens mobile app. Never commit gostylens.config.js.
window.GOSTYLENS_ANALYTICS = {
  apiKey: "phc_YOUR_PROJECT_API_KEY",
  host: "https://n.gostylens.com",
};
