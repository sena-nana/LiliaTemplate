# 桌面应用脚手架

最小 Tauri 2 + Vue 3 + TypeScript 脚手架。通用 UI、样式、桌面 Shell、菜单、主题和设置页由 `@lilia/ui` 提供，本仓库只保留应用配置、路由、命令、业务页面目录和 Tauri 基础配置。

## 结构

```text
src/
  main.ts
  app.ts
  app.config.ts
  routes.ts
  commands.ts
  features/
src-tauri/
scripts/
tests/
```

## 命令

```bash
yarn install
yarn dev
yarn tauri:dev
yarn test
yarn build
yarn verify
```

## 配置

根目录 `app.config.json` 是应用名称、产品标题、版本和 Tauri 标识的同步来源。修改后运行：

```bash
yarn sync:app-config
```

运行时 Shell 配置在 `src/app.config.ts`，路由在 `src/routes.ts`，命令在 `src/commands.ts`。

## 公共 UI 依赖

```json
{
  "dependencies": {
    "@lilia/ui": "github:sena-nana/LiliaUI#main"
  }
}
```
