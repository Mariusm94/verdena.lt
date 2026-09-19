#!/usr/bin/env python3
"""Scrape Hegelmann visual playoff brackets (trees + matrices) from kaunotenisas.lt."""

from __future__ import annotations

import json
import re
import html as H
import urllib.request
from pathlib import Path

PAGES = [
    ("Mixai", "https://kaunotenisas.lt/klases/hegelmann-group-tennis-tournament-mixai/"),
    ("Moterys dvejetai", "https://kaunotenisas.lt/klases/hegelmann-group-tennis-tournament-moterys-dvejetai/"),
    ("Moterys vienetai", "https://kaunotenisas.lt/klases/hegelmann-group-tennis-tournament-moterys-vienetai/"),
    ("Vyrai dvejetai", "https://kaunotenisas.lt/klases/hegelmann-group-tennis-tournament-vyrai-dvejetai/"),
    ("Vyrai vienetai", "https://kaunotenisas.lt/klases/hegelmann-group-tennis-tournament-vyrai-vienetai/"),
]

LEAGUES = [
    ("mixai-masters", "Mixai", "Masters"),
    ("mixai-power", "Mixai", "Power"),
    ("mixai-middle-challenger-1", "Mixai", "Middle / Challenger 1"),
    ("mixai-middle-challenger-2", "Mixai", "Middle / Challenger 2"),
    ("moterys-dvejetai-power", "Moterys dvejetai", "Power"),
    ("moterys-dvejetai-middle-1", "Moterys dvejetai", "Middle 1"),
    ("moterys-dvejetai-middle-2", "Moterys dvejetai", "Middle 2"),
    ("moterys-dvejetai-light", "Moterys dvejetai", "Light"),
    ("moterys-vienetai-middle", "Moterys vienetai", "Middle"),
    ("vyrai-dvejetai-masters", "Vyrai dvejetai", "Masters"),
    ("vyrai-dvejetai-power", "Vyrai dvejetai", "Power"),
    ("vyrai-dvejetai-middle-1", "Vyrai dvejetai", "Middle 1"),
    ("vyrai-dvejetai-middle-2", "Vyrai dvejetai", "Middle 2"),
    ("vyrai-dvejetai-challenger", "Vyrai dvejetai", "Challenger"),
    ("vyrai-vienetai-middle-1", "Vyrai vienetai", "Middle 1"),
    ("vyrai-vienetai-middle-2", "Vyrai vienetai", "Middle 2"),
]


def get(url: str) -> str:
    req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(req, timeout=90) as response:
        return response.read().decode("utf-8", "replace")


def clean_name(value: str) -> str:
    text = H.unescape(value)
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    text = text.replace("&nbsp;", "").replace("\xa0", " ").strip()
    if text.lower() in {"x", "nbsp;", ""}:
        return "x"
    text = text.replace(" ,", ",").replace(",", " / ")
    return re.sub(r"\s*/\s*", " / ", text).strip()


