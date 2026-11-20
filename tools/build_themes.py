#!/usr/bin/env python3
"""Build themes.json (thematic sections of the mushaf, in Qalun numbering).

Input: a list of passages in Hafs numbering, either
  - a QUL "Ayah theme" SQLite file (columns: theme, surah_number, ayah_from, ayah_to), or
  - a JSON list: [{"surah":2,"from":1,"to":5,"title":"..."}]
Output: themes.json  ->  {"v":1,"r":{"2":[[from,to,"title"],...]}}  (Qalun ayah numbers)

Usage: python3 tools/build_themes.py INPUT [OUTPUT]
"""
import json, os, sqlite3, sys

HERE = os.path.dirname(os.path.abspath(__file__))
H2Q = {int(k): v for k, v in json.load(open(os.path.join(HERE, "hafs2qalun.json"))).items()}
QALUN_COUNT = {s: max(v) for s, v in H2Q.items()}

def read_sqlite(path):
    db = sqlite3.connect(path); db.row_factory = sqlite3.Row
    for (t,) in db.execute("select name from sqlite_master where type='table'"):
        cols = [r[1] for r in db.execute(f'pragma table_info("{t}")')]
        if {"surah_number", "ayah_from", "ayah_to"} <= set(cols):
            tcol = "theme" if "theme" in cols else cols[0]
            for r in db.execute(f'select * from "{t}"'):
                yield int(r["surah_number"]), int(r["ayah_from"]), int(r["ayah_to"]), (r[tcol] or "").strip()
            return
    sys.exit("no table with surah_number/ayah_from/ayah_to found")

def read_json(path):
    for x in json.load(open(path, encoding="utf-8")):
        yield int(x["surah"]), int(x["from"]), int(x["to"]), (x.get("title") or "").strip()

def convert(rows):
    per = {}
    for s, f, t, title in rows:
        m = H2Q.get(s)
        if not m or f < 1 or t < f: continue
        f, t = min(f, len(m)), min(t, len(m))
        per.setdefault(s, []).append([m[f - 1], m[t - 1], title])
    out = {}
    for s, secs in per.items():
        secs.sort(key=lambda x: (x[0], x[1]))
        res = []
        for f, t, title in secs:
            if res and f <= res[-1][1]:             # a Qalun ayah shared by two passages, or an overlap
                if t <= res[-1][1]: continue        # fully inside the previous one
                f = res[-1][1] + 1                  # start after the previous section
            if f > t or t > QALUN_COUNT[s]: continue
            res.append([f, t, title])
        if res: out[str(s)] = res
    return out

if __name__ == "__main__":
    if len(sys.argv) < 2: sys.exit(__doc__)
    src = sys.argv[1]; dst = sys.argv[2] if len(sys.argv) > 2 else "themes.json"
    rows = list(read_json(src) if src.endswith(".json") else read_sqlite(src))
    r = convert(rows)
    json.dump({"v": 1, "r": r}, open(dst, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
    n = sum(len(v) for v in r.values())
    print(f"{len(rows)} passages in -> {n} sections over {len(r)} surahs written to {dst}")
