/**
 * Smoke: npx tsx scripts/standings-smoke.ts
 */
import {
  computeStandingsFromMatches,
  flipScore,
  parseTennisMatchWinner,
} from "../src/lib/standings";

function assert(cond: unknown, msg: string) {
  if (!cond) throw new Error(msg);
}

assert(flipScore("6:4 6:2") === "4:6 2:6", "flipScore basic");
assert(flipScore("7:5 3:6 10:8") === "5:7 6:3 8:10", "flipScore three sets");
assert(flipScore("6-4 6-2") === "4-6 2-6", "flipScore dash");

assert(parseTennisMatchWinner("6:4 6:2") === "home", "winner home 2-0");
assert(parseTennisMatchWinner("4:6 2:6") === "away", "winner away 0-2");
assert(parseTennisMatchWinner("7:5 3:6 10:8") === "home", "winner home 2-1");
assert(parseTennisMatchWinner("") === null, "empty score");
assert(parseTennisMatchWinner("6:6") === null, "tie sets");

const teams = ["A", "B", "C"];
const { points, places, scores } = computeStandingsFromMatches(teams, [
  { home: "A", away: "B", score: "6:4 6:2", status: "confirmed" },
  { home: "A", away: "C", score: "6:3 4:6 10:8", status: "confirmed" },
  { home: "B", away: "C", score: "6:0 6:1", status: "pending" }, // ignored
  { home: "B", away: "C", score: "", status: "confirmed" }, // ignored
]);

assert(points[0] === 2 && points[1] === 0 && points[2] === 0, `points ${points}`);
assert(places[0] === 1 && places[1] === 2 && places[2] === 3, `places ${places}`);
assert(scores[0][1] === "6:4 6:2", "scores A vs B");
assert(scores[1][0] === "4:6 2:6", "scores B vs A flipped");
assert(scores[1][2] === "0", "no confirmed B vs C");
assert(scores[0][0] === "", "diagonal empty");

console.log("standings smoke OK");
