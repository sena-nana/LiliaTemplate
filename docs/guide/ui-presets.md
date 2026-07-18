# UI 预设与迁移

## 构建期选择

模板通过 `src/ui` 暴露稳定 facade，业务页面只从该目录导入 UI、布局、设置与状态能力。预设切换会事务化更新 facade、依赖、配置和锁文件；失败时恢复切换前状态。

```bash
pnpm ui:status
pnpm ui:preset lilia --dry-run
pnpm ui:preset nana
pnpm ui:preset nana --check
```

同一预设重复执行不会产生改动。生产构建会检查以下边界：

- 只包含当前 Layer，不同时打包 Lilia 与 Nana。
- 业务路由保持异步加载。
- JS/CSS 体积不得超过对应基线的 15%。

## 本地与远端源码

预设和依赖来源互相独立：先选择预设，再用 `pnpm liliaui:local` 或 `pnpm liliaui:remote` 切换来源。提交前应回到远端固定 commit，并运行 `pnpm install --frozen-lockfile`。

## 历史项目迁移

先检查，不写文件：

```bash
pnpm ui:migrate --check --json
pnpm ui:migrate --preset nana --dry-run
```

确认报告中的安全改动、契约不兼容、信息架构复核和恢复反馈缺口后再执行：

```bash
pnpm ui:migrate --preset nana
```

工具只改写已知 Layer import 和受管配置，不重写业务逻辑；无法解析的 import 或未知 subpath 会阻止写入。修改中的工作区需显式确认，事务失败会回滚。
