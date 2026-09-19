#!/usr/bin/env python3
"""Import SportsPress players + league matches into the local Prisma SQLite DB.

Prefer ajax `kt_load_results` (covers group stages even when REST events are empty).
Skips hegelmann-2026 by default (already seeded). Does not commit to git.
"""

from __future__ import annotations

import argparse
import html as H
import json
import re
import sqlite3
import sys
import time
import unicodedata
import uuid
from collections import deque
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
BASE = "https://kaunotenisas.lt"
SP = f"{BASE}/wp-json/sportspress/v2"
UA = {"User-Agent": "Mozilla/5.0 (compatible; KaunotenisasImport/1.0)"}

# Skip by default — already has 16 draws / 807 matches.
SKIP_TOURNAMENTS = {"hegelmann-2026"}

# Map our Tournament.slug → discovery config.
# Old-site season slugs are often wrong; prefer names + hardcoded roots.
TOURNAMENT_SOURCES: list[dict[str, Any]] = [
    {
        "slug": "kalviu-taure",
        "roots": [6404],
        "search": ["kalviu-taure"],
        "season_ids": [6403],
    },
    {
        "slug": "dextera-2026-27",
        # Season name = DEXTERA CUP (slug wrongly says cheatles)
        "roots": [6409],
        "search": ["testinis-dvejetu-turnyras-dextera-cup"],
        "season_ids": [6406],
    },
    {
        "slug": "cheatless-2026-27",
        # Season name = CHEATLESS CUP (slug wrongly says dextera)
        "roots": [6412, 6413],
        "search": ["testinis-dvejetu-turnyras-cheatles-cup"],
        "exclude_slug_contains": ["2026-27m-"],  # those belong to TERMOPALAS
        "season_ids": [6408],
    },
    {
        "slug": "termopalas-2026-27",
        # Season 6415 name = HARD tennis CUP TERMOPALAS (slug wrongly cheatles).
        # Also include filled 2025/26 HARD cup roots (6314/6315…) — old site still
        # holds the playable season data under that tree.
        "roots": [6416, 6417, 6312, 6313, 6314, 6315, 6316, 6319],
        "search": [
            "2026-27m-testinis-dvejetu-turnyras-cheatles-cup",
            "2025-2026m-hard-dvejetu-turnyras-termopalas-taure",
        ],
        "season_ids": [6415, 6311],
    },
    {
        "slug": "neodenta-2026-27",
        "roots": [6424, 6425, 6426, 6427, 6428, 6429],
        "search": ["2026-27-testinis-ziemos-dvejetu-vienetu-turnyras-neodenta"],
        "season_ids": [6423],
    },
    {
        "slug": "neodenta-2025-26",
        "roots": [6279, 6280, 6281, 6282, 6283, 6303],
        "search": ["grand-neodenta-ziemos-turnyras-2025"],
        "season_ids": [6278],
    },
    {
        "slug": "vasara-belvilyje",
        # Closest SportsPress season: 2026 vasaros sezono atidarymas
        "roots": [6363, 6364, 6365],
        "search": ["vasaros-sezono-atidarymas"],
        "season_ids": [6362],
    },
]

# Optional archive tournaments created if missing (review completeness).
ARCHIVE_SOURCES: list[dict[str, Any]] = [
    {
        "slug": "dextera-2021-22",
        "title": "DEXTERA CUP",
        "season": "2021 / 22",
        "format": "Tęstinis dvejetų turnyras",
        "sponsor": "Dextera",
        "description": "Archyvinis 2021/2022 DEXTERA CUP (importuota iš senos svetainės).",
        "roots": [3155, 3156, 3157, 3158, 3159],
        "search": [],
        "season_ids": [468],
    },
    {
        "slug": "hegelmann-2025",
        "title": "Hegelmann Group Tennis Tournament",
        "season": "2025",
        "format": "Vasaros tęstinis dvejetų ir vienetų",
        "sponsor": "Hegelmann Group",
        "description": "Archyvinis 2025 Hegelmann sezonas (importuota iš senos svetainės).",
        "roots": [3204, 3205, 3206, 3207, 3208],
        "search": ["2025m-hegelmann-group-tennis-tournament"],
        "exclude_slug_contains": ["2024m-", "hegelmann-group-tennis-tournament-mixai-middle"],  # avoid 2026 leaves
        "season_ids": [434],
    },
    {
        "slug": "neodenta-2024-25",
        "title": "NEODENTA žiemos turnyras",
        "season": "2024 / 25",
        "format": "Tęstinis dvejetų ir vienetų",
        "sponsor": "Neodenta",
        "description": "Archyvinis 2024/2025 GRAND Neodenta žiemos turnyras.",
        "roots": [],
        "search": ["2024-2025m-grand-neodenta-ziemos-turnyras"],
        "season_ids": [428],
    },
]


