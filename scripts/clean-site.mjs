import { rm } from "node:fs/promises";
import path from "node:path";

const outputDirectory = path.resolve("_site");

if (path.dirname(outputDirectory) !== process.cwd() || path.basename(outputDirectory) !== "_site") {
  throw new Error(`Refusing to clean unexpected output directory: ${outputDirectory}`);
}

await rm(outputDirectory, { recursive: true, force: true });
