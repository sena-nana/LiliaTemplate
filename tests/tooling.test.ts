import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { describe, expect, it } from "vitest";

function scriptEnv(extra: Record<string, string>) {
  const env = { ...process.env };
  for (const key of Object.keys(env)) {
    if (key.toLowerCase() === "npm_config_user_agent") {
      delete env[key];
    }
  }
  return {
    ...env,
    ...extra,
  };
}

function appConfig() {
  return JSON.parse(readFileSync(resolve("app.config.json"), "utf-8")) as {
    appName: string;
    productTitle: string;
    version: string;
    identifier: string;
  };
}

describe("单应用模板工具链", () => {
  it("包管理器检查接受 Yarn 4 并拒绝其他入口", () => {
    const ok = spawnSync("node", ["scripts/check-package-manager.mjs"], {
      cwd: resolve("."),
      env: scriptEnv({
        npm_config_user_agent: "yarn/4.14.1 npm/? node/?",
      }),
      encoding: "utf-8",
    });
    expect(ok.status).toBe(0);

    const bad = spawnSync("node", ["scripts/check-package-manager.mjs"], {
      cwd: resolve("."),
      env: scriptEnv({
        npm_config_user_agent: "npm/11.0.0 node/?",
      }),
      encoding: "utf-8",
    });
    expect(bad.status).toBe(1);
  });

  it("Tauri dev 脚本 dry-run 输出动态端口配置", () => {
    const run = spawnSync("node", ["scripts/tauri-dev.mjs", "--verbose"], {
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
      devUrl: string;
      env: Record<string, string>;
    };
    expect(parsed.devUrl).toBe("http://localhost:34120");
    expect(parsed.env).toMatchObject({
      TAURI_TEMPLATE_DEV_PORT: "34120",
      TAURI_TEMPLATE_DEV_STRICT_PORT: "1",
    });
  });

  it("Tauri install 脚本默认追加本机 CPU 优化", () => {
    const run = spawnSync("node", ["scripts/tauri-install.mjs"], {
      cwd: resolve("."),
      env: {
        ...process.env,
        TAURI_TEMPLATE_INSTALL_DRY_RUN: "1",
        RUSTFLAGS: "-C debuginfo=0",
      },
      encoding: "utf-8",
    });

    expect(run.status).toBe(0);
    const parsed = JSON.parse(run.stdout) as {
      env: Record<string, string>;
    };
    expect(parsed.env.RUSTFLAGS).toBe("-C debuginfo=0 -C target-cpu=native");
  });

  it("Tauri install 脚本不覆盖显式 target-cpu 配置", () => {
    const run = spawnSync("node", ["scripts/tauri-install.mjs"], {
      cwd: resolve("."),
      env: {
        ...process.env,
        TAURI_TEMPLATE_INSTALL_DRY_RUN: "1",
        RUSTFLAGS: "-C target-cpu=x86-64-v3",
      },
      encoding: "utf-8",
    });

    expect(run.status).toBe(0);
    const parsed = JSON.parse(run.stdout) as {
      env: Record<string, string>;
    };
    expect(parsed.env.RUSTFLAGS).toBe("-C target-cpu=x86-64-v3");
  });

  it("Agent 调试入口输出模板边界和可执行验证入口", () => {
    const run = spawnSync("node", ["scripts/agent-debug.mjs", "--json"], {
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
