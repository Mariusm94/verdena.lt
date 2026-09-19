#!/usr/bin/env python3
"""Scrape playoff brackets (8/16/32 lentelės) from old-site class pages into tournament-tables dumps."""

from __future__ import annotations

import html as H
import json
import re
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TABLES = ROOT / "src/data/tournament-tables"
UA = {"User-Agent": "Mozilla/5.0"}

# tournament slug → pages that contain <h2 class="tournament-title"> brackets
SOURCES: dict[str, list[str]] = {
    "kalviu-taure": [
        "https://kaunotenisas.lt/klases/kalviu-taure-moterys-dvejetai-power/",
    ],
    "vasara-belvilyje": [
        "https://kaunotenisas.lt/klases/vasaros-sezono-atidarymas-mixai-middle-challenger/",
        "https://kaunotenisas.lt/klases/vasaros-sezono-atidarymas-moterys-dvejetai-middle/",
        "https://kaunotenisas.lt/klases/vasaros-sezono-atidarymas-vyrai-dvejetai-challenger/",
        "https://kaunotenisas.lt/klases/vasaros-sezono-atidarymas-vyrai-dvejetai-middle/",
        "https://kaunotenisas.lt/klases/vasaros-sezono-atidarymas-vyrai-dvejetai-power/",
    ],
    "termopalas-2026-27": [
        "https://kaunotenisas.lt/klases/2025-2026m-hard-dvejetu-turnyras-termopalas-taure-moterys-dvejetai/",
        "https://kaunotenisas.lt/klases/2025-2026m-hard-dvejetu-turnyras-termopalas-taure-vyrai-dvejetai/",
        "https://kaunotenisas.lt/klases/2025-2026m-hard-dvejetu-turnyras-termopalas-taure-moterys-dvejetai-masters/",
        "https://kaunotenisas.lt/klases/2025-2026m-hard-dvejetu-turnyras-termopalas-taure-vyrai-dvejetai-masters/",
    ],
    "neodenta-2025-26": [
        "https://kaunotenisas.lt/klases/grand-neodenta-ziemos-turnyras-2025-mixai/",
        "https://kaunotenisas.lt/klases/grand-neodenta-ziemos-turnyras-2025-moterys-dvejetai/",
        "https://kaunotenisas.lt/klases/grand-neodenta-ziemos-turnyras-2025-moterys-vienetai/",
        "https://kaunotenisas.lt/klases/grand-neodenta-ziemos-turnyras-2025-vyrai-dvejetai/",
        "https://kaunotenisas.lt/klases/grand-neodenta-ziemos-turnyras-2025-vyrai-vienetai/",
    ],
    "hegelmann-2025": [
        "https://kaunotenisas.lt/klases/2025m-hegelmann-group-tennis-tournament-mixai/",
        "https://kaunotenisas.lt/klases/2025m-hegelmann-group-tennis-tournament-moterys-dvejetai/",
        "https://kaunotenisas.lt/klases/2025m-hegelmann-group-tennis-tournament-moterys-vienetai/",
        "https://kaunotenisas.lt/klases/2025m-hegelmann-group-tennis-tournament-vyrai-dvejetai/",
        "https://kaunotenisas.lt/klases/2025m-hegelmann-group-tennis-tournament-vyrai-vienetai/",
        "https://kaunotenisas.lt/klases/2025m-hegelmann-group-tennis-tournament-flexi-vyrai/",
    ],
    "dextera-2026-27": [
        "https://kaunotenisas.lt/klases/testinis-dvejetu-turnyras-dextera-cup-vyrai-dvejetai-middle/",
    ],
    "cheatless-2026-27": [
        "https://kaunotenisas.lt/klases/2026-27m-testinis-dvejetu-turnyras-cheatles-cup-moterys-dvejetai-masters/",
        "https://kaunotenisas.lt/klases/2026-27m-testinis-dvejetu-turnyras-cheatles-cup-vyrai-dvejetai-masters/",
        "https://kaunotenisas.lt/klases/testinis-dvejetu-turnyras-cheatles-cup-moterys-dvejetai/",
        "https://kaunotenisas.lt/klases/testinis-dvejetu-turnyras-cheatles-cup-vyrai-dvejetai/",
    ],
}


def get(url: str) -> str:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=90) as response:
        return response.read().decode("utf-8", "replace")


def clean_name(value: str) -> str:
    text = H.unescape(value)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    text = text.replace("\xa0", " ").strip()
    if text.lower() in {"x", "nbsp;", ""}:
        return "x"
    text = text.replace(" ,", ",").replace(",", " / ")
    return re.sub(r"\s*/\s*", " / ", text).strip()


def clean_score(value: str) -> str:
    text = H.unescape(re.sub(r"<br\s*/?>", " ", value, flags=re.I))
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text.replace(" - ", ":")


