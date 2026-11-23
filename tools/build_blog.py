#!/usr/bin/env python3
"""Builds the static blog: blog/index.html and one page per article.

Run from the repository root:  python3 tools/build_blog.py
Add an article by appending to ARTICLES and running the script again.

The articles are test content. Prices in them come from the providers' own
sites (see assets/quiz-config.js for the sources) and were checked on CHECKED.
"""
import html
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from layout import BRAND, CHECKED, CTA_LABEL, foot, head  # noqa: E402

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "blog"
DATE = CHECKED
SRC = (f'<p class="source">Prijzen van de sites van de aanbieders, nagekeken op {CHECKED}. '
       'Ze kunnen intussen gewijzigd zijn. De bronnen staan bij elke aanbieder op de overzichtspagina\'s '
       'voor <a href="../betaalterminals.html">betaalterminals</a>, <a href="../smartphone-en-qr.html">smartphone en QR</a> '
       'en <a href="../online-betalen.html">online betalen</a>.</p>')

ARTICLES = [
    {
        "slug": "wat-kost-een-betaalterminal",
        "title": "Wat kost een betaalterminal echt? De drie delen van je factuur",
        "summary": "Toestel, vaste kosten en kosten per betaling: wie ze apart bekijkt, kan offertes eindelijk vergelijken.",
        "body": f"""
<p>Een offerte voor een betaalterminal lijkt vaak ingewikkelder dan ze is. Bijna elke aanbieder rekent drie dingen aan. Leg ze naast elkaar en je ziet snel wie voor jouw zaak het goedkoopst is.</p>
<h2>1. Het toestel</h2>
<p>Je koopt het toestel of je huurt het. Kopen kan al vanaf 34 euro voor een kaartlezer die met je smartphone werkt (SumUp Solo Lite) en loopt op tot 649 euro voor een volwaardige terminal (Worldline Saturn 1000F2). Huren kost bij de klassieke aanbieders ongeveer 30 tot 45 euro per maand: 29,35 euro voor de CCV Compact A77 en 36 euro voor de Saturn van Worldline.</p>
<h2>2. De vaste kosten per maand</h2>
<p>Dat is alles wat je betaalt, ook als er geen klant komt: de huur, een servicecontract, een abonnement of een jaarlijkse bijdrage. Worldline rekent bijvoorbeeld een compliancekost van 60 euro per jaar. SumUp en myPOS hebben een formule zonder vaste kosten en een abonnement van 19 euro per maand met een lager tarief per betaling.</p>
<h2>3. De kosten per betaling</h2>
<p>Hier zit het grootste verschil. Er zijn twee systemen:</p>
<ul>
<li><strong>Een vast bedrag per betaling.</strong> Worldline vraagt 0,13 euro per Bancontact-betaling, Viva.com 0,14 euro. Het bedrag van de aankoop speelt geen rol.</li>
<li><strong>Een percentage van het bedrag.</strong> SumUp vraagt 1,69%, myPOS 1,49% in de formule zonder abonnement.</li>
</ul>
<p>Kredietkaarten kosten bijna overal een percentage, soms met een vast bedrag erbovenop.</p>
<h2>Wat betekent dat voor jou?</h2>
<p>Het hangt af van twee cijfers: hoeveel betalingen je per maand krijgt en hoe groot ze gemiddeld zijn. Een bakker met veel kleine bedragen komt anders uit dan een kledingwinkel met weinig grote. Onze rekentool doet die som voor elke aanbieder.</p>
{SRC}
""",
    },
    {
        "slug": "vast-bedrag-of-percentage",
        "title": "Vast bedrag of percentage per betaling: waar ligt het kantelpunt?",
        "summary": "Bij kleine bedragen wint het percentage, bij grote het vaste bedrag. Met één deling weet je waar jij staat.",
        "body": f"""
<p>De ene aanbieder vraagt een vast bedrag per Bancontact-betaling, de andere een percentage. Welke goedkoper is, hangt af van het bedrag dat je klant betaalt.</p>
<h2>De som</h2>
<p>Deel het vaste bedrag door het percentage. De uitkomst is het aankoopbedrag waarbij beide evenveel kosten.</p>
<ul>
<li>0,13 euro (Worldline) tegenover 1,69% (SumUp zonder abonnement): 0,13 gedeeld door 0,0169 is ongeveer 7,70 euro.</li>
<li>0,14 euro (Viva.com) tegenover 1,49% (myPOS One): ongeveer 9,40 euro.</li>
</ul>
<p>Betaalt je klant gemiddeld minder dan dat bedrag, dan is het percentage goedkoper per betaling. Betaalt hij meer, dan wint het vaste bedrag. Bij een aankoop van 50 euro kost 1,69% al 0,85 euro, tegenover 0,13 euro met een vast bedrag.</p>
<h2>Vergeet de vaste kosten niet</h2>
<p>De som hierboven gaat alleen over de kost per betaling. Aanbieders met een vast bedrag per betaling rekenen vaak ook huur of een bijdrage aan. Bij weinig betalingen per maand kan een percentage zonder vaste kosten daardoor toch goedkoper zijn, ook bij grotere bedragen.</p>
<h2>Kleine bedragen: let op uitzonderingen</h2>
<p>CCV rekent de eerste 1.000 Bancontact-betalingen tot 5 euro per maand niet aan. Voor een krantenwinkel of een broodjeszaak kan dat veel schelen.</p>
<p>De rekentool houdt met al deze regels rekening en toont de berekening per aanbieder.</p>
{SRC}
""",
    },
    {
        "slug": "betaalterminal-huren-of-kopen",
        "title": "Betaalterminal huren of kopen: zo reken je het uit",
        "summary": "Huren spreidt de kost en bevat service. Kopen is na een tijd goedkoper, als het toestel lang genoeg meegaat.",
        "body": f"""
<p>Bij de klassieke aanbieders kan je een terminal huren of kopen. Bij de goedkope kaartlezers is kopen de enige optie, maar daar gaat het om enkele tientallen euro's.</p>
<h2>Een voorbeeld</h2>
<p>De Saturn 1000F2 van Worldline kost 649 euro zonder btw, of 36 euro huur per maand. In de huur zitten service, een simkaart met mobiele data en een vervangtoestel binnen één werkdag. Wie koopt, kan een servicecontract nemen; Worldline vermeldt daarvoor 16 euro per maand.</p>
<p>Met dat servicecontract erbij bespaar je als koper 20 euro per maand tegenover huren. De aankoopprijs van 649 euro heb je dan na ongeveer 32 maanden terugverdiend. Zonder servicecontract gaat het sneller, maar dan sta je er bij een defect alleen voor.</p>
<h2>Wanneer huren?</h2>
<ul>
<li>Je start en wil je geld in je zaak houden.</li>
<li>Je weet nog niet of je over een jaar hetzelfde toestel nodig hebt.</li>
<li>Je wil dat een defect toestel snel vervangen wordt zonder extra kost.</li>
</ul>
<h2>Wanneer kopen?</h2>
<ul>
<li>Je zaak draait stabiel en je houdt het toestel minstens drie jaar.</li>
<li>Je hebt een eenvoudige kaartlezer nodig. Die kost minder dan drie maanden huur van een klassieke terminal.</li>
</ul>
<h2>Kijk naar de looptijd</h2>
<p>Een huurcontract loopt meestal een vaste periode. Bij CCV is dat 12 maanden. Lees voor je tekent wanneer en hoe je kan opzeggen.</p>
{SRC}
""",
    },
    {
        "slug": "terminal-smartphone-of-qr-code",
        "title": "Terminal, smartphone of QR-code: welke betaaloplossing past bij jouw zaak?",
        "summary": "Je hebt niet altijd een toestel nodig om elektronisch betaald te worden. De vier opties naast elkaar.",
        "body": f"""
<p>Een betaalterminal is de bekendste manier om elektronisch betaald te worden, maar niet de enige. Welke oplossing past, hangt af van waar je klant betaalt en hoe vaak.</p>
<h2>Vaste terminal</h2>
<p>Staat aan de toonbank, hangt aan de stroom en werkt via je internetkabel. Gemaakt om de hele dag te draaien en kan meestal met je kassa samenwerken. De logische keuze voor een winkel met één afrekenpunt.</p>
<h2>Mobiele terminal of kaartlezer</h2>
<p>Heeft een batterij en werkt via wifi of een simkaart. Je neemt hem mee naar de tafel, het terras of de markt. De goedkoopste kaartlezers werken via een app op je telefoon en kosten enkele tientallen euro's.</p>
<h2>Je smartphone als terminal</h2>
<p>Met een app neem je contactloze betalingen aan op je eigen telefoon, zonder extra toestel. Bij Worldline heet dat Tap on Mobile: geen maandelijkse kosten en vanaf 0,13 euro per transactie. Bij myPOS zit Tap to Pay in elke formule. Handig voor wie weinig betalingen krijgt, op verplaatsing werkt of een reserve wil.</p>
<h2>QR-code</h2>
<p>Je klant scant een QR-code met zijn bankapp en bevestigt het bedrag. Met Bancontact Pro kost dat 0,06 euro per betaling en 18 euro per jaar, zonder btw. Je hebt geen toestel nodig. Het nadeel: je aanvaardt er geen betaalkaarten of kredietkaarten mee, en je klant heeft zijn telefoon en een app nodig.</p>
<h2>Combineren mag</h2>
<p>Veel zaken hangen een QR-sticker naast hun terminal. Wie met de app betaalt, kost je dan minder, en je hebt een reserve als de terminal uitvalt.</p>
<p>In de rekentool kies je hoe je betalingen wil aannemen en zie je wat elke oplossing per maand kost.</p>
{SRC}
""",
    },
    {
        "slug": "online-betalingen-wat-kost-het",
        "title": "Online betalingen in je webshop: wat kost het?",
        "summary": "Online betaal je per bestelling een vast bedrag, een percentage of beide. Zo lees je de tarieven.",
        "body": f"""
<p>Een betaling in je webshop kost meer dan dezelfde betaling aan een terminal. Daar staat tegenover dat je geen toestel nodig hebt en meestal geen vaste kosten betaalt.</p>
<h2>Hoe zijn de tarieven opgebouwd?</h2>
<p>De meeste aanbieders rekenen per geslaagde betaling. Er zijn drie vormen:</p>
<ul>
<li><strong>Een vast bedrag.</strong> Viva.com vraagt 0,37 euro per online Bancontact-betaling.</li>
<li><strong>Een percentage.</strong> SumUp vraagt 2,50% per online betaling.</li>
<li><strong>Een percentage plus een vast bedrag.</strong> myPOS vraagt in de formule zonder abonnement 1,99% + 0,20 euro. Voor kaarten van Visa en Mastercard rekent Viva.com 2,19% + 0,24 euro.</li>
</ul>
<h2>Kleine bestellingen: let op het vaste bedrag</h2>
<p>Bij een bestelling van 10 euro is 0,37 euro al 3,7% van het bedrag. Bij een bestelling van 100 euro is het 0,37%. Verkoop je vooral kleine bedragen, dan weegt het vaste deel zwaar door.</p>
<h2>Bancontact of kaart?</h2>
<p>In België betalen veel klanten online met Bancontact. Die betaling heeft bij sommige aanbieders een eigen, lager tarief dan een kredietkaart. Kijk dus naar beide tarieven en schat hoeveel van je klanten met elk betalen.</p>
<h2>Alleen Bancontact aanbieden?</h2>
<p>Met Bancontact Pro kost een online betaling volgens KBC 0,20 euro, plus 18 euro per jaar. Je aanvaardt dan geen kredietkaarten. Voor een webshop met alleen Belgische klanten kan dat volstaan.</p>
<h2>Verkoop je ook in een zaak?</h2>
<p>Dan kan één aanbieder voor beide handig zijn: één overzicht en één uitbetaling. Het is niet altijd het goedkoopst. De rekentool toont de twee lijsten naast elkaar.</p>
{SRC}
""",
    },
    {
        "slug": "elektronisch-betalen-verplicht",
        "title": "Elektronisch betalen aanbieden: wat moet je als ondernemer?",
        "summary": "Elke onderneming moet haar klanten een elektronische betaalmogelijkheid geven. Een terminal is één manier.",
        "body": """
<p>Ondernemingen in België moeten consumenten minstens één manier geven om elektronisch te betalen. Voor wie start, is dat een van de eerste dingen om te regelen.</p>
<h2>Moet het een betaalterminal zijn?</h2>
<p>Nee. De regel gaat over een elektronisch betaalmiddel, niet over een bepaald toestel. Een terminal is de bekendste oplossing, maar een betaling via een QR-code of een app telt ook. Cash mag je blijven aannemen.</p>
<h2>Waarom toch een terminal?</h2>
<ul>
<li>Klanten zijn het gewend: kaart of telefoon tegen het toestel en klaar.</li>
<li>Je aanvaardt ook kredietkaarten en buitenlandse kaarten.</li>
<li>Een terminal kan samenwerken met je kassa.</li>
</ul>
<h2>Wat kost het minimum?</h2>
<p>De goedkoopste kaartlezers kosten enkele tientallen euro's, zonder abonnement. Je betaalt dan alleen een percentage per betaling. Voor een zaak met weinig kaartbetalingen is dat vaak de voordeligste start.</p>
<h2>Mag je de kost doorrekenen?</h2>
<p>De kost van een kaartbetaling aan je klant doorrekenen mag niet. Reken de transactiekosten dus mee in je prijzen.</p>
<p class="source">Dit artikel is een algemene samenvatting en geen juridisch advies. De precieze regels vind je bij de FOD Economie. We hebben deze tekst niet door een jurist laten nalezen.</p>
""",
    },
    {
        "slug": "overstappen-naar-andere-aanbieder",
        "title": "Overstappen naar een andere terminalaanbieder in vijf stappen",
        "summary": "Een oud contract is zelden het goedkoopste. Zo stap je over zonder een dag zonder terminal te zitten.",
        "body": f"""
<p>Wie al jaren dezelfde terminal heeft, betaalt vaak een tarief van toen. Overstappen is minder werk dan het lijkt, als je de volgorde respecteert.</p>
<h2>1. Zoek je contract en je laatste factuur</h2>
<p>Noteer wat je per maand vast betaalt, wat een betaling kost en wanneer je contract afloopt. Zonder die cijfers kan je niets vergelijken.</p>
<h2>2. Kijk naar de opzegtermijn</h2>
<p>Bij huur loopt het contract meestal een vaste periode. CCV vermeldt bijvoorbeeld een huurcontract van 12 maanden dat je tot drie maanden voor het einde kan opzeggen; daarna loopt het door met een opzegtermijn van drie maanden. Bij aanbieders zonder contract, zoals SumUp, stop je wanneer je wil.</p>
<h2>3. Reken uit wat de andere aanbieders kosten</h2>
<p>Vul in de rekentool je kaartomzet en je gemiddelde ticket in en duid je huidige aanbieder aan. Je ziet het verschil per maand.</p>
<h2>4. Bestel de nieuwe terminal vóór je opzegt</h2>
<p>Test het nieuwe toestel een week naast het oude. Controleer of het geld correct op je rekening komt en of de koppeling met je kassa werkt.</p>
<h2>5. Zeg schriftelijk op en stuur het oude toestel terug</h2>
<p>Vraag een bevestiging van de einddatum. Een gehuurd toestel moet je terugsturen; bewaar het verzendbewijs.</p>
<h2>Loont het altijd?</h2>
<p>Nee. Is het verschil klein, dan is de moeite het niet waard. Je kan met de cijfers uit de rekentool ook gewoon een beter tarief vragen aan je huidige aanbieder.</p>
{SRC}
""",
    },
    {
        "slug": "kassa-en-betaalterminal-koppelen",
        "title": "Kassa en betaalterminal koppelen: waarom en hoe",
        "summary": "Met een koppeling tik je het bedrag maar één keer in. Niet elke terminal werkt met elke kassa.",
        "body": """
<p>In veel zaken staan kassa en betaalterminal los van elkaar. Je tikt het bedrag in op de kassa en daarna nog eens op de terminal. Dat werkt, maar het kost tijd en het gaat af en toe mis.</p>
<h2>Wat doet een koppeling?</h2>
<p>De kassa stuurt het bedrag zelf naar de terminal. Je klant betaalt, en de kassa weet meteen dat de betaling gelukt is. Aan het einde van de dag klopt je kassa met wat er op je rekening komt.</p>
<h2>De voordelen</h2>
<ul>
<li>Geen tikfouten: 15,00 euro wordt nooit 1,50 euro.</li>
<li>Sneller afrekenen op drukke momenten.</li>
<li>Minder werk bij het afsluiten van de dag.</li>
</ul>
<h2>Twee manieren</h2>
<ul>
<li><strong>Een kassa met eigen betalingen.</strong> Sommige kassasystemen bieden zelf betaalverwerking aan. Kassa en terminal komen dan van dezelfde leverancier.</li>
<li><strong>Een losse terminal die met je kassa werkt.</strong> Je kiest de terminal apart. Vraag je kassaleverancier welke terminals hij ondersteunt.</li>
</ul>
<h2>Vragen voor je tekent</h2>
<ol>
<li>Met welke terminals werkt mijn kassa?</li>
<li>Kost de koppeling iets extra, eenmalig of per maand?</li>
<li>Wie bel ik als het niet werkt: de kassa of de terminal?</li>
<li>Kan ik later van terminal veranderen zonder een nieuwe kassa?</li>
</ol>
<p>Op de pagina <a href="../kassasystemen.html">Kassasystemen</a> vind je leveranciers, met de prijs als ze die publiceren.</p>
""",
    },
    {
        "slug": "geregistreerde-kassa-horeca",
        "title": "De geregistreerde kassa in de horeca: wat je moet vragen aan je leverancier",
        "summary": "Wie maaltijden serveert, heeft vanaf een bepaalde omzet een geregistreerd kassasysteem nodig. Zo pak je de keuze aan.",
        "body": """
<p>In de horeca is de kassa geen vrije keuze. Zaken die maaltijden serveren, moeten vanaf een bepaalde omzet een geregistreerd kassasysteem gebruiken, ook wel de witte kassa genoemd. Volgens het offerteplatform Bobex ligt die grens op 25.000 euro omzet per jaar uit maaltijden, zonder drank en zonder btw.</p>
<h2>Wat is een geregistreerde kassa?</h2>
<p>Het is een kassasysteem dat elke verkoop vastlegt in een aparte module, de blackbox of fiscale datamodule. De gegevens kunnen achteraf niet gewijzigd worden.</p>
<h2>Vragen voor je leverancier</h2>
<ol>
<li>Is het systeem erkend als geregistreerde kassa, en voor de nieuwste versie van de regels?</li>
<li>Zit de blackbox in de prijs, of komt die erbij?</li>
<li>Wie doet de installatie en de aanmelding bij de overheid?</li>
<li>Wat kost het systeem per maand, alles inbegrepen?</li>
<li>Met welke betaalterminals werkt het?</li>
</ol>
<h2>Kies kassa en terminal samen</h2>
<p>Een horecazaak rekent af aan tafel, aan de toog en soms op het terras. Een mobiele terminal die met de kassa samenwerkt, bespaart elke dienst heel wat stappen. Bekijk daarom eerst welke terminals je kassa ondersteunt en reken dan uit wat ze kosten.</p>
<p class="source">Bron voor de omzetgrens: bobex.be, pagina over kassasystemen, geraadpleegd op 23 november 2026. Dit artikel is geen fiscaal advies. Vraag je boekhouder of de FOD Financiën of de verplichting voor jouw zaak geldt.</p>
""",
    },
    {
        "slug": "offertes-vergelijken-checklist",
        "title": "Offertes voor een betaalterminal vergelijken: de checklist",
        "summary": "Tien vragen die elke offerte moet beantwoorden. Staat het er niet in, vraag het dan na voor je tekent.",
        "body": """
<p>Twee offertes voor een betaalterminal zien er zelden hetzelfde uit. Met deze lijst zet je ze toch naast elkaar.</p>
<h2>Het toestel</h2>
<ol>
<li>Huur ik of koop ik, en voor welk bedrag?</li>
<li>Is het een vast of een mobiel toestel, en zit er een simkaart bij?</li>
</ol>
<h2>De vaste kosten</h2>
<ol start="3">
<li>Wat betaal ik elke maand, ook zonder één betaling?</li>
<li>Zijn er jaarlijkse kosten of bijdragen?</li>
<li>Wat kost de installatie of de levering?</li>
</ol>
<h2>De kosten per betaling</h2>
<ol start="6">
<li>Wat kost een Bancontact-betaling: een vast bedrag of een percentage?</li>
<li>Wat kost een kredietkaart, een zakelijke kaart en een kaart van buiten Europa?</li>
</ol>
<h2>Het contract</h2>
<ol start="8">
<li>Hoe lang loopt het contract en hoe zeg ik op?</li>
<li>Hoe snel staat het geld op mijn rekening?</li>
<li>Zijn de prijzen met of zonder btw?</li>
</ol>
<h2>Reken het om naar één bedrag</h2>
<p>Tel de vaste kosten per maand op en reken de kosten per betaling uit met je eigen cijfers: je kaartomzet en je gemiddelde ticket. Zo krijg je per offerte één maandbedrag. Dat is precies wat de rekentool doet voor de aanbieders met publieke prijzen.</p>
<p>Een bedrag dat veel lager ligt dan de rest? Kijk dan of het om een tijdelijke actie gaat en wat de prijs daarna wordt.</p>
""",
    },
]

