// @vitest-environment node
import { cpSync, mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { formatMigrationReport, inspectUiMigration, runUiMigration } from "@lilia/tools/ui-migrate";

const here = dirname(fileURLToPath(import.meta.url));
const fixture = join(here, "../fixtures/legacy-lilia");

function createHistoricalProject() {
  const root = mkdtempSync(join(tmpdir(), "lilia-template-migration-"));
  cpSync(fixture, root, { recursive: true });
  return root;
}

describe("historical template migration", () => {
  it("trials a safe Nana migration, preserves business code, and is idempotent", async () => {
    const root = createHistoricalProject();
    const originalFeature = readFileSync(join(root, "src/features/editor/EditorPage.vue"), "utf8");
    const check = await runUiMigration(root, { check: true });

    expect(check.status).toBe("needs_attention");
    expect(readFileSync(join(root, "src/features/editor/EditorPage.vue"), "utf8")).toBe(originalFeature);

    const report = await runUiMigration(root, { preset: "nana", commands: [] });
    const inspection = await inspectUiMigration(root, { preset: "nana" });
    const migratedFeature = readFileSync(join(root, "src/features/editor/EditorPage.vue"), "utf8");

    expect(report.status).toBe("changed");
    expect(report.migration.safeChanges.length).toBeGreaterThan(0);
    expect(report.migration.contractIncompatibilities).toHaveLength(0);
    expect(inspection.directImports).toHaveLength(0);
    expect(migratedFeature).toContain("businessProjectId");
    expect(formatMigrationReport(report).split("\n").length).toBeGreaterThan(5);

    const repeated = await runUiMigration(root, { preset: "nana", commands: [] });
    expect(repeated.status).toBe("unchanged");
    expect(repeated.changes).toHaveLength(0);
  });
});
