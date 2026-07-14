FROM node:22-alpine@sha256:16e22a550f3863206a3f701448c45f7912c6896a62de43add43bb9c86130c3e2 AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/dashboard-web/package.json apps/dashboard-web/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm ci --workspace @openleash/dashboard-web --workspace @openleash/shared

FROM deps AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
ARG OPENLEASH_API_URL=http://localhost:9319
ARG OPENLEASH_DASHBOARD_PORT=9300
ENV OPENLEASH_API_URL=$OPENLEASH_API_URL
ENV OPENLEASH_DASHBOARD_PORT=$OPENLEASH_DASHBOARD_PORT
COPY packages/shared packages/shared
COPY apps/dashboard-web apps/dashboard-web
RUN npm run build -w @openleash/shared && npm run build -w @openleash/dashboard-web

FROM node:22-alpine@sha256:16e22a550f3863206a3f701448c45f7912c6896a62de43add43bb9c86130c3e2 AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV OPENLEASH_DASHBOARD_PORT=9300
ENV PORT=9300
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx
COPY --chown=node:node --from=build /app/apps/dashboard-web/.next/standalone ./
COPY --chown=node:node --from=build /app/apps/dashboard-web/.next/static ./apps/dashboard-web/.next/static
COPY --chown=node:node --from=build /app/apps/dashboard-web/public ./apps/dashboard-web/public
USER node
EXPOSE 9300
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD node -e "fetch('http://127.0.0.1:9300/').then(r=>{if(!r.ok)process.exit(1)}).catch(()=>process.exit(1))"
CMD ["node", "apps/dashboard-web/server.js"]
