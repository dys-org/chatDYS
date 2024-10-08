FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install pm2 -g
WORKDIR /app

FROM base AS build
COPY . /app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
ENV NODE_ENV=production
RUN pnpm run -r build
RUN pnpm deploy --filter=server --prod /app-server
RUN mkdir -p /app-server/db-data

FROM nginx:1.26-alpine-slim AS client
COPY --from=build /app/packages/client/dist /usr/share/nginx/html
COPY --from=build /app/packages/client/nginx.conf /etc/nginx/conf.d/default.conf

FROM base AS server
COPY --from=build /app-server /app
