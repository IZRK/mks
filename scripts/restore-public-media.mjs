import { cp, mkdir, readFile } from "node:fs/promises";
import path from "node:path";

const projectRoot = path.resolve(".");
const mediaRoot = path.join(projectRoot, "public-media");
const outputRoot = path.join(projectRoot, "_site");
const manifest = JSON.parse(await readFile(path.join(mediaRoot, "manifest.json"), "utf8"));

function inside(root, relativePath) {
  const absolute = path.resolve(root, relativePath);
  const relative = path.relative(root, absolute);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error(`Unsafe public media path: ${relativePath}`);
  }
  return absolute;
}

await mkdir(outputRoot, { recursive: true });
await cp(
  path.join(mediaRoot, "wp-content"),
  path.join(outputRoot, "wp-content"),
  { recursive: true, force: true }
);

for (const file of manifest.files.filter((entry) => entry.source)) {
  const source = inside(mediaRoot, file.source);
  const target = inside(outputRoot, file.path);
  await mkdir(path.dirname(target), { recursive: true });
  await cp(source, target, { force: true });
}

const totalFiles = manifest.files.length;
const totalBytes = manifest.files.reduce((sum, file) => sum + file.bytes, 0);
process.stdout.write(`Restored ${totalFiles} public media paths (${totalBytes} bytes).\n`);
