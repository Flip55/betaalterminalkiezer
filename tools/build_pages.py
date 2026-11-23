#!/usr/bin/env python3
"""Builds the two provider overview pages: betaalterminals.html and kassasystemen.html.

Run from the repository root:  python3 tools/build_pages.py
Edit TERMINALS or REGISTERS below and run the script again.

Every statement on a card comes from the page named in its source. Nothing has
been confirmed with the companies. Tariffs used by the calculator live in
assets/quiz-config.js; keep both in step when a price changes.
"""
import html
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from layout import BRAND, CHECKED, CTA_LABEL, foot, head  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parent.parent

IN_TOOL = "In de rekentool"
ON_REQUEST = "Prijs op aanvraag"

# name, tagline, description, points, price line, tag, (source label, source url)
TERMINALS = [
    ("Worldline", "Huren of kopen, vast bedrag per Bancontact-betaling",
     "Verhuurt en verkoopt de Saturn 1000F2, een terminal met simkaart en mobiele data.",
     ["Huur: € 36 per maand, met service, simkaart en een vervangtoestel binnen 1 werkdag",
      "Koop: € 649 zonder btw",
      "Bancontact en binnenlandse debetkaart: € 0,13 per betaling",
      "Kredietkaart: 1,40% + € 0,10 per betaling",
      "Jaarlijkse compliancekost: € 60"],
     "Publieke tarieven. We rekenen met de huurformule.", IN_TOOL,
     ("worldline.com, pagina Saturn 1000F2", "https://worldline.com/nl-be/home/main-navigation/solutions/merchants/all-in-one-solutions/in-store/saturn1000f2-all-in-one")),
    ("CCV", "Huur met een staffel per aantal betalingen",
     "Verhuurt en verkoopt vaste en mobiele terminals. De prijs per debetbetaling daalt naarmate je er meer verwerkt.",
     ["Huur per maand: Compact A77 (mobiel) € 29,35, Plus Mobile A960 € 38,35, Duo-Base (vast) vanaf € 42,85",
      "Debetbetaling: van € 0,240 onder 100 betalingen per maand tot € 0,075 vanaf 2.500",
      "De eerste 1.000 Bancontact-betalingen tot € 5 per maand zijn gratis",
      "Kredietkaart binnen Europa: vanaf 1,25%",
      "Huurcontract van 12 maanden"],
     "Publieke tarieven. We rekenen met de huur van de A77 of de Duo-Base.", IN_TOOL,
     ("ccv.eu, pagina's Betaalmethoden en Betaalterminal huren", "https://www.ccv.eu/be-nl/betaaloplossingen/betaalterminals/betaalterminal-huren")),
    ("SumUp", "Kaartlezer kopen, percentage per betaling",
     "Verkoopt kaartlezers en terminals zonder huur of installatiekosten. Je betaalt een percentage per betaling.",
     ["Zonder abonnement: 1,69% per betaling",
      "Met Betalingen Plus (€ 19 per maand): 0,99% op kaarten van particulieren",
      "Toestellen: Solo Lite € 34, Solo met printer € 109, Terminal € 169",
      "Uitbetaling de volgende dag, ook in het weekend",
      "Opzeggen kan op elk moment"],
     "Publieke tarieven. Geen apart tarief voor Bancontact vermeld.", IN_TOOL,
     ("sumup.com, pagina Prijzen", "https://www.sumup.com/nl-be/prijzen/")),
    ("myPOS", "Drie formules, van percentage tot vast bedrag",
     "Biedt drie formules voor betalingen aan de terminal. De duurste formule heeft een vast bedrag per Bancontact-betaling.",
     ["One, zonder maandkost: 1,49% op Bancontact en kaarten van particulieren uit Europa",
      "Plus, € 19 per maand: 0,99%",
      "Pro, € 39 per maand: € 0,12 per Bancontact-betaling en 0,89% op andere kaarten van particulieren",
      "Uitbetaling onmiddellijk, dag en nacht"],
     "Publieke tarieven. De prijs van de toestellen staat niet op de tarievenpagina.", IN_TOOL,
     ("mypos.com, pagina Kosten en prijzen", "https://www.mypos.com/nl-be/pricing-and-fees")),
    ("Viva.com", "Vast bedrag per Bancontact-betaling, lage maandkost",
     "Aanbieder met een tarievenpagina voor België, voor betalingen in de zaak en online.",
     ["Bancontact in de zaak: € 0,14 per betaling",
      "Visa, Mastercard en Maestro van particulieren uit Europa: 1,69%",
      "Pakketten van € 0 tot € 19,99 per maand, naargelang het aantal terminals",
      "Tarieven geldig vanaf 16 september 2026"],
     "Publieke tarieven. De toestellen staan niet op de tarievenpagina.", IN_TOOL,
     ("viva.com, pagina Tarieven", "https://www.viva.com/nl-be/pricing")),
    ("Mollie", "Terminal en online betalingen bij één aanbieder",
     "Betaalaanbieder voor online betalingen en betalingen in de zaak.",
     ["Pay as you go: geen maandkost, één terminal",
      "Pro: € 20 per maand, één terminal inbegrepen, extra terminals € 20 per maand",
      "Toestellen: Tap-terminal € 95, mobiele of vaste terminal € 350",
      "Betalingen aannemen op je eigen iPhone of Android-toestel kan zonder terminal"],
     "Het tarief voor Bancontact aan de terminal stond niet op de pagina die we nakeken. Daarom niet in de rekentool.", ON_REQUEST,
     ("mollie.com, pagina Pricing", "https://www.mollie.com/pricing")),
    ("Axepta BNP Paribas", "Terminal via BNP Paribas Fortis",
     "Geregistreerde betalingsinstelling en partner van BNP Paribas Fortis voor betaalterminals.",
     ["All-in-One Grow: een vast bedrag van 35, 55, 75 of 115 euro per maand voor de huur van de terminal met een transactievolume",
      "Vaste en mobiele terminals, te huur of te koop",
      "Je geld staat de volgende werkdag op je rekening",
      "App Axepta BNP Paribas Soft: betalingen aannemen op je smartphone, met een minimumfactuur van 5 euro per maand"],
     "Welk volume bij welk forfait hoort, staat niet op de site.", ON_REQUEST,
     ("bnpparibasfortis.be, pagina Betaalterminal", "https://www.bnpparibasfortis.be/nl/public/ondernemers/dagelijks-bankieren/betalingen/betaalsystemen/betaalterminal")),
    ("KBC", "Bank die de terminal van Worldline aanbiedt",
     "KBC biedt zijn zakelijke klanten de Saturn 1000F2 van Worldline aan.",
     ["Huur vanaf 36 euro per maand of koop voor 649 euro, zonder btw",
      "Bij huur zijn technische bijstand, simkaart en mobiele data inbegrepen",
      "De kost per betaling hangt af van het bedrag en van hoe je klant betaalt"],
     "Zelfde toestel als bij Worldline. Niet apart in de rekentool.", ON_REQUEST,
     ("kbc.be, pagina Saturn 1000F2", "https://www.kbc.be/ondernemen/nl/product/betalen-en-betaald-worden/betalingen/ontvangen/saturn-1000f2.html")),
]

