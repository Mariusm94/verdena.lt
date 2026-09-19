#!/usr/bin/env python3
"""Build src/data/playerProfiles.ts + merged playerStats from scraped JSON."""
from __future__ import annotations

import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]


def esc(s: str) -> str:
    return s.replace("\\", "\\\\").replace("'", "\\'")


def slugify(value: str) -> str:
    s = value.lower()
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = re.sub(r"[^a-z0-9]+", "-", s).strip("-")
    return s[:80]


def main() -> None:
    profiles = json.loads((ROOT / "scripts/_player_profiles.json").read_text(encoding="utf-8"))
    index = json.loads((ROOT / "scripts/_players_index.json").read_text(encoding="utf-8"))
    ranking_stats = json.loads(
        (ROOT / "scripts/_player_stats_from_rankings.json").read_text(encoding="utf-8")
    )

    # Prefer scraped slug; fall back to slugify(name)
    by_slug: dict[str, dict] = {}
    for p in profiles:
        slug = p.get("slug") or slugify(p["name"])
        by_slug[slug] = {
            "slug": slug,
            "name": p["name"],
            "matches": int(p.get("matches") or 0),
            "singles": int(p.get("singles") or 0),
            "doubles": int(p.get("doubles") or 0),
            "losses": int(p.get("losses") or 0),
            "winsPct": int(p.get("winsPct") or 0),
            "setsLost": int(p.get("setsLost") or 0),
            "setsWon": int(p.get("setsWon") or 0),
            "gamesLost": int(p.get("gamesLost") or 0),
            "gamesWon": int(p.get("gamesWon") or 0),
        }

    # Merge ranking absolutes into playerStats by name
    player_stats: dict[str, dict] = {k: dict(v) for k, v in ranking_stats.items()}
    for p in by_slug.values():
        st = player_stats.setdefault(p["name"], {})
        if p["matches"] and "matches" not in st:
            st["matches"] = p["matches"]

    # Write playerProfiles.ts
    lines = [
        "export type PlayerProfile = {",
        "  slug: string;",
        "  name: string;",
        "  matches: number;",
        "  singles: number;",
        "  doubles: number;",
        "  losses: number;",
        "  winsPct: number;",
        "  setsLost: number;",
        "  setsWon: number;",
        "  gamesLost: number;",
        "  gamesWon: number;",
        "};",
        "",
        "export const playerProfiles: PlayerProfile[] = [",
    ]
    for slug in sorted(by_slug.keys()):
        p = by_slug[slug]
        lines.append(
            "  {"
            f" slug: '{esc(p['slug'])}',"
            f" name: '{esc(p['name'])}',"
            f" matches: {p['matches']},"
            f" singles: {p['singles']},"
            f" doubles: {p['doubles']},"
            f" losses: {p['losses']},"
            f" winsPct: {p['winsPct']},"
            f" setsLost: {p['setsLost']},"
            f" setsWon: {p['setsWon']},"
            f" gamesLost: {p['gamesLost']},"
            f" gamesWon: {p['gamesWon']},"
            " },"
        )
    lines.append("];")
    lines.append("")
    lines.append("export const playerProfilesBySlug: Record<string, PlayerProfile> = Object.fromEntries(")
    lines.append("  playerProfiles.map((profile) => [profile.slug, profile]),")
    lines.append(");")
    lines.append("")
    lines.append("export const playerProfilesByName: Record<string, PlayerProfile> = Object.fromEntries(")
    lines.append("  playerProfiles.map((profile) => [profile.name, profile]),")
    lines.append(");")
    lines.append("")
    (ROOT / "src/data/playerProfiles.ts").write_text("\n".join(lines) + "\n", encoding="utf-8")

    # Append/update playerStats in rankings.ts — rewrite the playerStats export only via sidecar merge file
    # Easier: rewrite full rankings.ts playerStats section by regenerating whole file from rankings_full
    tables = json.loads((ROOT / "scripts/_rankings_full.json").read_text(encoding="utf-8"))
    r_lines = [
        "export type RankingRow = {",
        "  rank: number;",
        "  name: string;",
        "  value: number;",
        "};",
        "",
        "export const rankingTables: {",
        "  id: string;",
        "  title: string;",
        "  unit: string;",
        "  rows: RankingRow[];",
        "}[] = [",
    ]
    for t in tables:
        r_lines.append("  {")
        r_lines.append(f"    id: '{t['id']}',")
        r_lines.append(f"    title: '{esc(t['title'])}',")
        r_lines.append(f"    unit: '{esc(t['unit'])}',")
        r_lines.append("    rows: [")
        for row in t["rows"]:
            r_lines.append(
                f"      {{ rank: {row['rank']}, name: '{esc(row['name'])}', value: {row['value']} }},"
            )
        r_lines.append("    ],")
        r_lines.append("  },")
    r_lines.append("];")
    r_lines.append("")
    r_lines.append("export type PlayerStat = {")
    r_lines.append("  wins?: number;")
    r_lines.append("  sets?: number;")
    r_lines.append("  games?: number;")
    r_lines.append("  matches?: number;")
    r_lines.append("};")
    r_lines.append("")
    r_lines.append("export const playerStats: Record<string, PlayerStat> = {")
    for name in sorted(player_stats.keys(), key=lambda s: s.casefold()):
        st = player_stats[name]
        parts = [f"{k}: {st[k]}" for k in ("wins", "sets", "games", "matches") if k in st]
        if parts:
            r_lines.append(f"  '{esc(name)}': {{ {', '.join(parts)} }},")
    r_lines.append("};")
    r_lines.append("")
    (ROOT / "src/data/rankings.ts").write_text("\n".join(r_lines) + "\n", encoding="utf-8")

    # slug map for members without profile
    slug_map = {p["name"]: p["slug"] for p in index if p.get("slug") and p.get("name")}
    for p in by_slug.values():
        slug_map[p["name"]] = p["slug"]
    (ROOT / "scripts/_name_to_slug.json").write_text(
        json.dumps(slug_map, ensure_ascii=False, indent=2), encoding="utf-8"
    )

    print(
        f"profiles={len(by_slug)} playerStats={len(player_stats)} "
        f"index={len(index)} slugMap={len(slug_map)}"
    )
    mism = sum(1 for p in by_slug.values() if slugify(p["name"]) != p["slug"])
    print(f"slugify mismatches vs scraped slug: {mism}")


if __name__ == "__main__":
    main()
