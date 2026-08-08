import { createHash } from "node:crypto";
import { createReadStream } from "node:fs";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";

const projectRoot = path.resolve(".");
const outputRoot = path.join(projectRoot, "_site");
const mediaRoot = path.join(projectRoot, "public-media");
const manifest = JSON.parse(await readFile(path.join(mediaRoot, "manifest.json"), "utf8"));
const pages = JSON.parse(await readFile(path.join(projectRoot, "src", "_data", "pages.json"), "utf8"));
const errors = [];
let totalBytes = 0;

function inside(root, relativePath) {
  const absolute = path.resolve(root, relativePath);
  const relative = path.relative(root, absolute);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Unsafe compatibility path: ${relativePath}`);
  }
  return absolute;
}

async function digest(file) {
  const hash = createHash("sha256");
  for await (const chunk of createReadStream(file)) hash.update(chunk);
  return hash.digest("hex");
}

for (const entry of manifest.files) {
  const target = inside(outputRoot, entry.path);
  const source = inside(mediaRoot, entry.source || entry.path);
  try {
    totalBytes += entry.bytes;
    await stat(source);
    const details = await stat(target);
    if (details.size !== entry.bytes) {
      errors.push(`${entry.path}: expected ${entry.bytes} bytes, found ${details.size}`);
      continue;
    }
    const actualHash = await digest(target);
    if (actualHash !== entry.sha256) errors.push(`${entry.path}: checksum mismatch`);
  } catch {
    errors.push(`${entry.path}: missing from the built site`);
  }
}

for (const page of pages) {
  const route = page.route.replace(/^\/+/, "");
  const target = page.route.endsWith("/")
    ? path.join(outputRoot, route, "index.html")
    : path.join(outputRoot, route);
  try {
    await stat(target);
  } catch {
    errors.push(`${page.route}: public page route is missing`);
  }
}

if (errors.length) {
  process.stderr.write(`Compatibility validation failed (${errors.length}):\n${errors.join("\n")}\n`);
  process.exit(1);
}

const totalFiles = manifest.files.length;
process.stdout.write(`Validated ${pages.length} public page routes and ${totalFiles} media paths (${totalBytes} bytes).\n`);
