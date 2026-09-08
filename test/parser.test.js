import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { parseMeetingNotes } from '../src/index.js';

test('parses attendees decisions and actions', () => {
  const meeting = parseMeetingNotes(fs.readFileSync('fixtures/customer-sync.md', 'utf8'));
  assert.equal(meeting.title, 'Customer Sync');
  assert.deepEqual(meeting.attendees, ['Mina', 'Jay', 'Omar']);
  assert.equal(meeting.decisions.length, 2);
  assert.equal(meeting.actions[0].owner, 'Mina');
  assert.equal(meeting.actions[0].due, '2026-06-14');
});

test('retains supported relative action dates', () => {
  const meeting = parseMeetingNotes('# Sync\n## Actions\n- Mina: send recap due tomorrow\n- Jay: review due next week');
  assert.deepEqual(meeting.actions.map(action => action.due), ['tomorrow', 'next week']);
});

test('preserves task wording that merely contains due', () => {
  const meeting = parseMeetingNotes('# Sync\n## Actions\n- Mina: complete due diligence report');
  assert.deepEqual(meeting.actions, [{ owner: 'Mina', task: 'complete due diligence report', due: null }]);
});

test('removes only the recognized due clause from task wording', () => {
  const meeting = parseMeetingNotes('# Sync\n## Actions\n- Mina: send recap due tomorrow after legal approval');
  assert.deepEqual(meeting.actions, [{ owner: 'Mina', task: 'send recap after legal approval', due: 'tomorrow' }]);
});

test('extracts the owner when a due clause precedes the owner colon', () => {
  const meeting = parseMeetingNotes('# Sync\n## Actions\n- [ ] Sam due tomorrow: send recap');
  assert.deepEqual(meeting.actions, [{ owner: 'Sam', task: 'send recap', due: 'tomorrow' }]);
});

test('removes parenthesized due clauses together with their delimiters', () => {
  const meeting = parseMeetingNotes('# Sync\n## Actions\n- [ ] Mina: send recap (due tomorrow)');
  assert.deepEqual(meeting.actions, [{ owner: 'Mina', task: 'send recap', due: 'tomorrow' }]);
});

test('removes bracket-wrapped due clauses together with their delimiters', () => {
  const meeting = parseMeetingNotes('# Sync\n## Actions\n- [ ] Mina: send recap [due next week]');
  assert.deepEqual(meeting.actions, [{ owner: 'Mina', task: 'send recap', due: 'next week' }]);
});

test('normalizes delimiter remnants around removed due clauses', () => {
  const meeting = parseMeetingNotes(`# Sync
## Actions
- Mina: send recap (due tomorrow
- Jay: review due tomorrow)
- Priya: send recap (due: tomorrow)`);
  assert.deepEqual(meeting.actions, [
    { owner: 'Mina', task: 'send recap', due: 'tomorrow' },
    { owner: 'Jay', task: 'review', due: 'tomorrow' },
    { owner: 'Priya', task: 'send recap', due: 'tomorrow' }
  ]);
});

test('reports the first due clause and strips a later one from the task', () => {
  const meeting = parseMeetingNotes('# Sync\n## Actions\n- Sam due tomorrow: send recap due next week');
  assert.deepEqual(meeting.actions, [{ owner: 'Sam', task: 'send recap', due: 'tomorrow' }]);
});

test('represents impossible calendar dates as missing', () => {
  const meeting = parseMeetingNotes('# Sync\n## Actions\n- Mina: send recap due 2026-02-29\n- Jay: review due 2026-13-01');
  assert.deepEqual(meeting.actions.map(action => action.due), [null, null]);
});

test('parses attendee section bullets without leaking them into notes', () => {
  const meeting = parseMeetingNotes(`# Weekly Sync
## Attendees
- Sam
* Lee
## Decisions
- Keep the Friday release
## Actions
- [ ] Sam: send recap due tomorrow`);

  assert.deepEqual(meeting.attendees, ['Sam', 'Lee']);
  assert.deepEqual(meeting.notes, []);
  assert.deepEqual(meeting.decisions, ['Keep the Friday release']);
  assert.deepEqual(meeting.actions, [{ owner: 'Sam', task: 'send recap', due: 'tomorrow' }]);
});

test('supports Participants headings and deduplicates inline attendees', () => {
  const meeting = parseMeetingNotes(`# Planning
Attendees: Sam, Lee; Sam
## Participants
- Lee
- Priya
## Questions
- Is Friday still available?`);

  assert.deepEqual(meeting.attendees, ['Sam', 'Lee', 'Priya']);
  assert.deepEqual(meeting.questions, ['Is Friday still available?']);
  assert.deepEqual(meeting.notes, []);
});

test('deduplicates attendees case-insensitively while preserving first spelling', () => {
  const meeting = parseMeetingNotes(`# Planning
Attendees: Mina, mina
## Participants
- MINA
- Jay`);

  assert.deepEqual(meeting.attendees, ['Mina', 'Jay']);
});

