# 双层验收矩阵

CI 对以下四个组合分别执行预设事务、边界检查、测试、生产构建和 Tauri 无安装包编译：

| 预设 | 依赖来源 | 预期 Layer |
| --- | --- | --- |
| Lilia | 固定 Git commit | `@lilia/ui` |
| Lilia | 本地 portal | `@lilia/ui` |
| Nana | 固定 Git commit | `@lilia/nana-ui` |
| Nana | 本地 portal | `@lilia/nana-ui` |

Nana 两个来源额外运行真实浏览器流程，覆盖首页、编辑、设置、首次设置、失败恢复、续接和减少动效。

## 本地完整检查

```bash
pnpm agent:debug --json
pnpm verify
pnpm tauri:build:no-bundle
```

切换到 Nana 后再运行：

```bash
pnpm test:e2e
```

构建会生成 `dist/ui-bundle-report.json`，并与 `tests/bundle-baseline.json` 比较。报告必须证明单 Layer、异步入口数量和体积预算同时满足。

历史迁移夹具位于 `fixtures/legacy-lilia`，功能测试会验证检查模式不写文件、业务代码保留、迁移后无直连 Layer import，以及重复执行无改动。
