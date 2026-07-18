#!/usr/bin/env node

import {
  existsSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const rootManifestPath = resolve(repoRoot, "package.json");
const backupPath = resolve(repoRoot, ".lilia-ui-deps.remote.json");
const localRoot = resolve(repoRoot, process.env.LILIA_UI_LOCAL_PATH || "../LiliaUI");

const packages = [
  ["@lilia/build", "packages/build"],
  ["@lilia/config", "packages/config"],
  ["@lilia/nana-ui", "packages/nana-ui"],
  ["@lilia/tools", "packages/tools"],
  ["@lilia/ui-contract", "packages/ui-contract"],
  ["@lilia/ui-foundation", "packages/ui-foundation"],
  ["@lilia/ui", "packages/ui"],
];

const mode = process.argv[2] || "status";
if (!["local", "remote", "status"].includes(mode)) {
  fail("Usage: pnpm liliaui:local | pnpm liliaui:remote | pnpm liliaui:status");
}

if (mode === "status") {
  printStatus();
  process.exit(0);
}

const manifest = readRootManifest();
const dependencies = manifest.dependencies ?? {};
const activePackages = packages.filter(([name]) => dependencies[name] !== undefined);

if (mode === "local") {
  switchToLocal(manifest, activePackages);
} else {
  switchToRemote(manifest, activePackages);
}

runPnpm(["install", "--no-frozen-lockfile"]);
printStatus();

function switchToLocal(rootManifest, active) {
  assertLocalPackages(active);

  if (!existsSync(backupPath)) {
    const remoteDependencies = Object.fromEntries(
      active.map(([name]) => [name, rootManifest.dependencies[name]]),
    );
    writeFileSync(backupPath, `${JSON.stringify({ dependencies: remoteDependencies }, null, 2)}\n`);
  }

  for (const [name, localPath] of active) {
    const relativePath = relative(repoRoot, resolve(localRoot, localPath)).replaceAll("\\", "/");
    rootManifest.dependencies[name] = `link:${relativePath}`;
  }
  writeRootManifest(rootManifest);
}

function switchToRemote(rootManifest, active) {
  if (!existsSync(backupPath)) {
    const linked = active.filter(([name]) => isLocalSpecifier(rootManifest.dependencies[name]));
    if (linked.length > 0) {
      fail(
        `Cannot restore ${linked.map(([name]) => name).join(", ")}: ${backupPath} is missing.`,
      );
    }
    return;
  }

  const backup = JSON.parse(readFileSync(backupPath, "utf8"));
  for (const [name] of active) {
    const remoteSpecifier = backup.dependencies?.[name];
    if (typeof remoteSpecifier !== "string" || remoteSpecifier.length === 0) {
      fail(`Missing remote dependency backup for ${name}.`);
    }
    rootManifest.dependencies[name] = remoteSpecifier;
  }
  writeRootManifest(rootManifest);
  rmSync(backupPath, { force: true });
}

function assertLocalPackages(active) {
  for (const [name, localPath] of active) {
    const manifestPath = resolve(localRoot, localPath, "package.json");
    if (!existsSync(manifestPath)) {
      fail(`Local package is missing: ${manifestPath}`);
    }
    const localManifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    if (localManifest.name !== name) {
      fail(`Expected ${manifestPath} to declare ${name}, got ${localManifest.name || "(missing)"}.`);
    }
  }
}

function runPnpm(args) {
  const pnpmCli = process.env.npm_execpath;
  if (!pnpmCli || !/pnpm/i.test(pnpmCli)) {
    fail("Run this script through a root pnpm command, for example: pnpm liliaui:local");
  }

  const isWindowsShim = process.platform === "win32" && /\.(?:cmd|bat)$/i.test(pnpmCli);
  const command = isWindowsShim ? process.env.ComSpec || "cmd.exe" : pnpmCli;
  const commandArgs = isWindowsShim ? ["/d", "/s", "/c", pnpmCli, ...args] : args;
  const result = spawnSync(command, commandArgs, {
    cwd: repoRoot,
    stdio: "inherit",
    env: process.env,
  });

  if (result.error) fail(result.error.message);
  if (result.status !== 0) process.exit(result.status ?? 1);
}

function printStatus() {
  const rootManifest = readRootManifest();
  const currentDependencies = rootManifest.dependencies ?? {};
  console.log("LiliaUI dependency source:");
  for (const [name] of packages) {
    const specifier = currentDependencies[name];
    if (specifier === undefined) {
      console.log(`  ${name}: inactive`);
      continue;
    }
    console.log(`  ${name}: ${isLocalSpecifier(specifier) ? `local (${specifier})` : "remote"}`);
  }
}

function isLocalSpecifier(specifier) {
  return typeof specifier === "string" && /^(?:link|file):/.test(specifier);
}

function readRootManifest() {
  return JSON.parse(readFileSync(rootManifestPath, "utf8"));
}

function writeRootManifest(manifest) {
  writeFileSync(rootManifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
