#!/bin/bash
# Read-only fetch, test, release build, smoke, gh-pages, live verification, IndexNow.
set -euo pipefail
cd "$(dirname "$0")"
: "${APIFY_TOKEN:?APIFY_TOKEN missing: deploy blocked}"
: "${GH_TOKEN:?GH_TOKEN missing: deploy blocked}"
node fetch-data.mjs "$@"
npm test
npm run check:secrets
npm run build:release
npm run check:dist
npm run smoke
npm run deploy
npm run verify:live
npm run indexnow
