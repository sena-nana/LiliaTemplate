import { render, screen } from "@testing-library/vue";
import { liliaSettingsKey } from "@lilia/ui/settings";
import { setLiliaUiConfig } from "@lilia/ui/shell";
import { createMemoryHistory } from "vue-router";
import { describe, expect, it } from "vitest";
import AppRoot from "../src/AppRoot.vue";
import { appConfig } from "../src/app.config";
import { createTemplateRouter } from "../src/app";
import { settingsModel } from "../src/settings";

async function renderAt(path: string) {
  setLiliaUiConfig(appConfig);
  const router = createTemplateRouter(createMemoryHistory());
  await router.push(path);
  await router.isReady();

  render(AppRoot, {
    global: {
      provide: {
        [liliaSettingsKey as symbol]: settingsModel,
      },
      plugins: [router],
    },
  });
}

describe("基础路由", () => {
  it("默认首页显示应用首页", async () => {
    await renderAt("/");

    await screen.findByRole("heading", { level: 1, name: "Tauri 应用模板" });
  });

  it("侧边栏左下角提供设置和状态入口", async () => {
    await renderAt("/");

    expect(screen.getAllByRole("link", { name: "设置" })).toHaveLength(1);
    const status = screen.getByRole("link", { name: "Ready" });
    expect(status.classList.contains("sb-conn--ok")).toBe(true);
    expect(status.getAttribute("title")).toBe("模板状态正常。点击进入设置。");
  });

  it("设置页默认显示外观设置并使用设置侧栏", async () => {
    await renderAt("/settings");

    await screen.findByRole("heading", { level: 1, name: "外观" });
    screen.getByRole("navigation", { name: "设置分类" });
  });

  it("设置页可通过 tab query 显示关于页，未知 tab 回落外观", async () => {
    await renderAt("/settings?tab=about");

    await screen.findByRole("heading", { level: 1, name: "关于" });
    expect(screen.getByRole("list").textContent).toContain("Tauri Template");
  });

  it("未知路由回到首页", async () => {
    await renderAt("/missing");

    await screen.findByRole("heading", { level: 1, name: "Tauri 应用模板" });
  });
});