CTA = f"""<aside class="closing">
  <h2>Wat kost betaald worden voor jouw zaak?</h2>
  <p>Enkele korte vragen. Je ziet per aanbieder de geschatte maandkost, met de berekening erbij.</p>
  <a class="btn primary" href="../index.html#quiz">{CTA_LABEL}</a>
</aside>
"""
BLOG_NOTE_EXTRA = " De artikels zijn testinhoud en niet door een specialist nagelezen."


def minutes(body: str) -> int:
    return max(2, round(len(body.split()) / 200))


def build() -> None:
    from layout import NOTE
    note = NOTE + BLOG_NOTE_EXTRA
    OUT.mkdir(exist_ok=True)
    items = []
    for a in ARTICLES:
        esc_title = html.escape(a["title"])
        esc_sum = html.escape(a["summary"])
        mins = minutes(a["body"])
        page = (
            head(a["title"] + " | " + BRAND, a["summary"], "../", "blog", note)
            + '<article class="post">\n'
            + '<p class="back"><a href="index.html">Alle artikels</a></p>\n'
            + f"<h1>{esc_title}</h1>\n"
            + f'<p class="meta">{DATE}, {mins} minuten lezen</p>\n'
            + f'<p class="intro">{esc_sum}</p>\n'
            + a["body"].strip()
            + "\n</article>\n"
            + CTA
            + foot("../")
        )
        (OUT / f'{a["slug"]}.html').write_text(page, encoding="utf-8")
        items.append(
            f'<li><a href="{a["slug"]}.html"><h2>{esc_title}</h2></a>'
            f"<p>{esc_sum}</p><p class=\"meta\">{mins} minuten lezen</p></li>"
        )
    index = (
        head("Blog | " + BRAND, "Praktische artikels over betaaloplossingen voor ondernemers in België: terminal, smartphone, QR-code en webshop.", "../", "blog", note)
        + '<div class="page-head"><h1>Een betaaloplossing kiezen, zonder jargon</h1>'
        + '<p class="lead">Praktische uitleg over terminals, betalen via smartphone, QR-codes, online betalingen en je kassa.</p></div>\n'
        + '<ul class="posts">\n'
        + "\n".join(items)
        + "\n</ul>\n"
        + CTA
        + foot("../")
    )
    (OUT / "index.html").write_text(index, encoding="utf-8")
    print(f"Built {len(ARTICLES)} articles in {OUT}")


if __name__ == "__main__":
    build()
