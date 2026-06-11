# Orchestration

1. Read meeting notes from a local file.
2. Run `meeting-followup-skill validate --input notes.md` to check for blockers.
3. Run `meeting-followup-skill plan --input notes.md --format md` to produce draft artifacts.
4. Ask the user to approve any email, CRM, ticket, or calendar side effect.
5. Copy only approved text into external systems.

The CLI never sends messages or writes to external services. Treat all output as a draft until a human confirms it.