def is_bye(name: str) -> bool:
    return name.strip().lower() in {"", "x", "—", "-"}


def infer_winner(home: str, away: str, score: str) -> str:
    if is_bye(away) and not is_bye(home):
        return home
    if is_bye(home) and not is_bye(away):
        return away
    low = score.lower().replace(" ", "")
    if "b.ž" in score.lower() or "bz" in low:
        if "1:0" in low or "1-0" in low:
            return home
        if "0:1" in low or "0-1" in low:
            return away
    sets = re.findall(r"(\d+)[:\-](\d+)", score)
    home_sets = away_sets = 0
    for left, right in sets:
        a, b = int(left), int(right)
        if a == b:
            continue
        if a > b:
            home_sets += 1
        else:
            away_sets += 1
    if home_sets > away_sets:
        return home
    if away_sets > home_sets:
        return away
    return ""


def fold(value: str) -> str:
    table = str.maketrans("ąčęėįšųūž", "aceeisuuz")
    return value.lower().translate(table)


def tokens(value: str) -> set[str]:
    return set(re.findall(r"[a-z]{3,}", fold(value)))


def parse_tree(body: str) -> dict:
    slots = [
        clean_name(name)
        for name in re.findall(
            r'<td[^>]*class="[^"]*sp-first-round[^"]*"[^>]*>\s*<span class="sp-team-name[^"]*"[^>]*>([^<]*)</span>',
            body,
        )
    ]
    first_scores = [
        clean_score(chunk)
        for chunk in re.findall(
            r'<td[^>]*class="[^"]*sp-event[^"]*sp-first-round[^"]*"[^>]*>[\s\S]*?<div class="sp-event-main">([\s\S]*?)</div>',
            body,
        )
    ]
    if len(slots) < 2:
        return {}
    power = 1
    while power < len(slots):
        power *= 2
    if power > len(slots):
        slots.extend(["x"] * (power - len(slots)))

    rounds = []
    current = slots[:]
    first_index = 0
    while len(current) > 1:
        matches = []
        nxt = []
        opening = len(current) == len(slots)
        for i in range(0, len(current), 2):
            home = current[i]
            away = current[i + 1] if i + 1 < len(current) else "x"
            if opening:
                score = first_scores[first_index] if first_index < len(first_scores) else ""
                first_index += 1
            else:
                score = ""
            winner = infer_winner(home, away, score)
            matches.append({"home": home, "away": away, "score": score, "winner": winner})
            nxt.append(winner or (home if not is_bye(home) else away))
        label = {2: "Finalas", 4: "Pusfinalis", 8: "Ketvirtfinalis", 16: "1/8 finalas", 32: "1/16 finalas"}.get(
            len(current), f"R{len(current)}"
        )
        rounds.append({"label": label, "matches": matches})
        current = nxt
    champion = current[0] if current else ""
    size = {2: "Finalas", 4: "4 lentelė", 8: "8 lentelė", 16: "16 lentelė", 32: "32 lentelė"}.get(
        len(slots), f"{len(slots)} lentelė"
    )
    return {"layout": "tree", "slots": slots, "rounds": rounds, "champion": champion, "size": size}


def parse_matrix(body: str) -> dict:
    rows = []
    for tr in re.findall(r"<tr[\s\S]*?</tr>", body):
        if re.search(r"<th", tr) and "Komanda" in tr:
            continue
        cells = [
            clean_name(c) if i == 1 else clean_score(c)
            for i, c in enumerate(re.findall(r"<t[dh][^>]*>([\s\S]*?)</t[dh]>", tr))
        ]
        if len(cells) < 4 or cells[1] in {"Komanda", ""}:
            continue
        rows.append(cells)
    if not rows:
        return {}
    teams = [row[1] for row in rows]
    n = len(teams)
    scores, points, places = [], [], []
    for row in rows:
        inner = row[2:]
        place = inner[-1] if inner else "0"
        pts = inner[-2] if len(inner) >= 2 else "0"
        grid = inner[:-2]
        while len(grid) < n:
            grid.append("")
        scores.append(grid[:n])
        try:
            points.append(int(float(pts)))
        except ValueError:
            points.append(0)
        try:
            places.append(int(float(place)))
        except ValueError:
            places.append(0)
    size = {2: "Finalas", 3: "4 lentelė", 4: "4 lentelė"}.get(
        n, "8 lentelė" if n <= 8 else "16 lentelė" if n <= 16 else "32 lentelė"
    )
    return {"layout": "matrix", "teams": teams, "scores": scores, "points": points, "places": places, "size": size}


def classify(title: str) -> str:
    low = title.lower().replace(" ", "")
    if "paguod" in low:
        return "paguoda"
    if "3viet" in low or "dėl3" in low or "del3" in low:
        return "trecia"
    if "pusfinal" in low:
        return "pusfinalis"
    if "final" in low:
        return "finalas"
    return "lentele"


