#!/usr/bin/env python3
"""Pull Hegelmann 2026 match lists and playoff stages from kaunotenisas.lt."""

from __future__ import annotations

import json
import re
import html as H
import urllib.request
from pathlib import Path
from urllib.parse import urlencode

LEAGUES = [
    {"id": 6382, "parent": 6371, "drawId": "mixai-masters", "group": "Mixai", "title": "Masters"},
    {"id": 6383, "parent": 6371, "drawId": "mixai-power", "group": "Mixai", "title": "Power"},
    {
        "id": 6384,
        "parent": 6371,
        "drawId": "mixai-middle-challenger-1",
        "group": "Mixai",
        "title": "Middle / Challenger 1",
    },
    {
        "id": 6385,
        "parent": 6371,
        "drawId": "mixai-middle-challenger-2",
        "group": "Mixai",
        "title": "Middle / Challenger 2",
    },
    {"id": 6386, "parent": 6370, "drawId": "moterys-dvejetai-power", "group": "Moterys dvejetai", "title": "Power"},
    {"id": 6387, "parent": 6370, "drawId": "moterys-dvejetai-middle-1", "group": "Moterys dvejetai", "title": "Middle 1"},
    {"id": 6388, "parent": 6370, "drawId": "moterys-dvejetai-middle-2", "group": "Moterys dvejetai", "title": "Middle 2"},
    {"id": 6389, "parent": 6370, "drawId": "moterys-dvejetai-light", "group": "Moterys dvejetai", "title": "Light"},
    {"id": 6390, "parent": 6368, "drawId": "moterys-vienetai-middle", "group": "Moterys vienetai", "title": "Middle"},
    {"id": 6393, "parent": 6369, "drawId": "vyrai-dvejetai-masters", "group": "Vyrai dvejetai", "title": "Masters"},
    {"id": 6394, "parent": 6369, "drawId": "vyrai-dvejetai-power", "group": "Vyrai dvejetai", "title": "Power"},
    {"id": 6395, "parent": 6369, "drawId": "vyrai-dvejetai-middle-1", "group": "Vyrai dvejetai", "title": "Middle 1"},
    {"id": 6396, "parent": 6369, "drawId": "vyrai-dvejetai-middle-2", "group": "Vyrai dvejetai", "title": "Middle 2"},
    {"id": 6397, "parent": 6369, "drawId": "vyrai-dvejetai-challenger", "group": "Vyrai dvejetai", "title": "Challenger"},
    {"id": 6391, "parent": 6367, "drawId": "vyrai-vienetai-middle-1", "group": "Vyrai vienetai", "title": "Middle 1"},
    {"id": 6392, "parent": 6367, "drawId": "vyrai-vienetai-middle-2", "group": "Vyrai vienetai", "title": "Middle 2"},
]

PARENTS = [
    {"id": 6371, "group": "Mixai"},
    {"id": 6370, "group": "Moterys dvejetai"},
    {"id": 6368, "group": "Moterys vienetai"},
    {"id": 6369, "group": "Vyrai dvejetai"},
    {"id": 6367, "group": "Vyrai vienetai"},
]

UA = {"User-Agent": "Mozilla/5.0"}


def get(url: str) -> str:
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, timeout=90) as response:
        return response.read().decode("utf-8", "replace")


def ajax(nonce: str, kind: str, term: int, parent: int) -> str:
    body = urlencode(
        {
            "action": "kt_load_results",
            "nonce": nonce,
            "type": kind,
            "term_id": str(term),
            "parent_league_id": str(parent),
        }
    ).encode()
    req = urllib.request.Request(
        "https://kaunotenisas.lt/wp-admin/admin-ajax.php",
        data=body,
        headers={**UA, "Content-Type": "application/x-www-form-urlencoded"},
    )
    with urllib.request.urlopen(req, timeout=90) as response:
        payload = json.loads(response.read().decode())
    if not payload.get("success"):
        return ""
    return payload.get("data") or ""


def clean(text: str) -> str:
    text = H.unescape(re.sub(r"<[^>]+>", " ", text))
    text = re.sub(r"\s+", " ", text).strip()
    text = text.replace(" ,", ",").replace(",", " / ")
    text = re.sub(r"\s*/\s*", " / ", text)
    return re.sub(r"\s+", " ", text).strip()


def parse_blocks(html: str) -> list[dict]:
    blocks = []
    parts = re.split(r'(<h3 class="kt-tournament-title">)', html)
    chunks: list[str] = []
    if parts[0].strip():
        chunks.append(parts[0])
    for i in range(1, len(parts), 2):
        chunks.append(parts[i] + (parts[i + 1] if i + 1 < len(parts) else ""))
    if not chunks:
        chunks = [html]
    for chunk in chunks:
        title_m = re.search(r'<h3 class="kt-tournament-title">([^<]+)</h3>', chunk)
        title = clean(title_m.group(1)) if title_m else ""
        for table in re.findall(r"<table[\s\S]+?</table>", chunk):
            rows = []
            for tr in re.findall(r"<tr[\s\S]*?</tr>", table):
                if re.search(r"<th", tr):
                    continue
                cells = [clean(c) for c in re.findall(r"<td[^>]*>([\s\S]*?)</td>", tr)]
                if len(cells) < 5:
                    continue
                home, away, date, score = cells[1], cells[2], cells[3], cells[4]
                if not home or not away:
                    continue
                rows.append({"home": home, "away": away, "date": date, "score": score})
            if rows:
                blocks.append({"title": title or "Mačai", "matches": rows})
    return blocks


def tokens(name: str) -> set[str]:
    return {t for t in re.findall(r"[A-Za-zĄČĘĖĮŠŲŪŽąčęėįšųūž]{3,}", name.lower())}


