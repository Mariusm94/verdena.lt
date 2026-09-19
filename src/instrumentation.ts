/**
 * Runs once when the Node server boots (Hostinger / next start).
 * Fills league tables into SQLite even if package.json start script is overridden.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
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

  try {
    const { syncOpenTournamentContent } = await import("@/lib/tournamentStore");
    const { ensureAllOpenRegistrations } = await import("@/lib/registrationStore");
    const synced = await syncOpenTournamentContent();
    const count = await ensureAllOpenRegistrations();
    console.log(`[instrumentation] open tournaments synced: ${synced}, registrations ready: ${count}`);
  } catch (error) {
    console.error("[instrumentation] open registrations failed:", error);
  }
}
