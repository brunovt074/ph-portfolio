#!/bin/bash
systemd-run --quiet --no-block --unit=sarahmoreauph-rebuild-$(date +%s) /opt/sarahmoreauph/rebuild.sh
