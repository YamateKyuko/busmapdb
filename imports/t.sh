#!/bin/bash

source ./env.sh

pg_dump \
  -d $LOCAL_DATABASE_URL \
  -Fc \
  --verbose \
  --schema=busmap \
  --no-owner \
  --no-privileges \
  --encoding=utf8 \
  --no-acl \
  > "busmapdb_dump"

psql -d $NEON_DATABASE_URL -f ./t.sql

pg_restore \
  "busmapdb_dump" \
  -d $NEON_DATABASE_URL \
  -Fc \
  --no-owner \
  --schema=busmap \
  --verbose \
  --clean \
  --if-exists \
  --no-privileges
