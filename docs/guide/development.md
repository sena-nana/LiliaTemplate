# 开发启动

## 项目结构

```text
Tauri-Template/
├── src/
│   ├── app.ts
│   ├── AppRoot.vue
│   ├── capabilities/
│   ├── commands.ts
│   ├── features/
│   ├── routes.ts
│   ├── ui/
│   └── main.ts
├── src-tauri/
├── scripts/ui-preset/
├── app.config.json
├── lilia.tools.profile.mjs
└── tests/
```

## 本地运行

```bash
npm install --global pnpm@11.14.0
pnpm install --frozen-lockfile
pnpm dev
pnpm tauri:dev
```

本仓库统一使用 Node.js 26.5.0 与 pnpm 11.14.0。Node.js 26 不再内置 Corepack，因此直接安装 pnpm，不依赖 Corepack。

## LiliaUI 本地联调

默认 `package.json` 和提交版 `pnpm-lock.yaml` 固定使用 GitHub 上同一个 LiliaUI commit。基础包始终存在，Layer 包只保留当前预设需要的 `@lilia/ui` 或 `@lilia/nana-ui`。普通 `pnpm install` 不依赖本机存在 LiliaUI 源码仓库。

需要同时修改 LiliaUI 时，从模板仓库根目录运行：

```bash
pnpm liliaui:local
```

该命令会把当前 manifest 中启用的 `@lilia/*` 依赖临时切换为指向本地 LiliaUI 工作区的 `link:` 依赖，并将原始远端依赖记录在被忽略的 `.lilia-ui-deps.remote.json` 中。如果 LiliaUI 不在相邻目录，可用 `LILIA_UI_LOCAL_PATH` 指定路径：

```powershell
$env:LILIA_UI_LOCAL_PATH = "C:\Files\workspace\LiliaUI"
pnpm liliaui:local
Remove-Item Env:LILIA_UI_LOCAL_PATH
```

提交依赖或锁文件变更前，先切回固定 GitHub 依赖：

```bash
pnpm liliaui:remote
pnpm liliaui:status
```

`pnpm liliaui:status` 会报告当前所有 LiliaUI 包来自本地 `link:` 路径还是固定 GitHub commit。提交策略是：远端 manifest 与对应锁文件可以入库；本地 `link:` manifest、临时锁文件和 `.lilia-ui-deps.remote.json` 不随普通业务提交入库。

## 验证

```bash
pnpm test
pnpm build
cargo check --manifest-path src-tauri/Cargo.toml
pnpm verify
pnpm test:e2e # Nana 预设
```

`pnpm agent:debug` 会读取 `lilia.tools.profile.mjs`，输出当前脚手架边界、关键文件、Agent 调试环境变量、应用声明的 `data-agent-id` 目标和桌面 replay 工具探测结果。

前端诊断由当前预设 adapter 按需装配。只有开发模式同时设置 `VITE_LILIA_AGENT_DEBUG=1`，或使用 `agent-debug` mode 时，才会异步加载诊断能力；普通生产构建不注册调试监听器。
