#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:?Usage: smoke-dev-alb.sh <base-url>}"
AUTH_HEADER="Authorization: Bearer placeholder"
JSON_HEADER="Content-Type: application/json"

request() {
  local method="$1"
  local url="$2"
  local expected_status="$3"
  shift 3

  local response_file
  response_file="$(mktemp)"
  local status
  status="$(curl -sS -o "$response_file" -w "%{http_code}" -X "$method" "$url" "$@")"

  if [ "$status" != "$expected_status" ]; then
    echo "Expected $method $url to return $expected_status, got $status"
    cat "$response_file"
    rm -f "$response_file"
    exit 1
  fi

  cat "$response_file"
  rm -f "$response_file"
}

request GET "$BASE_URL/health" 200 >/dev/null
request GET "$BASE_URL/api/catalog/categories" 200 | grep -q "desk-objects"
request GET "$BASE_URL/api/catalog/products" 200 | grep -q "harbor-monitor-stand"
request GET "$BASE_URL/" 200 | grep -q "CommerceOS"

request DELETE "$BASE_URL/api/cart" 200 -H "$AUTH_HEADER" >/dev/null
request POST "$BASE_URL/api/cart/items" 200 \
  -H "$AUTH_HEADER" \
  -H "$JSON_HEADER" \
  --data '{"productSlug":"north-table-lamp","quantity":1,"size":"One size"}' \
  | grep -q "north-table-lamp"
request PATCH "$BASE_URL/api/cart/items" 200 \
  -H "$AUTH_HEADER" \
  -H "$JSON_HEADER" \
  --data '{"productSlug":"north-table-lamp","quantity":2,"size":"One size"}' \
  | grep -q '"quantity":2'
request DELETE "$BASE_URL/api/cart/items?productSlug=north-table-lamp&size=One%20size" 200 \
  -H "$AUTH_HEADER" >/dev/null
request DELETE "$BASE_URL/api/cart" 200 -H "$AUTH_HEADER" >/dev/null

if [ -n "${KEYCLOAK_ISSUER_URL:-}" ] && [ -n "${KEYCLOAK_CLIENT_ID:-}" ]; then
  sign_in_status="$(curl -sS -o /dev/null -w "%{http_code}" "$BASE_URL/auth/sign-in")"
  if [ "$sign_in_status" != "307" ] && [ "$sign_in_status" != "302" ]; then
    echo "Expected sign-in redirect when Keycloak smoke config is present, got $sign_in_status"
    exit 1
  fi

  sign_out_status="$(curl -sS -o /dev/null -w "%{http_code}" "$BASE_URL/auth/sign-out")"
  if [ "$sign_out_status" != "307" ] && [ "$sign_out_status" != "302" ]; then
    echo "Expected sign-out redirect when Keycloak smoke config is present, got $sign_out_status"
    exit 1
  fi
else
  echo "Skipping auth redirect smoke tests because Keycloak smoke config is not present."
fi

echo "Dev ALB smoke tests passed."
