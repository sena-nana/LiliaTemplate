<script setup lang="ts">
import { computed } from "vue";
import { RouterView, useRoute } from "vue-router";
import { normalizeSettingsTab, useSettings } from "@lilia/ui-foundation/settings";
import { LiliaPrimaryContent, LiliaSectionNavigation, LiliaWorkspace } from "@lilia/ui/layouts";
import { LiliaSettingsSidebar } from "@lilia/ui/settings/sidebar";
import { LiliaAppShell } from "@lilia/ui/shell/app";
import { SIDEBAR_NAV } from "@lilia/ui/shell/config";
import { LiliaSidebarFrame, LiliaSidebarNavRow } from "@lilia/ui/shell/sidebar";

const route = useRoute();
const settings = useSettings();
const settingsMode = computed(() => settings !== null && route.path === settings.path);
const activeSettingsTab = computed(() => settings ? normalizeSettingsTab(settings, route.query.tab) : "");
</script>

<template>
  <LiliaAppShell>
    <LiliaWorkspace aria-label="应用工作区">
      <LiliaSectionNavigation id="template-navigation">
        <LiliaSettingsSidebar
          v-if="settingsMode && settings"
          :tabs="settings.tabs"
          :active-key="activeSettingsTab"
          return-to="/"
        />
        <LiliaSidebarFrame v-else aria-label="主导航">
          <nav class="template-sidebar-nav" aria-label="主导航">
            <LiliaSidebarNavRow
              v-for="item in SIDEBAR_NAV"
              :key="item.key"
              :item="item"
              :agent-id="`sidebar.nav.${item.key}`"
              :emphasis="item.emphasis"
            />
          </nav>
        </LiliaSidebarFrame>
      </LiliaSectionNavigation>
      <LiliaPrimaryContent id="template-primary">
        <RouterView />
      </LiliaPrimaryContent>
    </LiliaWorkspace>
  </LiliaAppShell>
</template>

<style scoped>
.template-sidebar-nav { display: flex; flex-direction: column; gap: 1px; min-height: 0; }
</style>
