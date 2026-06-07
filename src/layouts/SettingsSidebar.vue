<script setup lang="ts">
import { RouterLink } from "vue-router";
import { ArrowLeft } from "lucide-vue-next";
import type { SettingsTab, SettingsTabKey } from "../config/appShell";

defineProps<{
  tabs: SettingsTab[];
  activeKey: SettingsTabKey;
  returnTo?: string | null;
}>();
</script>

<template>
  <aside class="secondary-panel settings-sidebar" aria-label="设置分类">
    <div class="settings-sidebar__head">
      <RouterLink
        :to="returnTo || '/'"
        custom
        v-slot="{ navigate }"
      >
        <button
          type="button"
          class="settings-sidebar__back"
          aria-label="返回"
          title="返回"
          @click="navigate"
        >
          <ArrowLeft :size="15" aria-hidden="true" />
          <span>返回</span>
        </button>
      </RouterLink>
    </div>

    <nav class="settings-sidebar__tabs" aria-label="设置分类">
      <RouterLink
        v-for="tab in tabs"
        :key="tab.key"
        :to="tab.to"
        custom
        v-slot="{ navigate }"
      >
        <button
          type="button"
          class="settings-sidebar__tab"
          :class="{ 'is-active': activeKey === tab.key }"
          :aria-current="activeKey === tab.key ? 'page' : undefined"
          @click="navigate"
        >
          <component
            :is="tab.icon"
            class="settings-sidebar__tab-icon"
            :size="15"
            aria-hidden="true"
          />
          <span class="settings-sidebar__tab-label">{{ tab.label }}</span>
        </button>
      </RouterLink>
    </nav>
  </aside>
</template>
