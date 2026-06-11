#!/usr/bin/env bash
set -euo pipefail
npm test
npm run check
npm run build
npm run smoke >/tmp/meeting-followup-skill-smoke.md
test -s /tmp/meeting-followup-skill-smoke.md
