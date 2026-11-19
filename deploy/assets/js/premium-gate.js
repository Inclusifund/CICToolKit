/* Premium gate for the static premium tools (board pack, benefit statement, business model). 19 Nov 2026.
 *
 * Uses the SAME secure session as the account app (/app): Convex Auth keeps a short-lived JWT in localStorage on this
 * origin. We send it to the production backend's premium:getPremiumStatus, which decides from the server-side
 * entitlement. No email, tier or user id is read from or trusted in the browser.
 *
 * The page stays hidden (head style below) until the backend says premium: true; otherwise a locked card is shown.
 * Honest limit: these tools run in the browser, so this is an access gate, not DRM. Moving them into /app is the
 * long-term fix. The JWT lasts about an hour; an expired one reads as signed out, and opening the account app
 * (which refreshes it) and coming back via Premium fixes that.
 */
(function () {
  var CONVEX_URL = "https://basic-toad-42.eu-west-1.convex.cloud";
  var JWT_KEY = "__convexAuthJWT_" + CONVEX_URL.replace(/[^a-zA-Z0-9]/g, "");
  var hide = document.createElement("style");
  hide.id = "premium-gate-hide";
  hide.textContent = "body{visibility:hidden}";
  document.head.appendChild(hide);

  function reveal() { var s = document.getElementById("premium-gate-hide"); if (s) s.remove(); }

  function lock(signedIn) {
    var title = signedIn ? "This is a premium tool" : "Sign in to use this tool";
    var text = signedIn
      ? "It's part of the CIC Toolkit's lifetime premium. Upgrade once and every premium tool is yours."
      : "This tool is part of the CIC Toolkit premium. Sign in with your email, or continue with Google.";
    var primary = signedIn
      ? '<a href="/upgrade-landing.html" style="background:#d4a853;color:#1F2232">Upgrade to Lifetime &mdash; &pound;297</a>'
      : '<a href="/app/index.html#/login" style="background:#008080;color:#fff">Sign in</a>';
    // Overlay on top of the still-hidden page (a child can be visibility:visible inside a hidden body), so the
    // tool's own React mount is left alone and can't throw.
    var overlay = document.createElement("div");
    overlay.setAttribute("role", "dialog"); overlay.setAttribute("aria-modal", "true");
    overlay.style.cssText = "visibility:visible;position:fixed;inset:0;z-index:2147483647;overflow:auto";
    overlay.innerHTML =
      '<div style="min-height:100vh;display:flex;align-items:center;justify-content:center;padding:24px;background:#1F2232;font-family:Inter,system-ui,sans-serif">' +
      '<div style="max-width:440px;background:#2D3344;border:1px solid #d4a853;border-radius:14px;padding:32px;color:#F4F4F4;text-align:center">' +
      '<div style="font:700 13px Inter,sans-serif;letter-spacing:.2em;color:#d4a853;text-transform:uppercase;margin-bottom:10px">InclusiFund Premium</div>' +
      '<h1 style="font:700 26px Lora,Georgia,serif;margin:0 0 12px">' + title + '</h1>' +
      '<p style="color:#c6cbd8;line-height:1.6;margin:0 0 22px">' + text + '</p>' +
      '<style>.pg-btn a{display:inline-block;padding:12px 20px;border-radius:8px;font-weight:600;text-decoration:none;margin:4px}</style>' +
      '<div class="pg-btn">' + primary + '<a href="/app/index.html#/premium" style="color:#6BB6B6;border:1px solid #334155">Open my account</a></div>' +
      '</div></div>';
    document.body.appendChild(overlay);
  }

  // Session bounce (19 Nov 2026): the JWT lasts 1 hour and only the app renews it. If it has expired but the member
  // has a renewal token (signed in within 30 days), go through the app's /go/<tool> route once: it renews the
  // session and sends them straight back with ?bounced=1. The marker means we never bounce twice (no loops).
  var TOOL = { "/board-pack-builder.html": "board-pack", "/board-pack-builder": "board-pack",
               "/business-model.html": "business-model", "/business-model": "business-model" }[location.pathname];
  var REFRESH_KEY = "__convexAuthRefreshToken_" + CONVEX_URL.replace(/[^a-zA-Z0-9]/g, "");
  var bounced = /[?&]bounced=1/.test(location.search);
  function store(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } }
  function expired(jwt) {
    try { var p = JSON.parse(atob(jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/"))); return !p.exp || p.exp * 1000 < Date.now() + 30000; }
    catch (e) { return true; }
  }
  function bounce() { location.replace("/app/index.html#/go/" + TOOL); }
  var canBounce = !!(TOOL && !bounced && store(REFRESH_KEY));
  if (bounced && history.replaceState) history.replaceState(null, "", location.pathname + location.hash);

  var token = store(JWT_KEY);
  if (!token || expired(token)) {
    if (canBounce) { bounce(); return; }
    document.addEventListener("DOMContentLoaded", function () { lock(false); }); return;
  }

  fetch(CONVEX_URL + "/api/query", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": "Bearer " + token },
    body: JSON.stringify({ path: "premium:getPremiumStatus", args: {}, format: "json" }),
  })
    .then(function (r) { return r.json(); })
    .then(function (res) {
      var v = res && res.status === "success" ? res.value : null;
      if ((!v || !v.authenticated) && canBounce) { bounce(); return; }  // token rejected server-side: renew once
      var go = function () { if (v && v.premium === true) reveal(); else lock(!!(v && v.authenticated)); };
      if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go); else go();
    })
    .catch(function () {
      // Fail closed, but kindly: a network error shows the sign-in card rather than the tool.
      var go = function () { lock(false); };
      if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", go); else go();
    });
})();