def classify(title: str) -> str:
    low = title.lower().replace(" ", "")
    if "paguod" in low:
        return "paguoda"
    if "3viet" in low or "3-viet" in low or "del3" in low or "dėl3" in low or "dėl 3" in title.lower():
        return "trecia"
    if "pusfinal" in low:
        return "pusfinalis"
    if "final" in low:
        return "finalas"
    return "lentele"


def size_label(matches: list[dict]) -> str:
    names = set()
    for item in matches:
        names.add(item["home"])
        names.add(item["away"])
    n = len(names)
    if n >= 17:
        return "32 lentelė"
    if n >= 9:
        return "16 lentelė"
    if n >= 5:
        return "8 lentelė"
    return "Finalai"


def best_draw(group: str, matches: list[dict], title: str) -> str | None:
    low = title.lower()
    group_leagues = [item for item in LEAGUES if item["group"] == group]
    keyword_map = [
        ("middle / challenger 1", "middle-challenger-1"),
        ("middle/challenger 1", "middle-challenger-1"),
        ("middle / challenger 2", "middle-challenger-2"),
        ("middle/challenger 2", "middle-challenger-2"),
        ("middle 1", "middle-1"),
        ("middle 2", "middle-2"),
        ("challenger", "challenger"),
        ("masters", "masters"),
        ("power", "power"),
        ("light", "light"),
        ("middle", "middle"),
    ]
    for needle, suffix in keyword_map:
        if needle in low:
            hits = [item for item in group_leagues if suffix in item["drawId"] or item["title"].lower() == needle]
            if len(hits) == 1:
                return hits[0]["drawId"]
            if suffix == "middle" and "challenger" not in low:
                hits = [item for item in group_leagues if item["title"].lower() == "middle"]
                if len(hits) == 1:
                    return hits[0]["drawId"]
            if suffix == "challenger" and "middle" not in low:
                hits = [item for item in group_leagues if item["title"].lower() == "challenger"]
                if len(hits) == 1:
                    return hits[0]["drawId"]

    names = " ".join(f"{item['home']} {item['away']}" for item in matches)
    query = tokens(names)
    scored = []
    for item in group_leagues:
        roster = tokens(" ".join(item.get("roster") or []))
        score = len(query & roster)
        scored.append((score, item["drawId"]))
    scored.sort(reverse=True)
    if scored and scored[0][0] >= 4:
        return scored[0][1]
    if len(group_leagues) == 1:
        return group_leagues[0]["drawId"]
    return None


def main() -> None:
    page = get("https://kaunotenisas.lt/turnyrai/hegelmann-group-tennis-tournament/paskutiniai-rezultatai/")
    nonce = re.search(r'"nonce":"([^"]+)"', page).group(1)

    draws_path = Path("src/data/hegelmannDraws.ts")
    draws_src = draws_path.read_text()
    for league in LEAGUES:
        m = re.search(rf'"id": "{league["drawId"]}"[\s\S]+?"teams": \[([\s\S]+?)\]', draws_src)
        if not m:
            league["roster"] = []
            continue
        league["roster"] = re.findall(r'"([^"]+)"', m.group(1))

    matches: list[dict] = []
    stages: list[dict] = []
    mid = 1

    for league in LEAGUES:
        html = ajax(nonce, "subleague", league["id"], league["parent"])
        print("league", league["drawId"], "html", len(html))
        for block in parse_blocks(html):
            for row in block["matches"]:
                matches.append(
                    {
                        "id": f"g{mid}",
                        "drawId": league["drawId"],
                        "group": league["group"],
                        "league": league["title"],
                        "stage": "Grupė",
                        "kind": "grupe",
                        "home": row["home"],
                        "away": row["away"],
                        "date": row["date"],
                        "score": row["score"],
                    }
                )
                mid += 1

    for parent in PARENTS:
        html = ajax(nonce, "finals", parent["id"], parent["id"])
        print("finals", parent["group"], "html", len(html))
        for block in parse_blocks(html):
            draw_id = best_draw(parent["group"], block["matches"], block["title"])
            league_title = next((item["title"] for item in LEAGUES if item["drawId"] == draw_id), "")
            kind = classify(block["title"])
            stage_matches = []
            for row in block["matches"]:
                item = {
                    "id": f"p{mid}",
                    "drawId": draw_id or "",
                    "group": parent["group"],
                    "league": league_title,
                    "stage": block["title"],
                    "kind": kind,
                    "home": row["home"],
                    "away": row["away"],
                    "date": row["date"],
                    "score": row["score"],
                }
                matches.append(item)
                stage_matches.append(item)
                mid += 1
            stages.append(
                {
                    "id": f"s{len(stages) + 1}",
                    "title": block["title"],
                    "group": parent["group"],
                    "drawId": draw_id or "",
                    "league": league_title,
                    "kind": kind,
                    "size": size_label(block["matches"]),
                    "matches": stage_matches,
                }
            )

    matches.sort(key=lambda item: (item["date"] or "", item["group"], item["league"]), reverse=True)
    out = {
        "season": "2026",
        "tournamentSlug": "hegelmann-2026",
        "matches": matches,
        "stages": [
            {
                "id": stage["id"],
                "title": stage["title"],
                "group": stage["group"],
                "drawId": stage["drawId"],
                "league": stage["league"],
                "kind": stage["kind"],
                "size": stage["size"],
                "matchIds": [item["id"] for item in stage["matches"]],
            }
            for stage in stages
        ],
    }
    dest = Path("src/data/hegelmannSchedule.json")
    dest.write_text(json.dumps(out, ensure_ascii=False, indent=2))
    print("wrote", dest, "matches", len(matches), "stages", len(stages))


if __name__ == "__main__":
    main()