def now_iso() -> str:
    return datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.000Z")


def new_id() -> str:
    return "c" + uuid.uuid4().hex


def load_database_url() -> Path:
    env_path = ROOT / ".env"
    raw = "file:./dev.db"
    if env_path.exists():
        for line in env_path.read_text().splitlines():
            if line.startswith("DATABASE_URL="):
                raw = line.split("=", 1)[1].strip().strip('"').strip("'")
                break
    if raw.startswith("file:"):
        rel = raw[len("file:") :]
        # Prisma resolves relative SQLite paths against the schema dir.
        candidate = (ROOT / "prisma" / rel).resolve()
        if candidate.exists():
            return candidate
        alt = (ROOT / rel).resolve()
        if alt.exists():
            return alt
        return candidate
    raise SystemExit(f"Unsupported DATABASE_URL scheme: {raw.split(':', 1)[0]}")


def http_get(url: str, timeout: int = 180, retries: int = 8) -> tuple[bytes, dict[str, str]]:
    last_err: Exception | None = None
    for attempt in range(retries):
        try:
            req = Request(url, headers=UA)
            with urlopen(req, timeout=timeout) as resp:
                headers = {k: v for k, v in resp.headers.items()}
                return resp.read(), headers
        except Exception as err:  # noqa: BLE001 — network retries
            last_err = err
            wait = min(30.0, 2.0 * (attempt + 1))
            print(f"  retry {attempt + 1}/{retries} after {type(err).__name__}: {err} (sleep {wait:.0f}s)", flush=True)
            time.sleep(wait)
    assert last_err is not None
    raise last_err


def http_get_text(url: str, timeout: int = 180) -> str:
    return http_get(url, timeout=timeout)[0].decode("utf-8", "replace")


def http_get_json(url: str, timeout: int = 180) -> tuple[Any, dict[str, str]]:
    body, headers = http_get(url, timeout=timeout)
    return json.loads(body.decode("utf-8", "replace")), headers


def http_post_form(url: str, data: dict[str, str], timeout: int = 180, retries: int = 8) -> Any:
    last_err: Exception | None = None
    for attempt in range(retries):
        try:
            payload = urlencode(data).encode()
            req = Request(
                url,
                data=payload,
                headers={**UA, "Content-Type": "application/x-www-form-urlencoded"},
            )
            with urlopen(req, timeout=timeout) as resp:
                return json.loads(resp.read().decode("utf-8", "replace"))
        except Exception as err:  # noqa: BLE001
            last_err = err
            wait = min(30.0, 2.0 * (attempt + 1))
            print(f"  retry {attempt + 1}/{retries} after {type(err).__name__}: {err} (sleep {wait:.0f}s)", flush=True)
            time.sleep(wait)
    assert last_err is not None
    raise last_err


def paginate(url: str) -> list[Any]:
    items: list[Any] = []
    page = 1
    while True:
        sep = "&" if "?" in url else "?"
        data, headers = http_get_json(f"{url}{sep}per_page=100&page={page}")
        if not isinstance(data, list) or not data:
            break
        items.extend(data)
        total_pages = int(headers.get("X-WP-TotalPages") or 1)
        if page >= total_pages:
            break
        page += 1
        time.sleep(0.05)
    return items


