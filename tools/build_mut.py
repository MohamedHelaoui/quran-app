#!/usr/bin/env python3
"""Build mut.json (curated mutashabihat, Qalun numbering) from
Waqar144/Quran_Mutashabihat_Data (CC0): https://github.com/Waqar144/Quran_Mutashabihat_Data

usage: python3 tools/build_mut.py PATH/TO/mutashabiha_data.json mut.json

Output: {"v":1,"g":[[[s,from,to],...],...]}  one entry per group of similar passages.
The source uses 0-based global Hafs ayah indexes; tools/hafs2qalun.json maps Hafs -> Qalun.
"""
import json, os, sys

here = os.path.dirname(os.path.abspath(__file__))
H2Q = json.load(open(os.path.join(here, "hafs2qalun.json")))
HAFS_COUNTS = [len(H2Q[str(s)]) for s in range(1, 115)]
OFF = [0]
for c in HAFS_COUNTS:
    OFF.append(OFF[-1] + c)


def to_sa(g):
    s = next(i for i in range(114) if OFF[i] <= g < OFF[i + 1])
    return s + 1, g - OFF[s] + 1


def rng(x):
    a = x["ayah"]
    ids = a if isinstance(a, list) else [a]
    sa = [to_sa(i) for i in ids]
    s = sa[0][0]
    if any(t[0] != s for t in sa):
        return None
    q = sorted({H2Q[str(s)][h - 1] for _, h in sa})
    return (s, q[0], q[-1])


def main(src, out):
    d = json.load(open(src))
    seen, groups = set(), []
    for para in d.values():
        for e in para:
            items = [rng(e["src"])] + [rng(m) for m in e["muts"]]
            items = sorted({i for i in items if i})
            if len(items) < 2:
                continue
            sig = tuple(items)
            if sig in seen:
                continue
            seen.add(sig)
            groups.append([list(i) for i in items])
    # drop a group fully contained in a bigger one
    sets = [set(map(tuple, g)) for g in groups]
    keep = [g for i, g in enumerate(groups)
            if not any(j != i and len(sets[j]) > len(sets[i]) and sets[i] <= sets[j] for j in range(len(sets)))]
    keep.sort(key=lambda g: (g[0][0], g[0][1]))
    json.dump({"v": 1, "g": keep}, open(out, "w"), ensure_ascii=False, separators=(",", ":"))
    print(len(keep), "groups ->", out, os.path.getsize(out), "bytes")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
