// Checks index.json the way moth reads it: {"packages": {"name": {"repository": "...", "about": "..."}}}, names
// in alphabetical order, and, for a repository on GitHub, that it has the package's main file, <name>.moth.
// Run: node check-index.mjs [--offline]
import { readFileSync } from "node:fs";

const offline = process.argv.includes("--offline");
const problems = [];
let index;
try {
  index = JSON.parse(readFileSync(new URL("./index.json", import.meta.url), "utf8"));
} catch (err) {
  console.error(`index.json isn't JSON: ${err.message}`);
  process.exit(1);
}

const isObject = (v) => v !== null && typeof v === "object" && !Array.isArray(v);
if (!isObject(index) || !isObject(index.packages) || Object.keys(index).length !== 1) {
  console.error('index.json must be {"packages": {...}} and nothing else');
  process.exit(1);
}

const names = Object.keys(index.packages);
const sorted = [...names].sort();
if (names.join("\n") !== sorted.join("\n")) problems.push(`the names must be in alphabetical order: ${sorted.join(", ")}`);

for (const name of names) {
  const entry = index.packages[name];
  if (!/^[a-z][a-z0-9_]*$/.test(name)) problems.push(`'${name}': a name is lowercase letters, digits and _, starting with a letter`);
  if (!isObject(entry)) {
    problems.push(`'${name}' must be {"repository": "...", "about": "..."}`);
    continue;
  }
  const extra = Object.keys(entry).filter((k) => k !== "repository" && k !== "about");
  if (extra.length) problems.push(`'${name}' has ${extra.join(", ")}, which the index doesn't keep`);
  if (typeof entry.repository !== "string" || !entry.repository.trim()) problems.push(`'${name}' needs its repository`);
  if (typeof entry.about !== "string" || !entry.about.trim()) problems.push(`'${name}' needs a line about it`);
  else if (entry.about.length > 100 || /\n/.test(entry.about)) problems.push(`'${name}': its about is one line of at most 100 characters`);
}

// a GitHub repository's main file, from its default branch
if (!offline) {
  for (const name of names) {
    const repository = index.packages[name]?.repository;
    const found = typeof repository === "string" && /^(?:https:\/\/)?github\.com\/([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?$/.exec(repository.trim());
    if (!found) continue;
    const url = `https://raw.githubusercontent.com/${found[1]}/${found[2]}/HEAD/${name}.moth`;
    const answer = await fetch(url, { method: "HEAD" }).catch((err) => ({ status: err.message }));
    if (answer.status !== 200) problems.push(`'${name}': ${repository} has no ${name}.moth at its top (${url}: ${answer.status})`);
  }
}

if (problems.length) {
  for (const problem of problems) console.error(problem);
  process.exit(1);
}
console.log(names.length ? `index.json is fine: ${names.length} package${names.length === 1 ? "" : "s"}` : "index.json is fine: no packages yet");