def slugify(text: str) -> str:
    text = text.strip().lower().replace("/", " ").replace(",", " ")
    repl = {
        "ą": "a",
        "č": "c",
        "ę": "e",
        "ė": "e",
        "į": "i",
        "š": "s",
        "ų": "u",
        "ū": "u",
        "ž": "z",
    }
    for src, dst in repl.items():
        text = text.replace(src, dst)
    text = unicodedata.normalize("NFKD", text)
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = re.sub(r"[^a-z0-9]+", "-", text)
    return text.strip("-") or "draw"


def clean_name(text: str) -> str:
    text = H.unescape(re.sub(r"<[^>]+>", " ", text))
    text = re.sub(r"\s+", " ", text).strip()
    text = text.replace(" ,", ",").replace(", ", " / ").replace(",", " / ")
    text = re.sub(r"\s*/\s*", " / ", text)
    return re.sub(r"\s+", " ", text).strip()


def fetch_nonce() -> str:
    for url in [
        f"{BASE}/",
        f"{BASE}/turnyrai/",
        f"{BASE}/turnyrai/hegelmann-group-tennis-tournament/paskutiniai-rezultatai/",
    ]:
        html = http_get_text(url)
        m = re.search(r'"nonce":"([^"]+)"', html)
        if m:
            return m.group(1)
    raise RuntimeError("Could not find sportix_ajax nonce")


def ajax_results(nonce: str, kind: str, term_id: int, parent_id: int) -> str:
    payload = http_post_form(
        f"{BASE}/wp-admin/admin-ajax.php",
        {
            "action": "kt_load_results",
            "nonce": nonce,
            "type": kind,
            "term_id": str(term_id),
            "parent_league_id": str(parent_id),
        },
    )
    if not payload.get("success"):
        return ""
    return payload.get("data") or ""


def parse_ajax_matches(html: str) -> list[dict[str, str]]:
    matches: list[dict[str, str]] = []
    if not html or len(html) < 40:
        return matches
    for table in re.findall(r"<table[\s\S]+?</table>", html):
        for tr in re.findall(r"<tr[\s\S]*?</tr>", table):
            if re.search(r"<th", tr):
                continue
            cells = [clean_name(c) for c in re.findall(r"<td[^>]*>([\s\S]*?)</td>", tr)]
            if len(cells) < 5:
                continue
            home, away, date, score = cells[1], cells[2], cells[3], cells[4]
            if not home or not away:
                continue
            if home.lower() in {"namų", "home"} or away.lower() in {"svečių", "away"}:
                continue
            matches.append(
                {
                    "home": home,
                    "away": away,
                    "playedAt": date or "",
                    "score": score or "",
                    "stage": "Grupė",
                }
            )
    return matches


def score_from_results(event: dict[str, Any]) -> str:
    teams = event.get("teams") or []
    results = event.get("results") or {}
    if len(teams) < 2:
        return ""
    home_id, away_id = str(teams[0]), str(teams[1])
    home = results.get(home_id) or {}
    away = results.get(away_id) or {}
    parts: list[str] = []
    for key in ("sone", "stwo", "sthree"):
        a = str(home.get(key) or "").strip()
        b = str(away.get(key) or "").strip()
        if not a and not b:
            continue
        if a.lower().startswith("s") or b.lower().startswith("s"):
            continue
        if a == "" or b == "":
            continue
        parts.append(f"{a}:{b}")
    return " ".join(parts)


_team_cache: dict[int, str] = {}


def team_name(team_id: int) -> str:
    if team_id in _team_cache:
        return _team_cache[team_id]
    try:
        data, _ = http_get_json(f"{SP}/teams/{team_id}")
        title = clean_name((data.get("title") or {}).get("rendered") or "")
    except Exception:
        title = f"Team {team_id}"
    _team_cache[team_id] = title
    return title


def fetch_rest_events(league_id: int) -> list[dict[str, str]]:
    events = paginate(f"{SP}/events?leagues={league_id}")
    out: list[dict[str, str]] = []
    for event in events:
        teams = event.get("teams") or []
        if len(teams) < 2:
            continue
        home = team_name(int(teams[0]))
        away = team_name(int(teams[1]))
        if not home or not away:
            continue
        date = (event.get("date") or "")[:10]
        out.append(
            {
                "home": home,
                "away": away,
                "playedAt": date,
                "score": score_from_results(event),
                "stage": "Grupė",
            }
        )
    return out


