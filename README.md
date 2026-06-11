# meeting-followup-skill

Local-first CLI and library for converting meeting notes into safe follow-up drafts, CRM-ready notes, action registers, and review checklists.

## Quickstart

```bash
npm test
npm run smoke
node bin/meeting-followup-skill.js plan --input fixtures/customer-sync.md --format md
```

## CLI

```bash
meeting-followup-skill validate --input notes.md
meeting-followup-skill plan --input notes.md --format json
meeting-followup-skill plan --input notes.md --format md
```

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
- No live integrations and no external writes.
- Human review is required before sending or logging anything.

## Safety Notes
The skill is intentionally dry-run only. Output that mentions sending email, posting, scheduling, or updating a CRM is an approval-gated recommendation, not an action.
