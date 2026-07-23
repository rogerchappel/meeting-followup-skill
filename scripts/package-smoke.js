import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";

const output = execFileSync("npm", ["pack", "--json"], {
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

const tarball = resolve(pack.filename);
const consumer = mkdtempSync(join(tmpdir(), "meeting-followup-package-smoke-"));

try {
  execFileSync("npm", [
    "install",
    "--ignore-scripts",
    "--no-audit",
    "--no-fund",
    "--prefix",
    consumer,
    tarball
  ], { stdio: "pipe" });

  const libraryOutput = execFileSync("node", [
    "--input-type=module",
    "--eval",
    "import { createFollowupPlan } from 'meeting-followup-skill'; process.stdout.write(createFollowupPlan('# Test').status)"
  ], { cwd: consumer, encoding: "utf8" });

  if (libraryOutput !== "draft") {
    throw new Error(`package-root import returned unexpected status: ${libraryOutput}`);
  }

  execFileSync(
    join(consumer, "node_modules", ".bin", "meeting-followup-skill"),
    ["--help"],
    { stdio: "pipe" }
  );
} finally {
  rmSync(consumer, { recursive: true, force: true });
  rmSync(tarball, { force: true });
}

console.log(
  `package smoke ok: ${pack.filename} includes ${pack.files.length} files; library import and CLI work after install`
);