def league_children(parent_id: int) -> list[dict[str, Any]]:
    return paginate(f"{SP}/leagues?parent={parent_id}")


def league_by_id(league_id: int) -> dict[str, Any] | None:
    try:
        data, _ = http_get_json(f"{SP}/leagues/{league_id}")
        return data if isinstance(data, dict) else None
    except Exception:
        return None


def search_leagues(needle: str) -> list[dict[str, Any]]:
    return paginate(f"{SP}/leagues?search={quote(needle)}")


def discover_leaves(cfg: dict[str, Any]) -> list[dict[str, Any]]:
    """Return leaf leagues: {id, parent, group, title, externalKey}."""
    by_id: dict[int, dict[str, Any]] = {}
    exclude = cfg.get("exclude_slug_contains") or []

    def accept(league: dict[str, Any]) -> bool:
        slug = league.get("slug") or ""
        for frag in exclude:
            if frag in slug:
                return False
        return True

    def add(league: dict[str, Any]) -> None:
        if not accept(league):
            return
        by_id[int(league["id"])] = league

    for root_id in cfg.get("roots") or []:
        league = league_by_id(int(root_id))
        if league:
            add(league)

    for needle in cfg.get("search") or []:
        for league in search_leagues(needle):
            add(league)

    # BFS children
    queue = deque(by_id.keys())
    seen_children: set[int] = set()
    while queue:
        parent_id = queue.popleft()
        if parent_id in seen_children:
            continue
        seen_children.add(parent_id)
        for child in league_children(parent_id):
            if int(child["id"]) not in by_id:
                add(child)
                queue.append(int(child["id"]))

    # Determine leaves = nodes with no discovered children, or nodes that are not parents
    child_of: set[int] = set()
    for league in by_id.values():
        parent = int(league.get("parent") or 0)
        if parent and parent in by_id:
            child_of.add(int(league["id"]))

    parents_with_kids = {int(l.get("parent") or 0) for l in by_id.values() if int(l.get("parent") or 0)}
    leaves: list[dict[str, Any]] = []
    for lid, league in sorted(by_id.items()):
        kids = [c for c in by_id.values() if int(c.get("parent") or 0) == lid]
        if kids:
            continue
        parent_id = int(league.get("parent") or 0)
        parent = by_id.get(parent_id) or (league_by_id(parent_id) if parent_id else None)
        group = clean_name((parent or {}).get("name") or league.get("name") or "Liga")
        title = clean_name(league.get("name") or "Liga")
        if parent_id == 0:
            # Root used as leaf — group = title, title = "Bendras" or same
            group = title
            title = "Pagrindinė"
        external = slugify(f"{group}-{title}")
        leaves.append(
            {
                "id": lid,
                "parent": parent_id or lid,
                "group": group,
                "title": title,
                "externalKey": external,
                "slug": league.get("slug") or "",
            }
        )
    # Deduplicate external keys
    used: dict[str, int] = {}
    for leaf in leaves:
        key = leaf["externalKey"]
        if key in used:
            used[key] += 1
            leaf["externalKey"] = f"{key}-{used[key]}"
        else:
            used[key] = 1
    _ = parents_with_kids  # silence lint
    return leaves


def dedupe_matches(matches: list[dict[str, str]]) -> list[dict[str, str]]:
    seen: set[tuple[str, str, str, str]] = set()
    out: list[dict[str, str]] = []
    for m in matches:
        key = (m["home"], m["away"], m.get("score") or "", m.get("playedAt") or "")
        if key in seen:
            continue
        seen.add(key)
        out.append(m)
    return out


def collect_leaf_matches(nonce: str, leaf: dict[str, Any]) -> list[dict[str, str]]:
    matches = parse_ajax_matches(ajax_results(nonce, "subleague", leaf["id"], leaf["parent"]))
    if not matches:
        matches = fetch_rest_events(leaf["id"])
    return dedupe_matches(matches)


