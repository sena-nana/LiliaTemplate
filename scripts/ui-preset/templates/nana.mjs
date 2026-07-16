export const nanaFiles = {
  "src/ui/index.ts": `export {
  Button, Card, Checkbox, EmptyState, FormField, IconButton, Input,
  InteractiveCard, ListItem, Progress, Select, Skeleton, StatusBadge,
  Switch, Tabs, Textarea, Toast, ValidationMessage, useNanaUI,
} from "@lilia/nana-ui";
export { OperationalStatus } from "@lilia/nana-ui/feedback";
`,
  "src/ui/commands.ts": `export { createCommandRegistry, installCommandRegistry } from "@lilia/nana-ui/commands";
export type { CommandHandler, CommandMap, CommandRegistry } from "@lilia/nana-ui/commands";
`,
  "src/ui/consumer.ts": `export {
  AdvancedSettingsDisclosure, CompletionFeedback, DeviceStatusCard,
  GuidedEmptyState, OperationResult, ProgressiveSection, RecoveryError,
  SetupStep, SetupStepper, UndoableActionNotice,
} from "@lilia/nana-ui/consumer";
`,
  "src/ui/patterns.ts": `export {
  ContextPanel, NanaEditorLayout as EditorLayout, NanaHomeLayout as HomeLayout,
  NanaOnboardingLayout as OnboardingLayout, NanaSettingsLayout as SettingsLayout,
  PersistentStatusBar, PrimaryActionArea, TaskPageHeader,
} from "@lilia/nana-ui/patterns";
`,
  "src/ui/settings.ts": `export { createSettingsModel, normalizeSettingsTab, provideSettings, useSettings } from "@lilia/nana-ui/settings";
export type { SettingsModel, SettingsModelInput } from "@lilia/nana-ui/settings";
`,
  "src/ui/shell.ts": `export { NanaAppShell as AppShell, NanaSidebar as Sidebar } from "@lilia/nana-ui/shell";
`,
  "src/ui/state.ts": `export { createAsyncTaskController, createContinuation, createEditSession, createUndoManager, initialReconnectState, reduceReconnect, summarizeOperationalState, useAutoSave } from "@lilia/nana-ui/state";
export type { AsyncTaskController, AutoSaveController, ContinuationSnapshot } from "@lilia/nana-ui/state";
`,
  "src/ui/styles.css": `@import "@lilia/nana-ui/styles.css";
`,
  "src/ui/ActiveShell.vue": `<script setup lang="ts">
import type { SidebarItem, SidebarMode } from "./contract";
import { OperationalStatus } from "./index";
import { AppShell } from "./shell";
import { useOperationalStore } from "../capabilities/operational";
defineProps<{ navigation: readonly SidebarItem[]; settingsItem?: SidebarItem; sidebarMode?: SidebarMode; productTitle?: string }>();
const operational = useOperationalStore();
</script>
<template><AppShell :navigation="navigation" :settings-item="settingsItem" :sidebar-mode="sidebarMode">
  <template #project><strong>{{ productTitle }}</strong></template>
  <template #save-state><OperationalStatus :state="{ save: operational.state.save, pendingChanges: operational.state.pendingChanges }" /></template>
  <template #device-state><OperationalStatus :state="{ connection: operational.state.connection }" /></template>
  <template #runtime-state><OperationalStatus :state="{ runtime: operational.state.runtime }" /></template>
  <template #status><OperationalStatus :state="operational.state" agent-id="app.operational.status" /></template>
</AppShell></template>
`,
  "src/ui/activePreset.ts": `import Home from "@lucide/vue/dist/esm/icons/house.mjs";
import Palette from "@lucide/vue/dist/esm/icons/palette.mjs";
import Radio from "@lucide/vue/dist/esm/icons/radio.mjs";
import Settings from "@lucide/vue/dist/esm/icons/settings.mjs";
import Sliders from "@lucide/vue/dist/esm/icons/sliders-horizontal.mjs";
import User from "@lucide/vue/dist/esm/icons/user.mjs";
import Video from "@lucide/vue/dist/esm/icons/video.mjs";
import Zap from "@lucide/vue/dist/esm/icons/zap.mjs";
import { nanaPresetAdapter } from "@lilia/nana-ui/preset";
import type { Component } from "vue";
import appConfigJson from "../../app.config.json";
import { autoSaveCapability, createMockProductAdapter, operationalCapability, productCapability, recoveryCapability, undoCapability } from "../capabilities";
import ActiveShell from "./ActiveShell.vue";
import { createSettingsModel, provideSettings } from "./settings";
import type { AppUIPresetAdapter } from "./contract";
import type { TemplateUIPresetAdapter } from "./types";

const upstream = nanaPresetAdapter as AppUIPresetAdapter<Component>;
const Section = () => import("../features/nana/settings/SettingsSection.vue");
const settings = createSettingsModel({
  path: "/settings", defaultTab: "appearance", description: "按任务逐步调整；高级选项默认收起。",
  tabs: [
    { key: "appearance", label: "外观", icon: Palette, props: { title: "外观", description: "调整界面呈现方式。" } },
    { key: "device", label: "设备", icon: Radio, props: { title: "设备", description: "管理输入设备和连接偏好。" } },
    { key: "capture", label: "捕捉", icon: Video, props: { title: "捕捉", description: "选择适合当前任务的捕捉方式。" } },
    { key: "performance", label: "性能", icon: Zap, props: { title: "性能", description: "平衡响应速度和资源使用。" } },
    { key: "output", label: "输出", icon: Sliders, props: { title: "输出", description: "配置输出行为和目标。" } },
    { key: "account", label: "账户与数据", icon: User, props: { title: "账户与数据", description: "管理本地数据和账户选项。" } },
    { key: "advanced", label: "高级", icon: Settings, props: { title: "高级", description: "仅在需要时调整高级行为。", showAdvanced: true } },
  ],
  sections: { appearance: Section, device: Section, capture: Section, performance: Section, output: Section, account: Section, advanced: Section },
});

export const templatePreset: TemplateUIPresetAdapter = {
  ...upstream,
  shell: ActiveShell,
  shellProps: {
    navigation: [
      { id: "home", label: "首页", icon: Home, href: "/", agentId: "navigation.home" },
      { id: "editor", label: "编辑", icon: Sliders, href: "/editor", agentId: "navigation.editor" },
    ],
    settingsItem: { id: "settings", label: "设置", icon: Settings, href: "/settings", agentId: "navigation.settings" },
    sidebarMode: upstream.policy.sidebarDefault,
    productTitle: appConfigJson.productTitle,
  },
  routes: [
    { path: "", component: () => import("../features/nana/home/HomePage.vue") },
    { path: "editor", component: () => import("../features/nana/editor/EditorPage.vue") },
    { path: "settings", component: () => import("../features/nana/settings/SettingsPage.vue") },
    ...(appConfigJson.onboarding?.enabled ? [{ path: "onboarding", component: () => import("../features/nana/onboarding/OnboardingPage.vue") }] : []),
  ],
  appCapabilities: [productCapability(createMockProductAdapter({ failConnectOnce: import.meta.env.VITE_TEMPLATE_MOCK_FAILURE === "1" })), operationalCapability(), autoSaveCapability(), recoveryCapability(), undoCapability()],
  install(app) { provideSettings(app, settings); },
};
`,
};
