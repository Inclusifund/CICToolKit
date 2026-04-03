(function () {
  function init() {
    const body = document.body;
    if (!body || document.getElementById('v2-global-nav')) return;

    const isV2 = /-2\.0\.html$/.test(window.location.pathname) || /-2\.0\.html$/.test(window.location.href);
    if (!isV2) return;

    const header = document.createElement('div');
    header.id = 'v2-global-nav';
    header.innerHTML = `
      <a href="dashboard-2.0.html" class="v2-logo-link">InclusiFund</a>
      <nav class="v2-nav-links">
        <a href="dashboard-2.0.html">Dashboard</a>
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

    if (!/dashboard-2\.0\.html$/.test(window.location.pathname)) {
      const back = document.createElement('a');
      back.id = 'v2-global-back';
      back.href = 'dashboard-2.0.html';
      back.textContent = '← Back to Dashboard';
      body.appendChild(back);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
