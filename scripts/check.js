import fs from 'node:fs';
const required = ['README.md', 'SKILL.md', 'package-lock.json', 'docs/PRD.md', 'docs/TASKS.md', 'docs/ORCHESTRATION.md', 'bin/meeting-followup-skill.js'];
const missing = required.filter(file => !fs.existsSync(file));
if (missing.length) {
  console.error(`Missing required files: ${missing.join(', ')}`);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const lockfile = JSON.parse(fs.readFileSync('package-lock.json', 'utf8'));
const lockedRoot = lockfile.packages?.[''];
const synchronizedFields = ['name', 'version', 'license', 'bin', 'engines', 'dependencies', 'devDependencies', 'optionalDependencies', 'peerDependencies'];
const normalize = (field, value) => field === 'bin' && value
  ? Object.fromEntries(Object.entries(value).map(([name, path]) => [name, path.replace(/^\.\//, '')]))
  : value ?? null;
const drifted = synchronizedFields.filter((field) =>
  JSON.stringify(normalize(field, manifest[field])) !== JSON.stringify(normalize(field, lockedRoot?.[field]))
);

if (lockfile.lockfileVersion !== 3 || !lockedRoot || drifted.length) {
  console.error(`package-lock.json is out of sync with package.json${drifted.length ? `: ${drifted.join(', ')}` : ''}; run npm install --package-lock-only`);
  process.exit(1);
}
console.log('check ok');
