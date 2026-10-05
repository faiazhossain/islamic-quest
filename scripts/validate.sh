#!/bin/sh
# Amal Quest phase validator.
# Runs after every implementation phase; a failing check stops the pipeline.
set -e
cd "$(dirname "$0")/.."

echo "== lint =="
npm run lint

echo "== tests =="
npm test

echo "== production build =="
npm run build

echo ""
echo "OK: lint, tests, and build all passed"