REGISTERS = [
    ("Lightspeed", "Kassasoftware voor horeca en winkels",
     "Kassasysteem in de cloud met eigen betaalverwerking. Publiceert zijn prijzen voor horeca.",
     ["Lightspeed Restaurant: Basic € 89, Core € 159 en Pro € 249 per maand",
      "Extra licentie: € 49 per maand",
      "Vermeldt GKS 2.0 in zijn aanbod voor horeca",
      "Ook een kassasysteem voor winkels"],
     "Publieke prijzen voor de software. Hardware niet inbegrepen.", "Publieke prijzen",
     ("lightspeedhq.com, pagina Prijzen Restaurant", "https://www.lightspeedhq.com/be/kassasysteem/restaurant/prijzen/")),
    ("unTill", "Eenvoudige kassa-app of horecasysteem op maat",
     "Leverancier met twee producten: unTill Air voor kleinere zaken en unTill Prime voor de horeca.",
     ["unTill Air: kassa in de cloud op je eigen tablet of telefoon, vanaf 19 euro per maand volgens de site",
      "Geen installatiekosten bij unTill Air",
      "Betalingen ingebouwd in de kassa (unTill Payments, met Adyen)",
      "unTill Prime: op maat, met meer dan 125 koppelingen, prijs op maat"],
     "We keken niet na of unTill Air voldoet aan de Belgische regels voor de geregistreerde kassa.", "Publieke prijzen",
     ("untill.com", "https://untill.com/products")),
    ("Caresta", "Kassa huren voor één vast bedrag per maand",
     "Leverancier uit Merksem met een pakket van hardware, software en ondersteuning, geïnstalleerd in je zaak.",
     ["Huur: € 139 per maand zonder btw, minstens 12 maanden",
      "Installatie: € 399 eenmalig, zonder btw",
      "Voor horeca, bakkers, frituren, slagers en winkels",
      "Kan gekoppeld worden aan de blackbox 2.0"],
     "Publieke huurprijs. Aankoop op maat.", "Publieke prijzen",
     ("carestakassasystemen.be", "https://carestakassasystemen.be/")),
    ("URBANPOS", "Verdeler van RESTOMAX voor de horeca",
     "Bedrijf uit Lasne dat het kassasysteem RESTOMAX verdeelt, van snackbar tot keten met meerdere vestigingen.",
     ["Formules van 149 tot 349 euro per maand",
      "Kassa en betaalterminal samen huren vanaf 49 euro per maand",
      "Zegt dat RESTOMAX door de FOD Financiën gecertificeerd is voor de blackbox",
      "Ondersteuning zeven dagen op zeven"],
     "Publieke prijzen op de eigen site.", "Publieke prijzen",
     ("urbanpos.be", "https://www.urbanpos.be/nl/comparatif-caisse-enregistreuse-horeca")),
    ("Horecakassa.be", "Kassa kopen zonder abonnement",
     "Verkoopt een kassasysteem voor de horeca dat je één keer betaalt.",
     ["Eenmalige aankoop, geen maandelijkse abonnementskosten",
      "Werkt met en zonder blackbox (FDM)"],
     "De prijs zelf keken we niet na.", ON_REQUEST,
     ("horecakassa.be", "https://horecakassa.be/")),
    ("Trivec", "Kassa en dranksystemen voor de horeca",
     "Leverancier van kassaoplossingen en dranksystemen voor de Europese horecasector.",
     ["Gericht op horeca"],
     "Prijs op aanvraag volgens de bron. Niet nagekeken op de site van Trivec.", ON_REQUEST,
     ("kassasysteemvergelijken.be", "https://www.kassasysteemvergelijken.be/horeca-kassasysteem/")),
    ("Touch Systems", "Kassasystemen voor meerdere sectoren",
     "Leverancier van kassasystemen voor horeca, retail en voeding.",
     ["Biedt geregistreerde kassa's aan"],
     "Prijs op aanvraag volgens de bron. Niet nagekeken op de site van Touch Systems.", ON_REQUEST,
     ("kassasysteemvergelijken.be", "https://www.kassasysteemvergelijken.be/horeca-kassasysteem/")),
    ("MplusKASSA", "Kassasoftware voor de horeca",
     "Kassasysteem dat Bobex bij zijn selectie van horecakassa's rekent.",
     ["Software en hardware apart verkrijgbaar"],
     "Geen prijs nagekeken op de site van de leverancier.", ON_REQUEST,
     ("bobex.be, pagina Horeca kassasystemen", "https://www.bobex.be/nl-be/kassasysteem/horeca/")),
]


