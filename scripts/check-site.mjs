import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import * as cheerio from "cheerio";

const outputDir = path.resolve("_site");
const errors = [];
const warnings = [];
const configuredPrefix = process.env.PATH_PREFIX || "/";
const pathPrefix = configuredPrefix === "/"
  ? ""
  : `/${configuredPrefix.replace(/^\/+|\/+$/g, "")}`;

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(absolute));
    else files.push(absolute);
  }
  return files;
}

function outputTarget(urlPath) {
  let clean = decodeURIComponent(urlPath.split("?")[0].split("#")[0]);
  if (pathPrefix && (clean === pathPrefix || clean.startsWith(`${pathPrefix}/`))) {
    clean = clean.slice(pathPrefix.length) || "/";
  }
  if (clean.endsWith("/")) return path.join(outputDir, clean, "index.html");
  return path.join(outputDir, clean);
}

async function exists(file) {
  try {
    await access(file);
    return true;
  } catch {
    return false;
  }
}

const allFiles = await walk(outputDir);
const htmlFiles = allFiles.filter((file) => file.endsWith(".html"));

for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const $ = cheerio.load(html);
  const relativeFile = path.relative(outputDir, file);

  if (!$('html[lang="en"], html[lang="sl"]').length) errors.push(`${relativeFile}: missing valid html lang`);
  if ($('h1').length !== 1) errors.push(`${relativeFile}: expected one h1, found ${$('h1').length}`);
  if (!$("title").text().trim()) errors.push(`${relativeFile}: empty title`);
  if ($(".site-footer .partner-grid img").length !== 8) errors.push(`${relativeFile}: expected eight partner logos in the footer`);

  if (relativeFile === "index.html" || relativeFile === path.join("en", "index.html")) {
    if ($(".hero-index > span").first().text().trim() !== "34") errors.push(`${relativeFile}: expected 34th-edition hero`);
    if ($(".document-placeholder").length !== 2) errors.push(`${relativeFile}: expected two circular placeholders`);
    if ($(".document-band a").length) errors.push(`${relativeFile}: pending circulars must not be links`);
  }

  const ids = new Set();
  $("[id]").each((_, element) => {
    const id = $(element).attr("id");
    if (ids.has(id)) errors.push(`${relativeFile}: duplicate id #${id}`);
    ids.add(id);
  });

  for (const element of $("img").toArray()) {
    const src = $(element).attr("src");
    const alt = $(element).attr("alt");
    if (alt === undefined) errors.push(`${relativeFile}: image missing alt`);
    if (src?.startsWith("/")) {
      const target = outputTarget(src);
      if (!await exists(target)) errors.push(`${relativeFile}: missing image ${src}`);
    }
  }

  for (const element of $("a[href]").toArray()) {
    const href = $(element).attr("href");
    if (!href?.startsWith("/") || href.startsWith("//")) continue;
    const target = outputTarget(href);
    if (!await exists(target)) errors.push(`${relativeFile}: broken internal link ${href}`);
  }

  $("a[target='_blank']").each((_, element) => {
    if (!($(element).attr("rel") || "").includes("noopener")) {
      warnings.push(`${relativeFile}: target=_blank without noopener`);
    }
  });
}

if (htmlFiles.length !== 40) errors.push(`Expected 40 HTML pages, found ${htmlFiles.length}`);

const languageCounts = { en: 0, sl: 0 };
for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const lang = cheerio.load(html)("html").attr("lang");
  if (lang in languageCounts) languageCounts[lang] += 1;
}
if (languageCounts.en !== 20 || languageCounts.sl !== 20) {
  errors.push(`Expected 20 pages per language, found ${JSON.stringify(languageCounts)}`);
}

if (warnings.length) process.stdout.write(`Warnings (${warnings.length}):\n${warnings.join("\n")}\n`);
if (errors.length) {
  process.stderr.write(`Validation failed (${errors.length}):\n${errors.join("\n")}\n`);
  process.exit(1);
}

process.stdout.write(`Validated ${htmlFiles.length} HTML pages (${languageCounts.sl} sl, ${languageCounts.en} en); root-relative links and local images resolve.\n`);
