#!/usr/bin/env python3
"""Bump the app version after any change: the service worker VERSION and the ?vNN on the css/js links.
usage: python3 tools/bump.py"""
import re, datetime, os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
sw = open("sw.js", encoding="utf-8").read()
n = int(re.search(r'ASSET_V = "v(\d+)"', sw).group(1)) + 1
d = datetime.date.today().isoformat()
sw = re.sub(r'const VERSION = "[^"]*"', 'const VERSION = "v%d-%s"' % (n, d), sw)
sw = re.sub(r'ASSET_V = "v\d+"', 'ASSET_V = "v%d"' % n, sw)
open("sw.js", "w", encoding="utf-8").write(sw)
ix = open("index.html", encoding="utf-8").read()
ix = re.sub(r'(\.(?:css|js))\?v\d+"', r'\1?v%d"' % n, ix)
open("index.html", "w", encoding="utf-8").write(ix)
print("now v%d" % n)
