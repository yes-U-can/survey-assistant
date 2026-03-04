import fs from "node:fs";
import path from "node:path";

let loaded = false;

function stripQuotes(value: string) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseEnvFile(content: string) {
  const entries: Array<{ key: string; value: string }> = [];
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) {
      continue;
    }

    const eqIndex = line.indexOf("=");
    if (eqIndex < 1) {
      continue;
    }

    const key = line.slice(0, eqIndex).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) {
      continue;
    }

    const value = stripQuotes(line.slice(eqIndex + 1));
    entries.push({ key, value });
  }
  return entries;
}

export function loadTestEnv(rootDir = process.cwd()) {
  if (loaded) {
    return;
  }

  const candidates = [".env.local", ".env"];
  for (const file of candidates) {
    const filePath = path.join(rootDir, file);
    if (!fs.existsSync(filePath)) {
      continue;
    }

    const content = fs.readFileSync(filePath, "utf8");
    for (const { key, value } of parseEnvFile(content)) {
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  }

  loaded = true;
}

