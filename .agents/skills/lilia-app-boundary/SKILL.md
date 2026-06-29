---
name: lilia-app-boundary
description: Ownership rules for deciding whether a final Lilia desktop application change belongs in the app repository or in LiliaUI. Use when Codex touches shell behavior, titlebar, sidebar, settings, menus, theme, global CSS, config sync, build wrappers, default assets, window state, @lilia packages, tauri-plugin-lilia, app routes, commands, business pages, or app-owned Tauri code.
---

# Lilia App Boundary

## Decision Rule

Put behavior in the final app only when it is application-specific business logic, application configuration, page routing, command wiring, or an app-owned Tauri boundary.

Move or implement behavior in LiliaUI when it is reusable shell, UI system, styling, config, tooling, build, template check, default asset, or common Tauri runtime behavior.

## Final App Owns

- `app.config.json`: app name, product title, version, identifier, storage prefix, and app shell copy.
- `src/app.config.ts`: app navigation, footer status, settings copy, and app-level shell configuration.
- `src/routes.ts`: final app routes and lazy-loaded business pages.
- `src/commands.ts`: app command registration exposed to LiliaUI runtime.
- `src/features/**`: app business pages, workflows, state, and scoped styles.
- `src-tauri/**`: app-specific Rust commands, app-specific state, capabilities, and Tauri configuration.
- `tests/**`: behavior tests for final app routes, commands, configuration, and business workflows.

## LiliaUI Owns

- `@lilia/ui`: shared components, desktop shell, titlebar, sidebar, settings page, menus, dialogs, theme, CSS tokens, reset, base controls, page classes, default copy patterns, and global UI behavior.
- `@lilia/config`: shared TypeScript, Vite, VitePress, and app config synchronization helpers.
- `@lilia/tools`: default assets, template checks, migrations, and surrounding tools.
- `@lilia/build`: dev, build, docs, Tauri run, and verify wrappers.
- `tauri-plugin-lilia`: main-window preparation, window state persistence, and shared Tauri runtime behavior.

Do not edit `node_modules/@lilia/*`. Modify the LiliaUI source repository, validate there, then update the final app dependency or lockfile.

## Common Decisions

- New business page or workflow: implement in the final app under `src/features`, then wire through `src/routes.ts` and `src/app.config.ts`.
- New app-specific command: implement in final app frontend and `src-tauri`, then update capabilities and tests.
- Titlebar, sidebar, shell layout, settings, menu, theme, default resource, config sync, template check, build flow, or window-state change: implement in LiliaUI first.
- Repeated style or component pattern across final apps: implement in LiliaUI.
- One-off business visualization or workflow-specific style: keep scoped in the final app component.

## Guardrails

- Do not copy Lilia-specific paths, protocols, providers, task timelines, or verification scripts into final apps unless the app truly implements that capability.
- Do not duplicate shared shell or style code locally to make a quick fix.
- When unsure, inspect the current app code and LiliaUI package surface before choosing a boundary.
- If both sides must change, define the interface first, then update LiliaUI and the final app in that order.
