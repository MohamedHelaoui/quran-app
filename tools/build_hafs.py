#!/usr/bin/env python3
"""Build hafs.json (optional Hafs mushaf, huffaz mode) from KFGQPC Hafs data v18
(https://github.com/thetruetruth/quran-data-kfgqpc, hafs/data/hafsData_v18.json).
usage: python3 tools/build_hafs.py PATH/TO/hafsData_v18.json hafs.json
Output: {"t":[[aya text]], "p":[[page]], "b":basmala, "q":[[qalun ayah for each hafs ayah]]} (same shape as qaloon.json + q)."""
import json, os, sys
here = os.path.dirname(os.path.abspath(__file__))
H2Q = json.load(open(os.path.join(here, "hafs2qalun.json")))
d = json.load(open(sys.argv[1], encoding="utf-8"))
t = [[] for _ in range(114)]; p = [[] for _ in range(114)]
for x in d:
    s = x["sora"] - 1
    assert len(t[s]) + 1 == x["aya_no"]
    t[s].append(x["aya_text"].strip()); p[s].append(x["page"])
b = t[0][0].rsplit(" ", 1)[0]
q = [H2Q[str(s + 1)] for s in range(114)]
assert all(len(q[s]) == len(t[s]) for s in range(114))
json.dump({"t": t, "p": p, "b": b, "q": q}, open(sys.argv[2], "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print("ayat", sum(map(len, t)), "bytes", os.path.getsize(sys.argv[2]))
