# CIC ToolKit — Dokploy Migration Status

**Last session**: 2026-04-03 02:30

## What was done

### Codex paranoid sweep (93 HTML files audited)
Root cause of 404s: `vercel.json` rewrites + `cleanUrls: true` not honoured by Dokploy's static file serving.

### Fixes applied

1. **`deploy/nginx.conf`** — Created Nginx config mirroring all `vercel.json` behaviour:
   - `try_files $uri $uri.html $uri/ =404` (clean URLs)
   - 14 explicit rewrites (`/welcome`, `/tools`, `/grants`, `/premium`, etc.)
   - Security headers (X-Frame-Options, nosniff, XSS protection)
   - Trailing slash stripping

2. **`deploy/Dockerfile`** — `nginx:alpine` container, copies static site + nginx config

3. **`deploy/opportunities-hub.html:182`** — Removed dead `<script src="assets/js/access-support.js">` (file never existed, nothing calls it)

## What's next

- [ ] Push `deploy/` changes to the repo Dokploy pulls from
- [ ] In Dokploy: set build context to `deploy/` directory
- [ ] Deploy and test these routes specifically (they were 404ing):
  - `/welcome` → should load onboarding-dark
  - `/dashboard` → should load dashboard
  - `/benefit-statement` → should load benefit-statement
  - `/tools` → should load cic-tool-suite-landing
  - `/grants` → should load opportunities-hub
  - `/premium` → should load premium-tools-dashboard
  - `/log-in/*` → should all load login
- [ ] If any routes still 404, check Dokploy's port mapping (container exposes port 80)

## Codex CLI setup (also done this session)

- Installed globally: `npm install -g @openai/codex` (v0.118.0)
- Authenticated with OpenAI API key
- PATH fix added to `~/.zshrc`: `export PATH="$HOME/.npm-global/bin:$PATH"`
- **IMPORTANT**: Rotate the OpenAI API key at platform.openai.com/api-keys — it was exposed in conversation
