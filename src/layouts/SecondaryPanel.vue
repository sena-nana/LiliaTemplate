<script setup lang="ts">
import { RouterLink } from "vue-router";
import { Plus } from "lucide-vue-next";
import {
  SIDEBAR_FOOTER_LINKS,
  SIDEBAR_FOOTER_STATUS,
  SIDEBAR_GLOBAL_ACTIONS,
  SIDEBAR_GROUPS,
  SIDEBAR_NAV,
} from "../config/appShell";
import SidebarFooter from "../components/sidebar/SidebarFooter.vue";
</script>

<template>
  <aside class="secondary-panel">
    <div class="sb-section sb-section--actions">
      <button
        v-for="action in SIDEBAR_GLOBAL_ACTIONS"
        :key="action.key"
        type="button"
        class="sb-action"
        :title="action.label"
        :aria-label="action.label"
        :disabled="action.disabled"
      >
        <component :is="action.icon" :size="16" aria-hidden="true" />
      </button>
    </div>

    <div class="sb-section">
      <div class="sb-section__header">
        <span class="sb-section__title">工作区</span>
        <div class="sb-section__tools">
          <button type="button" class="sb-icon-btn" title="添加" aria-label="添加" disabled>
            <Plus :size="14" aria-hidden="true" />
          </button>
        </div>
      </div>
      <nav class="sb-tree" aria-label="主导航">
        <RouterLink
          v-for="item in SIDEBAR_NAV"
          :key="item.label"
          :to="item.to ?? '/'"
          class="sb-tree__row"
          active-class="is-active"
          :aria-disabled="item.disabled ? 'true' : undefined"
        >
          <component :is="item.icon" :size="14" aria-hidden="true" />
          <span class="sb-tree__name">{{ item.label }}</span>
        </RouterLink>
      </nav>
    </div>

    <div
      v-for="group in SIDEBAR_GROUPS"
      :key="group.title"
      class="sb-section"
    >
      <div class="sb-section__header">
        <span class="sb-section__title">{{ group.title }}</span>
        <div v-if="group.tools?.length" class="sb-section__tools">
          <button
            v-for="tool in group.tools"
            :key="tool.key"
            type="button"
            class="sb-icon-btn"
            :title="tool.label"
            :aria-label="tool.label"
            :disabled="tool.disabled"
          >
            <component :is="tool.icon" :size="14" aria-hidden="true" />
          </button>
        </div>
      </div>
      <div class="sb-tree">
        <div
          v-for="item in group.items"
          :key="item.label"
          class="sb-tree__row sb-tree__row--project"
          :aria-disabled="item.disabled ? 'true' : undefined"
        >
          <component :is="item.icon" :size="14" aria-hidden="true" />
          <span class="sb-tree__name">{{ item.label }}</span>
        </div>
        <p v-if="group.emptyText" class="sb-tree__empty">{{ group.emptyText }}</p>
      </div>
    </div>

    <SidebarFooter
      :links="SIDEBAR_FOOTER_LINKS"
      :status="SIDEBAR_FOOTER_STATUS"
    />
  </aside>
</template>
