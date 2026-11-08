#!/usr/bin/env bash
set -euo pipefail
npm test
npm run check
npm run build
smoke_output=$(mktemp "${TMPDIR:-/tmp}/meeting-followup-skill-smoke.XXXXXX")
trap 'rm -f "$smoke_output"' EXIT
npm run smoke >"$smoke_output"
test -s "$smoke_output"
