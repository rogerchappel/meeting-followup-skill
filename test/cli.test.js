import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

const runCli = (...args) => spawnSync(
  process.execPath,
  ['bin/meeting-followup-skill.js', ...args],
  { encoding: 'utf8' }
);

test('prints help without requiring an input file', () => {
  const result = runCli('--help');

  assert.equal(result.status, 0);
  assert.match(result.stdout, /^Usage: meeting-followup-skill/);
  assert.equal(result.stderr, '');
});

test('rejects a missing input option value with a usage error', () => {
  const result = runCli('plan', '--input');

  assert.equal(result.status, 2);
  assert.equal(result.stderr, 'Option --input requires a value.\n');
  assert.doesNotMatch(result.stderr, /\n\s+at /);
});

test('reports unreadable input without a Node stack trace', () => {
  const result = runCli('plan', '--input', 'does-not-exist.md');

  assert.equal(result.status, 3);
  assert.equal(result.stderr, 'Unable to read input "does-not-exist.md": file not found.\n');
  assert.doesNotMatch(result.stderr, /\n\s+at /);
});

test('rejects missing and unsupported format values', () => {
  const missing = runCli('plan', '--input', 'fixtures/customer-sync.md', '--format');
  assert.equal(missing.status, 2);
  assert.equal(missing.stderr, 'Option --format requires a value.\n');

  const unsupported = runCli('plan', '--input', 'fixtures/customer-sync.md', '--format', 'yaml');
  assert.equal(unsupported.status, 2);
  assert.equal(unsupported.stderr, 'Unsupported format "yaml". Expected json or md.\n');
});

test('plans successfully in documented JSON and Markdown formats', () => {
  const json = runCli('plan', '--input', 'fixtures/customer-sync.md', '--format', 'json');
  assert.equal(json.status, 0);
  assert.equal(JSON.parse(json.stdout).title, 'Customer Sync');

  const markdown = runCli('plan', '--input', 'fixtures/customer-sync.md', '--format', 'md');
  assert.equal(markdown.status, 0);
  assert.match(markdown.stdout, /^# Customer Sync/);
});

test('validates safe and blocked input with stable statuses', () => {
  const safe = runCli('validate', '--input', 'fixtures/customer-sync.md');
  assert.equal(safe.status, 0);
  assert.equal(JSON.parse(safe.stdout).status, 'ok');

  const blocked = runCli('validate', '--input', 'fixtures/unsafe-notes.md');
  assert.equal(blocked.status, 1);
  assert.equal(JSON.parse(blocked.stdout).status, 'blocked');
});
