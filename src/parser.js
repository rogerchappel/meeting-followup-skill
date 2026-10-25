const DEFAULT_VOCABULARY = {
  attendees: ['attendee', 'attendees', 'participant', 'participants'],
  decisions: ['decision', 'decisions', 'key decisions'],
  risks: ['risk', 'risks', 'key risks'],
  questions: ['question', 'questions', 'open questions'],
  actions: ['action', 'actions', 'action items']
};

export function parseMeetingNotes(text, options = {}) {
  const lines = String(text || '').split(/\r?\n/);
  const vocabulary = normalizeVocabulary(options.vocabulary);
  const meeting = { title: 'Untitled meeting', attendees: [], decisions: [], risks: [], questions: [], actions: [], notes: [] };
  let section = '';
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const heading = line.match(/^#{1,6}(?:[ \t]+|$)(.*)$/);
    if (heading) {
      const label = heading[1].replace(/[ \t]+#+[ \t]*$/, '').trim();
      if (meeting.title === 'Untitled meeting') meeting.title = label;
      section = label.toLocaleLowerCase('en-US');
      continue;
    }
    const attendeeLabel = matchLabel(line, vocabulary.attendees);
    if (attendeeLabel) {
      meeting.attendees.push(...line.slice(attendeeLabel.length + 1).split(/[,;]/).map(x => x.trim()).filter(Boolean));
      continue;
    }
    if (matchesSection(section, vocabulary.attendees) && /^[-*]\s+/.test(line)) meeting.attendees.push(cleanBullet(line));
    else if (matchesLabel(line, vocabulary.decisions) || (matchesSection(section, vocabulary.decisions) && isMarkdownBullet(line))) meeting.decisions.push(cleanBullet(stripLabel(line, vocabulary.decisions)));
    else if (matchesLabel(line, vocabulary.risks) || (matchesSection(section, vocabulary.risks) && isMarkdownBullet(line))) meeting.risks.push(cleanBullet(stripLabel(line, vocabulary.risks)));
    else if (matchesLabel(line, vocabulary.questions) || (matchesSection(section, vocabulary.questions) && isMarkdownBullet(line))) meeting.questions.push(cleanBullet(stripLabel(line, vocabulary.questions)));
    else if (matchesLabel(line, vocabulary.actions) || (matchesSection(section, vocabulary.actions) && isMarkdownBullet(line))) meeting.actions.push(parseAction(stripLabel(line, vocabulary.actions)));
    else meeting.notes.push(cleanBullet(line));
  }
  meeting.attendees = deduplicateAttendees(meeting.attendees);
  return meeting;
}

function isMarkdownBullet(line) {
  return /^[-*]\s+/.test(line);
}

function deduplicateAttendees(attendees) {
  const seen = new Set();
  return attendees.filter(attendee => {
    const identity = attendee.toLocaleLowerCase('en-US');
    if (seen.has(identity)) return false;
    seen.add(identity);
    return true;
  });
}

function normalizeVocabulary(custom = {}) {
  return Object.fromEntries(Object.entries(DEFAULT_VOCABULARY).map(([kind, defaults]) => {
    const supplied = custom[kind];
    const values = supplied === undefined ? defaults : Array.isArray(supplied) ? supplied : [supplied];
    if (!values.every(value => typeof value === 'string' && value.trim())) {
      throw new TypeError(`Vocabulary for ${kind} must contain non-empty strings.`);
    }
    return [kind, [...new Set([...defaults, ...values.map(value => value.trim().toLocaleLowerCase('en-US'))])]];
  }));
}

function matchesSection(section, terms) { return terms.includes(section); }

function matchLabel(line, terms) {
  const match = line.match(/^([^:]+):/);
  return match && terms.includes(match[1].trim().toLocaleLowerCase('en-US')) ? match[1] : null;
}

function matchesLabel(line, terms) { return Boolean(matchLabel(line, terms)); }
function stripLabel(line, terms) {
  const label = matchLabel(line, terms);
  return label ? line.slice(label.length + 1) : line;
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
