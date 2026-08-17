# meeting-followup-skill

Local-first CLI and library for converting meeting notes into safe follow-up drafts, CRM-ready notes, action registers, and review checklists.

## Quickstart

```bash
npm test
npm run check
npm run lint
npm run build
npm run smoke
npm run package:smoke
npm run release:check
node bin/meeting-followup-skill.js plan --input fixtures/customer-sync.md --format md
```

## CLI

```bash
meeting-followup-skill validate --input notes.md
meeting-followup-skill plan --input notes.md --format json
meeting-followup-skill plan --input notes.md --format md
meeting-followup-skill --help
```

`--input` requires a readable file. `--format` accepts `json` (the default) or
`md`. Unknown options, extra positional arguments, and duplicate options are
usage errors; the CLI rejects them instead of producing plan output. It exits
with status 2 for command or option usage errors, 3 when the input cannot be
read, and 1 when `validate` finds a blocker.

## Library

```js
import { createFollowupPlan } from 'meeting-followup-skill';
const plan = createFollowupPlan(notesText);
```

## What It Produces
- Follow-up email draft.
- CRM note draft.
- Action checklist with owners and due dates.
- Safety findings for credentials, missing ownership, missing due dates, and external-action language.

## Limitations
- Heuristic parser for lightweight notes, not a full transcript understanding model.
- Action due dates support `YYYY-MM-DD`, `today`, `tomorrow`, and `next week`; impossible calendar dates are treated as missing.
- No live integrations and no external writes.
- Human review is required before sending or logging anything.

## Safety Notes
The skill is intentionally dry-run only. Output that mentions sending email, posting, scheduling, or updating a CRM is an approval-gated recommendation, not an action.

## Package contents

The npm package allowlist includes the runtime files plus the public support
documents needed for release review: `README.md`, `LICENSE`, `SKILL.md`,
`CHANGELOG.md`, `SECURITY.md`, and `CONTRIBUTING.md`.
Run `npm run package:smoke` before publishing to confirm the CLI, runtime
modules, fixtures, and public support files are present in the tarball and
that both the package-root library import and installed CLI work in a clean
consumer project.

`npm run lint` is the stable contributor alias for the release gate's static
package checks.
