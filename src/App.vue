<script setup lang="ts">
import { RouterView } from "vue-router";
import ContextMenuHost from "./components/context-menu/ContextMenuHost.vue";
</script>

<template>
  <ContextMenuHost>
    <RouterView />
  </ContextMenuHost>
</template>
