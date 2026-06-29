import appConfigJson from "../app.config.json";
import type { LiliaAppConfig } from "@lilia/ui";

export const appConfig = {
  appName: appConfigJson.appName,
  productTitle: appConfigJson.productTitle,
  version: appConfigJson.version,
  storageKeyPrefix: appConfigJson.storageKeyPrefix,
  shell: appConfigJson.shell,
  sidebar: {
    globalActions: [
      { key: "new", label: "新建", icon: "file-plus", disabled: true },
      { key: "search", label: "搜索", icon: "search", disabled: true },
    ],
    nav: [
      {
        key: "overview",
        to: "/",
        label: "概览",
        icon: "home",
        tools: [{ key: "new", label: "新建", icon: "file-plus", disabled: true }],
      },
    ],
    groups: [
      {
        key: "example",
        title: appConfigJson.shell.workspaceSectionTitle,
        tools: [{ key: "more", label: "更多", icon: "more", disabled: true }],
        items: [
          {
            key: "workspace",
            label: appConfigJson.shell.workspaceName,
            icon: "folder",
            disabled: true,
            tools: [{ key: "more", label: "更多", icon: "more", disabled: true }],
          },
        ],
        emptyText: appConfigJson.shell.workspaceEmptyText,
      },
    ],
    footerLinks: [{ key: "settings", to: "/settings", label: "设置", icon: "settings" }],
    footerStatus: {
      to: "/settings",
      label: appConfigJson.shell.statusLabel,
      title: appConfigJson.shell.statusTitle,
      tone: "ok",
      icon: "sparkles",
    },
  },
} satisfies LiliaAppConfig;
