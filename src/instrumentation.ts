/**
 * Runs once when the Node server boots (Hostinger / next start).
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  try {
    const { syncClubContentFromStatic } = await import("@/lib/contentStore");
    await syncClubContentFromStatic();
    console.log("[instrumentation] club content synced");
  } catch (error) {
    console.error("[instrumentation] club content sync failed:", error);
  }

  if (process.env.SKIP_TOURNAMENT_TABLE_SYNC === "1") return;

  try {
    const { execFile } = await import("node:child_process");
    const { promisify } = await import("node:util");
    const execFileAsync = promisify(execFile);
    const { cwd } = await import("node:process");
    await execFileAsync(process.execPath, ["scripts/sync-tournament-tables.mjs"], {
      cwd: cwd(),
      env: process.env,
      timeout: 180_000,
      maxBuffer: 4 * 1024 * 1024,
    });
    console.log("[instrumentation] tournament tables sync done");
  } catch (error) {
    console.error("[instrumentation] tournament tables sync failed:", error);
  }
}