def parse_page(html: str) -> list[dict]:
    items = []
    parts = re.split(r'<h2 class="tournament-title">', html)
    for part in parts[1:]:
        title = clean_name(part.split("</h2>")[0])
        if not title or "rėmėj" in title.lower():
            continue
        table_m = re.search(r"<table([^>]*)>([\s\S]*?)</table>", part)
        if not table_m:
            continue
        attrs, body = table_m.group(1), table_m.group(2)
        cls = re.search(r'class="([^"]+)"', attrs)
        class_name = cls.group(1) if cls else ""
        parsed = parse_tree(body) if "bracket" in class_name else parse_matrix(body)
        if not parsed:
            continue
        # Prefer tree brackets for playoff "lentelės"
        if parsed.get("layout") != "tree":
            continue
        items.append({"title": title, "kind": classify(title), **parsed})
    return items


def best_draw(item: dict, draws: list[dict]) -> dict | None:
    names = " ".join(item.get("slots") or [])
    name_toks = tokens(names)
    title_fold = fold(item["title"])
    scored = []
    for draw in draws:
        teams = json.loads(draw["teams"]) if isinstance(draw["teams"], str) else draw["teams"]
        roster_toks = tokens(" ".join(teams))
        overlap = len(name_toks & roster_toks)
        title_hit = 0
        for part in re.split(r"[\s/\-]+", draw["title"].lower()):
            if len(part) >= 3 and part in title_fold:
                title_hit += 2
        for part in re.split(r"[\s/\-]+", draw["groupName"].lower()):
            if len(part) >= 4 and part in title_fold:
                title_hit += 1
        score = overlap + title_hit
        scored.append((score, overlap, draw))
    scored.sort(key=lambda x: (x[0], x[1]), reverse=True)
    if not scored:
        return None
    if scored[0][1] >= 2 or scored[0][0] >= 4:
        return scored[0][2]
    # single-draw tournaments
    if len(draws) == 1 and scored[0][1] >= 1:
        return draws[0]
    return None


def slugify(value: str) -> str:
    value = fold(value)
    value = re.sub(r"[^a-z0-9]+", "-", value).strip("-")
    return value[:80] or "playoff"


def main() -> None:
    for slug, pages in SOURCES.items():
        path = TABLES / f"{slug}.json"
        if not path.exists():
            print("skip missing dump", slug)
            continue
        dump = json.loads(path.read_text(encoding="utf-8"))
        draws = dump.get("draws") or []
        # clear previous scraped brackets so re-run is clean
        for draw in draws:
            draw["brackets"] = []

        scraped = 0
        for url in pages:
            try:
                html = get(url)
            except Exception as exc:
                print("  fail", url, exc)
                continue
            items = parse_page(html)
            print(f"{slug}  {url.split('/klases/')[-1][:50]} -> {len(items)} trees")
            for item in items:
                draw = best_draw(item, draws)
                if not draw:
                    print("   unmatched", item["title"], item.get("size"))
                    continue
                external_id = slugify(f"{item['title']}-{item.get('size','')}")
                payload = {
                    "id": external_id,
                    "title": item["title"],
                    "group": draw["groupName"],
                    "drawId": draw["externalKey"],
                    "league": draw["title"],
                    "kind": item["kind"],
                    "layout": "tree",
                    "size": item.get("size", ""),
                    "slots": item.get("slots", []),
                    "rounds": item.get("rounds", []),
                    "champion": item.get("champion") or None,
                }
                draw.setdefault("brackets", []).append(
                    {
                        "externalId": external_id,
                        "title": item["title"],
                        "league": draw["title"],
                        "groupName": draw["groupName"],
                        "payload": json.dumps(payload, ensure_ascii=False),
                    }
                )
                scraped += 1
                print("   +", draw["externalKey"], item["title"], item.get("size"))

        path.write_text(json.dumps(dump, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
        total = sum(len(d.get("brackets") or []) for d in draws)
        print(f"  wrote {slug}: {total} brackets ({scraped} matched)\n")

    # refresh index
    index = []
    for path in sorted(TABLES.glob("*.json")):
        if path.name == "index.json":
            continue
        dump = json.loads(path.read_text(encoding="utf-8"))
        draws = dump.get("draws") or []
        matches = sum(len(d.get("matches") or []) for d in draws)
        brackets = sum(len(d.get("brackets") or []) for d in draws)
        index.append(
            {
                "slug": dump["slug"],
                "draws": len(draws),
                "matches": matches,
                "brackets": brackets,
                "bytes": path.stat().st_size,
            }
        )
    (TABLES / "index.json").write_text(json.dumps(index, indent=2), encoding="utf-8")
    print("index updated", index)


if __name__ == "__main__":
    main()
