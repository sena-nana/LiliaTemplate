import { createLiliaApp, LiliaDesktopShell } from "@lilia/ui";
import type { RouterHistory } from "vue-router";
import { appConfig } from "./app.config";
import { commands } from "./commands";
import { routes } from "./routes";

export function createTemplateApp(history?: RouterHistory) {
  return createLiliaApp({
    config: appConfig,
    routes,
    commands,
    shell: LiliaDesktopShell,
    history,
  });
}
