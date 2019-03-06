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
  "$SRC/bin.js" --token TEST --url http://localhost:5382 "$@" & pid=$!
  echo "$pid" > /tmp/gla.pid
  sleep 1s
}

gla_reset() {
  kill "$(cat /tmp/gla.pid 2>/dev/null || /bin/true)" 2>/dev/null || /bin/true
  rm -rf /tmp/gitlab-artifacts-server/*
}

gla_get() {
  curl -s "http://localhost:5236/$1" "$@"
}

fail() {
  echo
  echo "==========================!=========================="
  echo "Test failure: $1"
  echo "==========================!=========================="
  echo
  exit 2
}

{
  mock_stop
  mock_start

  gla_reset
  gla_spawn --project 10901641 --branch master --job build
  RES=$(gla_get test.txt)
  if [ "$RES" != "helloworld" ]; then
    fail "test.txt didn't have expected value 'helloworld'"
  fi

  echo
  echo "OK"

  gla_reset
  mock_stop
} | pino-pretty
