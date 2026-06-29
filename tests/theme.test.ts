import { describe, expect, it, vi } from "vitest";
import appConfig from "../app.config.json";

const themeStorageKey = `${appConfig.storageKeyPrefix}.theme`;

describe("useTheme", () => {
  it("从 localStorage 恢复主题并写入 html data-theme", async () => {
    localStorage.setItem(themeStorageKey, "light");
    vi.resetModules();

    const { setLiliaAppConfig, useTheme } = await import("@lilia/ui");
    setLiliaAppConfig((await import("../src/app.config")).appConfig);
    const { theme } = useTheme();

    expect(theme.value).toBe("light");
    expect(document.documentElement.dataset.theme).toBe("light");
  });

  it("setTheme 会同步更新 data-theme 和 localStorage", async () => {
    vi.resetModules();
    const { setLiliaAppConfig, useTheme } = await import("@lilia/ui");
    setLiliaAppConfig((await import("../src/app.config")).appConfig);
    const { theme, setTheme } = useTheme();

    setTheme("dark");

    expect(theme.value).toBe("dark");
    expect(document.documentElement.dataset.theme).toBe("dark");
    expect(localStorage.getItem(themeStorageKey)).toBe("dark");
  });
});
