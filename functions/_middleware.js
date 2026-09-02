/**
 * Cloudflare Pages middleware:
 * - Store routing for /get and ?download=1
 * - Consent-region cookie from CF-IPCountry (EU/EEA/UK/CH → banner required)
 */
const APP_STORE_URL = "https://apps.apple.com/app/gostylens/id6760427902";
const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.stylenslab.gostylens";

const CONSENT_REQUIRED_COUNTRIES = new Set([
  "AT",
  "BE",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "DE",
  "GR",
  "HU",
  "IE",
  "IT",
  "LV",
  "LT",
  "LU",
  "MT",
  "NL",
  "PL",
  "PT",
  "RO",
  "SK",
  "SI",
  "ES",
  "SE",
  "IS",
  "LI",
  "NO",
  "GB",
  "CH",
]);

const CONSENT_REGION_COOKIE = "gostylens_consent_required";

function isIOS(ua) {
  return (
    /iPhone|iPad|iPod/i.test(ua) ||
    (/Macintosh/i.test(ua) && /Mobile/i.test(ua))
  );
}

function isAndroid(ua) {
  return /Android/i.test(ua);
}

function wantsStoreRedirect(url) {
  const path = url.pathname.replace(/\/$/, "") || "/";
  if (path === "/get" || path === "/get.html") return true;
  if (url.searchParams.get("download") === "1") return true;
  if (url.searchParams.get("get") === "1") return true;
  return false;
}

function storeRedirectResponse(ua) {
  if (isIOS(ua)) {
    return Response.redirect(APP_STORE_URL, 302);
  }
  if (isAndroid(ua)) {
    return Response.redirect(PLAY_STORE_URL, 302);
  }
  return null;
}

function isConsentRequiredCountry(country) {
  return CONSENT_REQUIRED_COUNTRIES.has(country);
}

function withConsentRegionCookie(response, country, isHttps) {
  const required = isConsentRequiredCountry(country) ? "1" : "0";
  const secure = isHttps ? "; Secure" : "";
  const cookie = `${CONSENT_REGION_COOKIE}=${required}; Path=/; Max-Age=86400; SameSite=Lax${secure}`;

  const next = new Response(response.body, response);
  next.headers.append("Set-Cookie", cookie);
  return next;
}

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const country = request.cf?.country || "";
  const isHttps = url.protocol === "https:";

  let response;

  if (wantsStoreRedirect(url)) {
    const ua = request.headers.get("user-agent") || "";
    const storeResponse = storeRedirectResponse(ua);
    if (storeResponse) {
      response = storeResponse;
    } else if (url.pathname.replace(/\/$/, "") !== "/get.html") {
      response = Response.redirect(new URL("/get.html", url.origin), 302);
    } else {
      response = await context.next();
    }
  } else {
    response = await context.next();
  }

  return withConsentRegionCookie(response, country, isHttps);
}
