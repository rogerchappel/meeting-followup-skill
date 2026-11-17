# Tasks

## Done
- Package scaffold and CLI entrypoint.
- Meeting notes parser.
- Follow-up and CRM note planner.
- Safety checks for missing owners, due dates, credentials, and external action language.
- Fixture-backed tests and smoke command.

## Next
- Add selectable CRM note templates beyond the current fixed summary (Meeting, Attendees, Decisions, Actions, Risks, and Open Questions). Proposed initial styles are `compact` (one-line meeting context followed by labeled decisions and actions) and `standard` (the current labeled-section layout with risks and open questions). A future `--crm-template <compact|standard>` option should default to `standard`; unknown names must be rejected rather than silently falling back. Template fixtures should assert exact output for populated sections, omitted empty sections, and text requiring Markdown escaping. This is planned behavior only: no selectable CRM templates or `--crm-template` option are currently implemented; the existing fixed CRM note remains the only output.
