export async function installTemplateDiagnostics() {
  const diagnostics = await import("@lilia/ui/diagnostics");
  if (!diagnostics.isLiliaAgentDebugEnabled()) return false;
  diagnostics.installAgentDebugHarness();
  return true;
}
