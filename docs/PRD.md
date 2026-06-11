# Product Requirements: meeting-followup-skill

## Goal
Give agents a repeatable local workflow for turning meeting notes into follow-up material that is useful but never sent or written externally without approval.

## Functional Requirements
- Parse markdown or plain text meeting notes.
- Extract attendees, decisions, risks, questions, and action items.
- Produce a follow-up draft, CRM note, checklist, and safety findings.
- Exit non-zero for validation blockers.
- Keep all behavior local-first and deterministic for fixtures.

## Safety Requirements
- Detect secret-like content.
- Flag external action language as approval-gated.
- Keep generated output as drafts only.

## Success Metrics
- Fixture tests cover parser and safety behavior.
- Smoke command produces markdown output.
- Another agent can run the skill with only Node.js.
