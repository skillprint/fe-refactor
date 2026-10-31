#!/usr/bin/env bash
# Makes an uploaded release live: publishes the viewer-request function built
# with it, then points the KeyValueStore's `current` at it. Run it with an
# older sha to roll back.
#
#   scripts/static-export/activate.sh <git sha>
#
# Needs AWS credentials for the deploy role and PORTAL_BUCKET, PORTAL_FUNCTION
# and PORTAL_KVS_ARN.
set -euo pipefail

sha="${1:?usage: activate.sh <git sha>}"
: "${PORTAL_BUCKET:?}" "${PORTAL_FUNCTION:?}" "${PORTAL_KVS_ARN:?}"

work="$(mktemp -d)"
trap 'rm -rf "$work"' EXIT

# The release and its function must both be there.
aws s3api head-object --bucket "$PORTAL_BUCKET" --key "releases/$sha/index.html" > /dev/null
aws s3 cp "s3://$PORTAL_BUCKET/functions/$sha.js" "$work/function.js" --no-progress

# Stage the code (keeping the function's config, which holds the store
# association), check it runs, then publish.
aws cloudfront describe-function --name "$PORTAL_FUNCTION" > "$work/describe.json"
etag="$(jq -r .ETag "$work/describe.json")"
jq -c .FunctionSummary.FunctionConfig "$work/describe.json" > "$work/config.json"
etag="$(aws cloudfront update-function --name "$PORTAL_FUNCTION" --if-match "$etag" \
  --function-config "file://$work/config.json" --function-code "fileb://$work/function.js" \
  --query ETag --output text)"

printf '%s' '{"version":"1.0","context":{"eventType":"viewer-request"},"viewer":{"ip":"1.2.3.4"},"request":{"method":"GET","uri":"/","querystring":{},"headers":{},"cookies":{}}}' \
  > "$work/event.json"
error="$(aws cloudfront test-function --name "$PORTAL_FUNCTION" --if-match "$etag" --stage DEVELOPMENT \
  --event-object "fileb://$work/event.json" --query TestResult.FunctionErrorMessage --output text)"
if [ -n "$error" ] && [ "$error" != "None" ]; then
  echo "viewer-request function fails its test: $error" >&2
  exit 1
fi

aws cloudfront publish-function --name "$PORTAL_FUNCTION" --if-match "$etag" > /dev/null

kvs_etag="$(aws cloudfront-keyvaluestore describe-key-value-store --kvs-arn "$PORTAL_KVS_ARN" --query ETag --output text)"
aws cloudfront-keyvaluestore put-key --kvs-arn "$PORTAL_KVS_ARN" --if-match "$kvs_etag" \
  --key current --value "$sha" > /dev/null

# CloudFront answers a missing key with the 404 page at the bucket root.
aws s3 cp "s3://$PORTAL_BUCKET/releases/$sha/404.html" "s3://$PORTAL_BUCKET/404.html" --no-progress \
  --metadata-directive REPLACE --content-type 'text/html' --cache-control 'public, max-age=60'

echo "Live: $sha"
