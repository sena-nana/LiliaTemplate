import { fireEvent, render, screen } from "@testing-library/vue";
import { APP_SHELL_COPY, LiliaAppRoot, vContextMenu } from "@lilia/ui";
import { createMemoryHistory } from "vue-router";
import { describe, expect, it, vi } from "vitest";
import { createTemplateRouter } from "../src/app";

async function renderAt(path: string) {
  const router = createTemplateRouter(createMemoryHistory());
  await router.push(path);
  await router.isReady();

  render(LiliaAppRoot, {
    global: {
      directives: {
        contextMenu: vContextMenu,
      },
      plugins: [router],
    },
  });
}

describe("基础路由", () => {
  it("默认首页显示应用首页", async () => {
    await renderAt("/");

    expect(
      await screen.findByRole("heading", { level: 1, name: APP_SHELL_COPY.homeTitle }),
    ).toBeInTheDocument();
  });

  it("侧边栏左下角提供设置和状态入口", async () => {
    await renderAt("/");

    expect(screen.getAllByRole("link", { name: "设置" })).toHaveLength(1);
    expect(
      screen.getByRole("link", { name: APP_SHELL_COPY.statusTitle }),
    ).toHaveClass("sb-conn--ok");
  });

  it("设置页默认显示外观设置并使用设置侧栏", async () => {
    await renderAt("/settings");

    expect(await screen.findByRole("heading", { level: 1, name: "外观" })).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: "设置分类" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /外观/ })).toHaveClass("is-active");
    expect(await screen.findByRole("radiogroup", { name: "圆角" })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "圆角半径" })).toBeInTheDocument();
    expect(document.querySelector('[data-agent-id="settings.appearance"]')).toBeInTheDocument();
    expect(document.querySelector('[data-agent-id="settings.appearance.theme.dark"]')).toBeInTheDocument();
    expect(document.querySelector('[data-agent-id="settings.appearance.corner-radius"]')).toBeInTheDocument();
  });

  it("外观页圆角设置可即时切换全局 data-corners", async () => {
    await renderAt("/settings");

    const smooth = await screen.findByRole("radio", { name: /平滑/ });
    const round = screen.getByRole("radio", { name: /普通/ });

    expect(smooth).toHaveClass("is-active");
    expect(document.documentElement.dataset.corners).toBe("smooth");

    await fireEvent.click(round);

    expect(round).toHaveClass("is-active");
    await vi.waitFor(() => {
      expect(document.documentElement.dataset.corners).toBe("round");
    });

    await fireEvent.click(smooth);

    expect(smooth).toHaveClass("is-active");
    expect(document.documentElement.dataset.corners).toBe("smooth");
  });

  it("外观页圆角半径设置可即时切换全局半径变量", async () => {
    await renderAt("/settings");

    const radius = await screen.findByRole("slider", { name: "圆角半径" });

    expect(document.documentElement.style.getPropertyValue("--app-corner-radius")).toBe("16px");
    expect(screen.getByText("16px")).toBeInTheDocument();

    await fireEvent.input(radius, { target: { value: "14" } });

    await vi.waitFor(() => {
      expect(document.documentElement.style.getPropertyValue("--app-corner-radius")).toBe("14px");
    });
    expect(screen.getByText("14px")).toBeInTheDocument();
  });

  it("设置页可通过 tab query 显示关于页，未知 tab 回落外观", async () => {
    await renderAt("/settings?tab=about");

    expect(await screen.findByRole("heading", { level: 1, name: "关于" })).toBeInTheDocument();
    expect(await screen.findByText("Tauri Template")).toBeInTheDocument();
  });

  it("未知路由回到首页", async () => {
    await renderAt("/missing");

    expect(await screen.findByRole("heading", { level: 1, name: APP_SHELL_COPY.homeTitle }))
      .toBeInTheDocument();
  });

  it("未知设置 tab 回落到外观", async () => {
    await renderAt("/settings?tab=missing");

    expect(await screen.findByRole("heading", { level: 1, name: "外观" })).toBeInTheDocument();
  });
});
