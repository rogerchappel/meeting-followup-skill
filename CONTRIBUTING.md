# Contributing

Thanks for helping improve `meeting-followup-skill`.

## Local Verification

```bash
npm run release:check
```

The release check runs tests, static checks, build validation, the fixture-backed
CLI smoke command, and the package dry run.

## Pull Requests

- Keep parser, planner, formatter, and safety changes covered by tests.
- Use synthetic notes in fixtures. Do not commit real customer, calendar, or CRM data.
- Preserve the dry-run safety model: generated follow-up text is a review draft, not an external action.
- Update README or `docs/VERIFICATION.md` when CLI commands change.

