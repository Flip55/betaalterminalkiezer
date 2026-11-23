#!/usr/bin/env python3
"""Checks every internal link and anchor in the built site.

Run from the repository root:  python3 tools/check_links.py
External links (http, https, mailto) are listed but not fetched.
"""
import pathlib
import re
import sys
from html.parser import HTMLParser

ROOT = pathlib.Path(__file__).resolve().parent.parent


class Page(HTMLParser):
    def __init__(self):
        super().__init__()
        self.links, self.ids = [], set()

    def handle_starttag(self, tag, attrs):
        a = dict(attrs)
        if a.get("id"):
            self.ids.add(a["id"])
        for key in ("href", "src"):
            if a.get(key):
                self.links.append(a[key])


def parse(path):
    p = Page()
    p.feed(path.read_text(encoding="utf-8"))
    return p


def main() -> int:
    pages = {f: parse(f) for f in sorted(ROOT.rglob("*.html")) if ".git" not in f.parts}
    extra = [ROOT / "assets/quiz-config.js"]
    errors, internal, external = [], 0, set()
    for f, page in pages.items():
        links = list(page.links)
        for link in links:
            if re.match(r"^(https?:|mailto:)", link):
                external.add(link)
                continue
            internal += 1
            target, _, anchor = link.partition("#")
            dest = (f.parent / target).resolve() if target else f
            if not dest.is_file():
                errors.append(f"{f.relative_to(ROOT)}: {link} -> missing file")
            elif anchor and dest.suffix == ".html" and anchor not in pages[dest].ids:
                errors.append(f"{f.relative_to(ROOT)}: {link} -> missing anchor #{anchor}")
    # links that the quiz builds from the config
    cfg = extra[0].read_text(encoding="utf-8")
    for link in re.findall(r'url:\s*"([^"]+)"', cfg):
        if link.startswith("http"):
            external.add(link)
            continue
        internal += 1
        if not (ROOT / link.split("#")[0]).is_file():
            errors.append(f"quiz-config.js: {link} -> missing file")
    print(f"{len(pages)} pages, {internal} internal links checked, {len(external)} external links not fetched")
    for e in errors:
        print("BROKEN", e)
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
