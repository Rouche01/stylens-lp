(function () {
  var CONSENT_REGION_COOKIE = "gostylens_consent_required";

  function readCookie(name) {
    var pattern = new RegExp("(?:^|;\\s*)" + name + "=([^;]*)");
    var match = document.cookie.match(pattern);
    return match ? decodeURIComponent(match[1]) : null;
  }

  function isConsentBannerRequired() {
    var regionFlag = readCookie(CONSENT_REGION_COOKIE);
    if (regionFlag === "0") return false;
    // Missing cookie (local dev) or EU/EEA/UK/CH: show banner.
    return true;
  }

  function showBanner() {
    if (document.getElementById("gostylens-consent-banner")) return;

    var banner = document.createElement("div");
    banner.id = "gostylens-consent-banner";
    banner.className = "consent-banner";
    banner.setAttribute("role", "dialog");
    banner.setAttribute("aria-label", "Analytics cookie consent");
    banner.setAttribute("aria-live", "polite");

    banner.innerHTML =
      '<div class="consent-banner__inner">' +
      '<p class="consent-banner__text">' +
      "We use analytics cookies to understand traffic and how visitors use our download links. " +
      'See our <a href="privacy.html">Privacy Policy</a>.' +
      "</p>" +
      '<div class="consent-banner__actions">' +
      '<button type="button" class="consent-banner__btn consent-banner__btn--primary" data-consent="accepted">Accept analytics</button>' +
      '<button type="button" class="consent-banner__btn consent-banner__btn--secondary" data-consent="rejected">Reject</button>' +
      "</div>" +
      "</div>";

    banner.addEventListener("click", function (event) {
      var button = event.target.closest("[data-consent]");
      if (!button || !window.gostylensAnalytics) return;
      window.gostylensAnalytics.applyConsent(button.getAttribute("data-consent"));
      hideBanner();
    });

    document.body.appendChild(banner);

    var primary = banner.querySelector(".consent-banner__btn--primary");
    if (primary) primary.focus();
  }

  function hideBanner() {
    var banner = document.getElementById("gostylens-consent-banner");
    if (banner) banner.remove();
  }

  function onPostHogReady() {
    if (!window.gostylensAnalytics || !window.gostylensAnalytics.applyConsent) return;

    var consent = window.gostylensAnalytics.getConsent();
    if (consent) {
      window.gostylensAnalytics.applyConsent(consent);
      return;
    }

    if (!isConsentBannerRequired()) {
      window.gostylensAnalytics.applyConsent("accepted");
      return;
    }

    showBanner();
  }

  document.addEventListener("gostylens:posthog-ready", onPostHogReady);
})();
