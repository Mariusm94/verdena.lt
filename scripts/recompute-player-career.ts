import { recomputePlayerCareerStats } from "../src/lib/playerCareer";

async function main() {
  const cache = await recomputePlayerCareerStats();
  const players = Object.values(cache.byName);
  const top = [...players].sort((a, b) => b.wins - a.wins).slice(0, 5);
  console.log(
    JSON.stringify(
      {
        updatedAt: cache.updatedAt,
        players: players.length,
        topWins: top.map((p) => ({ name: p.name, wins: p.wins, matches: p.matches })),
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
