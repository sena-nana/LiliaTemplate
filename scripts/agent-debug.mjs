#!/usr/bin/env node

import { existsSync, readFileSync } from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const args = new Set(process.argv.slice(2));
const jsonMode = args.has("--json");

const packageJson = readJson("package.json");
const appConfig = readJson("app.config.json");

const importantFiles = [
  ["app.config.json", "single source for app name, product title, version, and identifiers"],
  ["src/main.ts", "minimal Vue bootstrap that mounts createLiliaApp"],
  ["src/app.config.ts", "runtime adapter from app config to @lilia/ui shell config"],
  ["src/app.ts", "createLiliaApp integration boundary"],
  ["src/routes.ts", "application route table"],
  ["src/commands.ts", "application command registration boundary"],
  ["src/features/home/HomePage.vue", "default business feature page"],
  ["node_modules/@lilia/ui/src/index.ts", "installed public UI package entry"],
  ["src-tauri/src/lib.rs", "Tauri command and plugin registration boundary"],
  ["src-tauri/src/window_state.rs", "window-state persistence boundary"],
  ["tests/tooling.test.ts", "tooling and template-boundary regression tests"],
  ["docs/guide/development.md", "developer and agent orientation guide"],
].map(([path, purpose]) => ({
  path,
  purpose,
  exists: existsSync(resolve(root, path)),
}));

const agentTargetFiles = {
  "node_modules/@lilia/ui/src/layouts/AppShell.vue": [["shell.sidebar.resizer"]],
  "node_modules/@lilia/ui/src/components/TitleBar.vue": [
    ["titlebar.left-sidebar.toggle"],
    ["titlebar.window.minimize"],
    ["titlebar.window.maximize"],
    ["titlebar.window.close"],
  ],
  "node_modules/@lilia/ui/src/layouts/SecondaryPanel.vue": [
    ["sidebar.global.new", "sidebar.global.${action.key}"],
    ["sidebar.global.search", "sidebar.global.${action.key}"],
    ["sidebar.nav.overview", "sidebar.nav.${item.key}"],
    ["sidebar.workspace.add"],
    ["sidebar.group.example.item.workspace", "sidebar.group.${group.key}.item.${item.key}"],
  ],
  "node_modules/@lilia/ui/src/components/sidebar/SidebarFooter.vue": [
    ["sidebar.footer.settings", "sidebar.footer.${link.key}"],
    ["sidebar.footer.status"],
  ],
  "node_modules/@lilia/ui/src/layouts/SettingsSidebar.vue": [
    ["settings.sidebar.back"],
    ["settings.sidebar.tab.appearance", "settings.sidebar.tab.${tab.key}"],
    ["settings.sidebar.tab.about", "settings.sidebar.tab.${tab.key}"],
  ],
  "node_modules/@lilia/ui/src/pages/settings/AppearanceSection.vue": [
    ["settings.appearance.theme.dark"],
    ["settings.appearance.theme.light"],
    ["settings.appearance.corner.smooth"],
    ["settings.appearance.corner.round"],
    ["settings.appearance.corner-radius"],
  ],
  "node_modules/@lilia/ui/src/components/ContextMenuHost.vue": [["context-menu"]],
  "node_modules/@lilia/ui/src/components/ConfirmDialog.vue": [["confirm-dialog.cancel"], ["confirm-dialog.confirm"]],
};

const agentTargets = Object.entries(agentTargetFiles).flatMap(([path, targets]) => {
  const sourcePath = resolve(root, path);
  const source = existsSync(sourcePath) ? readFileSync(sourcePath, "utf-8") : "";
  return targets.map(([id, token = id]) => ({
    id,
    path,
    exists: source.includes(`data-agent-id="${token}"`) || source.includes(token),
  }));
});

const deps = {
  ...packageJson.dependencies,
  ...packageJson.devDependencies,
};

