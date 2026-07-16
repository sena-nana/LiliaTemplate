import { defineToolsProfile } from "@lilia/tools";

export default defineToolsProfile({
  requireSingleAppRoot: true,
  expectedDependencies: [
    "@lilia/build",
    "@lilia/config",
    "@lilia/tools",
    "@lilia/ui",
    "vue",
    "vue-router",
  ],
  nativeBackdropPermissions: [
    "lilia:default",
    "lilia:allow-set-window-backdrop",
  ],
  importantFiles: [
    ["app.config.json", "application metadata source"],
    ["src/main.ts", "Vue mount entry"],
    ["src/AppRoot.vue", "application-owned root and global hosts"],
    ["src/app.ts", "Vue, Router, Shell, commands, and provider assembly"],
    ["src/app.config.ts", "application shell navigation"],
    ["src/routes.ts", "application routes"],
    ["src/commands.ts", "application command map"],
    ["src/overlays.ts", "application overlay composition"],
    ["src/runtime.ts", "optional UI runtime installers"],
    ["src/diagnostics.ts", "development-only diagnostics installer"],
    ["src/settings.ts", "application settings model"],
    ["src/features/home/HomePage.vue", "default application page"],
    ["tests/app.test.ts", "explicit application assembly test"],
    ["tests/tooling.test.ts", "template tooling contract tests"],
    ["docs/guide/development.md", "development workflow"],
  ],
  agentTargetFiles: {
    "src/features/home/HomePage.vue": [
      ["home.page"],
      ["home.header"],
      ["home.start-card"],
    ],
  },
  boundaries: {
    includes: [
      "application bootstrap and routing",
      "application configuration and commands",
      "application-owned features and Tauri boundaries",
    ],
    excludes: [
      "shared UI and shell implementations",
      "shared build and tooling engines",
      "shared Tauri window runtime",
    ],
  },
  entrypoints: [
    { id: "dev", command: "yarn dev", purpose: "start the frontend development server" },
    { id: "agent-debug", command: "yarn agent:debug --json", purpose: "inspect template readiness" },
    { id: "test", command: "yarn test", purpose: "run application behavior tests" },
    { id: "verify", command: "yarn verify", purpose: "run the complete application verification" },
  ],
});
