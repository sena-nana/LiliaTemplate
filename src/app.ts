import { createApp } from "vue";
import {
  createRouter,
  createWebHistory,
  type RouterHistory,
} from "vue-router";
import { installCommandRegistry } from "@lilia/ui/commands";
import { provideLiliaSettings } from "@lilia/ui/settings";
import { LiliaDesktopShell, setLiliaUiConfig } from "@lilia/ui/shell";
import AppRoot from "./AppRoot.vue";
import { appConfig } from "./app.config";
import { commands } from "./commands";
import { installTemplateDiagnostics } from "./diagnostics";
import { routes } from "./routes";
import { installTemplateUiRuntime } from "./runtime";
import { settingsModel } from "./settings";

export function createTemplateApp(history?: RouterHistory) {
  setLiliaUiConfig(appConfig);
  const app = createApp(AppRoot);
  const router = createTemplateRouter(history);

  provideLiliaSettings(app, settingsModel);
  installCommandRegistry(app, commands);
  installTemplateUiRuntime(app);
  app.use(router);
  if (
    import.meta.env.DEV
    && (import.meta.env.VITE_LILIA_AGENT_DEBUG === "1" || import.meta.env.MODE === "agent-debug")
  ) {
    void installTemplateDiagnostics();
  }

  return { app, router };
}

export function createTemplateRouter(history?: RouterHistory) {
  return createRouter({
    history: history ?? createWebHistory(),
    routes: [
      {
        path: "/",
        component: LiliaDesktopShell,
        meta: { sidebar: "main", returnable: true },
        children: routes,
      },
      { path: "/:pathMatch(.*)*", redirect: "/" },
    ],
  });
}
