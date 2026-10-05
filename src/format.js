export function formatPlan(plan, format = 'json') {
  if (format === 'json') return `${JSON.stringify(plan, null, 2)}\n`;
  if (format === 'calendar') return formatCalendarSummary(plan);
  if (format !== 'md') throw new Error(`Unsupported format: ${format}`);
  const findings = plan.safety.map(f => `- ${f.level.toUpperCase()} ${f.code}: ${f.message}`).join('\n') || '- None';
  const checklist = plan.checklist.map(item => `- [${item.done ? 'x' : ' '}] ${item.item}`).join('\n');
  const notes = plan.meeting.notes.map(note => `- ${note}`).join('\n') || '- None';
  return [`# ${plan.title}`, '', `Status: ${plan.status}`, '', '## Follow-up Draft', plan.followup, '', '## CRM Note', '```', plan.crmNote, '```', '', '## Meeting Notes', notes, '', '## Checklist', checklist, '', '## Safety Findings', findings, ''].join('\n');
}

function formatCalendarSummary(plan) {
  const { meeting } = plan;
  const bullets = values => values.length ? values.map(value => `- ${value}`).join('\n') : '- None captured';
  const actions = meeting.actions.length
    ? meeting.actions.map(action => `- ${action.task} (owner: ${action.owner || 'unassigned'}; due: ${action.due || 'unscheduled'})`).join('\n')
    : '- None captured';
  return [
    `# ${plan.title} — Calendar Summary`,
    '',
    `Attendees: ${meeting.attendees.join(', ') || 'Not captured'}`,
    '',
    '## Decisions', bullets(meeting.decisions), '',
    '## Action items', actions, '',
    '## Risks', bullets(meeting.risks), '',
    '## Open questions', bullets(meeting.questions), '',
    '## Review status', plan.status, ''
  ].join('\n');
}
