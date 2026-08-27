# meeting-followup-skill

Local-first CLI and library for converting meeting notes into safe follow-up drafts, CRM-ready notes, action registers, and review checklists.

## Quickstart

```bash
npm ci
npm test
npm run check
npm run lint
npm run build
npm run smoke
npm run package:smoke
npm run release:check
node bin/meeting-followup-skill.js plan --input fixtures/customer-sync.md --format md
```

Use `npm ci` from a fresh checkout to install exactly the dependency metadata
committed in `package-lock.json`. The repository check fails when the root
package metadata and lockfile drift apart.

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

The parser accepts comma- or semicolon-separated inline attendee fields such
as `Attendees: Mina, Jay`, and Markdown bullets beneath an `Attendees` or
`Participants` heading. Repeated names are included once. Starting another
heading ends the attendee section, so later decisions and actions retain their
own classifications.

Meeting bullets are routed by explicit section headings. Supported headings
are `Decision`, `Decisions`, and `Key Decisions`; `Risk`, `Risks`, and
`Key Risks`; `Question`, `Questions`, and `Open Questions`; and `Action`,
`Actions`, and `Action Items`. Other headings remain ordinary notes even when
their text contains a word fragment such as `action`.

## What It Produces
- Follow-up email draft.
- CRM note draft.
- Action checklist with owners and due dates.
- Safety findings for credentials, missing ownership, missing due dates, and external-action language.

## Limitations
- Heuristic parser for lightweight notes, not a full transcript understanding model.
- Attendee section entries must use `-` or `*` Markdown bullets.
- Action due dates support `YYYY-MM-DD`, `today`, `tomorrow`, and `next week`; impossible calendar dates are treated as missing.
- A valid `due <value>` clause is removed from the action text after its due date is parsed, while text before and after the clause is retained. The clause may appear before the owner (`Sam due tomorrow: send recap`), after the task, or wrapped in parentheses or brackets (`send recap (due tomorrow)`); surrounding delimiters are removed with the clause. Other uses of `due`, such as `due diligence`, remain part of the task.
- No live integrations and no external writes.
- Human review is required before sending or logging anything.

## Safety Notes
The skill is intentionally dry-run only. Action items that mention sending email, posting, scheduling, updating or writing to a CRM, or logging notes in a CRM are approval-gated recommendations, not actions. Ordinary discussion about a CRM does not create an approval finding unless the action uses one of those side-effect verbs.

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
