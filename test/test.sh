#!/bin/bash

TEST=$(dirname $(readlink -f 0))
MAIN=$(dirname "$TEST")
SRC="$MAIN/src"
TOKEN="$RANDOM$RANDOM$RANDOM$$"

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

gla_get_tok() {
  curl -s "http://$TOKEN@localhost:5236/$1" "$@"
}

fail() {
  echo
  echo "===============================!==============================="
  echo "Test failure: $1"
  echo "===============================!==============================="
  echo
  mock_stop
  gla_reset
  exit 2
}

r() {
  echo
  echo "==="
  echo "======"
  echo "========="
  echo "Running Test: $*"
  echo "========="
  echo "======"
  echo "==="
  echo
}

{
  mock_stop
  mock_start

  r "Normal fetch"
  gla_reset
  gla_spawn --project 10901641 --branch master --job build
  RES=$(gla_get test.txt)
  if [ "$RES" != "helloworld" ]; then
    fail "test.txt didn't have expected value 'helloworld'"
  fi

  r "Fetch with prefix"
  gla_reset
  gla_spawn --project 10901641 --branch master --job build --prefix /hello
  RES=$(gla_get hello/test.txt)
  if [ "$RES" != "helloworld" ]; then
    fail "test.txt didn't have expected value 'helloworld'"
  fi

  r "Fetch with 2 prefixes"
  gla_reset
  gla_spawn --project 10901641 --branch master --job build --prefix /hello -- \
    --project 10901641 --branch master --job build --prefix /bye
  RES=$(gla_get hello/test.txt)
  if [ "$RES" != "helloworld" ]; then
    fail "test.txt didn't have expected value 'helloworld'"
  fi
  RES=$(gla_get bye/test.txt)
  if [ "$RES" != "helloworld" ]; then
    fail "test.txt didn't have expected value 'helloworld'"
  fi

  r "Fetch with 2 prefixes, one root"
  gla_reset
  gla_spawn --project 10901641 --branch master --job build --prefix /hello -- \
    --project 10901641 --branch master --job build --prefix /
  RES=$(gla_get hello/test.txt)
  if [ "$RES" != "helloworld" ]; then
    fail "test.txt didn't have expected value 'helloworld'"
  fi
  RES=$(gla_get test.txt)
  if [ "$RES" != "helloworld" ]; then
    fail "test.txt didn't have expected value 'helloworld'"
  fi

  r "Webhook"
  gla_reset
  gla_spawn --project 10901641 --branch master --job build --webhook "$TOKEN"
  gla_get_tok checkUpdate
  RES=$(gla_get_tok checkUpdate)
  if [ "$RES" != '{"ok":true}' ]; then
    fail "test.txt didn't have expected value 'ok: true'"
  fi

  echo
  echo "OK"

  gla_reset
  mock_stop
} | pino-pretty
