#!/bin/sh

/wait-for.sh ${DATABASE_HOSTNAME}:5432 -- python /app/Preprocessing.py
