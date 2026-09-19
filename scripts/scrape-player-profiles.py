#!/usr/bin/env python3
"""Scrape career player stats from kaunotenisas.lt public profile pages."""

from __future__ import annotations

import html as html_lib
import json
import re
import sys
import time
from pathlib import Path
from typing import Any
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parents[1]
SCRIPTS = ROOT / "scripts"
BASE = "https://kaunotenisas.lt"
SP_PLAYERS = f"{BASE}/wp-json/sportspress/v2/players"
UA = {"User-Agent": "Mozilla/5.0 (compatible; KaunotenisasScraper/1.0)"}

INDEX_PATH = SCRIPTS / "_players_index.json"
PROFILES_PATH = SCRIPTS / "_player_profiles.json"
RANKINGS_PATH = SCRIPTS / "_rankings_full.json"

RANKING_PAGES: list[tuple[str, str, str, str]] = [
    ("wins", "Daugiausiai pasiekta pergalių", "Pergalės", f"{BASE}/reitingai/daugiausiai-pergaliu/"),
    ("sets", "Daugiausiai laimėta setų", "Setai", f"{BASE}/reitingai/daugiausiai-laimetu-setu/"),
    ("games", "Daugiausiai laimėta game", "Game", f"{BASE}/reitingai/daugiausiai-laimetu-game/"),
    (
        "matches",
        "Daugiausiai laimėta mačų",
        "Mačai",
        f"{BASE}/reitingai/daugiausiai-laimetu-macu/",
    ),
]

STAT_LABELS = {
    "Vienetai": "singles",
    "Dvejetai": "doubles",
    "Pralaimėjimai": "losses",
    "Pergalės": "winsPct",
    "Pralaimėta setų": "setsLost",
    "Laimėta setų": "setsWon",
    "Pralaimėta game": "gamesLost",
    "Laimėta game": "gamesWon",
}


def http_get(url: str, timeout: int = 120) -> tuple[bytes, dict[str, str]]:
    req = Request(url, headers=UA)
    with urlopen(req, timeout=timeout) as resp:
        headers = {k: v for k, v in resp.headers.items()}
        return resp.read(), headers


def http_get_text(url: str) -> str:
    body, _ = http_get(url)
    return body.decode("utf-8", "replace")


def clean_name(text: str) -> str:
    text = html_lib.unescape(re.sub(r"<[^>]+>", " ", text))
    return re.sub(r"\s+", " ", text).strip()


def fetch_players_index() -> list[dict[str, Any]]:
    index: list[dict[str, Any]] = []
    page = 1
    while True:
        url = f"{SP_PLAYERS}?per_page=100&page={page}&_fields=id,slug,title"
        body, headers = http_get(url)
        data = json.loads(body.decode("utf-8", "replace"))
        if not isinstance(data, list) or not data:
            break
        for player in data:
            slug = (player.get("slug") or "").strip()
            name = clean_name((player.get("title") or {}).get("rendered") or "")
            if not slug:
                continue
            index.append({"id": int(player["id"]), "slug": slug, "name": name})
        total_pages = int(headers.get("X-WP-TotalPages") or 1)
        print(f"players index page {page}/{total_pages} (+{len(data)})", flush=True)
        if page >= total_pages:
            break
        page += 1
        time.sleep(0.05)
    return index


def parse_profile(slug: str, page_html: str) -> dict[str, Any] | None:
    if "Sužaista mačų" not in page_html:
        return None

    h1 = re.search(r"<h1[^>]*>([\s\S]*?)</h1>", page_html, re.I)
    name = clean_name(h1.group(1)) if h1 else ""

    matches_m = re.search(r"Sužaista mačų iš viso:\s*(\d+)", page_html)
    if not matches_m:
        return None

    profile: dict[str, Any] = {
        "slug": slug,
        "name": name,
        "matches": int(matches_m.group(1)),
    }

    for legend in re.findall(
        r'<div class="legend-item">\s*<div class="color-box"[^>]*></div>\s*([^<]+?)\s*(\d+)\s*%\s*</div>',
        page_html,
    ):
        label = re.sub(r"\s+", " ", legend[0]).strip()
        key = STAT_LABELS.get(label)
        if key:
            profile[key] = int(legend[1])

    for key in STAT_LABELS.values():
        profile.setdefault(key, 0)

    return profile


