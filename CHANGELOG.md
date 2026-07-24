# Changelog

## Unreleased

- Validate CLI option values before execution and report unreadable inputs
  without exposing Node.js stack traces.
- Cover help, usage errors, input errors, plan formats, and validation exit
  statuses with CLI-level regression tests.

## 0.1.0

- Initial release candidate for dry-run meeting follow-up planning.
- Provides CLI commands for validation and Markdown or JSON follow-up plans.
- Includes parser, planner, formatter, safety checks, fixtures, and release verification docs.
