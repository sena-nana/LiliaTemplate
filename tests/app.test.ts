import { nextTick } from "vue";
import { createMemoryHistory } from "vue-router";
import { describe, expect, it } from "vitest";
import { createTemplateApp } from "../src/app";

describe("应用装配", () => {
  it("显式安装 Root、Router、Shell 和设置 Provider 后可挂载", async () => {
    const root = document.createElement("div");
    document.body.append(root);
    const { app, router } = createTemplateApp(createMemoryHistory());

    await router.push("/settings?tab=about");
    await router.isReady();
    app.mount(root);
    await nextTick();

    expect(root.querySelector('[data-agent-id="shell"]')).not.toBeNull();
    expect(root.querySelector('[data-agent-id="settings.page.about"]')).not.toBeNull();
    expect(window.__liliaAgentDebug).toBeUndefined();

    app.unmount();
    root.remove();
  });
});
