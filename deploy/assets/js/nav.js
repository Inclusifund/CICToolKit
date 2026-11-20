/* InclusiFund kit sidebar (rebuilt 20 Nov 2026 from the board pack sidebar Royal liked).
 * One script for every tool page: drop <script src="/assets/js/nav.js" defer></script> into the page.
 *  - Desktop (>= 960px): open by default; the burger collapses it (remembered per browser).
 *  - Smaller screens: a slim top bar with a burger; the sidebar slides in as a drawer (Esc or backdrop closes it).
 *  - Self-contained styles (ifk- prefix) so it works on any page without that page's CSS.
 *  - Links go to the CURRENT destinations (secure app at /app, live tool pages), never the retired account pages.
 *  - Name/email come from the app's secure session (users:getCurrentUser with the session token), never stored here.
 */
(function () {
  var CONVEX_URL = "https://basic-toad-42.eu-west-1.convex.cloud";
  var JWT_KEY = "__convexAuthJWT_" + CONVEX_URL.replace(/[^a-zA-Z0-9]/g, "");
  var PREF_KEY = "ifk-sidebar-collapsed";
  var APP = "/app/index.html#";
  var ITEMS = [
    { label: "Dashboard", icon: "\u{1F3E0}", href: APP + "/dashboard", match: ["#/dashboard"] },
    { section: "Premium" },
    { label: "CIC34 report", icon: "\u{1F4C4}", href: APP + "/cic34", match: ["#/cic34"] },
    { label: "Board pack builder", icon: "\u{1F4CB}", href: "/board-pack-builder.html", match: ["/board-pack-builder"] },
    { label: "Business model", icon: "\u{1F4C8}", href: "/business-model.html", match: ["/business-model"] },
    { section: "Free tools" },
    { label: "Grant Match", icon: "\u{1F3AF}", href: "/grant-match.html", match: ["/grant-match"] },
    { label: "Opportunities Hub", icon: "\u{1F50D}", href: "/opportunities-hub.html", match: ["/opportunities-hub", "/grants"] },
    { label: "Benefit statement", icon: "\u{270D}\u{FE0F}", href: "/benefit-statement.html", match: ["/benefit-statement"] },
    { label: "Eligibility checker", icon: "\u{2705}", href: "/eligibility-checker.html", match: ["/eligibility-checker"] },
    { section: "Compliance" },
    { label: "Compliance calendar", icon: "\u{1F4C5}", href: APP + "/compliance-calendar", match: ["#/compliance-calendar", "#/compliance-onboarding"] },
    { section: "Account" },
    { label: "Settings", icon: "\u{2699}\u{FE0F}", href: APP + "/settings", match: ["#/settings"] },
    { label: "Support", icon: "\u{2753}", href: "/support.html", match: ["/support"] },
  ];

  var CSS = [
    ":root{--ifk-w:272px;--ifk-bar:52px}",
    ".ifk-side{position:fixed;top:0;left:0;bottom:0;width:var(--ifk-w);background:#1F2232;color:#fff;display:flex;flex-direction:column;",
    "  padding:18px 14px 16px;z-index:2147483000;overflow-y:auto;transition:transform .22s ease;font-family:Inter,system-ui,sans-serif;box-sizing:border-box}",
    ".ifk-head{display:flex;align-items:center;justify-content:space-between;margin:0 4px 18px 10px}",
    ".ifk-logo{font:800 1.35rem Inter,system-ui,sans-serif;letter-spacing:-.02em;color:#fff;text-decoration:none;",
    "  background:linear-gradient(135deg,#fff 0%,#A1A1AA 100%);-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent}",
    ".ifk-sec{font:700 .7rem Inter,system-ui,sans-serif;color:#6B7280;text-transform:uppercase;letter-spacing:.08em;margin:18px 0 6px 14px}",
    ".ifk-item{display:flex;align-items:center;gap:.7rem;padding:.62rem .9rem;border-radius:10px;color:#A1A1AA;text-decoration:none;",
    "  font:500 .95rem Inter,system-ui,sans-serif;transition:background .15s,color .15s}",
    ".ifk-item:hover{color:#fff;background:rgba(255,255,255,.06)}",
    ".ifk-item.ifk-active{background:#008080;color:#fff;box-shadow:0 4px 12px rgba(0,128,128,.3)}",
    ".ifk-ico{font-size:1.1rem;width:1.4rem;text-align:center}",
    ".ifk-prof{margin-top:auto;padding:14px;background:rgba(255,255,255,.04);border-radius:12px;display:flex;align-items:center;gap:.7rem;text-decoration:none;color:#fff}",
    ".ifk-av{width:36px;height:36px;border-radius:50%;background:#008080;display:flex;align-items:center;justify-content:center;font:700 .85rem Inter,sans-serif;flex:none}",
    ".ifk-pn{font:600 .85rem Inter,sans-serif;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    ".ifk-pe{font:400 .72rem Inter,sans-serif;opacity:.65;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}",
    ".ifk-burger{width:40px;height:40px;border-radius:10px;border:1px solid rgba(255,255,255,.14);background:transparent;color:#fff;",
    "  display:inline-flex;align-items:center;justify-content:center;cursor:pointer;flex:none}",
    ".ifk-burger:hover{background:rgba(255,255,255,.08)}",
    // host pages style every <button> (padding, colours) - reset so the burger icon always shows
    ".ifk-burger{padding:0!important;margin:0!important;min-width:0!important;width:40px!important;height:40px!important;",
    "  background:transparent!important;color:#fff!important;border-radius:10px!important;line-height:1!important;box-shadow:none!important}",
    ".ifk-burger svg{display:block;width:20px;height:20px}",
    ".ifk-burger:focus-visible,.ifk-item:focus-visible,.ifk-prof:focus-visible{outline:3px solid #d4a853;outline-offset:2px}",
    ".ifk-bar{position:fixed;top:0;left:0;right:0;height:var(--ifk-bar);background:#1F2232;display:none;align-items:center;gap:12px;",
    "  padding:0 12px;z-index:2147482999;box-shadow:0 2px 10px rgba(0,0,0,.25)}",
    ".ifk-bar .ifk-logo{font-size:1.1rem}",
    ".ifk-backdrop{position:fixed;inset:0;background:rgba(9,11,20,.55);z-index:2147482998;display:none}",
    // Desktop open: content shifts right. Board pack's old grid shell is flattened so there is no double offset.
    "@media (min-width:960px){body.ifk-open{padding-left:var(--ifk-w)!important}",
    "  body.ifk-collapsed .ifk-side{transform:translateX(-100%)}",
    "  body.ifk-collapsed .ifk-bar{display:flex} body.ifk-collapsed{padding-top:var(--ifk-bar)!important}}",
    "@media (max-width:959px){.ifk-side{transform:translateX(-100%);box-shadow:8px 0 30px rgba(0,0,0,.35)}",
    "  body.ifk-drawer .ifk-side{transform:none} body.ifk-drawer .ifk-backdrop{display:block}",
    "  .ifk-bar{display:flex} body.ifk-has{padding-top:var(--ifk-bar)!important}}",
    "@media (min-width:960px){body.ifk-open #root{width:auto!important;max-width:none!important;margin-left:0!important}}",
    "body.ifk-has .app-shell{display:block!important} body.ifk-has .app-shell>.app-sidebar{display:none!important}",
    "@media (prefers-reduced-motion:reduce){.ifk-side{transition:none}}",
    // Public sign-in screens in the app show no member menu
    "body.ifk-hidden .ifk-side,body.ifk-hidden .ifk-bar,body.ifk-hidden .ifk-backdrop{display:none!important}",
    "body.ifk-hidden{padding-left:0!important;padding-top:0!important}",
  ].join("\n");

  var BURGER = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';

  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }
  function pref(v) { try { if (v === undefined) return localStorage.getItem(PREF_KEY) === "1"; localStorage.setItem(PREF_KEY, v ? "1" : "0"); } catch (e) { return false; } }
  function isDesktop() { return window.matchMedia("(min-width:960px)").matches; }

  function build() {
    if (document.querySelector(".ifk-side")) return;
    var style = document.createElement("style"); style.id = "ifk-style"; style.textContent = CSS; document.head.appendChild(style);

    var side = document.createElement("aside"); side.className = "ifk-side"; side.id = "ifk-side";
    var links = ITEMS.map(function (it) {
      if (it.section) return '<div class="ifk-sec">' + esc(it.section) + "</div>";
      return '<a class="ifk-item" href="' + it.href + '" data-ifk-match="' + it.match.join("|") + '"><span class="ifk-ico" aria-hidden="true">' + it.icon + "</span><span>" + esc(it.label) + "</span></a>";
    }).join("");
    side.innerHTML = '<div class="ifk-head"><a class="ifk-logo" href="/">InclusiFund</a>' +
      '<button type="button" class="ifk-burger" data-ifk-toggle aria-controls="ifk-side" aria-expanded="true" aria-label="Hide menu">' + BURGER + "</button></div>" +
      '<nav aria-label="CIC Toolkit">' + links + "</nav>" +
      '<a class="ifk-prof" href="' + APP + '/settings"><div class="ifk-av" id="ifk-av">IF</div><div style="min-width:0">' +
      '<div class="ifk-pn" id="ifk-pn">My account</div><div class="ifk-pe" id="ifk-pe">Sign in or manage your account</div></div></a>';

    var bar = document.createElement("div"); bar.className = "ifk-bar";
    bar.innerHTML = '<button type="button" class="ifk-burger" data-ifk-toggle aria-controls="ifk-side" aria-expanded="false" aria-label="Show menu">' + BURGER +
      '</button><a class="ifk-logo" href="/">InclusiFund</a>';
    var backdrop = document.createElement("div"); backdrop.className = "ifk-backdrop"; backdrop.setAttribute("data-ifk-close", "");

    var old = document.querySelector(".app-shell > .app-sidebar"); if (old) old.remove();
    document.body.prepend(backdrop); document.body.prepend(bar); document.body.prepend(side);
    document.body.classList.add("ifk-has");
    apply();

    document.addEventListener("click", function (e) {
      if (e.target.closest("[data-ifk-toggle]")) toggle();
      else if (e.target.closest("[data-ifk-close]")) closeDrawer();
    });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape" && document.body.classList.contains("ifk-drawer")) closeDrawer(); });
    window.matchMedia("(min-width:960px)").addEventListener("change", apply);
    markActive();
    // The account app (React Router) changes pages with history.pushState/replaceState, which fire no event, so
    // wrap them; hashchange/popstate cover links and the back button.
    ["pushState", "replaceState"].forEach(function (fn) {
      var orig = history[fn];
      history[fn] = function () { var r = orig.apply(this, arguments); setTimeout(markActive, 0); return r; };
    });
    window.addEventListener("hashchange", markActive); window.addEventListener("popstate", markActive);
    profile();
  }

  function markActive() {
    var here = location.pathname + location.hash;
    document.body.classList.toggle("ifk-hidden", /^#\/(login|signup|welcome)\b/.test(location.hash));
    document.querySelectorAll(".ifk-item[data-ifk-match]").forEach(function (a) {
      var on = a.getAttribute("data-ifk-match").split("|").some(function (m) { return here.indexOf(m) !== -1; });
      a.classList.toggle("ifk-active", on);
      if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
    });
    if (!isDesktop()) closeDrawer();  // tapping a link inside the app closes the phone drawer
  }

  function apply() {
    var b = document.body, collapsed = pref();
    b.classList.remove("ifk-drawer");
    b.classList.toggle("ifk-open", isDesktop() && !collapsed);
    b.classList.toggle("ifk-collapsed", isDesktop() && collapsed);
    sync();
  }
  function toggle() {
    if (isDesktop()) { pref(!pref()); apply(); }
    else { document.body.classList.toggle("ifk-drawer"); sync(); }
  }
  function closeDrawer() { document.body.classList.remove("ifk-drawer"); sync(); }
  function sync() {
    var open = isDesktop() ? !pref() : document.body.classList.contains("ifk-drawer");
    document.querySelectorAll("[data-ifk-toggle]").forEach(function (btn) {
      btn.setAttribute("aria-expanded", String(open)); btn.setAttribute("aria-label", open ? "Hide menu" : "Show menu");
    });
  }

  function profile() {
    var token = null; try { token = localStorage.getItem(JWT_KEY); } catch (e) { token = null; }
    if (!token) return;
    fetch(CONVEX_URL + "/api/query", { method: "POST", headers: { "Content-Type": "application/json", Authorization: "Bearer " + token },
      body: JSON.stringify({ path: "users:getCurrentUser", args: {}, format: "json" }) })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        var u = res && res.status === "success" ? res.value : null; if (!u) return;
        var name = u.fullName || u.name || "My account";
        document.getElementById("ifk-pn").textContent = name;
        document.getElementById("ifk-pe").textContent = u.email || "";
        document.getElementById("ifk-av").textContent = name.split(/\s+/).map(function (w) { return w[0]; }).join("").slice(0, 2).toUpperCase() || "IF";
      })
      .catch(function () {});
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build); else build();
})();
