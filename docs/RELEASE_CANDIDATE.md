# Release Candidate Notes

## Classification
ship

## Included
- Local-first meeting follow-up CLI and ESM API.
- Fixture-backed parser and planner tests.
- Safety checks for secrets, missing owners, missing due dates, and approval-gated external action language.
- Reusable SKILL.md for agent operators.

## Verification
- npm test
- npm run check
- npm run build
- npm run smoke
- bash scripts/validate.sh

## Known Gaps
- Parser intentionally favors structured notes over raw diarized transcripts.
- CRM-specific templates are planned but not included in this MVP.
