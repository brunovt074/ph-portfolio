#!/bin/bash
touch /run/sarahmoreauph-rebuild.pending
exec >> /var/log/sarahmoreauph-rebuild.log 2>&1
exec 9>/run/sarahmoreauph-rebuild.lock
flock -n 9 || exit 0
while [ -f /run/sarahmoreauph-rebuild.pending ]; do
  sleep 15
  rm -f /run/sarahmoreauph-rebuild.pending
  cd /opt/sarahmoreauph
  BUILD_ID=$(date +%s) docker compose up -d --build
  docker image prune -f
done
