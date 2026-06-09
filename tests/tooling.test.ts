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

describe("单应用模板工具链", () => {
  it("根 package.json 直接提供单应用脚本，不包含 workspace", () => {
    const pkg = JSON.parse(readFileSync(resolve("package.json"), "utf-8"));

    expect(pkg.workspaces).toBeUndefined();
    expect(pkg.packageManager).toBe("yarn@4.14.1");
    expect(pkg.scripts).toMatchObject({
      "check:package-manager": "node scripts/check-package-manager.mjs",
      dev: "vite",
      build: "vue-tsc --noEmit && vite build",
      test: "vitest run",
      tauri: "tauri",
      "tauri:dev": "node scripts/tauri-dev.mjs",
      "tauri:build": "tauri build",
      verify: "yarn test && yarn build && cargo check --manifest-path src-tauri/Cargo.toml",
    });
  });

  it("只保留通用 Tauri/Vue 依赖，不包含 Lilia agent 业务依赖", () => {
    const pkg = JSON.parse(readFileSync(resolve("package.json"), "utf-8"));
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };

    expect(deps.vue).toBeDefined();
    expect(deps["vue-router"]).toBeDefined();
    expect(deps["@tauri-apps/api"]).toBeDefined();
    expect(deps["@tauri-apps/plugin-store"]).toBeDefined();
    expect(deps["@anthropic-ai/claude-agent-sdk"]).toBeUndefined();
    expect(deps["@openai/codex-sdk"]).toBeUndefined();
    expect(deps["@modelcontextprotocol/sdk"]).toBeUndefined();
    expect(deps["@lilia/contracts"]).toBeUndefined();
    expect(deps.zod).toBeUndefined();
  });

  it("Rust 端只新增通用窗口状态 store 插件", () => {
    const cargo = readFileSync(resolve("src-tauri/Cargo.toml"), "utf-8");

    expect(cargo).toContain('tauri-plugin-store = "2"');
    expect(cargo).not.toContain("rusqlite");
    expect(cargo).not.toContain("r2d2");
    expect(cargo).not.toContain("reqwest");
  });

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
    expect(bad.stderr).toContain("Tauri Template requires Yarn 4 through Corepack.");
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
      args: string[];
      devUrl: string;
      env: Record<string, string>;
    };
    expect(parsed.devUrl).toBe("http://localhost:34120");
    expect(parsed.args).toContain("tauri");
    expect(parsed.args).toContain("dev");
    expect(parsed.args).toContain("--config");
    expect(parsed.args).toContain("--verbose");
    expect(parsed.env).toMatchObject({
      TAURI_TEMPLATE_DEV_PORT: "34120",
      TAURI_TEMPLATE_DEV_STRICT_PORT: "1",
    });
  });
});

describe("Lilia 外壳样式迁移", () => {
  it("保留侧栏折叠时的宽度、拖拽线和 reduced-motion 动效规则", () => {
    const shellCss = readFileSync(resolve("src/styles/shell.css"), "utf-8");

    expect(shellCss).toContain("transition: grid-template-columns 0.24s var(--sidebar-easing)");
    expect(shellCss).toContain("left 0.24s var(--sidebar-easing)");
    expect(shellCss).toContain("@media (prefers-reduced-motion: reduce)");
  });

  it("保留 Lilia 的透明按钮基线和显式强调态", () => {
    const styles = readFileSync(resolve("src/styles.css"), "utf-8");

    expect(styles).toContain("button {\n  background: transparent");
    expect(styles).toContain("button.primary");
    expect(styles).toContain("background: var(--accent-soft)");
    expect(styles).toContain("button.ghost.danger:hover");
    expect(styles).toContain("background: transparent");
  });

  it("保留 Lilia 侧边栏行内工具的悬停显隐动画", () => {
    const secondaryPanel = readFileSync(resolve("src/layouts/SecondaryPanel.vue"), "utf-8");
    const rowTools = readFileSync(resolve("src/components/sidebar/SidebarRowTools.vue"), "utf-8");

    expect(rowTools).toContain("class=\"sb-tree__hover-tools\"");
    expect(rowTools).toContain(".sb-tree__hover-tools");
    expect(rowTools).toContain("opacity: 0");
    expect(rowTools).toContain("pointer-events: none");
    expect(secondaryPanel).toContain(".sb-tree__hover-tools");
    expect(secondaryPanel).toContain(".sb-tree__row:hover .sb-tree__hover-tools");
    expect(secondaryPanel).toContain(".sb-tree__row:focus-within .sb-tree__hover-tools");
    expect(secondaryPanel).toContain(".sb-tree__row.is-active .sb-tree__hover-tools");
    expect(secondaryPanel).toContain("opacity: 1");
    expect(secondaryPanel).toContain("pointer-events: auto");
  });
});
