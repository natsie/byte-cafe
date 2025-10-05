interface DBEntry {
  source?: string;
  extensions?: string[];
  compressible?: boolean;
  charset?: string;
}

interface MimeDB {
  [x: string]: DBEntry;
}

const db = (await import("./mime-db.json", { with: { type: "json" } })).default as MimeDB;
const extMap: Record<string, string> = {};

console.log("Building extension map.");
for (const mimeType in db) {
  const { extensions = [] } = db[mimeType] || {};
  for (let i = 0; i < extensions.length; ++i) {
    extMap[extensions[i] || ""] = mimeType;
  }
}

console.log("Writing extension map to file.");
const { resolve } = await import("path");
const { writeFile } = await import("node:fs/promises");
await writeFile(resolve(import.meta.dirname, "ext-map.json"), JSON.stringify(extMap));

console.log("Done!");