test('parses only Markdown bullets beneath action headings', () => {
  const meeting = parseMeetingNotes(`# Review
## Actions
No actions assigned.
- Mina: send recap due tomorrow
* Jay: review notes due next week
- [x] Mina: confirm delivery due today
- [ ] Jay: archive notes due 2026-09-08`);

  assert.deepEqual(meeting.notes, ['No actions assigned.']);
  assert.deepEqual(meeting.actions, [
    { owner: 'Mina', task: 'send recap', due: 'tomorrow' },
    { owner: 'Jay', task: 'review notes', due: 'next week' },
    { owner: 'Mina', task: 'confirm delivery', due: 'today' },
    { owner: 'Jay', task: 'archive notes', due: '2026-09-08' }
  ]);
});

test('does not classify headings by arbitrary substrings', () => {
  const meeting = parseMeetingNotes(`# Review
## Satisfaction
- Scores improved
## Risk appetite
- Keep the current threshold
## Questions afterward
- Share the recording`);

  assert.deepEqual(meeting.actions, []);
  assert.deepEqual(meeting.risks, []);
  assert.deepEqual(meeting.questions, []);
  assert.deepEqual(meeting.notes, [
    'Scores improved',
    'Keep the current threshold',
    'Share the recording'
  ]);
});

test('keeps checked and unchecked checklist bullets as notes outside action sections', () => {
  const meeting = parseMeetingNotes(`# Weekly Sync
## Checklist
- [x] Confirm room booking
- [ ] Read prework`);

  assert.deepEqual(meeting.actions, []);
  assert.deepEqual(meeting.notes, ['[x] Confirm room booking', '[ ] Read prework']);
});

test('parses checked and unchecked checklist bullets inside documented action sections', () => {
  const meeting = parseMeetingNotes(`# Weekly Sync
## Actions
- [x] Mina: send recap due tomorrow
## Action Items
- [ ] Jay: confirm scope due next week`);

  assert.deepEqual(meeting.actions, [
    { owner: 'Mina', task: 'send recap', due: 'tomorrow' },
    { owner: 'Jay', task: 'confirm scope', due: 'next week' }
  ]);
});

test('routes every documented meeting section heading', () => {
  const meeting = parseMeetingNotes(`# Review
## Decision
- Ship the change
## Key Decisions
- Retain the fallback
## Risk
- Schedule may slip
## Key Risks
- Vendor approval may slip
## Question
- Who signs off?
## Open Questions
- When is launch?
## Action
- Mina: send recap due tomorrow
## Action Items
- Jay: confirm scope due next week`);

  assert.deepEqual(meeting.decisions, ['Ship the change', 'Retain the fallback']);
  assert.deepEqual(meeting.risks, ['Schedule may slip', 'Vendor approval may slip']);
  assert.deepEqual(meeting.questions, ['Who signs off?', 'When is launch?']);
  assert.deepEqual(meeting.actions, [
    { owner: 'Mina', task: 'send recap', due: 'tomorrow' },
    { owner: 'Jay', task: 'confirm scope', due: 'next week' }
  ]);
});

test('routes supported sections across valid ATX heading forms', () => {
  const meeting = parseMeetingNotes(`# Review
#### Attendees ####
- Mina
##### Participants ##
- Jay
###### Decisions ######
- Ship the change
#### Risks ###
- Schedule may slip
##### Questions #
- Who signs off?
###### Actions ###
- Mina: send recap due tomorrow`);

  assert.deepEqual(meeting.attendees, ['Mina', 'Jay']);
  assert.deepEqual(meeting.decisions, ['Ship the change']);
  assert.deepEqual(meeting.risks, ['Schedule may slip']);
  assert.deepEqual(meeting.questions, ['Who signs off?']);
  assert.deepEqual(meeting.actions, [
    { owner: 'Mina', task: 'send recap', due: 'tomorrow' }
  ]);
});

test('keeps substring ATX headings and their bullets as notes', () => {
  const meeting = parseMeetingNotes(`# Review
#### Actions afterward ####
- Share the recording
##### Participant notes ##
- Mina joined late`);

  assert.deepEqual(meeting.actions, []);
  assert.deepEqual(meeting.attendees, []);
  assert.deepEqual(meeting.notes, ['Share the recording', 'Mina joined late']);
});

test('requires Markdown bullets beneath decision risk and question headings', () => {
  const meeting = parseMeetingNotes(`# Review
## Decisions
Context only, not a decision.
- Ship the change
## Key Risks
Discussion only, not a risk.
* Schedule may slip
## Open Questions
Background only, not a question.
- Who signs off?`);

  assert.deepEqual(meeting.decisions, ['Ship the change']);
  assert.deepEqual(meeting.risks, ['Schedule may slip']);
  assert.deepEqual(meeting.questions, ['Who signs off?']);
  assert.deepEqual(meeting.notes, [
    'Context only, not a decision.',
    'Discussion only, not a risk.',
    'Background only, not a question.'
  ]);
});

test('recognizes explicit decision risk and question lines outside sections', () => {
  const meeting = parseMeetingNotes(`# Review
Decision: Ship the change
Risk: Schedule may slip
Question: Who signs off?`);

  assert.deepEqual(meeting.decisions, ['Ship the change']);
  assert.deepEqual(meeting.risks, ['Schedule may slip']);
  assert.deepEqual(meeting.questions, ['Who signs off?']);
  assert.deepEqual(meeting.notes, []);
});
