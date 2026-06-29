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
├── tests/
└── scripts/
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

`yarn agent:debug` 会输出当前脚手架边界、关键文件和建议验证入口。
