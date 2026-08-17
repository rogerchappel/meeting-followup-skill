import { parseMeetingNotes } from './parser.js';
import { inspectSafety, hasBlockers } from './safety.js';

export function createFollowupPlan(text, options = {}) {
  const meeting = parseMeetingNotes(text);
  const safety = inspectSafety(meeting, text);
  return {
    title: meeting.title,
    generatedAt: options.now || new Date().toISOString(),
    status: hasBlockers(safety) ? 'blocked' : 'draft',
    meeting,
    followup: buildFollowup(meeting),
    crmNote: buildCrmNote(meeting),
    checklist: buildChecklist(meeting, safety),
    safety
  };
}

function buildFollowup(meeting) {
  const greeting = meeting.attendees.length ? `Hi ${meeting.attendees.join(', ')},` : 'Hi team,';
  const decisions = meeting.decisions.length ? meeting.decisions.map(item => `- ${item}`).join('\n') : '- No explicit decisions captured.';
  const actions = meeting.actions.length ? meeting.actions.map(action => `- ${action.owner || 'Unassigned'}: ${action.task}${action.due ? ` (due ${action.due})` : ''}`).join('\n') : '- No action items captured.';
  return `${greeting}\n\nThanks for the discussion. Here is my draft recap.\n\nDecisions:\n${decisions}\n\nActions:\n${actions}\n\nPlease reply with corrections before this is sent or logged.`;
}

function buildCrmNote(meeting) {
  return [
    `Meeting: ${meeting.title}`,
    `Attendees: ${meeting.attendees.join(', ') || 'Not captured'}`,
    `Decisions: ${meeting.decisions.join('; ') || 'None captured'}`,
    `Risks: ${meeting.risks.join('; ') || 'None captured'}`,
    `Open questions: ${meeting.questions.join('; ') || 'None captured'}`
  ].join('\n');
}

function buildChecklist(meeting, safety) {
  return [
    { item: 'Confirm attendee list', done: meeting.attendees.length > 0 },
    { item: 'Confirm decisions are accurate', done: meeting.decisions.length > 0 },
    { item: 'Assign every action item to an owner', done: meeting.actions.length > 0 && meeting.actions.every(action => action.owner) },
    { item: 'Confirm due dates for action items', done: meeting.actions.length > 0 && meeting.actions.every(action => action.due) },
    { item: 'Get approval before external sends or CRM writes', done: !safety.some(f => f.level === 'approval') }
  ];
}
