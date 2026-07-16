export const liliaFiles = {
  "src/ui/index.ts": `export {
  Button, Card, Checkbox, EmptyState, FormField, IconButton, Input,
  InteractiveCard, ListItem, Progress, Select, Skeleton, StatusBadge,
  Switch, Tabs, Textarea, Toast, ValidationMessage,
} from "@lilia/ui";
`,
  "src/ui/commands.ts": `export {
  createCommandRegistry, installCommandRegistry,
} from "@lilia/ui/commands";
export type { CommandHandler, CommandMap, CommandRegistry } from "@lilia/ui/commands";
`,
  "src/ui/consumer.ts": `export {};
`,
  "src/ui/patterns.ts": `export {};
`,
  "src/ui/settings.ts": `export * from "@lilia/ui/settings";
`,
  "src/ui/shell.ts": `export * from "@lilia/ui/shell";
`,
  "src/ui/state.ts": `export {};
`,
  "src/ui/styles.css": `@import "@lilia/ui/styles.css";
`,
  "src/ui/ActiveShell.vue": `<template><div /></template>
`,
  "src/ui/activePreset.ts": `import { liliaPresetAdapter } from "@lilia/ui/preset";
import { provideSettings, createSettingsModel } from "@lilia/ui-foundation/settings";
import { LiliaDesktopShell, resolveLiliaIcon, setLiliaUiConfig } from "@lilia/ui/shell";
import { installCornerStyle, installGlobalScrollbarVisibility, installLiliaContextMenu, installNativeAppearance } from "@lilia/ui/runtime";
import ContextMenuHost from "@lilia/ui/components/ContextMenuHost";
import OverlayHost from "@lilia/ui/components/OverlayHost";
import appConfigJson from "../../app.config.json";
import { defineComponent, h, type Component } from "vue";
import type { AppUIPresetAdapter } from "./contract";
import type { TemplateUIPresetAdapter } from "./types";

const upstream = liliaPresetAdapter as AppUIPresetAdapter<Component>;
const Hosts = defineComponent({ setup: () => () => [h(ContextMenuHost), h(OverlayHost)] });
const settings = createSettingsModel({
  path: "/settings", defaultTab: "appearance", description: "偏好设置会保存到本地。",
  tabs: [
    { key: "appearance", label: "外观", icon: resolveLiliaIcon("palette") },
    { key: "about", label: "关于", icon: resolveLiliaIcon("info") },
  ],
  sections: {
    appearance: () => import("@lilia/ui/settings").then((module) => ({ default: module.LiliaAppearanceSection })),
    about: () => import("@lilia/ui/settings").then((module) => ({ default: module.LiliaAboutSection })),
  },
});

export const templatePreset: TemplateUIPresetAdapter = {
  ...upstream,
  shell: LiliaDesktopShell,
  routes: [
    { path: "", component: () => import("../features/home/HomePage.vue") },
    { path: "settings", component: () => import("@lilia/ui/settings").then((module) => module.LiliaSettingsPage) },
  ],
  hosts: Hosts,
  install(app) {
    setLiliaUiConfig({
      appName: appConfigJson.appName, productTitle: appConfigJson.productTitle,
      version: appConfigJson.version, storageKeyPrefix: appConfigJson.storageKeyPrefix,
      appearance: { backdropTarget: "sidebar" },
      sidebar: {
        navTitle: "导航",
        nav: [{ key: "overview", to: "/", label: "首页", icon: "home" }],
        footerLinks: [{ key: "settings", to: "/settings", label: "设置", icon: "settings" }],
      },
    });
    provideSettings(app, settings);
    installLiliaContextMenu(app);
    installGlobalScrollbarVisibility();
    installCornerStyle();
    installNativeAppearance();
  },
  installDiagnostics: async () => {
    const diagnostics = await import("@lilia/ui/diagnostics");
    if (!diagnostics.isLiliaAgentDebugEnabled()) return false;
    diagnostics.installAgentDebugHarness();
    return true;
  },
};
`,
};
