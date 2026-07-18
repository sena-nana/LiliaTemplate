#!/usr/bin/env node
import { createUiPresetPlan, executeUiTransaction, formatUiReport, inspectUiProject, createUiReport } from "@lilia/tools/ui-preset";
import { createOverlayOperations } from "./ui-preset/overlay.mjs";

const args = process.argv.slice(2);
const action = args.find((arg) => !arg.startsWith("-")) ?? "status";
const json = args.includes("--json");
const options = { check: args.includes("--check"), dryRun: args.includes("--dry-run"), force: args.includes("--force") };
const projectRoot = process.cwd();
const inspection = await inspectUiProject(projectRoot);

if (action === "status") {
  process.stdout.write(formatUiReport(createUiReport({ kind: "ui-preset", inspection }), { json }));
  if (inspection.status !== "ready") process.exitCode = 1;
} else {
  const appConfig = structuredClone(inspection.appConfig);
  if (action === "lilia") delete appConfig.layout;
  if (action === "nana") {
    appConfig.layout ??= { type: "nana-home", sidebar: { collapsible: true } };
    appConfig.onboarding ??= { enabled: true };
  }
  const planningInspection = { ...inspection, appConfig };
  const commands = [
    { id: "install", command: "pnpm", args: ["install"] },
    { id: "test", command: "pnpm", args: ["test"] },
    { id: "build", command: "pnpm", args: ["build"] },
  ];
  const plan = await createUiPresetPlan(planningInspection, action, {
    uiFiles: [],
    commands,
  });
  plan.operations.push(...await createOverlayOperations(projectRoot, action));
  plan.operations = plan.operations.filter((operation) => operation.before !== operation.after);
  plan.git = inspection.git;
  const result = await executeUiTransaction(plan, options);
  const current = result.status === "changed" ? await inspectUiProject(projectRoot) : inspection;
  const report = createUiReport({ kind: "ui-preset", inspection: current, plan, result });
  process.stdout.write(formatUiReport(report, { json }));
  if (["blocked", "changes_required", "needs_attention", "rolled_back"].includes(report.status)) process.exitCode = 1;
}
