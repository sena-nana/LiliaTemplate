# 开发启动

## 项目结构

```text
Tauri-Template/
├── src/
│   ├── app.config.ts
│   ├── app.ts
│   ├── commands.ts
│   ├── features/
│   ├── routes.ts
│   └── main.ts
├── src-tauri/
└── tests/
```

## 本地运行

```bash
corepack enable
yarn install
yarn dev
yarn tauri:dev
```

## 验证

```bash
yarn test
yarn build
cargo check --manifest-path src-tauri/Cargo.toml
yarn verify
```

`yarn agent:debug` 会输出当前脚手架边界、关键文件、Agent 调试环境变量、共享 `data-agent-id` 目标和桌面 replay 工具探测结果。设置 `VITE_LILIA_AGENT_DEBUG=1` 后,基于 `@lilia/ui` 的应用会安装 `window.__liliaAgentDebug` 前端调试接口。
