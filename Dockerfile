FROM node:20-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable
WORKDIR /app

FROM base AS build
COPY . /app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN mkdir -p /app/db-data
ENV NODE_ENV=production
RUN pnpm run -r build
RUN pnpm deploy --filter=server --prod /prod/server

FROM base AS client
COPY --from=build /app/packages/client/dist /app

FROM base AS server
# COPY --from=build /prod/server/node_modules /prod/server/node_modules
# COPY --from=build /prod/server/dist /prod/server
COPY --from=build /prod/server /app
