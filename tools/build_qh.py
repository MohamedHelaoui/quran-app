#!/usr/bin/env python3
"""Build qh.json: places where Qalun's text differs from Hafs's, found by aligning the two KFGQPC texts word by word
after removing differences that are only spelling conventions of the two printings (wasl vowels, shadda, sukun, tanween
forms, silah marks, waqf signs...). Each place is labelled with a rough kind.
usage: python3 tools/build_qh.py   (reads qaloon.json and hafs.json, writes qh.json)
Output: {"v":1,"d":[[surah, ayah, first word, last word, hafs words, kind, hafs ayah], ...]}  (Qalun numbering, word index 0-based)"""
import json, re, difflib, os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
q = json.load(open("qaloon.json", encoding="utf-8")); h = json.load(open("hafs.json", encoding="utf-8"))
num = re.compile(r" [٠-٩]+$")
DROP = set("ـۖۗۘۙۚۛۜ۝۞ۣ۟۠ۢۤۧۨ۩۪ۭ۫۬ٓ ‌‍ًࣰٌࣱٍࣲّْٖٕٜۡٗٞٔ")
MAP = {"ٱ": "ا", "ٲ": "ا", "ٳ": "ا", "ٰ": "ا", "ی": "ي", "ى": "ي", "ے": "ي", "أ": "ء", "إ": "ء",
       "آ": "ءا", "ؤ": "ء", "ئ": "ء", "ڡ": "ف", "ں": "ن", "ٯ": "ق"}
V = "َُِ"
def norm(w):
    w = re.sub("[\u064A\u0649\u0627\u0648][\u0654\u0655]", "\u0621", w)   # letter + combining hamza = hamza
    w = w.replace("\u06E7", "\u064A")                                             # small high yeh (إبراهـۧم)
    o = ""; prev = ""
    for c in w:
        if c in ("ۥ", "ۦ"):
            if prev in ("ه", "م"): continue
            c = "و" if c == "ۥ" else "ي"
        if c in DROP: continue
        c = MAP.get(c, c); o += c
        if c not in V: prev = c
    o = re.sub("ا[" + V + "]+", "ا", o)
    o = re.sub("^([وفبكل]?[" + V + "]?)ال[" + V + "]", "\\1ال", o)
    o = re.sub("^([وف]?[" + V + "]?)لِل[" + V + "]", "\\1لِل", o)
    o = re.sub("مُ$", "م", o)
    o = re.sub("َا$", "ا", o)
    o = re.sub("اا", "ا", o)
    return o
def kind(a, b):
    if re.sub("ه[" + V + "]", "ه", a) == re.sub("ه[" + V + "]", "ه", b) and "ه" in a: return "إسكان الهاء وضمّها"
    if re.sub("يَ$", "ي", a) == re.sub("يَ$", "ي", b) and a != b: return "ياء الإضافة"
    ch = set()
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
        if op != "equal": ch |= set(a[i1:i2]) | set(b[j1:j2])
    if ch <= set("ءايو" + V + " ") and ("ء" in ch or "ء" in a or "ء" in b): return "الهمز"
    return "فرش الحروف"
words = lambda t: num.sub("", t).split(" ")
hasv = re.compile("[" + V + "]")
TQ = {"ً": "F", "ٗ": "F", "ࣰ": "F", "ٌ": "D", "ٞ": "D", "ࣱ": "D", "ٍ": "K", "ٖ": "K", "ࣲ": "K"}
tan = lambda w: "".join(TQ[c] for c in w if c in TQ)
out = []
for s in range(114):
    Q = [(a + 1, i, w) for a, t in enumerate(q["t"][s]) for i, w in enumerate(words(t))]
    H = [(a + 1, i, w) for a, t in enumerate(h["t"][s]) for i, w in enumerate(words(t))]
    nq = [norm(x[2]) for x in Q]; nh = [norm(x[2]) for x in H]
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, nq, nh, autojunk=False).get_opcodes():
        if op == "equal":                                  # same word, but a different case ending (raf' / nasb / jarr: tanween type)
            for k in range(i2 - i1):
                a, b = Q[i1 + k], H[j1 + k]; ta, tb = tan(a[2]), tan(b[2])
                if ta and tb and ta != tb and a[2]: out.append([s + 1, a[0], a[1], a[1], b[2], "حركة الإعراب", b[0]])
            continue
        if j2 > j1 and not any(hasv.search(x) for x in nh[j1:j2]): continue    # muqatta'at letters (unvowelled in Hafs)
        if i2 == i1:                                                          # word only in Hafs: show it on the previous Qalun word
            if i1 == 0: continue
            i1 -= 1
        k = kind(" ".join(nq[i1:i2]), " ".join(nh[j1:j2]))
        ht = " ".join(x[2] for x in H[j1:j2]); ha = H[j1][0] if j2 > j1 else 0
        for a in sorted({x[0] for x in Q[i1:i2]}):                           # one entry per Qalun ayah
            ws = [x[1] for x in Q[i1:i2] if x[0] == a and x[2]]
            if not ws or not ht.strip(): continue
            out.append([s + 1, a, min(ws), max(ws), ht, k, ha])
json.dump({"v": 1, "d": out}, open("qh.json", "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
from collections import Counter
print(len(out), "places", os.path.getsize("qh.json"), "bytes", Counter(x[5] for x in out))
