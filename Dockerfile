FROM node:22-slim AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

COPY . /app
WORKDIR /app

FROM base AS prod-deps
WORKDIR /app/server
RUN pnpm install --frozen-lockfile

FROM base AS build-frontend
WORKDIR /app/frontend
RUN pnpm install --frozen-lockfile
RUN pnpm run build

FROM base
COPY --from=prod-deps /app/server/node_modules /app/server/node_modules
COPY --from=prod-deps /app/server/index.js /app/server/index.js
COPY --from=build-frontend /app/frontend/dist /app/frontend/dist

EXPOSE 4000
CMD ["node", "/app/server/index.js"]
