# meeting-followup-skill

Use this skill when an agent needs to turn meeting notes, transcript excerpts, or call summaries into follow-up drafts, CRM notes, and action registers.

## Required Inputs
- A local markdown or text file with meeting notes.
- Optional human-provided context about recipients, CRM conventions, or tone.

## Tools
- Node.js 20 or newer.
- Local filesystem read access to the meeting notes file.

## Side-effect Boundaries
- This skill reads local files and writes output to stdout only.
- It must not send email, update CRM records, create tickets, schedule meetings, or contact external services.
- Any external action suggested by the output requires explicit user approval in a later step.

## Workflow
1. Run validation on the notes file.
   Action due dates may use `YYYY-MM-DD`, `today`, `tomorrow`, or `next week`; impossible calendar dates are reported as missing.
   Attendees may be written inline (`Attendees: Mina, Jay`) or as `-`/`*`
   bullets under an `Attendees` or `Participants` heading; duplicates are
   collapsed.
2. Review blockers, warnings, and approval findings.
3. Generate the draft plan in markdown or JSON.
4. Ask the user to confirm factual accuracy and approve any external send or write.
5. Use only approved text outside the local workspace.

## Examples
```bash
meeting-followup-skill validate --input fixtures/customer-sync.md
meeting-followup-skill plan --input fixtures/customer-sync.md --format md
```

## Verification
Run `npm test`, `npm run check`, `npm run build`, `npm run smoke`, or `bash scripts/validate.sh` before trusting changes.
