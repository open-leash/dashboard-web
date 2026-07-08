FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY apps/dashboard-web/package.json apps/dashboard-web/package.json
COPY packages/shared/package.json packages/shared/package.json
RUN npm ci --workspace @openleash/dashboard-web --workspace @openleash/shared --include-workspace-root

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

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV OPENLEASH_DASHBOARD_PORT=9300
ENV PORT=9300
COPY --from=build /app/apps/dashboard-web/.next/standalone ./
COPY --from=build /app/apps/dashboard-web/.next/static ./apps/dashboard-web/.next/static
COPY --from=build /app/apps/dashboard-web/public ./apps/dashboard-web/public
EXPOSE 9300
CMD ["node", "apps/dashboard-web/server.js"]
