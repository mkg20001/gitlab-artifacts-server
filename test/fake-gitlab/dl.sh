#!/bin/bash

dl() {
  #FPATH=$(echo "$1" | sed -r "s|https://gitlab.com|.|g" | sed -r "s|\?.+||g")
  #FPATH="$FPATH/index.json"
  #DIR=$(dirname "$FPATH")
  #mkdir -p "$DIR"
  FPATH=$(echo "$1" | sed "s|https://gitlab.com/||g" | sed -r "s|[^a-z0-9]|_|g")
  curl -L --header "PRIVATE-TOKEN: $TOKEN" "$1" > "$FPATH"
}

dl 'https://gitlab.com/api/v4/projects/10901641/pipelines?ref=master&per_page=1&status=success'
dl 'https://gitlab.com/api/v4/projects/10901641/pipelines/48040583/jobs?scope=success'
dl 'https://gitlab.com/api/v4/projects/10901641/jobs/163312005/artifacts'
