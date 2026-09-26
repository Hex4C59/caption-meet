#!/usr/bin/env bash
# Sample only the supplied process; stop when it exits or its identity changes.
set -eu
experiment_pid=${1:?usage: sample-process.sh PID}
experiment_start=$(awk '{print $22}' "/proc/$experiment_pid/stat")
printf 'utc,pid,rss_kib,fd_count,threads\n'
while [ -r "/proc/$experiment_pid/stat" ]; do
  current_start=$(awk '{print $22}' "/proc/$experiment_pid/stat")
  [ "$current_start" = "$experiment_start" ] || break
  rss=$(awk '/^VmRSS:/ {print $2}' "/proc/$experiment_pid/status")
  threads=$(awk '/^Threads:/ {print $2}' "/proc/$experiment_pid/status")
  descriptors=$(find "/proc/$experiment_pid/fd" -mindepth 1 -maxdepth 1 -printf '.' | wc -c)
  printf '%s,%s,%s,%s,%s\n' "$(date -u +%FT%TZ)" "$experiment_pid" "$rss" "$descriptors" "$threads"
  sleep 10
done
