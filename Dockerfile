# --- BUILDER ---
FROM node:14-alpine AS builder

ARG NODE_AUTH_TOKEN
ENV DATABASE_HOSTNAME=
ENV DATABASE_URL=
ENV PORT=3003
ENV POSTER_SERVICE_URL=

# inject and install dependencies
COPY --chown=1000:0 package.json package-lock.json /app/
COPY .npmrc.ci /app/.npmrc
WORKDIR /app
RUN set -x && npm ci

# --- RUNTIME ---
FROM node:14-alpine

# inject dependencies
COPY --from=builder --chown=1000:0 /app/node_modules /app/node_modules

# inject service logic
COPY --chown=1000:0 package.json /app/package.json
COPY --chown=1000:0 src /app/src
COPY --chown=1000:0 serve.sh /serve.sh
ADD --chown=1000:0 https://raw.githubusercontent.com/eficode/wait-for/f71f8199a0dd95953752fb5d3f76f79ced16d47d/wait-for /wait-for.sh
RUN set -x && chmod u+x /serve.sh /wait-for.sh

# switch to a non-root user
USER 1000

# start the micro server on a dynamic port (as required by Heroku)
CMD ["/serve.sh"]

HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD [ "curl", '-f', 'http://localhost:${PORT}' ]
