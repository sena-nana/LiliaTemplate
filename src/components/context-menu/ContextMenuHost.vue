<script setup lang="ts">
import { onBeforeUnmount, onMounted, provide, ref } from "vue";
import {
  ContextMenuHostKey,
  type ContextMenuController,
  type ContextMenuItem,
} from "./useContextMenu";

const open = ref(false);
const x = ref(0);
const y = ref(0);
const items = ref<ContextMenuItem[]>([]);

function show(event: MouseEvent, nextItems: ContextMenuItem[]) {
  event.preventDefault();
  items.value = nextItems;
  x.value = event.clientX;
  y.value = event.clientY;
  open.value = nextItems.length > 0;
}

function hide() {
  open.value = false;
}

async function run(item: ContextMenuItem) {
  if (item.disabled) return;
  hide();
  await item.action?.();
}

function suppressNativeMenu(event: MouseEvent) {
  event.preventDefault();
}

function onPointerDown(event: MouseEvent) {
  if (!open.value || event.button === 2) return;
  hide();
}

const controller: ContextMenuController = { show, hide };
provide(ContextMenuHostKey, controller);

onMounted(() => {
  document.addEventListener("contextmenu", suppressNativeMenu);
  document.addEventListener("mousedown", onPointerDown, true);
  window.addEventListener("blur", hide);
});

onBeforeUnmount(() => {
  document.removeEventListener("contextmenu", suppressNativeMenu);
  document.removeEventListener("mousedown", onPointerDown, true);
  window.removeEventListener("blur", hide);
});
</script>

<template>
  <slot />
  <Teleport to="body">
    <ul
      v-if="open"
      class="context-menu"
      role="menu"
      :style="{ left: x + 'px', top: y + 'px' }"
      @mousedown.stop
    >
      <li
        v-for="item in items"
        :key="item.id"
        class="context-menu__item"
        :class="{ 'is-disabled': item.disabled }"
        role="menuitem"
        :aria-disabled="item.disabled || undefined"
        @click="run(item)"
      >
        {{ item.label }}
      </li>
    </ul>
  </Teleport>
</template>
