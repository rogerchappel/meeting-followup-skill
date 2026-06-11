export function formatPlan(plan, format = 'json') {
  if (format === 'json') return `${JSON.stringify(plan, null, 2)}\n`;
  if (format !== 'md') throw new Error(`Unsupported format: ${format}`);
  const findings = plan.safety.map(f => `- ${f.level.toUpperCase()} ${f.code}: ${f.message}`).join('\n') || '- None';
  const checklist = plan.checklist.map(item => `- [${item.done ? 'x' : ' '}] ${item.item}`).join('\n');
  return [`# ${plan.title}`, '', `Status: ${plan.status}`, '', '## Follow-up Draft', plan.followup, '', '## CRM Note', '```', plan.crmNote, '```', '', '## Checklist', checklist, '', '## Safety Findings', findings, ''].join('\n');
}
