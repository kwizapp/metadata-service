# extend basic alpine image
FROM node:13.8-alpine

# switch to a non-root user
USER 1000

# inject and install dependencies
COPY --chown=1000:0 package.json package-lock.json /app/
WORKDIR /app
RUN set -x && npm ci

# inject service logic
COPY --chown=1000:0 src /app/src
COPY --chown=1000:0 serve.sh /serve.sh
RUN set -x && chmod u+x /serve.sh

# start the micro server on a dynamic port (as required by Heroku)
CMD ["/serve.sh"]