const checks = [
  {
    id: "package-manager",
    ok: packageJson.packageManager === "yarn@4.14.1",
    detail: `packageManager=${packageJson.packageManager ?? "missing"}`,
  },
  {
    id: "single-app-root",
    ok: packageJson.workspaces === undefined,
    detail: packageJson.workspaces === undefined ? "no workspaces field" : "workspaces field exists",
  },
  {
    id: "lilia-agent-runtime-excluded",
    ok: ["@anthropic-ai/claude-agent-sdk", "@openai/codex-sdk", "@modelcontextprotocol/sdk", "@lilia/contracts"].every(
      (name) => deps[name] === undefined,
    ),
    detail: "template should expose agent-friendly structure without bundling Lilia agent runtime",
  },
  {
    id: "lilia-ui-dependency-present",
    ok: packageJson.dependencies?.["@lilia/ui"] !== undefined,
    detail: `@lilia/ui=${packageJson.dependencies?.["@lilia/ui"] ?? "missing"}`,
  },
  {
    id: "important-files-present",
    ok: importantFiles.every((file) => file.exists),
    detail: `${importantFiles.filter((file) => file.exists).length}/${importantFiles.length} files present`,
  },
  {
    id: "agent-targets-present",
    ok: agentTargets.every((target) => target.exists),
    detail: `${agentTargets.filter((target) => target.exists).length}/${agentTargets.length} targets present`,
  },
];

const gitStatus = spawnSync("git", ["status", "--short"], {
  cwd: root,
  encoding: "utf-8",
  shell: false,
});

const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  project: {
    root: relative(process.cwd(), root) || ".",
    name: packageJson.name,
    productTitle: appConfig.productTitle,
    version: packageJson.version,
    packageManager: packageJson.packageManager,
  },
  boundaries: {
    includes: [
      "thin Tauri 2 + Vue 3 scaffold",
      "@lilia/ui powered theme, titlebar, context menu, shell, and settings UI",
      "window-state persistence and app metadata sync",
      "deterministic root scripts that agents can run from the repository root",
    ],
    excludes: [
      "Lilia Claude/Codex/CC-Switch runtime business logic",
      "workspace packages, task timeline, provider configuration, and chat persistence",
      "SQLite/WebDAV/tray/widget features from other applications",
    ],
  },
  entrypoints: [
    { id: "install", command: "corepack yarn install", purpose: "install dependencies with the pinned Yarn line" },
    { id: "frontend", command: "yarn dev", purpose: "run the Vite frontend only" },
    { id: "desktop", command: "yarn tauri:dev", purpose: "run the Tauri desktop app with dynamic devUrl" },
    { id: "unit", command: "yarn test", purpose: "run Vitest regression tests" },
    { id: "build", command: "yarn build", purpose: "type-check and build frontend assets" },
    {
      id: "desktop-release-fast",
      command: "yarn tauri:build:no-bundle",
      purpose: "compile the release desktop app without generating installers",
    },
    {
      id: "rust",
      command: "cargo check --manifest-path src-tauri/Cargo.toml",
      purpose: "check the Tauri Rust side",
    },
    { id: "full", command: "yarn verify", purpose: "run the template's full verification gate" },
  ],
  importantFiles,
  agentTargets,
  checks,
  git: {
    available: gitStatus.error === undefined,
    dirty: gitStatus.status === 0 ? gitStatus.stdout.trim().length > 0 : null,
  },
  status: checks.every((check) => check.ok) ? "ready" : "needs_attention",
};

if (jsonMode) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else {
  printTextReport(report);
}

if (report.status !== "ready") {
  process.exitCode = 1;
}

function readJson(path) {
  return JSON.parse(readFileSync(resolve(root, path), "utf-8"));
}

function printTextReport(report) {
  console.log(`${report.project.productTitle} agent debug report`);
  console.log(`status: ${report.status}`);
  console.log(`root: ${report.project.root}`);
  console.log("");
  console.log("entrypoints:");
  for (const entry of report.entrypoints) {
    console.log(`- ${entry.command} (${entry.purpose})`);
  }
  console.log("");
  console.log("checks:");
  for (const check of report.checks) {
    console.log(`- ${check.ok ? "ok" : "fail"} ${check.id}: ${check.detail}`);
  }
  console.log("");
  console.log("important files:");
  for (const file of report.importantFiles) {
    console.log(`- ${file.exists ? "ok" : "missing"} ${file.path}: ${file.purpose}`);
  }
  console.log("");
  console.log("agent targets:");
  for (const target of report.agentTargets) {
    console.log(`- ${target.exists ? "ok" : "missing"} ${target.id}: ${target.path}`);
  }
}
