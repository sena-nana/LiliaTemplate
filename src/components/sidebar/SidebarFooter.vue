<script setup lang="ts">
import { RouterLink } from "vue-router";
import type {
  SidebarFooterLink,
  SidebarFooterStatus,
} from "../../config/appShell";

defineProps<{
  links: SidebarFooterLink[];
  status: SidebarFooterStatus;
}>();
</script>

<template>
  <div class="sb-footer">
    <RouterLink
      v-for="link in links"
      :key="link.label"
      :to="link.to"
      class="sb-footer__btn"
      active-class="is-active"
      :title="link.title ?? link.label"
      :aria-label="link.label"
    >
      <component :is="link.icon" :size="14" aria-hidden="true" />
    </RouterLink>

    <RouterLink
      :to="status.to"
      class="sb-conn"
      :class="`sb-conn--${status.tone}`"
      :title="status.title"
      :aria-label="status.title"
    >
      <component :is="status.icon" :size="12" aria-hidden="true" />
      <span class="sb-conn__label">{{ status.label }}</span>
    </RouterLink>
  </div>
</template>
