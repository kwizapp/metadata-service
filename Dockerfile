FROM node:12-alpine AS builder

ARG NODE_AUTH_TOKEN

# inject and install dependencies
COPY --chown=1000:0 package.json package-lock.json .npmrc /app/
WORKDIR /app
RUN set -x && npm ci

# extend basic alpine image
FROM node:12-alpine

# switch to a non-root user
USER 1000

# inject and install dependencies
WORKDIR /app
COPY --from=builder --chown=1000:0 /app/node_modules .

# inject service logic
COPY --chown=1000:0 src /app/src
COPY --chown=1000:0 serve.sh /serve.sh
RUN set -x && chmod u+x /serve.sh

# start the micro server on a dynamic port (as required by Heroku)
CMD ["/serve.sh"]
