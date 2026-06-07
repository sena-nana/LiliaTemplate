import {
  createRouter,
  createWebHistory,
  type RouterHistory,
} from "vue-router";
import AppShell from "./layouts/AppShell.vue";
import Home from "./pages/Home.vue";
import Plugins from "./pages/Plugins.vue";
import Settings from "./pages/Settings.vue";

export function createTemplateRouter(history: RouterHistory = createWebHistory()) {
  return createRouter({
    history,
    routes: [
      {
        path: "/",
        component: AppShell,
        meta: { sidebar: "main", returnable: true },
        children: [
          { path: "", component: Home, meta: { sidebar: "main", returnable: true } },
          { path: "plugins", component: Plugins, meta: { sidebar: "main", returnable: true } },
          {
            path: "settings",
            component: Settings,
            meta: { sidebar: "settings", lockSidebar: true, returnable: false },
          },
        ],
      },
      { path: "/:pathMatch(.*)*", redirect: "/" },
    ],
  });
}

export const router = createTemplateRouter();
