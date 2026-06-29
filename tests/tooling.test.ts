import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

function appConfig() {
  return JSON.parse(readFileSync(resolve("app.config.json"), "utf-8")) as {
    appName: string;
    productTitle: string;
    version: string;
    identifier: string;
  };
}

function yarnRun(args: string[], options: Parameters<typeof spawnSync>[2]) {
  if (process.platform !== "win32") {
    return spawnSync("yarn", args, options);
  }

  return spawnSync(process.env.ComSpec || "cmd.exe", ["/d", "/s", "/c", "yarn.cmd", ...args], options);
}

describe("单应用模板工具链", () => {
  it("Tauri dev 脚本 dry-run 可通过公开入口执行", () => {
    const run = yarnRun(["tauri:dev", "--verbose"], {
      cwd: resolve("."),
      env: {
        ...process.env,
        TAURI_TEMPLATE_DEV_DRY_RUN: "1",
        TAURI_TEMPLATE_DEV_PORT: "34120",
      },
      encoding: "utf-8",
    });

    expect(run.status).toBe(0);
    const parsed = JSON.parse(run.stdout) as {
      args: string[];
      devUrl?: string;
    };
    expect(parsed.args).toContain("dev");
    expect(parsed.devUrl).toMatch(/^http:\/\/localhost:\d+$/);
  });

  it("Tauri install 脚本 dry-run 可通过公开入口执行", () => {
    const run = yarnRun(["tauri:install"], {
      cwd: resolve("."),
      env: {
        ...process.env,
        TAURI_TEMPLATE_INSTALL_DRY_RUN: "1",
      },
      encoding: "utf-8",
    });

    expect(run.status).toBe(0);
    const parsed = JSON.parse(run.stdout) as {
      command: string;
      args: string[];
    };
    expect(parsed.command).toBeTruthy();
    expect(parsed.args.join(" ")).toContain("tauri build");
  });

  it("Agent 调试入口输出模板边界和可执行验证入口", () => {
    const run = yarnRun(["agent:debug", "--json"], {
      cwd: resolve("."),
      encoding: "utf-8",
    });

    expect(run.status).toBe(0);

    const report = JSON.parse(run.stdout) as {
      status: string;
      entrypoints: Array<{ id: string; command: string }>;
      importantFiles: Array<{ path: string; exists: boolean }>;
      agentTargets: Array<{ id: string; path: string; exists: boolean }>;
      checks: Array<{ id: string; ok: boolean }>;
    };

    expect(report.status).toBe("ready");
    expect(report.entrypoints.length).toBeGreaterThan(0);
    expect(report.importantFiles.every((file) => file.exists)).toBe(true);
    expect(report.agentTargets.every((target) => target.exists)).toBe(true);
    expect(report.checks.every((check) => check.ok)).toBe(true);
  });

  it("app.config.json 是应用名称、标题和版本的同步来源", () => {
    const config = appConfig();
    const pkg = JSON.parse(readFileSync(resolve("package.json"), "utf-8"));
    const tauri = JSON.parse(readFileSync(resolve("src-tauri/tauri.conf.json"), "utf-8"));

    expect(pkg.name).toBe(config.appName);
    expect(pkg.version).toBe(config.version);
    expect(tauri.productName).toBe(config.productTitle);
    expect(tauri.version).toBe(config.version);
    expect(tauri.identifier).toBe(config.identifier);
    expect(tauri.app.windows[0].title).toBe(config.productTitle);
  });
});