def esc(s: str) -> str:
    return html.escape(s)


def monogram(name: str) -> str:
    parts = [p for p in name.replace(".", " ").split() if p.lower() != "en"]
    return (parts[0][0] + (parts[1][0] if len(parts) > 1 else parts[0][1:2])).upper()


def card(name, tagline, desc, points, price, tag, source) -> str:
    lis = "".join(f"<li>{esc(p)}</li>" for p in points)
    return f"""<article class="card">
  <div class="card-head"><div class="mono" aria-hidden="true">{esc(monogram(name))}</div><div><h2>{esc(name)}</h2><p>{esc(tagline)}</p></div></div>
  <span class="tag">{esc(tag)}</span>
  <p>{esc(desc)}</p>
  <div><h3>Wat de aanbieder zelf vermeldt</h3><ul class="checks">{lis}</ul></div>
  <div class="card-foot"><p><strong>Prijs:</strong> {esc(price)}</p><p class="source">Bron: <a href="{source[1]}" rel="noopener">{esc(source[0])}</a>, nagekeken op {CHECKED}.</p></div>
</article>"""


def closing(title: str, text: str) -> str:
    return f"""<aside class="closing">
  <h2>{esc(title)}</h2>
  <p>{esc(text)}</p>
  <a class="btn primary" href="index.html#quiz">{CTA_LABEL}</a>
</aside>
"""


