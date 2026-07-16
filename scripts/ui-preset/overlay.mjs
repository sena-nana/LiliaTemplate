import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { liliaFiles } from "./templates/lilia.mjs";
import { nanaFiles } from "./templates/nana.mjs";

const templates = { lilia: liliaFiles, nana: nanaFiles };

export async function createOverlayOperations(projectRoot, preset) {
  const files = {
    ...templates[preset],
    "src/ui/preset.ts": renderPreset(preset),
    "tsconfig.json": renderTsconfig(preset),
  };
  return await Promise.all(Object.entries(files).map(async ([path, after]) => ({
    path,
    before: await readOptional(resolve(projectRoot, path)),
    after,
    reason: "template-preset-overlay",
  })));
}

function renderPreset(preset) {
  const adapter = preset === "nana" ? "nanaPresetAdapter" : "liliaPresetAdapter";
  const packageName = preset === "nana" ? "@lilia/nana-ui" : "@lilia/ui";
  const density = preset === "nana" ? "comfortable" : "compact";
  return `// @lilia/ui-preset:start\nexport { ${adapter} as appUIPreset } from "${packageName}/preset";\n\nexport const appUIPresetId = "${preset}" as const;\nexport const appUIDefaultDensity = "${density}" as const;\n// @lilia/ui-preset:end\n\nexport { templatePreset as activeUIPreset } from "./activePreset";\nexport type { TemplateAppCapability, TemplateUIPresetAdapter } from "./types";\n`;
}

function renderTsconfig(preset) {
  const exclude = preset === "nana"
    ? ["src/features/home/**"]
    : ["src/features/nana/**", "src/capabilities/**"];
  return `${JSON.stringify({
    extends: "@lilia/config/tsconfig/app.json",
    include: ["src/**/*.ts", "src/**/*.vue"],
    exclude,
    references: [{ path: "./tsconfig.node.json" }],
  }, null, 2)}\n`;
}

async function readOptional(path) {
  try { return await readFile(path, "utf8"); }
  catch (error) { if (error?.code === "ENOENT") return null; throw error; }
}