def flip_score(score: str) -> str:
    parts = []
    for set_score in score.strip().split():
        if ":" in set_score:
            a, b = set_score.split(":", 1)
            parts.append(f"{b}:{a}")
        elif "-" in set_score:
            a, b = set_score.split("-", 1)
            parts.append(f"{b}-{a}")
        else:
            parts.append(set_score)
    return " ".join(parts)


def tennis_winner(score: str) -> str | None:
    home_sets = away_sets = 0
    for set_score in score.strip().split():
        bits = re.split(r"[:\-]", set_score)
        if len(bits) != 2:
            continue
        try:
            a, b = int(bits[0]), int(bits[1])
        except ValueError:
            continue
        if a > b:
            home_sets += 1
        elif b > a:
            away_sets += 1
    if home_sets > away_sets:
        return "home"
    if away_sets > home_sets:
        return "away"
    return None


def compute_standings(teams: list[str], matches: list[dict[str, str]]) -> tuple[list[int], list[int], list[list[str]]]:
    n = len(teams)
    points = [0] * n
    cell: list[list[list[str]]] = [[[] for _ in range(n)] for _ in range(n)]
    index = {name: i for i, name in enumerate(teams)}

    for match in matches:
        score = (match.get("score") or "").strip()
        if not score:
            continue
        hi = index.get(match["home"])
        ai = index.get(match["away"])
        if hi is None or ai is None or hi == ai:
            continue
        cell[hi][ai].append(score)
        cell[ai][hi].append(flip_score(score))
        winner = tennis_winner(score)
        if winner == "home":
            points[hi] += 1
        elif winner == "away":
            points[ai] += 1

    scores: list[list[str]] = [["" for _ in range(n)] for _ in range(n)]
    for i in range(n):
        for j in range(n):
            if i == j:
                scores[i][j] = ""
            elif not cell[i][j]:
                scores[i][j] = "0"
            else:
                scores[i][j] = " · ".join(cell[i][j])

    order = sorted(range(n), key=lambda i: (-points[i], i))
    places = [0] * n
    for rank, team_index in enumerate(order):
        places[team_index] = rank + 1
    return points, places, scores


def ensure_tournament(conn: sqlite3.Connection, cfg: dict[str, Any]) -> str:
    row = conn.execute("SELECT id FROM Tournament WHERE slug = ?", (cfg["slug"],)).fetchone()
    if row:
        return row[0]
    ts = now_iso()
    tid = new_id()
    conn.execute(
        """
        INSERT INTO Tournament (
          id, slug, title, season, status, format, sponsor, description, rules, schedule,
          tables, tablesNote, registerSubject, links, coverImage, published, createdAt, updatedAt
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """,
        (
            tid,
            cfg["slug"],
            cfg.get("title") or cfg["slug"],
            cfg.get("season") or "",
            "archyvas",
            cfg.get("format") or "",
            cfg.get("sponsor"),
            cfg.get("description") or "",
            "[]",
            "[]",
            "[]",
            None,
            None,
            "[]",
            None,
            1,
            ts,
            ts,
        ),
    )
    return tid


def replace_draw(
    conn: sqlite3.Connection,
    tournament_id: str,
    leaf: dict[str, Any],
    matches: list[dict[str, str]],
) -> tuple[str, int]:
    teams: list[str] = []
    seen: set[str] = set()
    for m in matches:
        for name in (m["home"], m["away"]):
            if name not in seen:
                seen.add(name)
                teams.append(name)
    points, places, scores = compute_standings(teams, matches)
    ts = now_iso()

    existing = conn.execute(
        "SELECT id FROM LeagueDraw WHERE tournamentId = ? AND externalKey = ?",
        (tournament_id, leaf["externalKey"]),
    ).fetchone()
    if existing:
        draw_id = existing[0]
        conn.execute("DELETE FROM Match WHERE drawId = ?", (draw_id,))
        conn.execute(
            """
            UPDATE LeagueDraw
            SET groupName=?, title=?, teams=?, points=?, places=?, scores=?, updatedAt=?
            WHERE id=?
            """,
            (
                leaf["group"],
                leaf["title"],
                json.dumps(teams, ensure_ascii=False),
                json.dumps(points),
                json.dumps(places),
                json.dumps(scores, ensure_ascii=False),
                ts,
                draw_id,
            ),
        )
    else:
        draw_id = new_id()
        conn.execute(
            """
            INSERT INTO LeagueDraw (
              id, tournamentId, externalKey, groupName, title, teams, points, places, scores,
              createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                draw_id,
                tournament_id,
                leaf["externalKey"],
                leaf["group"],
                leaf["title"],
                json.dumps(teams, ensure_ascii=False),
                json.dumps(points),
                json.dumps(places),
                json.dumps(scores, ensure_ascii=False),
                ts,
                ts,
            ),
        )

    for m in matches:
        conn.execute(
            """
            INSERT INTO Match (
              id, drawId, home, away, score, previousScore, stage, playedAt, status,
              submittedByUserId, createdAt, updatedAt
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                new_id(),
                draw_id,
                m["home"],
                m["away"],
                m.get("score") or "",
                "",
                m.get("stage") or "Grupė",
                m.get("playedAt") or None,
                "confirmed",
                None,
                ts,
                ts,
            ),
        )
    return draw_id, len(matches)