DISCLAIMER = ("Alle merknamen zijn eigendom van hun respectieve houders. Vermelding dient enkel ter identificatie "
              "en is gebaseerd op publiek beschikbare informatie. De bedrijven zijn geen partner van deze site en "
              "hebben de teksten niet bevestigd. Staat jouw bedrijf hier nog niet bij? "
              '<a href="index.html#aanbieders">Neem contact met ons op</a>.')


def build() -> None:
    n_tool = sum(1 for t in TERMINALS if t[5] == IN_TOOL)
    page = (
        head("Betaalterminals in België: aanbieders en tarieven | " + BRAND,
             "Overzicht van aanbieders van betaalterminals in België, met de tarieven die ze zelf publiceren.",
             "", "term")
        + f"""<div class="page-head">
  <h1>Aanbieders van betaalterminals op een rij</h1>
  <p class="lead">{len(TERMINALS)} aanbieders, met wat ze zelf over hun prijzen publiceren. Van {n_tool} aanbieders zitten de tarieven in de rekentool. Zo zie je wat elk van hen jou per maand zou kosten.</p>
  <a class="btn primary" href="index.html#quiz">{CTA_LABEL}</a>
</div>
<div class="cards">
{chr(10).join(card(*t) for t in TERMINALS)}
</div>
<p class="source">Tarieven nagekeken op {CHECKED}, op de site van elke aanbieder. Eerst staan de aanbieders uit de rekentool, daarna de andere. De volgorde is geen rangschikking. {DISCLAIMER}</p>
"""
        + closing("Welke terminal is voor jouw zaak het goedkoopst?",
                  "Beantwoord zes korte vragen. Je ziet per aanbieder de geschatte maandkost, met de berekening erbij.")
        + foot("")
    )
    (ROOT / "betaalterminals.html").write_text(page, encoding="utf-8")

    page = (
        head("Kassasystemen in België: leveranciers en prijzen | " + BRAND,
             "Overzicht van leveranciers van kassasystemen voor horeca en winkels in België.",
             "", "kassa")
        + f"""<div class="page-head">
  <h1>Kassasystemen voor horeca en winkels op een rij</h1>
  <p class="lead">Een kassa kies je vaak samen met je betaalterminal. Dit zijn {len(REGISTERS)} leveranciers, met de prijs als ze die zelf publiceren.</p>
  <p>{BRAND} rekent voor kassasystemen niets uit: de prijs hangt te veel af van hardware en opties. Serveer je maaltijden, vraag dan altijd of het systeem erkend is als geregistreerde kassa.</p>
  <a class="btn primary" href="index.html#quiz">{CTA_LABEL}</a>
</div>
<div class="cards">
{chr(10).join(card(*r) for r in REGISTERS)}
</div>
<p class="source">Nagekeken op {CHECKED}. Eerst staan de leveranciers met publieke prijzen, daarna de andere. De volgorde is geen rangschikking. {DISCLAIMER}</p>
"""
        + closing("Eerst weten wat je terminal kost?",
                  "De rekentool toont in één minuut wat elke betaalterminal jou per maand kost. Daarna kies je de kassa die erbij past.")
        + foot("")
    )
    (ROOT / "kassasystemen.html").write_text(page, encoding="utf-8")
    print(f"Built betaalterminals.html ({len(TERMINALS)} cards, {n_tool} in tool) and kassasystemen.html ({len(REGISTERS)} cards)")


if __name__ == "__main__":
    build()
