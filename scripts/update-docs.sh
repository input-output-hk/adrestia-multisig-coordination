#!/usr/bin/env bash

set -euo pipefail

root=$(cd "$(dirname "$0")"/..; pwd)
out="${1:-}"
tag="${2:-}"

if [ -z "$out" ]; then
  echo "usage: $0 DEST_DIR [TAG]"
  exit 1
fi

if [ -n "$tag" ]; then
  what="release tag $tag"
  dest="$out/api/$tag"
else
  what="git snapshot"
  dest="$out/api/edge"
fi

echo '*** Building documentation for' "$what"
mkdir -p "$dest"
cp -Rv "$root"/src/server/api/* "$dest"