def scrape_profiles(players: list[dict[str, Any]]) -> tuple[list[dict[str, Any]], list[str]]:
    existing: list[dict[str, Any]] = []
    done_slugs: set[str] = set()
    if PROFILES_PATH.exists():
        try:
            existing = json.loads(PROFILES_PATH.read_text(encoding="utf-8"))
            if isinstance(existing, list):
                done_slugs = {p["slug"] for p in existing if isinstance(p, dict) and p.get("slug")}
            else:
                existing = []
        except json.JSONDecodeError:
            existing = []

    profiles = list(existing)
    errors: list[str] = []
    processed = 0

    for i, player in enumerate(players, start=1):
        slug = player["slug"]
        if slug in done_slugs:
            continue
        url = f"{BASE}/zaidejas/{slug}/"
        try:
            page_html = http_get_text(url)
            row = parse_profile(slug, page_html)
            if row:
                profiles.append(row)
                done_slugs.add(slug)
        except Exception as err:  # noqa: BLE001 — collect per-player failures
            errors.append(f"{slug}: {type(err).__name__}: {err}")
        processed += 1
        if processed % 50 == 0:
            PROFILES_PATH.write_text(
                json.dumps(profiles, ensure_ascii=False, indent=2) + "\n",
                encoding="utf-8",
            )
            print(
                f"checkpoint {processed} processed this run, {len(profiles)} with stats, {len(errors)} errors",
                flush=True,
            )
        if i % 25 == 0:
            print(f"profiles {i}/{len(players)}", flush=True)
        time.sleep(0.12)

    PROFILES_PATH.write_text(
        json.dumps(profiles, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    return profiles, errors


def parse_ranking_table(page_html: str, max_rows: int = 200) -> list[dict[str, Any]]:
    rows: list[dict[str, Any]] = []
    for table in re.findall(r"<table[\s\S]+?</table>", page_html):
        for tr in re.findall(r"<tr[\s\S]*?</tr>", table):
            if re.search(r"<th", tr, re.I):
                continue
            cells = [clean_name(c) for c in re.findall(r"<td[^>]*>([\s\S]*?)</td>", tr)]
            if len(cells) < 2:
                continue
            rank_text, name, *rest = cells + [""] * 3
            if not name or not re.search(r"\d", rank_text):
                continue
            rank_digits = re.sub(r"\D", "", rank_text)
            if not rank_digits:
                continue
            value_text = rest[0] if rest else cells[-1]
            value_digits = re.sub(r"[^\d]", "", value_text)
            if not value_digits:
                continue
            rows.append({"rank": int(rank_digits), "name": name, "value": int(value_digits)})
            if len(rows) >= max_rows:
                return rows
    return rows


def ensure_rankings() -> None:
    if RANKINGS_PATH.exists():
        try:
            data = json.loads(RANKINGS_PATH.read_text(encoding="utf-8"))
            if isinstance(data, list) and all(len(t.get("rows") or []) >= 200 for t in data):
                print("rankings ok", flush=True)
                return
        except json.JSONDecodeError:
            pass

    tables: list[dict[str, Any]] = []
    for table_id, title, unit, url in RANKING_PAGES:
        print(f"rankings {table_id}…", flush=True)
        html = http_get_text(url)
        rows = parse_ranking_table(html, max_rows=200)
        tables.append({"id": table_id, "title": title, "unit": unit, "rows": rows})
        time.sleep(0.2)
    RANKINGS_PATH.write_text(json.dumps(tables, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def main() -> None:
    print("Fetching players index…", flush=True)
    index = fetch_players_index()
    INDEX_PATH.write_text(json.dumps(index, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"players index: {len(index)}", flush=True)

    ensure_rankings()

    print("Scraping player profiles…", flush=True)
    profiles, errors = scrape_profiles(index)

    print("\n===== DONE =====", flush=True)
    print(f"players_index={len(index)}", flush=True)
    print(f"profiles_with_stats={len(profiles)}", flush=True)
    print(f"errors={len(errors)}", flush=True)
    if errors:
        err_path = SCRIPTS / "_player_profiles_errors.txt"
        err_path.write_text("\n".join(errors) + "\n", encoding="utf-8")
        print(f"errors written to {err_path.name}", flush=True)


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        sys.exit(130)
