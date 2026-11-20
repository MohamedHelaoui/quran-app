#!/usr/bin/env python3
"""Build tf/<surah>.json: word meanings (غريب), i'rab and Tafsir al-Jalalayn for every Qalun ayah.

Source: github.com/spa5k/tafsir_api (MIT), folder `tafsir/`, with the editions
  al-muyassar-fi-al-gharib   -> "m"  (معاني المفردات)
  al-i-rab-al-muyassar       -> "i"  (الإعراب)
  ar-tafsir-al-jalalayn      -> "j"  (تفسير الجلالين)
The sources use Hafs ayah numbers; tools/qalun2hafs.json says which Hafs ayat make up each Qalun ayah.

Usage: python3 tools/build_tafsir.py PATH/TO/tafsir_api/tafsir [OUT_DIR=tf]
"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
Q2H = {int(k): v for k, v in json.load(open(os.path.join(HERE, "qalun2hafs.json"))).items()}
EDITIONS = {"m": "al-muyassar-fi-al-gharib", "i": "al-i-rab-al-muyassar", "j": "ar-tafsir-al-jalalayn"}

def load(src, ed, s):
    return {r["ayah"]: (r.get("text") or "").strip() for r in json.load(open(os.path.join(src, ed, f"{s}.json"), encoding="utf-8"))}

def main(src, out):
    os.makedirs(out, exist_ok=True)
    total = 0
    for s in range(1, 115):
        data = {k: load(src, ed, s) for k, ed in EDITIONS.items()}
        res = {}; lastj = 0
        for q, hs in enumerate(Q2H[s], 1):
            row = {}
            for k in "mij":
                parts = []
                for h in hs:
                    t = data[k].get(h, "")
                    if t and t not in parts: parts.append(t)
                if parts: row[k] = "\n\n".join(parts)
            if "j" in row: lastj = q
            elif lastj: row["jp"] = lastj          # Jalalayn explains this ayah together with an earlier one
            if row: res[str(q)] = row
        p = os.path.join(out, f"{s}.json")
        json.dump(res, open(p, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
        total += os.path.getsize(p)
    print(f"114 files, {total/1e6:.1f} MB")

if __name__ == "__main__":
    if len(sys.argv) < 2: sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else "tf")
