import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const bundleDir = join(root, "src-tauri", "target", "release", "bundle");
const platform = process.platform;
const nativeCpuFlag = "-C target-cpu=native";
const dryRun = process.env.TAURI_TEMPLATE_INSTALL_DRY_RUN === "1";
const priorityExts = {
  win32: [".msi", ".exe"],
  darwin: [".dmg", ".pkg"],
  linux: [".appimage", ".deb", ".rpm"],
};

function run(command, args = [], options = {}) {
  const result = spawnSync(command, args, {
    cwd: root,
    stdio: "inherit",
    shell: false,
    ...options,
  });

  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(`Command failed (${result.status}): ${command} ${args.join(" ")}`);
  }
}

function walkFiles(dir) {
  const list = [];
  for (const item of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, item.name);
    if (item.isDirectory()) {
      list.push(...walkFiles(full));
    } else if (item.isFile()) {
      list.push({ path: full, mtime: statSync(full).mtimeMs });
    }
  }
  return list;
}

function pickBundleFile() {
  if (!existsSync(bundleDir)) {
    throw new Error(`Bundle 目录不存在: ${bundleDir}`);
  }

  const files = walkFiles(bundleDir).filter((f) =>
    priorityExts[platform]?.includes(extname(f.path).toLowerCase()),
  );

  const exts = priorityExts[platform] ?? [];
  for (const ext of exts) {
    const matched = files.filter((f) => f.path.toLowerCase().endsWith(ext));
    if (matched.length > 0) {
      matched.sort((a, b) => b.mtime - a.mtime);
      return matched[0].path;
    }
  }

  throw new Error(`未找到支持的安装包: ${bundleDir}`);
}

function install(path) {
  const ext = extname(path).toLowerCase();

  if (platform === "win32") {
    if (ext === ".msi") return run("msiexec", ["/i", path, "/qn", "/norestart"]);
    return run(process.env.ComSpec || "cmd.exe", [
      "/d",
      "/s",
      "/c",
      `start "" "${path}"`,
    ]);
  }

  if (platform === "darwin") {
    return run("open", [path]);
  }

  if (platform === "linux") {
    if (ext === ".deb") return run("sudo", ["dpkg", "-i", path]);
    if (ext === ".rpm") return run("sudo", ["rpm", "-i", path]);
    return run("xdg-open", [path]);
  }

  throw new Error(`不支持的系统: ${platform}`);
}

function nativeBuildEnv() {
  const env = { ...process.env };
  const rustflags = env.RUSTFLAGS?.trim();
  env.RUSTFLAGS = rustflags && !rustflags.includes("target-cpu=")
    ? `${rustflags} ${nativeCpuFlag}`
    : rustflags || nativeCpuFlag;
  return env;
}

function buildCommand() {
  if (platform === "win32") {
    return {
      command: process.env.ComSpec || "cmd.exe",
      args: ["/d", "/s", "/c", "yarn.cmd tauri build"],
    };
  }

  return { command: "yarn", args: ["tauri", "build"] };
}

function yarnBuild() {
  const env = nativeBuildEnv();
  const { command, args } = buildCommand();

  if (dryRun) {
    console.log(JSON.stringify({ command, args, env: { RUSTFLAGS: env.RUSTFLAGS } }, null, 2));
    return;
  }

  run(command, args, { env });
}

yarnBuild();
if (dryRun) process.exit(0);
const bundle = pickBundleFile();
console.log(`[tauri:install] 发现安装包: ${bundle}`);
install(bundle);
console.log(`[tauri:install] 安装程序已触发: ${bundle}`);
