(function () {
  var config = window.GOSTYLENS_ANALYTICS;
  var ready = false;
  var queue = [];

  function getPageName() {
    var path = window.location.pathname.replace(/\/$/, "") || "/";
    if (path === "/" || path === "/index.html") return "home";
    if (path.indexOf("pricing") !== -1) return "pricing";
    if (path.indexOf("get") !== -1) return "get";
    if (path.indexOf("privacy") !== -1) return "privacy";
    if (path.indexOf("terms") !== -1) return "terms";
    if (path.indexOf("support") !== -1) return "support";
    return path.replace(/^\//, "") || "home";
  }

  var pageName = getPageName();

  function flushQueue() {
    if (!ready || !window.posthog) return;
    while (queue.length) {
      var item = queue.shift();
      window.posthog.capture(item.event, item.props);
    }
  }

  function capture(event, props) {
    var payload = Object.assign({ page_name: pageName }, props || {});
    if (ready && window.posthog) {
      window.posthog.capture(event, payload);
      return;
    }
    queue.push({ event: event, props: payload });
  }

  function slugify(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "_")
      .replace(/^_|_$/g, "");
  }

  function storeFromHref(href) {
    if (!href) return "unknown";
    if (href.indexOf("apps.apple.com") !== -1) return "ios";
    if (href.indexOf("play.google.com") !== -1) return "android";
    return "unknown";
  }

  window.gostylensAnalytics = {
    capture: capture,
    getPageName: function () {
      return pageName;
    },
    get isReady() {
      return ready;
    },
  };

  if (!config || !config.apiKey || config.apiKey.indexOf("phc_") !== 0) {
    return;
  }

  var host = config.host || "https://n.gostylens.com";

  !(function (t, e) {
    var o, n, p, r;
    e.__SV ||
      ((window.posthog = e),
      (e._i = []),
      (e.init = function (i, s, a) {
        function g(t, e) {
          var o = e.split(".");
          2 == o.length && ((t = t[o[0]]), (e = o[1]));
          t[e] = function () {
            t.push([e].concat(Array.prototype.slice.call(arguments, 0)));
          };
        }
        ((p = t.createElement("script")).type = "text/javascript"),
          (p.crossOrigin = "anonymous"),
          (p.async = !0),
          (p.src =
            s.api_host.replace(".i.posthog.com", "-assets.i.posthog.com") +
            "/static/array.js"),
          (r = t.getElementsByTagName("script")[0]).parentNode.insertBefore(
            p,
            r,
          );
        var u = e;
        void 0 !== a ? (u = e[a] = []) : (a = "posthog");
        u.people = u.people || [];
        u.toString = function (t) {
          var e = "posthog";
          return "posthog" !== a && (e += "." + a), t || (e += " (stub)"), e;
        };
        u.people.toString = function () {
          return u.toString(1) + ".people (stub)";
        };
        o =
          "init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(
            " ",
          );
        for (n = 0; n < o.length; n++) g(u, o[n]);
        e._i.push([i, s, a]);
      }),
      (e.__SV = 1));
  })(document, window.posthog || []);

  window.posthog.init(config.apiKey, {
    api_host: host,
    ui_host: "https://us.posthog.com",
    defaults: '2026-05-30',
    persistence: "memory",
    autocapture: false,
    capture_pageview: true,
    capture_pageleave: true,
    capture_dead_clicks: false,
    capture_performance: false,
    person_profiles: "identified_only",
    disable_session_recording: true,
    disable_surveys: true,
    advanced_disable_flags: true,
    loaded: function (posthog) {
      posthog.register({
        surface: "landing_page",
        page_name: pageName,
      });
      ready = true;
      flushQueue();
    },
  });

  document.addEventListener("DOMContentLoaded", function () {
    document.querySelectorAll(".faq-item").forEach(function (item) {
      item.addEventListener("toggle", function () {
        if (!item.open) return;
        var summary = item.querySelector("summary");
        capture("pricing_faq_opened", {
          question: slugify(summary && summary.textContent),
        });
      });
    });

    document.querySelectorAll(".get-card .store-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        capture("store_link_clicked", {
          store: storeFromHref(btn.getAttribute("href")),
          location: "get_fallback",
        });
      });
    });
  });
})();
