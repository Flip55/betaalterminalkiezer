"""Shared page shell for the generated pages (provider pages and blog).

index.html is written by hand and repeats the same header and footer markup.
"""
import html

BRAND = "Betaalterminalkiezer"
CHECKED = "23 november 2026"
NOTE = ("Demo-versie. De vermelde bedrijven zijn geen partner van deze site en hebben de teksten "
        "niet bevestigd. Je antwoorden in de rekentool blijven in je browser.")

NAV = [
    ("term", "betaalterminals.html", "Betaalterminals"),
    ("kassa", "kassasystemen.html", "Kassasystemen"),
    ("blog", "blog/index.html", "Blog"),
    ("werking", "index.html#werking", "Hoe het werkt"),
]
CTA_LABEL = "Bereken mijn maandkost"
FONTS = "https://fonts.googleapis.com/css2?family=Red+Hat+Display:wght@500;700;800&family=Red+Hat+Text:wght@400;600&display=swap"


def head(title: str, description: str, prefix: str, active: str, note: str = NOTE) -> str:
    current = ' aria-current="page"'
    links = "".join(
        f'<a href="{prefix}{href}"{current if key == active else ""}>{label}</a>'
        for key, href, label in NAV
    )
    return f"""<!DOCTYPE html>
<html lang="nl-BE">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{html.escape(title)}</title>
<meta name="description" content="{html.escape(description)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="{FONTS}" rel="stylesheet">
<link rel="stylesheet" href="{prefix}assets/site.css">
</head>
<body>
<div class="demo-note">{html.escape(note)}</div>
<div class="wrap">
<header class="top">
  <a class="brand" href="{prefix}index.html"><span></span>{BRAND}</a>
  <nav class="main" aria-label="Hoofdmenu">{links}<a class="btn primary" href="{prefix}index.html#quiz">{CTA_LABEL}</a></nav>
</header>
<main>
"""


def foot(prefix: str) -> str:
    return f"""</main>
<footer class="site">
  <nav aria-label="Voettekst">
    <a href="{prefix}index.html#quiz">Bereken je maandkost</a>
    <a href="{prefix}betaalterminals.html">Betaalterminals</a>
    <a href="{prefix}kassasystemen.html">Kassasystemen</a>
    <a href="{prefix}blog/index.html">Blog</a>
    <a href="{prefix}index.html#aanbieders">Voor aanbieders</a>
  </nav>
  <p>{BRAND} is een demo. De bedragen zijn schattingen op basis van publieke tarieven en vervangen geen offerte.</p>
</footer>
</div>
</body>
</html>
"""