def clean_score(value: str) -> str:
    text = H.unescape(re.sub(r"<br\s*/?>", " ", value, flags=re.I))
    text = re.sub(r"<[^>]+>", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    text = text.replace(" - ", ":")
    return text


def classify(title: str) -> str:
    low = title.lower().replace(" ", "")
    if "paguod" in low:
        return "paguoda"
    if "3viet" in low or "3-viet" in low or "dėl3" in low or "del3" in low:
        return "trecia"
    if "pusfinal" in low:
        return "pusfinalis"
    if "final" in low:
        return "finalas"
    return "lentele"


def draw_id_for(group: str, title: str) -> tuple[str, str]:
    low = title.lower()
    group_leagues = [item for item in LEAGUES if item[1] == group]
    rules = [
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
        ("vienetai", "middle"),
    ]
    for needle, suffix in rules:
        if needle not in low:
            continue
        if suffix == "challenger" and "middle" in low:
            continue
        hits = [item for item in group_leagues if suffix in item[0] or item[2].lower() == needle]
        if suffix == "middle" and "challenger" not in low:
            hits = [item for item in group_leagues if item[2].lower() in {"middle", "middle 1", "middle 2"}]
            if "1" in title.lower():
                hits = [item for item in hits if item[2].endswith("1")]
            elif "2" in title.lower():
                hits = [item for item in hits if item[2].endswith("2")]
            elif len(hits) > 1:
                hits = [item for item in hits if item[2].lower() == "middle"]
        if len(hits) == 1:
            return hits[0][0], hits[0][2]
        if hits:
            return hits[0][0], hits[0][2]
    if len(group_leagues) == 1:
        return group_leagues[0][0], group_leagues[0][2]
    return "", ""


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
        if low.endswith("1") and "0" in low:
            return home
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


def names_match(a: str, b: str) -> bool:
    if is_bye(a) or is_bye(b):
        return False
    ta = set(re.findall(r"[a-z]{3,}", fold(a)))
    tb = set(re.findall(r"[a-z]{3,}", fold(b)))
    return len(ta & tb) >= 2 or (len(ta) == 1 and ta <= tb) or (len(tb) == 1 and tb <= ta)


def flip_score(score: str) -> str:
    def flip(token: str) -> str:
        if ":" in token:
            left, right = token.split(":", 1)
            if left.isdigit() and right.isdigit():
                return f"{right}:{left}"
        return token

    return " ".join(flip(token) for token in score.split())


def lookup_score(home: str, away: str, catalog: list[dict]) -> str:
    for item in catalog:
        if names_match(home, item["home"]) and names_match(away, item["away"]):
            return item["score"]
        if names_match(home, item["away"]) and names_match(away, item["home"]):
            return flip_score(item["score"])
    return ""


def parse_tree(body: str, catalog: list[dict]) -> dict:
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
                score = lookup_score(home, away, catalog)
            winner = infer_winner(home, away, score)
            matches.append({"home": home, "away": away, "score": score, "winner": winner})
            nxt.append(winner or ("" if is_bye(home) and is_bye(away) else home if not is_bye(home) else away))
        label = {2: "Finalas", 4: "Pusfinalis", 8: "Ketvirtfinalis", 16: "Aštuntfinalis"}.get(len(current), f"{len(current)}")
        rounds.append({"label": label, "matches": matches})
        current = nxt
    champion = current[0] if current else ""
    size = {2: "Finalas", 4: "4 lentelė", 8: "8 lentelė", 16: "16 lentelė", 32: "32 lentelė"}.get(len(slots), f"{len(slots)} lentelė")
    return {"layout": "tree", "slots": slots, "rounds": rounds, "champion": champion, "size": size}


def parse_matrix(body: str) -> dict:
    rows = []
    for tr in re.findall(r"<tr[\s\S]*?</tr>", body):
        if re.search(r"<th", tr) and "Komanda" in tr:
            continue
        cells = [clean_name(c) if i == 1 else clean_score(c) for i, c in enumerate(re.findall(r"<t[dh][^>]*>([\s\S]*?)</t[dh]>", tr))]
        if len(cells) < 4:
            continue
        if cells[1] in {"Komanda", ""}:
            continue
        rows.append(cells)
    if not rows:
        return {}
    teams = [row[1] for row in rows]
    n = len(teams)
    scores = []
    points = []
    places = []
    for row in rows:
        # [index, name, s1, s2, ..., points, place]
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
    if all(p == 0 for p in places) and any(points):
        ranked = sorted(range(n), key=lambda i: -points[i])
        places = [0] * n
        for rank, index in enumerate(ranked, start=1):
            places[index] = rank
    size = {2: "Finalas", 3: "4 lentelė", 4: "4 lentelė"}.get(n, "8 lentelė" if n <= 8 else "16 lentelė" if n <= 16 else "32 lentelė")
    return {
        "layout": "matrix",
        "teams": teams,
        "scores": scores,
        "points": points,
        "places": places,
        "size": size,
    }


def parse_page(group: str, html: str, catalog: list[dict]) -> list[dict]:
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
        draw_id, league = draw_id_for(group, title)
        if "bracket" in class_name:
            parsed = parse_tree(body, catalog)
        else:
            parsed = parse_matrix(body)
        if not parsed:
            continue
        items.append(
            {
                "id": f"{group}-{len(items)}-{title}",
                "title": title,
                "group": group,
                "drawId": draw_id,
                "league": league,
                "kind": classify(title),
                **parsed,
            }
        )
    return items


def bracket_names(item: dict) -> str:
    if item.get("layout") == "tree":
        return " ".join(item.get("slots") or [])
    return " ".join(item.get("teams") or [])


def fill_draw_ids(brackets: list[dict], rosters: dict[str, list[str]]) -> None:
    for item in brackets:
        if item.get("drawId"):
            continue
        names = bracket_names(item)
        scored = []
        for draw_id, roster in rosters.items():
            if not draw_id.startswith(item["group"].split()[0].lower()[:4]) and item["group"] not in " ".join(rosters.get(draw_id, [])):
                pass
            group_leagues = [row[0] for row in LEAGUES if row[1] == item["group"]]
            if draw_id not in group_leagues:
                continue
            score = len(set(re.findall(r"[a-z]{4,}", fold(names))) & set(re.findall(r"[a-z]{4,}", fold(" ".join(roster)))))
            scored.append((score, draw_id))
        scored.sort(reverse=True)
        if scored and scored[0][0] >= 3:
            item["drawId"] = scored[0][1]
            item["league"] = next((row[2] for row in LEAGUES if row[0] == scored[0][1]), "")


def main() -> None:
    catalog = json.loads(Path("src/data/hegelmannSchedule.json").read_text())["matches"]
    draws_src = Path("src/data/hegelmannDraws.ts").read_text()
    rosters: dict[str, list[str]] = {}
    for draw_id, *_ in LEAGUES:
        found = re.search(rf'"id": "{draw_id}"[\s\S]+?"teams": \[([\s\S]+?)\]', draws_src)
        rosters[draw_id] = re.findall(r'"([^"]+)"', found.group(1)) if found else []

    brackets = []
    for group, url in PAGES:
        html = get(url)
        items = parse_page(group, html, catalog)
        print(group, "->", len(items), "brackets")
        brackets.extend(items)
    fill_draw_ids(brackets, rosters)
    for item in brackets:
        print(" ", item["layout"], item.get("size"), item["drawId"] or "?", item["title"])
    dest = Path("src/data/hegelmannBrackets.json")
    dest.write_text(json.dumps({"brackets": brackets}, ensure_ascii=False, indent=2))
    print("wrote", dest, "count", len(brackets))


if __name__ == "__main__":
    main()
