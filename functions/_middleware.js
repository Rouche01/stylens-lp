/**
 * Server-side store routing for QR / share links.
 * Intercepts /get, /get.html, and ?download=1 before any HTML is served.
 */
const APP_STORE_URL = "https://apps.apple.com/app/gostylens/id6760427902";
const PLAY_STORE_URL =
  "https://play.google.com/store/apps/details?id=com.stylenslab.gostylens";

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

export async function onRequest(context) {
  const url = new URL(context.request.url);

  if (!wantsStoreRedirect(url)) {
    return context.next();
  }

  const ua = context.request.headers.get("user-agent") || "";
  const storeResponse = storeRedirectResponse(ua);
  if (storeResponse) return storeResponse;

  // Desktop / unknown: show the static chooser page
  if (url.pathname.replace(/\/$/, "") !== "/get.html") {
    return Response.redirect(new URL("/get.html", url.origin), 302);
  }

  return context.next();
}
