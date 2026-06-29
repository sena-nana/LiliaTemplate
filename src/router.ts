import { createLiliaRouter, LiliaDesktopShell, setLiliaAppConfig } from "@lilia/ui";
import { createWebHistory, type RouterHistory } from "vue-router";
import { appConfig } from "./app.config";
import { routes } from "./routes";

export function createTemplateRouter(history: RouterHistory = createWebHistory()) {
  setLiliaAppConfig(appConfig);
  return createLiliaRouter(routes, LiliaDesktopShell, history);
}

export const router = createTemplateRouter();
