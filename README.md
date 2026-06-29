# 桌面应用模板

一个最轻 Tauri 2 + Vue 3 + TypeScript 应用脚手架。通用 UI、样式、桌面 Shell、菜单、主题和设置页能力由 `@lilia/ui` 提供，模板只保留应用入口、配置、路由、业务示例目录和 Tauri 基础配置。

模板保留：

- `src/main.ts`、`src/app.config.ts`、`src/routes.ts`、`src/commands.ts` 最小前端接入。
- `src/features/` 业务页面目录约定。
- `@lilia/ui` 依赖接入和公共样式 import。
- 主窗口位置、尺寸与最大化状态恢复，避免启动时先闪默认窗口再跳转。
- 根级 `app.config.json` 统一维护应用名称、产品标题、版本和 Tauri 标识。
- Yarn 4 单应用包管理与 `verify` 验证脚本。
- 最小 Tauri Rust 壳和 `ping` invoke 冒烟命令。
- Agent 友好的项目结构说明、边界清单和 `agent:debug` 诊断入口。

公共包提供：

- Lilia 风格的自绘标题栏、可拖拽侧栏、紧凑工作台 UI。
- 暗色 / 浅色主题切换、圆角设置与本地持久化。
- 组件声明式右键菜单、程序化打开菜单、危险项二次确认。
- Dropdown、ViewTabs、ConfirmDialog 等基础组件。
- `createLiliaApp`、命令注册表、Shell 配置适配和全局挂载点。

模板不包含：

- Lilia 的 Claude / Codex / CC-Switch / agent runner 业务。
- workspace、`packages/contracts`、项目 stub、聊天流、provider 配置。
- SQLite、WebDAV、托盘、小组件等 Momo 业务能力。

## 命令

```bash
yarn install
yarn dev
yarn tauri:dev
yarn tauri:build
yarn tauri:install
yarn agent:debug
yarn verify
```

`yarn verify` 会串行运行前端测试、前端构建和 Tauri Rust 编译检查。
`yarn tauri:install` 会先执行打包，再自动打开安装程序安装产物（Windows 优先使用 .msi 静默安装）。
`yarn agent:debug` 会输出模板边界、关键文件、建议验证命令和当前结构检查结果，便于 Agent 在不加载 Lilia 业务上下文的情况下定位问题。

## 应用信息

修改根目录的 `app.config.json` 后运行 `yarn sync:app-config`，会同步更新前端展示、`package.json`、`src-tauri/tauri.conf.json` 和 `src-tauri/Cargo.toml`。

运行时 Shell 配置位于 `src/app.config.ts`，会把根级 `app.config.json` 转成 `@lilia/ui` 的配置对象。业务页面从 `src/routes.ts` 接入，命令从 `src/commands.ts` 注册。

## LiliaUI 依赖

模板通过 Git 依赖引用公共 UI 包：

```json
{
  "dependencies": {
    "@lilia/ui": "github:sena-nana/LiliaUI#main"
  }
}
```

需要同步公共 UI / 样式 / Shell 能力时，更新依赖并重新安装：

```bash
yarn up @lilia/ui
yarn install
```

## 版本提升（本地）

本地发布前可先执行：

```bash
yarn version:bump patch
yarn version:bump minor
yarn version:bump major
yarn version:bump 1.2.3
```

`version:bump` 会先校验版本号合法性，更新 `app.config.json` 中的版本，再同步到 `package.json`、`src-tauri/tauri.conf.json` 和 `src-tauri/Cargo.toml`，便于后续 `git commit` 与 `workflow` 打 tag 发布。
