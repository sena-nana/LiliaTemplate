#!/usr/bin/env node

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const root = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const configPath = resolve(root, "app.config.json");
const appConfig = readJson(configPath);

validateAppConfig(appConfig);

syncJson("package.json", (pkg) => {
  pkg.name = appConfig.appName;
  pkg.version = appConfig.version;
});

syncJson("src-tauri/tauri.conf.json", (tauriConfig) => {
  tauriConfig.productName = appConfig.productTitle;
  tauriConfig.version = appConfig.version;
  tauriConfig.identifier = appConfig.identifier;
  tauriConfig.app.windows = tauriConfig.app.windows.map((windowConfig) => ({
    ...windowConfig,
    title: windowConfig.label === "main" ? appConfig.productTitle : windowConfig.title,
  }));
});

syncTomlValue("src-tauri/Cargo.toml", "version", appConfig.version);

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeIfChanged(path, next) {
  const current = readFileSync(path, "utf8");
  if (current !== next) {
    writeFileSync(path, next, "utf8");
  }
}

function syncJson(relativePath, update) {
  const path = resolve(root, relativePath);
  const data = readJson(path);
  update(data);
  writeIfChanged(path, `${JSON.stringify(data, null, 2)}\n`);
}

function syncTomlValue(relativePath, key, value) {
  const path = resolve(root, relativePath);
  const escaped = value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
  const next = readFileSync(path, "utf8").replace(
    new RegExp(`^${key}\\s*=\\s*"[^"]*"`, "m"),
    `${key} = "${escaped}"`,
  );
  writeIfChanged(path, next);
}

function validateAppConfig(config) {
  const required = ["appName", "productTitle", "version", "identifier", "storageKeyPrefix"];
  for (const key of required) {
    if (typeof config[key] !== "string" || config[key].trim() === "") {
      throw new Error(`app.config.json requires a non-empty string "${key}".`);
    }
  }
}
