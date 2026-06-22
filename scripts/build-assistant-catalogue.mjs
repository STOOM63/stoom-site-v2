#!/usr/bin/env node
/**
 * STOOM — Générateur automatique du catalogue Assistant.
 *
 * Scanne toutes les pages HTML et tous les JSON de /data. Il génère ensuite
 * data/assistant/catalogue-produits.json sans liste de marques à maintenir.
 */
import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, "data");
const OUTPUT_PATH = path.join(DATA_DIR, "assistant", "catalogue-produits.json");
const toPosix = (value) => value.split(path.sep).join("/");

async function exists(target) {
  try { await fs.access(target); return true; } catch { return false; }
}

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if ([".git", "node_modules"].includes(entry.name)) continue;
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(target));
    else files.push(target);
  }
  return files;
}

function clean(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

function tag(html, name) {
  const match = html.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)<\\/${name}>`, "i"));
  return match ? clean(match[1]) : "";
}

function pageName(title, h1, fallback) {
  return clean((h1 || title || fallback)
    .replace(/\s*[|–—-]\s*STOOM.*$/i, "")
    .replace(/\s+à\s+Clermont[-\s]?Ferrand.*$/i, ""));
}

function extractDataPaths(html) {
  const set = new Set();
  const re = /(?:\.\/)?data\/[A-Za-z0-9_./-]+\.json/gi;
  let match;
  while ((match = re.exec(html)) !== null) set.add(match[0].replace(/^\.\//, ""));
  return [...set];
}

function isProduct(record) {
  return record && typeof record === "object" && !Array.isArray(record)
    && String(record.nom || "").trim()
    && (
      String(record.saveurs || "").trim() ||
      String(record.description || "").trim() ||
      String(record.format || "").trim() ||
      String(record.nicotine || "").trim() ||
      String(record.image || "").trim()
    );
}

function isLiquid(record) {
  return Boolean(
    String(record.saveurs || "").trim() ||
    String(record.nicotine || "").trim() ||
    String(record.format || "").trim()
  );
}

async function readJson(target) {
  try { return JSON.parse(await fs.readFile(target, "utf8")); } catch { return null; }
}

async function homeGammeMap() {
  const map = new Map();
  const data = await readJson(path.join(DATA_DIR, "home", "gammes.json"));
  if (!Array.isArray(data)) return map;
  for (const item of data) {
    const page = String(item && item.lien || "").trim().replace(/^\/+/, "");
    const title = String(item && item.titre || "").trim();
    if (page && title) map.set(page, title);
  }
  return map;
}

async function main() {
  if (!await exists(DATA_DIR)) throw new Error("Dossier /data introuvable.");

  const [files, gammeByPage] = await Promise.all([walk(ROOT), homeGammeMap()]);
  const htmlFiles = files.filter((file) => file.toLowerCase().endsWith(".html"));
  const dataFiles = files.filter((file) => {
    const relative = toPosix(path.relative(ROOT, file));
    return relative.startsWith("data/") && relative.endsWith(".json");
  });

  const pageMeta = new Map();
  const pagesByData = new Map();

  for (const htmlFile of htmlFiles) {
    const page = toPosix(path.relative(ROOT, htmlFile));
    const html = await fs.readFile(htmlFile, "utf8");
    const title = tag(html, "title");
    const h1 = tag(html, "h1");
    pageMeta.set(page, {
      page,
      title,
      h1,
      gamme: gammeByPage.get(page) || pageName(title, h1, path.basename(page, ".html"))
    });

    for (const dataPath of extractDataPaths(html)) {
      if (!pagesByData.has(dataPath)) pagesByData.set(dataPath, []);
      pagesByData.get(dataPath).push(page);
    }
  }

  const products = [];
  const sources = [];

  for (const jsonFile of dataFiles) {
    const source = toPosix(path.relative(ROOT, jsonFile));
    if (source.startsWith("data/assistant/") || source.startsWith("data/home/")) continue;

    const raw = await readJson(jsonFile);
    if (!Array.isArray(raw)) continue;
    const records = raw.filter(isProduct);
    if (!records.length) continue;

    const linkedPages = [...new Set(pagesByData.get(source) || [])];
    const defaultPage = `${path.basename(source, ".json")}.html`;
    const page = linkedPages[0] || (pageMeta.has(defaultPage) ? defaultPage : "");
    const meta = pageMeta.get(page) || {};
    const gamme = meta.gamme || path.basename(source, ".json");

    sources.push({
      source,
      page,
      gamme,
      page_title: meta.title || "",
      page_h1: meta.h1 || "",
      produits: records.length,
      liquides: records.filter(isLiquid).length
    });

    records.forEach((record, index) => {
      products.push({
        id: `${source}#${index + 1}`,
        type: isLiquid(record) ? "liquide" : "produit",
        source,
        page,
        marque: String(record.marque || gamme || "").trim(),
        gamme: String(record.gamme || gamme || "").trim(),
        nom: String(record.nom || "").trim(),
        saveurs: String(record.saveurs || "").trim(),
        description: String(record.description || "").trim(),
        format: String(record.format || "").trim(),
        nicotine: String(record.nicotine || "").trim(),
        versions: String(record.versions || "").trim(),
        image: String(record.image || "").trim(),
        categorie: String(record.categorie || "").trim(),
        tags: Array.isArray(record.tags) ? record.tags.map(String) : []
      });
    });
  }

  const seen = new Set();
  const deduped = products.filter((item) => {
    const key = [item.type, item.source, item.nom, item.format, item.nicotine]
      .map((value) => value.toLowerCase())
      .join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const catalog = {
    version: "1.0.0",
    generated_at: new Date().toISOString(),
    generator: "scripts/build-assistant-catalogue.mjs",
    rules: {
      source_of_truth: "Toutes les références sont détectées automatiquement parmi les JSON /data du dépôt.",
      stock: "La présence au catalogue ne garantit jamais la disponibilité réelle en magasin.",
      excluded: "Les fichiers data/home et data/assistant ne sont pas des catalogues produits."
    },
    stats: {
      pages_html_scanned: htmlFiles.length,
      json_data_scanned: dataFiles.length,
      sources_produits: sources.length,
      produits: deduped.length,
      liquides: deduped.filter((item) => item.type === "liquide").length
    },
    sources: sources.sort((a, b) => a.source.localeCompare(b.source, "fr")),
    produits: deduped,
    liquides: deduped.filter((item) => item.type === "liquide"),
    autres_produits: deduped.filter((item) => item.type !== "liquide")
  };

  await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await fs.writeFile(OUTPUT_PATH, `${JSON.stringify(catalog, null, 2)}\n`, "utf8");
  console.log(`Catalogue généré : ${catalog.stats.produits} produits, ${catalog.stats.liquides} liquides, ${catalog.stats.sources_produits} sources.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
