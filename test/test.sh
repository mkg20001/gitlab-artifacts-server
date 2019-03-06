#!/bin/bash

TEST=$(dirname $(readlink -f 0))
MAIN=$(dirname "$TEST")
SRC="$MAIN/src"

mock_start() {
  node "$TEST/fake-gitlab/mock.js" & pid=$!
  echo "$pid" > /tmp/gla-mock.pid
}

mock_stop() {
  kill "$(cat /tmp/gla-mock.pid 2>/dev/null || /bin/true)" 2>/dev/null || /bin/true
}

gla_spawn() {
  "$SRC/bin.js" --token TEST --url http://localhost:5236 "$@" & pid=$!
  echo "$pid" > /tmp/gla.pid
  sleep 1s
}

gla_reset() {
  kill "$(cat /tmp/gla.pid 2>/dev/null || /bin/true)" 2>/dev/null || /bin/true
  rm -rf /tmp/gitlab-artifacts-server/*
}

gla_get() {
  curl "http://localhost:5236/$1" "$@"
}

mock_stop
mock_start

gla_reset
gla_spawn --project 13083 --branch master --job compile-assets
gla_get test.txt

mock_stop
