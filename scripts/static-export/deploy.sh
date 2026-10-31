#!/usr/bin/env bash
# Uploads the static export as a release, then makes it live (activate.sh).
#
#   scripts/static-export/deploy.sh <git sha>
#
# Needs out/ from `pnpm run build:export`, build/viewer-request.js generated
# with the distribution's KeyValueStore ARN, AWS credentials for the deploy
# role, and PORTAL_BUCKET, PORTAL_FUNCTION and PORTAL_KVS_ARN (outputs of the
# portal_site module in the marketplace Terraform).
set -euo pipefail

sha="${1:?usage: deploy.sh <git sha>}"
: "${PORTAL_BUCKET:?}" "${PORTAL_FUNCTION:?}" "${PORTAL_KVS_ARN:?}"
grep -q "^import cf from 'cloudfront';" build/viewer-request.js || {
  echo "build/viewer-request.js was generated without the KeyValueStore ARN" >&2
  exit 1
}

release="s3://$PORTAL_BUCKET/releases/$sha"

# Build assets have content hashes in their names: cached for a year, everywhere.
aws s3 sync out/_next/static "$release/_next/static" --no-progress \
  --cache-control 'public, max-age=31536000, immutable'

# Everything else: the edge keeps it, since its path names the release, and
# browsers check back each time, since their URLs don't.
aws s3 sync out "$release" --no-progress --exclude '_next/static/*' \
  --cache-control 'public, max-age=0, s-maxage=31536000'

# The site's preview card has no extension, so sync gave it no image type.
aws s3 cp out/opengraph-image "$release/opengraph-image" --no-progress \
  --content-type image/png --cache-control 'public, max-age=0, s-maxage=31536000'

# This release's function, kept beside it for a rollback.
aws s3 cp build/viewer-request.js "s3://$PORTAL_BUCKET/functions/$sha.js" --no-progress \
  --content-type application/javascript

"$(dirname "$0")/activate.sh" "$sha"
