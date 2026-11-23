#!/usr/bin/env python3
"""Line numbers (and a flag for the 4 Qalun ayat that run onto the next page) of each ayah on its printed page (15-line mushaf), from the KFGQPC data
(https://github.com/thetruetruth/quran-data-kfgqpc: qaloon/data/QaloonData_v10.json, hafs/data/hafsData_v18.json).
usage: python3 tools/build_lines.py QALOON_JSON HAFS_JSON
writes lines.json {"q":[[[start,end],...] per surah]} and adds "l" (same shape) to hafs.json"""
import json, os, sys
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
def lines(path, sk):
    d = json.load(open(path, encoding="utf-8")); out = [[] for _ in range(114)]
    for x in d:
        s = x[sk] - 1; assert len(out[s]) + 1 == x["aya_no"]; out[s].append([x["line_start"], x["line_end"]] + ([1] if "-" in str(x["page"]) else []))   # 1: continues on the next page
    return out
q = lines(sys.argv[1], "sura_no"); h = lines(sys.argv[2], "sora")
Q = json.load(open("qaloon.json", encoding="utf-8")); assert [len(x) for x in q] == [len(x) for x in Q["t"]]
json.dump({"q": q}, open("lines.json", "w"), separators=(",", ":"))
H = json.load(open("hafs.json", encoding="utf-8")); assert [len(x) for x in h] == [len(x) for x in H["t"]]
H["l"] = h; json.dump(H, open("hafs.json", "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print("ok", os.path.getsize("lines.json"))
