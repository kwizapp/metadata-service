#!/bin/sh -ex

cd /app
npm start -- -l tcp://0.0.0.0:${PORT-8001}
