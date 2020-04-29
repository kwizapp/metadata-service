#!/bin/sh -ex

cd /app
/wait-for.sh $DATABASE_HOSTNAME:5432 -- npm start -- -l tcp://0.0.0.0:${PORT-3003}
