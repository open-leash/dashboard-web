FROM node:22-alpine@sha256:16e22a550f3863206a3f701448c45f7912c6896a62de43add43bb9c86130c3e2 AS builder
WORKDIR /app
RUN apk add --no-cache git
ARG OPENLEASH_SHARED_REF=9b7ca332b01b99b23f5b5c2337ea60db9e4b77cd
RUN git clone https://github.com/open-leash/shared.git packages/shared \
    && git -C packages/shared checkout --detach "$OPENLEASH_SHARED_REF"
COPY . apps/dashboard-web
RUN printf '%s\n' \
  '{"private":true,"type":"module","workspaces":["packages/*","apps/*"],"overrides":{"sharp":"0.35.3"}}' \
  > package.json
RUN npm install --workspace @openleash/shared --workspace @openleash/dashboard-web
ENV NEXT_TELEMETRY_DISABLED=1
ARG OPENLEASH_API_URL=http://localhost:9319
ARG OPENLEASH_DASHBOARD_PORT=9300
ENV OPENLEASH_API_URL=$OPENLEASH_API_URL
ENV OPENLEASH_DASHBOARD_PORT=$OPENLEASH_DASHBOARD_PORT
RUN npm run build -w @openleash/shared && npm run build -w @openleash/dashboard-web

FROM node:22-alpine@sha256:16e22a550f3863206a3f701448c45f7912c6896a62de43add43bb9c86130c3e2 AS runner
LABEL org.opencontainers.image.source="https://github.com/open-leash/dashboard-web" \
      org.opencontainers.image.title="OpenLeash dashboard-web" \
      org.opencontainers.image.licenses="Apache-2.0"
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV OPENLEASH_DASHBOARD_PORT=9300
ENV PORT=9300
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx
COPY --chown=node:node --from=builder /app/apps/dashboard-web/.next/standalone ./
COPY --chown=node:node --from=builder /app/apps/dashboard-web/.next/static ./apps/dashboard-web/.next/static
COPY --chown=node:node --from=builder /app/apps/dashboard-web/public ./apps/dashboard-web/public
USER node
EXPOSE 9300
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:9300/').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "apps/dashboard-web/server.js"]
