# 开发启动

## 项目结构

```text
Tauri-Template/
├── src/                 # Vue 3 前端
│   ├── app.config.ts    # 将根级 app.config.json 适配为 @lilia/ui 配置
│   ├── app.ts           # createLiliaApp 接入
│   ├── commands.ts      # app 命令注册
│   ├── features/        # 业务页面
│   ├── routes.ts        # app 路由
│   └── main.ts
├── src-tauri/           # Tauri 2 Rust 端
├── tests/               # Vitest + Testing Library
└── scripts/             # 本地开发脚本, 包含 agent-debug.mjs 诊断入口
```

## 本地运行

本仓库通过 Corepack 使用 Yarn 4.14.1。建议从仓库根目录通过根 `yarn ...` 脚本运行贡献命令。

```bash
corepack enable
corepack prepare yarn@4.14.1 --activate
yarn install
yarn dev
yarn tauri:dev
yarn agent:debug
yarn tauri:build:no-bundle
yarn tauri:build
yarn tauri:install
```

`yarn tauri:dev` 会自动寻找可用本地端口,再把对应 `devUrl` 传给 Tauri。
`yarn tauri:build:no-bundle` 只验证 release 编译并跳过安装包生成,适合发布前的本地快速检查。
`yarn tauri:install` 会先用本机 CPU 优化参数打包,再打开安装程序并尝试安装;该入口面向本机安装验证,不要用它产出的包做通用分发。

Rust 编译缓存可在个人机器启用 `sccache`,但不要写入仓库配置。确认本机已安装后,在 `~/.cargo/config.toml` 配置:

```toml
[build]
rustc-wrapper = "sccache"
```

启用后用 `sccache --show-stats` 和重复构建耗时确认命中效果。CI 通过 `mozilla-actions/sccache-action` 使用预构建 sccache,不要在 workflow 里用 `cargo install sccache`,否则会从源码编译并拖慢构建。

## Agent 调试

模板只迁移 Lilia 对 Agent 友好的结构,不迁移 Claude / Codex / agent runner 业务。Agent 排查问题时优先从仓库根目录运行:

```bash
yarn agent:debug
```

该命令会列出项目边界、关键文件、推荐验证入口和结构检查结果。需要机器可读输出时使用:

```bash
yarn agent:debug --json
```

## 验证

```bash
yarn test
yarn build
cargo check --manifest-path src-tauri/Cargo.toml
yarn tauri:build:no-bundle
yarn verify
```

按影响范围运行最小必要验证。涉及构建配置、壳层布局、路由或 Tauri 端改动时,优先运行 `yarn verify`。

## 图标

Tauri 图标位于 `src-tauri/icons/`。如需替换图标,先更新源图,再使用 Tauri CLI 重新生成平台图标。
