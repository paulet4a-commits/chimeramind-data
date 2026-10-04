#!/bin/bash
# Fetch live data, build, and publish dist/ to the gh-pages branch (GitHub Pages → data.chimeramind.com).
# gh-pages holds generated files only, so it is force-pushed as a single fresh commit each time.
# Usage: bash deploy.sh [--run-missing]
set -e
cd "$(dirname "$0")"
node fetch-data.mjs "$@"
node build.mjs
cd dist
rm -rf .git
git init -q -b gh-pages
git config user.name "Murat Uzun"
git config user.email "paulet4a@gmail.com"
git add -A
git commit -qm "Deploy $(date -u +%Y-%m-%dT%H:%MZ)"
git push -qf https://github.com/paulet4a-commits/chimeramind-data.git gh-pages
rm -rf .git
echo "deployed $(date -u +%FT%TZ)"
cd ..
node indexnow.mjs || true
