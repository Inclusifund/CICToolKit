# Serve the prepared `deploy/` tree (un-gated free tools + free-tools band +
# clean-URL nginx rewrites). Build context is repo root; deploy/ is the canonical
# launch tree. See projects/cic-suite-launch-2026-07-01/E2E-RESULT-2026-07-01.md.
FROM nginx:alpine
COPY deploy/nginx.conf /etc/nginx/conf.d/default.conf
COPY deploy/ /usr/share/nginx/html
RUN rm -f /usr/share/nginx/html/Dockerfile /usr/share/nginx/html/nginx.conf
EXPOSE 80
