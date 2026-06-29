import { execFileSync } from "node:child_process";

const output = execFileSync("npm", ["pack", "--dry-run", "--json"], {
  encoding: "utf8"
});

const [pack] = JSON.parse(output);
const files = new Set(pack.files.map((file) => file.path));
const required = [
  "bin/meeting-followup-skill.js",
  "src/format.js",
  "src/index.js",
  "src/parser.js",
  "src/planner.js",
  "src/safety.js",
  "fixtures/customer-sync.md",
  "fixtures/unsafe-notes.md",
  "README.md",
  "LICENSE",
  "SKILL.md",
  "CHANGELOG.md",
  "SECURITY.md",
  "CONTRIBUTING.md"
];

const missing = required.filter((file) => !files.has(file));

if (missing.length > 0) {
  console.error(`Package smoke failed; missing: ${missing.join(", ")}`);
  process.exit(1);
}

console.log(`package smoke ok: ${pack.filename} includes ${pack.files.length} files`);
