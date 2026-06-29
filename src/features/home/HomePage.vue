<script setup lang="ts">
import { Copy, Pencil, Trash2 } from "@lucide/vue";
import { APP_SHELL_COPY, Dropdown, ViewTabs } from "@lilia/ui";
import { ref } from "vue";

const cardMenu = [
  { id: "rename", label: "重命名", icon: Pencil, onSelect: () => {} },
  { id: "duplicate", label: "复制", icon: Copy, onSelect: () => {} },
  {
    id: "delete",
    label: "删除",
    icon: Trash2,
    danger: true,
    confirmLabel: "确认删除？再点一次",
    onSelect: () => {},
  },
];

const menuMotionOptions: Array<{
  value: "bottom" | "top";
  label: string;
  hint: string;
}> = [
  { value: "bottom", label: "向下展开", hint: "从按钮点击点展开" },
  { value: "top", label: "向上展开", hint: "适合页面底部" },
];

const menuMotionValue = ref<"bottom" | "top">("bottom");
</script>

<template>
  <section>
    <ViewTabs active="overview" />
    <div class="page-header">
      <div>
        <h1>{{ APP_SHELL_COPY.homeTitle }}</h1>
        <p>{{ APP_SHELL_COPY.homeDescription }}</p>
      </div>
    </div>

    <div class="template-grid">
      <div class="card" v-context-menu="cardMenu">
        <h2>欢迎</h2>
        <p class="muted">应用已准备就绪。</p>
      </div>
      <div class="card" v-context-menu="cardMenu">
        <h2>菜单示例</h2>
        <p class="muted">此卡片已接入公共菜单能力，右键可打开操作菜单。</p>
      </div>
      <div class="card">
        <h2>选择示例</h2>
        <Dropdown
          v-model="menuMotionValue"
          :options="menuMotionOptions"
          placement="bottom"
          placeholder="选择展开方向"
        />
      </div>
    </div>
  </section>
</template>

<style scoped>
.template-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

@media (max-width: 900px) {
  .template-grid {
    grid-template-columns: 1fr;
  }
}
</style>
