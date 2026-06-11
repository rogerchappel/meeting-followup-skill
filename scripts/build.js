import { createFollowupPlan } from '../src/index.js';
const plan = createFollowupPlan('# Smoke\nAttendees: Ada\nAction: Ada: verify package due today');
if (plan.status !== 'draft') throw new Error('Expected draft smoke plan');
console.log('build ok');
