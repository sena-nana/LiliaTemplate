import appConfigJson from "../app.config.json";
import type { LiliaUiConfig } from "@lilia/ui/shell";

export const appConfig = {
  appName: appConfigJson.appName,
  productTitle: appConfigJson.productTitle,
  version: appConfigJson.version,
  storageKeyPrefix: appConfigJson.storageKeyPrefix,
  appearance: {
    backdropTarget: "sidebar",
  },
  sidebar: {
    navTitle: "导航",
    nav: [
      {
        key: "overview",
        to: "/",
        label: "首页",
        icon: "home",
      },
    ],
    footerLinks: [{ key: "settings", to: "/settings", label: "设置", icon: "settings" }],
    footerStatuses: [
      {
        key: "template-ready",
        to: "/settings",
        label: "Ready",
        title: "模板状态正常。点击进入设置。",
        tone: "ok",
        icon: "sparkles",
      },
    ],
  },
} satisfies LiliaUiConfig;
