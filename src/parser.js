export function parseMeetingNotes(text) {
  const lines = String(text || '').split(/\r?\n/);
  const meeting = { title: 'Untitled meeting', attendees: [], decisions: [], risks: [], questions: [], actions: [], notes: [] };
  let section = '';
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const heading = line.match(/^#{1,3}\s+(.*)$/);
    if (heading) {
      const label = heading[1].trim();
      if (meeting.title === 'Untitled meeting') meeting.title = label;
      section = label.toLowerCase();
      continue;
    }
    if (/^(?:attendees?|participants?):/i.test(line)) {
      meeting.attendees.push(...line.replace(/^(?:attendees?|participants?):/i, '').split(/[,;]/).map(x => x.trim()).filter(Boolean));
      continue;
    }
    if (isAttendeeSection(section) && /^[-*]\s+/.test(line)) meeting.attendees.push(cleanBullet(line));
    else if (/^decision:/i.test(line) || isSection(section, 'decision')) meeting.decisions.push(cleanBullet(line.replace(/^decision:/i, '')));
    else if (/^risk:/i.test(line) || isSection(section, 'risk')) meeting.risks.push(cleanBullet(line.replace(/^risk:/i, '')));
    else if (/^question:/i.test(line) || isSection(section, 'question')) meeting.questions.push(cleanBullet(line.replace(/^question:/i, '')));
    else if (/^action:/i.test(line) || isSection(section, 'action')) meeting.actions.push(parseAction(line));
    else meeting.notes.push(cleanBullet(line));
  }
  meeting.attendees = [...new Set(meeting.attendees)];
  return meeting;
}

function isAttendeeSection(section) {
  return /^(?:attendees?|participants?)$/.test(section);
}

function isSection(section, kind) {
  const headings = {
    decision: ['decision', 'decisions', 'key decisions'],
    risk: ['risk', 'risks', 'key risks'],
    question: ['question', 'questions', 'open questions'],
    action: ['action', 'actions', 'action items']
  };
  return headings[kind].includes(section);
}

function cleanBullet(value) { return String(value || '').replace(/^[-*]\s*/, '').trim(); }

const DUE_PATTERN = /\bdue[: ]+(\d{4}-\d{2}-\d{2}|next week|tomorrow|today)\b/i;

export function parseAction(line) {
  const text = cleanBullet(String(line).replace(/^- \[[ xX]\]\s*/, '').replace(/^action:/i, ''));
  const dueMatch = text.match(DUE_PATTERN);
  const dueValue = dueMatch?.[1] || null;
  const due = dueValue && (!/^\d{4}-\d{2}-\d{2}$/.test(dueValue) || isCalendarDate(dueValue)) ? dueValue : null;
  const cleaned = due && dueMatch ? removeDueClause(text, dueMatch) : text;
  const ownerMatch = cleaned.match(/^([^:]+):\s+(.+)$/);
  const owner = ownerMatch ? ownerMatch[1].trim() : null;
  let taskText = ownerMatch ? ownerMatch[2] : cleaned;
  const taskDueMatch = taskText.match(DUE_PATTERN);
  if (due && taskDueMatch) taskText = removeDueClause(taskText, taskDueMatch);
  return { owner, task: taskText.trim(), due };
}

function removeDueClause(text, dueMatch) {
  const start = dueMatch.index;
  const end = start + dueMatch[0].length;
  const before = text[start - 1];
  const after = text[end];
  const wrapped = (before === '(' && after === ')') || (before === '[' && after === ']');
  const from = wrapped ? start - 1 : start;
  const to = wrapped ? end + 1 : end;
  return `${text.slice(0, from)} ${text.slice(to)}`
    .replace(/\s{2,}/g, ' ')
    .replace(/\s+([,;:])/g, '$1')
    .replace(/\(\s*\)/g, '')
    .replace(/\[\s*\]/g, '')
    .replace(/\s+[)\]]/g, '')
    .replace(/[(\[]\s*$/g, '')
    .trim();
}

function isCalendarDate(value) {
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}