def import_players(conn: sqlite3.Connection) -> tuple[int, int]:
    """SportsPress players are NOT club members.

    Kept for optional diagnostics only — do not write into ClubMember.
    Club members come from src/data/members.ts via seed / admin.
    """
    print("  skip writing SportsPress players into ClubMember (use --legacy-players-as-members to force)", flush=True)
    return 0, 0


def import_players_as_club_members(conn: sqlite3.Connection) -> tuple[int, int]:
    existing = {
        row[0].strip().lower()
        for row in conn.execute("SELECT name FROM ClubMember").fetchall()
        if row[0]
    }
    created = 0
    scanned = 0
    page = 1
    while True:
        print(f"  players page {page}…", flush=True)
        data, headers = http_get_json(
            f"{SP}/players?per_page=100&page={page}&_fields=id,title"
        )
        if not data:
            break
        for player in data:
            scanned += 1
            name = clean_name((player.get("title") or {}).get("rendered") or "")
            if not name:
                continue
            key = name.lower()
            if key in existing:
                continue
            existing.add(key)
            conn.execute(
                """
                INSERT INTO ClubMember (id, name, sortName, published, createdAt)
                VALUES (?, ?, ?, ?, ?)
                """,
                (new_id(), name, name, 1, now_iso()),
            )
            created += 1
        conn.commit()
        total_pages = int(headers.get("X-WP-TotalPages") or 1)
        print(f"  players page {page}/{total_pages} scanned={scanned} created={created}", flush=True)
        if page >= total_pages:
            break
        page += 1
        time.sleep(0.15)
    return scanned, created


