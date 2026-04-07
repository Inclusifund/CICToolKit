(function () {
  function getDashboardUrl() {
    try {
      var raw = localStorage.getItem('inclusifund_user');
      if (raw) {
        var user = JSON.parse(raw);
        if (user.tier === 'premium' || user.tier === 'lifetime') {
          return 'cic-premium-dashboard-2.0.html';
        }
      }
    } catch (e) {}
    return 'dashboard-2.0.html';
  }

  function init() {
    const body = document.body;
    if (!body || document.getElementById('v2-global-nav')) return;

    const isV2 = /-2\.0\.html$/.test(window.location.pathname) || /-2\.0\.html$/.test(window.location.href);
    if (!isV2) return;

    const dashUrl = getDashboardUrl();

    const header = document.createElement('div');
    header.id = 'v2-global-nav';
    header.innerHTML = `
      <a href="${dashUrl}" class="v2-logo-link">InclusiFund</a>
      <nav class="v2-nav-links">
        <a href="${dashUrl}">Dashboard</a>
        <a href="support-2.0.html">Support</a>
      </nav>
    `;

    const style = document.createElement('style');
    style.textContent = `
      #v2-global-nav {position: fixed; top: 12px; right: 12px; z-index: 9999; background: #ffffffee; border: 1px solid #dbe4f0; border-radius: 10px; padding: 8px 12px; display: flex; gap: 12px; align-items: center; font-family: Inter, system-ui, sans-serif; box-shadow: 0 4px 18px rgba(0,0,0,.08);}
      #v2-global-nav a {text-decoration: none; color: #0f766e; font-size: 13px; font-weight: 600;}
      #v2-global-nav .v2-logo-link {color: #111827; font-weight: 800;}
      #v2-global-back {position: fixed; left: 12px; bottom: 12px; z-index: 9999; background: #0f766e; color: white; text-decoration: none; font-family: Inter, system-ui, sans-serif; font-size: 13px; padding: 10px 12px; border-radius: 10px; box-shadow: 0 4px 18px rgba(0,0,0,.15);}
    `;

    document.head.appendChild(style);
    body.appendChild(header);

    const isDashboard = /dashboard-2\.0\.html$|cic-premium-dashboard-2\.0\.html$/.test(window.location.pathname);
    if (!isDashboard) {
      const back = document.createElement('a');
      back.id = 'v2-global-back';
      back.href = dashUrl;
      back.textContent = '\u2190 Back to Tools Suite';
      body.appendChild(back);
    }
  }

  // Rewrite ALL hardcoded dashboard links on the page to be tier-aware
  function rewriteDashboardLinks() {
    const dashUrl = getDashboardUrl();
    const freeDash = 'dashboard-2.0.html';
    const oldDash = 'dashboard.html';
    if (dashUrl === freeDash) return; // free user, no rewriting needed

    // Rewrite <a href="dashboard-2.0.html"> and <a href="dashboard.html">
    document.querySelectorAll('a[href]').forEach(function (a) {
      if (a.href.indexOf(freeDash) !== -1 || a.href.indexOf(oldDash) !== -1) {
        // Don't rewrite if it's already the premium dashboard
        if (a.href.indexOf('cic-premium') !== -1) return;
        a.href = a.href.replace(freeDash, dashUrl).replace(oldDash, dashUrl);
      }
    });
  }

  // Expose getDashboardUrl globally so inline React onClick handlers can use it
  window.InclusiFundDashUrl = getDashboardUrl;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { init(); rewriteDashboardLinks(); });
  } else {
    init();
    rewriteDashboardLinks();
  }

  // Also rewrite links added dynamically by React (runs after React renders)
  setTimeout(rewriteDashboardLinks, 1500);
  setTimeout(rewriteDashboardLinks, 3000);
})();
