export function parseMeetingNotes(text) {
  const lines = String(text || '').split(/?
/);
  const meeting = { title: 'Untitled meeting', attendees: [], decisions: [], risks: [], questions: [], actions: [], notes: [] };
  let section = '';
  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;
    const heading = line.match(/^#{1,3}s+(.*)$/);
    if (heading) {
      const label = heading[1].trim();
      if (meeting.title === 'Untitled meeting') meeting.title = label;
      section = label.toLowerCase();
      continue;
    }
    if (/^attendees?:/i.test(line)) {
      meeting.attendees.push(...line.replace(/^attendees?:/i, '').split(/[,;]/).map(x => x.trim()).filter(Boolean));
      continue;
    }
    if (/^decision:/i.test(line) || section.includes('decision')) meeting.decisions.push(cleanBullet(line.replace(/^decision:/i, '')));
    else if (/^risk:/i.test(line) || section.includes('risk')) meeting.risks.push(cleanBullet(line.replace(/^risk:/i, '')));
    else if (/^question:/i.test(line) || section.includes('question')) meeting.questions.push(cleanBullet(line.replace(/^question:/i, '')));
    else if (/^- [[ xX]]/.test(line) || /^action:/i.test(line) || section.includes('action')) meeting.actions.push(parseAction(line));
    else meeting.notes.push(cleanBullet(line));
  }
  meeting.attendees = [...new Set(meeting.attendees)];
  return meeting;
}

function cleanBullet(value) { return String(value || '').replace(/^[-*]s*/, '').trim(); }

export function parseAction(line) {
  const text = cleanBullet(String(line).replace(/^- [[ xX]]s*/, '').replace(/^action:/i, ''));
  const due = (text.match(/due[: ]+(d{4}-d{2}-d{2}|next week|tomorrow|today)/i) || [])[1] || null;
  const ownerMatch = text.match(/^([^:]+):s+(.+)$/);
  const owner = ownerMatch ? ownerMatch[1].trim() : null;
  const task = ownerMatch ? ownerMatch[2].replace(/due[: ].*$/i, '').trim() : text.replace(/due[: ].*$/i, '').trim();
  return { owner, task, due };
}