def import_tournament(
    conn: sqlite3.Connection,
    nonce: str,
    cfg: dict[str, Any],
    *,
    create_if_missing: bool,
) -> dict[str, Any]:
    slug = cfg["slug"]
    row = conn.execute("SELECT id, title FROM Tournament WHERE slug = ?", (slug,)).fetchone()
    if not row and not create_if_missing:
        return {"slug": slug, "skipped": True, "reason": "tournament missing"}
    if not row:
        tournament_id = ensure_tournament(conn, cfg)
        title = cfg.get("title") or slug
    else:
        tournament_id, title = row[0], row[1]

    leaves = discover_leaves(cfg)
    draws = 0
    matches_total = 0
    leaf_stats: list[str] = []

    for leaf in leaves:
        matches = collect_leaf_matches(nonce, leaf)
        if not matches:
            leaf_stats.append(f"{leaf['externalKey']}:0")
            continue
        _, count = replace_draw(conn, tournament_id, leaf, matches)
        draws += 1
        matches_total += count
        leaf_stats.append(f"{leaf['externalKey']}:{count}")

    return {
        "slug": slug,
        "title": title,
        "leaves": len(leaves),
        "draws": draws,
        "matches": matches_total,
        "details": leaf_stats,
        "empty": matches_total == 0,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Import SportsPress data into Prisma SQLite")
    parser.add_argument("--skip-players", action="store_true", help="(default) do not touch ClubMember")
    parser.add_argument(
        "--legacy-players-as-members",
        action="store_true",
        help="OLD behaviour: write SportsPress players into ClubMember (not recommended)",
    )
    parser.add_argument("--skip-archives", action="store_true")
    parser.add_argument("--only", help="Comma-separated tournament slugs to import")
    parser.add_argument("--include-hegelmann", action="store_true")
    args = parser.parse_args()

    only = {s.strip() for s in args.only.split(",")} if args.only else None

    db_path = load_database_url()
    print(f"DB: {db_path}")
    if not db_path.exists() or db_path.stat().st_size == 0:
        raise SystemExit(f"Database missing or empty: {db_path}")

    print("Fetching ajax nonce…")
    nonce = fetch_nonce()
    print("nonce ok")

    conn = sqlite3.connect(str(db_path))
    conn.execute("PRAGMA foreign_keys = ON")

    # Preserve hegelmann counts for sanity check
    hegelmann_before = conn.execute(
        """
        SELECT COUNT(d.id), COALESCE(SUM((SELECT COUNT(*) FROM Match m WHERE m.drawId = d.id)), 0)
        FROM Tournament t
        LEFT JOIN LeagueDraw d ON d.tournamentId = t.id
        WHERE t.slug = 'hegelmann-2026'
        """
    ).fetchone()
    print(f"hegelmann-2026 before: draws={hegelmann_before[0]} matches={hegelmann_before[1]}")

    summary: list[dict[str, Any]] = []

    try:
        if args.legacy_players_as_members and not args.skip_players:
            print("Importing SportsPress players into ClubMember (legacy)…")
            scanned, created = import_players_as_club_members(conn)
            print(f"players scanned={scanned} created={created}")
            summary.append({"players_scanned": scanned, "players_created": created})
        else:
            print("Skipping ClubMember player import (official members list only)")

        sources = list(TOURNAMENT_SOURCES)
        if not args.skip_archives:
            sources.extend(ARCHIVE_SOURCES)

        for cfg in sources:
            slug = cfg["slug"]
            if only and slug not in only:
                continue
            if slug in SKIP_TOURNAMENTS and not args.include_hegelmann:
                print(f"SKIP {slug} (already has data)")
                continue
            print(f"\n=== {slug} ===")
            create = slug in {a["slug"] for a in ARCHIVE_SOURCES}
            result = import_tournament(conn, nonce, cfg, create_if_missing=create)
            conn.commit()
            summary.append(result)
            print(
                f"draws={result.get('draws')} matches={result.get('matches')} "
                f"leaves={result.get('leaves')} empty={result.get('empty')}"
            )
            for line in result.get("details") or []:
                print(" ", line)

        hegelmann_after = conn.execute(
            """
            SELECT COUNT(d.id), COALESCE(SUM((SELECT COUNT(*) FROM Match m WHERE m.drawId = d.id)), 0)
            FROM Tournament t
            LEFT JOIN LeagueDraw d ON d.tournamentId = t.id
            WHERE t.slug = 'hegelmann-2026'
            """
        ).fetchone()
        print(f"\nhegelmann-2026 after: draws={hegelmann_after[0]} matches={hegelmann_after[1]}")
        if hegelmann_after != hegelmann_before:
            print("WARNING: hegelmann-2026 counts changed!", file=sys.stderr)

        print("\n===== SUMMARY =====")
        members = conn.execute("SELECT COUNT(*) FROM ClubMember").fetchone()[0]
        print(f"ClubMember total: {members}")
        for row in conn.execute(
            """
            SELECT t.slug,
                   COUNT(d.id) AS draws,
                   COALESCE(SUM((SELECT COUNT(*) FROM Match m WHERE m.drawId = d.id)), 0) AS matches
            FROM Tournament t
            LEFT JOIN LeagueDraw d ON d.tournamentId = t.id
            GROUP BY t.id
            ORDER BY t.slug
            """
        ):
            print(f"  {row[0]:28} draws={row[1]:3} matches={row[2]}")

        empty = [r["slug"] for r in summary if r.get("empty")]
        if empty:
            print("No match data found for:", ", ".join(empty))

    finally:
        conn.close()


if __name__ == "__main__":
    main()
