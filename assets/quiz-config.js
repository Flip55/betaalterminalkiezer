/*
 * Betaaloplossingkiezer: alle teksten, vragen, antwoorden en tarieven.
 * Pas hier aan wat je wil wijzigen; quiz.js bevat alleen de werking.
 *
 * TARIEVEN
 * - Elk tarief komt van de site van de aanbieder zelf (of van de bank die de
 *   oplossing verkoopt). Bron en datum staan bij elke aanbieder onder "sources".
 * - Staat een prijs niet op de site van de aanbieder, dan krijgt die aanbieder
 *   voor dat kanaal een tekst onder "onRequest" en rekent de quiz niets uit.
 * - Wijzig je een tarief, pas dan ook "checkedOn" aan.
 *
 * EEN PLAN (formule van een aanbieder)
 * - channel: "winkel" (standaard) of "online".
 * - types:   voor de winkel: "vast", "mobiel", "smartphone" of "qr". null als de
 *            aanbieder het toestel niet op zijn tarievenpagina toont.
 * - monthly: vaste kosten per maand, elk met een label.
 * - debit:   kost per betaling met Bancontact of debetkaart: { fixed, pct } of
 *            { tiers: [...], small: {...} } voor een staffel.
 * - credit:  kost per betaling met kredietkaart: { pct, fixed }.
 * - debitOnly: true als de oplossing geen kredietkaarten aanvaardt.
 * - oneOff:  eenmalige kosten (niet in de maandprijs geteld); null = onbekend.
 * - notes:   wat de lezer bij de berekening moet weten.
 */
window.QUIZ_CONFIG = {
  storageKey: "bok-calculator-v2",
  checkedOn: "23 november 2026",

  /* Aannames van de berekening. Zichtbaar op de resultaatpagina. */
  assumptions: {
    /* deel van de betalingen met Bancontact (of debetkaart in de zaak); de rest is kredietkaart */
    debitShare: { winkel: 0.9, online: 0.7 }
  },

  channels: {
    winkel: {
      title: "In je zaak",
      intro: "Gerekend met {n} betalingen per maand van gemiddeld {ticket}, samen {turnover} omzet met kaart of smartphone.",
      debit: "Bancontact of debetkaart",
      credit: "kredietkaart",
      turnover: "omzet", ticket: "ticket",
      cta: { label: "Bekijk de oplossingen voor in de zaak", url: "betaalterminals.html" }
    },
    online: {
      title: "Online",
      intro: "Gerekend met {n} bestellingen per maand van gemiddeld {ticket}, samen {turnover} online omzet.",
      debit: "Bancontact",
      credit: "Visa of Mastercard",
      turnover: "omzetOnline", ticket: "ticketOnline",
      cta: { label: "Bekijk de aanbieders voor online betalen", url: "online-betalen.html" }
    }
  },

  start: {
    title: "Wat kost betaald worden jou per maand?",
    subtitle: "Terminal, smartphone, QR-code of webshop: beantwoord enkele korte vragen en zie per aanbieder de geschatte maandkost, met de berekening erbij.",
    button: "Bereken mijn maandkost",
    note: "6 tot 9 vragen · 1 minuut · geen gegevens nodig",
    resume: "Ga verder waar je gebleven was",
    /* Foto naast de starttekst. Laat "image" weg om zonder foto te werken. */
    image: { src: "assets/hero.jpg", small: "assets/hero-800.jpg", width: 1400, height: 792, alt: "Een klant betaalt met zijn kaart aan de betaalterminal van een winkelier in een Belgische winkelstraat." }
  },

  labels: {
    progress: "Vraag {n} van {total}",
    explain: "Waarom vragen we dit?",
    previous: "Vorige",
    next: "Volgende",
    restart: "Opnieuw berekenen",
    resultTitle: "Jouw geschatte maandkost per aanbieder",
    top3Title: "De voordeligste voor jouw situatie",
    rank: "Nummer {n}",
    perMonth: "per maand",
    shareOfTurnover: "{pct} van deze omzet",
    oneOff: "Eenmalig: {amount}",
    oneOffNone: "Geen toestel nodig",
    oneOffUnknown: "Prijs van het toestel staat niet op de tarievenpagina",
    allTitle: "Alle aanbieders met publieke tarieven",
    showCalc: "Bekijk de berekening",
    calcFixed: "Vaste kosten: {label}",
    calcDebitFixed: "{n} betalingen met {debit} × {rate}",
    calcDebitPct: "{rate} op {amount} met {debit}",
    calcDebitFree: "{n} Bancontact-betalingen tot € 5: gratis",
    calcDebitSmallExtra: "{n} Bancontact-betalingen tot € 5 boven de eerste {free} × {rate}",
    calcCreditPct: "{rate} op {amount} met {credit}",
    calcCreditFixed: "{n} betalingen met {credit} × {rate}",
    calcTotal: "Geschat per maand",
    calcOneOff: "Eenmalig: {label}",
    sources: "Bron",
    notFit: "Past niet bij je keuze: {type}",
    current: "Je huidige aanbieder",
    currentTitle: "Vergelijking met je huidige aanbieder",
    currentCheaper: "{channel}: bij {current} kom je met deze tarieven uit op {amount} per maand. De voordeligste aanbieder die bij je keuze past, {best}, kost {bestAmount}. Dat is een verschil van {diff} per maand. Vergelijk dit met je eigen factuur: je betaalt misschien een ouder of onderhandeld tarief.",
    currentBest: "{channel}: met deze tarieven is {current} al de voordeligste keuze. Vergelijk het bedrag wel met je eigen factuur: je betaalt misschien een ouder tarief.",
    currentUnknown: "Van je huidige aanbieder hebben we geen publieke tarieven. Leg de bedragen hierboven naast je laatste factuur.",
    onRequestTitle: "Prijs op aanvraag",
    onRequestIntro: "Van deze aanbieders vonden we geen volledige tarieven voor België. We schatten niets en tonen hen daarom zonder bedrag.",
    notesTitle: "Goed om te weten voor jouw zaak",
    checked: "Tarieven nagekeken op {date}.",
    assumptionsTitle: "Zo rekenden we",
    assumptionsList: [
      "Het aantal betalingen is je omzet gedeeld door je gemiddelde bedrag. We rekenen met het midden van de schijf die je koos.",
      { when: "winkel", text: "In je zaak: we nemen aan dat {debitWinkel} van je betalingen met Bancontact of een debetkaart gebeurt en {creditWinkel} met een kredietkaart van een particulier uit Europa." },
      { when: "online", text: "Online: we nemen aan dat {debitOnline} van je bestellingen met Bancontact betaald wordt en {creditOnline} met een Visa- of Mastercard-kaart van een particulier uit Europa." },
      "Zakelijke kaarten en kaarten van buiten Europa kosten bij elke aanbieder meer.",
      "Per aanbieder tonen we de formule die voor jouw cijfers het goedkoopst uitkomt.",
      "Eenmalige kosten zoals de aankoop van een toestel staan apart en zitten niet in de maandprijs.",
      "Tijdelijke kortingen en acties tellen niet mee.",
      "De meeste bedragen zijn zonder btw. Bij sommige aanbieders staat niet op de site of de btw inbegrepen is."
    ],
    disclaimer: "Dit is een schatting op basis van publieke tarieven, geen offerte. De vermelde bedrijven zijn geen partner van deze site en hebben de teksten niet bevestigd. Controleer de prijs altijd bij de aanbieder."
  },

  /*
   * Vragen. "value" is het getal waarmee we rekenen.
   * "when" bepaalt bij welk antwoord op de eerste vraag een vraag verschijnt.
   * "note" bij een antwoord verschijnt op de resultaatpagina.
   */
  questions: [
    {
      id: "kanaal",
      text: "Waar betalen je klanten?",
      explain: "Een betaling in je zaak en een betaling in een webshop hebben andere tarieven en vaak andere aanbieders. We stellen alleen de vragen die voor jou tellen.",
      options: [
        { id: "winkel", label: "In mijn zaak of onderweg", channels: ["winkel"] },
        { id: "online", label: "Online, in een webshop of met een betaallink", channels: ["online"] },
        { id: "beide", label: "Allebei", channels: ["winkel", "online"], note: "Je verkoopt in je zaak en online. Bij één aanbieder voor beide heb je één overzicht en één aanspreekpunt, maar dat is niet altijd het goedkoopst. Vergelijk de twee lijsten hierboven." }
      ]
    },
    {
      id: "sector",
      text: "In welke sector werk je?",
      explain: "De sector verandert de prijs niet. We gebruiken hem om je onderaan het resultaat te wijzen op wat voor jouw soort zaak telt, zoals de geregistreerde kassa in de horeca.",
      options: [
        { id: "horeca", label: "Horeca (café, restaurant, frituur)", note: "In de horeca kies je de betaaloplossing best samen met je kassa. Wie maaltijden serveert, heeft vanaf een bepaalde omzet een geregistreerd kassasysteem nodig. Bekijk de kassasystemen op deze site en vraag je boekhouder of de regel voor jou geldt." },
        { id: "voeding", label: "Voedingswinkel (bakker, slager, kruidenier)", note: "Veel kleine bedragen? Dan weegt een vast bedrag per betaling zwaarder door. Kijk in de berekening welke aanbieder kleine Bancontact-betalingen goedkoper of gratis verwerkt." },
        { id: "winkel", label: "Winkel of webshop" },
        { id: "diensten", label: "Diensten en vrije beroepen" },
        { id: "zorg", label: "Schoonheid en zorg (kapper, kinesist)" },
        { id: "markt", label: "Markt, foodtruck of evenementen", note: "Werk je op verplaatsing, kies dan een oplossing met een goede mobiele verbinding: een toestel met een eigen simkaart, je smartphone of een QR-code." },
        { id: "andere", label: "Iets anders" }
      ]
    },
    {
      id: "omzet", when: "winkel",
      text: "Hoeveel omzet ontvang je per maand elektronisch in je zaak?",
      explain: "Tel alleen wat klanten in je zaak met Bancontact, debetkaart, kredietkaart of smartphone betalen. Start je nog, kies dan wat je verwacht. We rekenen met het midden van de schijf.",
      options: [
        { id: "o1", label: "Minder dan € 2.500", value: 1500 },
        { id: "o2", label: "€ 2.500 tot € 5.000", value: 3750 },
        { id: "o3", label: "€ 5.000 tot € 10.000", value: 7500 },
        { id: "o4", label: "€ 10.000 tot € 25.000", value: 17500 },
        { id: "o5", label: "€ 25.000 tot € 50.000", value: 37500 },
        { id: "o6", label: "Meer dan € 50.000", value: 75000 }
      ]
    },
    {
      id: "ticket", when: "winkel",
      text: "Hoeveel betaalt een klant in je zaak gemiddeld per keer?",
      explain: "Sommige aanbieders vragen een vast bedrag per betaling, andere een percentage. Bij kleine bedragen is een percentage vaak goedkoper, bij grote bedragen een vast bedrag. Daarom maakt je gemiddelde ticket een groot verschil.",
      options: [
        { id: "t1", label: "Minder dan € 5", value: 4 },
        { id: "t2", label: "€ 5 tot € 15", value: 10 },
        { id: "t3", label: "€ 15 tot € 30", value: 22 },
        { id: "t4", label: "€ 30 tot € 60", value: 45 },
        { id: "t5", label: "€ 60 tot € 150", value: 100 },
        { id: "t6", label: "Meer dan € 150", value: 250 }
      ]
    },
    {
      id: "type", when: "winkel",
      text: "Hoe wil je betalingen in je zaak aannemen?",
      explain: "Een vaste terminal staat aan de toonbank. Een mobiele terminal neem je mee. Zonder toestel kan ook: met een app maak je van je smartphone een terminal, of je klant scant een QR-code met zijn bankapp.",
      options: [
        { id: "vast", label: "Met een vaste terminal aan de toonbank", types: ["vast"] },
        { id: "mobiel", label: "Met een mobiele terminal of kaartlezer", types: ["mobiel"] },
        { id: "zonder", label: "Zonder toestel: met mijn smartphone of een QR-code", types: ["smartphone", "qr"] },
        { id: "beide", label: "Maakt mij niet uit", types: ["vast", "mobiel", "smartphone"], note: "Je hebt geen voorkeur voor een toestel. We vergelijken terminals en smartphone-apps. Een QR-code zonder toestel is nog goedkoper per betaling, maar aanvaardt geen kredietkaarten; kies 'zonder toestel' om die optie te zien." }
      ]
    },
    {
      id: "kassa", when: "winkel",
      text: "Moet de betaaloplossing samenwerken met je kassa?",
      explain: "Met een koppeling stuurt de kassa het bedrag zelf naar de terminal. Je tikt niets twee keer in en maakt minder fouten. Niet elke oplossing werkt met elke kassa.",
      options: [
        { id: "ja", label: "Ja, ik heb een kassa of wil er een", note: "Je wil een koppeling met je kassa. Vraag elke aanbieder vóór je tekent of zijn oplossing met jouw kassasysteem werkt en wat de koppeling kost. Die kost zit niet in de bedragen hierboven. Op de pagina Kassasystemen vind je kassa's met een eigen betaaloplossing." },
        { id: "nee", label: "Nee, dat hoeft niet" },
        { id: "weetniet", label: "Dat weet ik nog niet", note: "Twijfel je over een kassa? Lees eerst het blogartikel over kassa en terminal koppelen. Een losse betaaloplossing kan je later meestal vervangen zonder hoge kosten." }
      ]
    },
    {
      id: "omzetOnline", when: "online",
      text: "Hoeveel omzet ontvang je per maand online?",
      explain: "Tel wat klanten betalen in je webshop of via een betaallink. Start je nog, kies dan wat je verwacht. We rekenen met het midden van de schijf.",
      options: [
        { id: "o1", label: "Minder dan € 2.500", value: 1500 },
        { id: "o2", label: "€ 2.500 tot € 5.000", value: 3750 },
        { id: "o3", label: "€ 5.000 tot € 10.000", value: 7500 },
        { id: "o4", label: "€ 10.000 tot € 25.000", value: 17500 },
        { id: "o5", label: "€ 25.000 tot € 50.000", value: 37500 },
        { id: "o6", label: "Meer dan € 50.000", value: 75000 }
      ]
    },
    {
      id: "ticketOnline", when: "online",
      text: "Hoe groot is een online bestelling gemiddeld?",
      explain: "Online vragen de meeste aanbieders een vast bedrag per betaling, een percentage, of beide. Bij kleine bestellingen weegt het vaste bedrag zwaar door.",
      options: [
        { id: "t2", label: "Minder dan € 15", value: 10 },
        { id: "t3", label: "€ 15 tot € 30", value: 22 },
        { id: "t4", label: "€ 30 tot € 60", value: 45 },
        { id: "t5", label: "€ 60 tot € 150", value: 100 },
        { id: "t6", label: "Meer dan € 150", value: 250 }
      ]
    },
    {
      id: "huidig",
      text: "Bij wie zit je vandaag?",
      explain: "Heb je al een betaaloplossing, dan zetten we je huidige aanbieder in de lijst in de kijker. Zo zie je meteen of overstappen iets kan opleveren.",
      options: [
        { id: "geen", label: "Nog bij niemand, ik start" },
        { id: "worldline", label: "Worldline" },
        { id: "ccv", label: "CCV" },
        { id: "sumup", label: "SumUp" },
        { id: "mypos", label: "myPOS" },
        { id: "viva", label: "Viva.com" },
        { id: "bancontactpro", label: "Bancontact Pro (QR-code)" },
        { id: "andere", label: "Een andere aanbieder of via mijn bank" }
      ]
    }
  ],

  typeLabels: { vast: "vaste terminal", mobiel: "mobiele terminal", zonder: "zonder toestel", beide: "terminal of smartphone" },

  /*
   * Aanbieders. Alle tarieven nagekeken op de datum in "checkedOn".
   */
  providers: [
    {
      id: "worldline",
      name: "Worldline",
      plans: [
        {
          id: "saturn-huur",
          label: "Saturn 1000F2, huur",
          types: ["mobiel", "vast"],
          monthly: [
            { label: "huur van het toestel, service en simkaart inbegrepen", amount: 36 },
            { label: "jaarlijkse compliancekost van € 60, per maand", amount: 5 }
          ],
          debit: { fixed: 0.13 },
          credit: { pct: 0.014, fixed: 0.10 },
          oneOff: [{ label: "Plug & Play-installatie (gewone prijs; op de dag van nakijken tijdelijk gratis)", amount: 65 }],
          notes: [
            "Het toestel kopen kan ook: € 649 zonder btw. Dan komt er een servicecontract bij.",
            "Voor zakelijke kaarten en kaarten van buiten Europa rekent Worldline 1,20% extra.",
            "Worldline vermeldt bij de huur en de transactiekosten niet of de btw inbegrepen is."
          ]
        },
        {
          id: "tap",
          label: "Tap on Mobile, app op je smartphone",
          types: ["smartphone"],
          monthly: [],
          debit: { fixed: 0.13 },
          credit: { pct: 0.014, fixed: 0.10 },
          oneOff: [],
          notes: [
            "Geen maandelijkse kosten en geen activatiekost. Je hebt een Android-toestel of iPhone met NFC nodig.",
            "Alleen contactloze betalingen.",
            "Worldline vermeldt 'vanaf € 0,13 per transactie'. De tarieven per kaartsoort komen van de pagina van KBC, dat Tap on Mobile van Worldline aanbiedt.",
            "We keken niet na of de jaarlijkse compliancekost van Worldline ook voor de app geldt."
          ]
        }
      ],
      onRequest: { online: "Worldline biedt ook online betalingen aan. De tarieven daarvoor keken we niet na op de site van Worldline." },
      sources: [
        { label: "worldline.com, pagina Tap on Mobile", url: "https://worldline.com/nl-be/home/main-navigation/solutions/merchants/all-in-one-solutions/in-store/worldline-tap-on-mobile" },
        { label: "kbc.be, pagina Tap on Mobile (tarieven per kaartsoort)", url: "https://www.kbc.be/ondernemen/nl/product/betalen-en-betaald-worden/betalingen/ontvangen/tap-on-mobile.html" },
        { label: "worldline.com, pagina Saturn 1000F2", url: "https://worldline.com/nl-be/home/main-navigation/solutions/merchants/all-in-one-solutions/in-store/saturn1000f2-all-in-one" }
      ]
    },
    {
      id: "ccv",
      name: "CCV",
      plans: [
        {
          id: "a77-huur",
          label: "CCV Compact A77, huur",
          types: ["mobiel"],
          monthly: [{ label: "huur van het toestel", amount: 29.35 }],
          debit: {
            tiers: [
              { upTo: 99, amount: 0.240 },
              { upTo: 199, amount: 0.188 },
              { upTo: 399, amount: 0.140 },
              { upTo: 749, amount: 0.116 },
              { upTo: 1099, amount: 0.100 },
              { upTo: 2499, amount: 0.082 },
              { upTo: null, amount: 0.075 }
            ],
            small: { maxTicket: 5, free: 1000, after: 0.02 }
          },
          credit: { pct: 0.0125, fixed: 0 },
          oneOff: [
            { label: "eenmalige kost volgens de huurpagina", amount: 69 },
            { label: "stabiliteitstoeslag", amount: 27.5 }
          ],
          notes: [
            "De prijs per debetbetaling hangt af van je aantal betalingen in die maand: van € 0,240 onder 100 betalingen tot € 0,075 vanaf 2.500.",
            "De eerste 1.000 Bancontact-betalingen tot € 5 per maand zijn gratis. We passen dat toe als je gemiddelde ticket onder € 5 ligt.",
            "Kredietkaarten: 'vanaf 1,25%' binnen Europa. We rekenen met 1,25%.",
            "Huurcontract van 12 maanden. CCV vermeldt niet of de prijzen zonder btw zijn."
          ]
        },
        {
          id: "duobase-huur",
          label: "CCV Duo-Base, huur",
          types: ["vast"],
          monthly: [{ label: "huur van het toestel", amount: 42.85 }],
          debit: {
            tiers: [
              { upTo: 99, amount: 0.240 },
              { upTo: 199, amount: 0.188 },
              { upTo: 399, amount: 0.140 },
              { upTo: 749, amount: 0.116 },
              { upTo: 1099, amount: 0.100 },
              { upTo: 2499, amount: 0.082 },
              { upTo: null, amount: 0.075 }
            ],
            small: { maxTicket: 5, free: 1000, after: 0.02 }
          },
          credit: { pct: 0.0125, fixed: 0 },
          oneOff: [
            { label: "eenmalige kost volgens de huurpagina", amount: 144 },
            { label: "stabiliteitstoeslag", amount: 27.5 }
          ],
          notes: [
            "Huurprijs 'vanaf € 42,85' per maand. We rekenen met € 42,85.",
            "De prijs per debetbetaling hangt af van je aantal betalingen in die maand: van € 0,240 onder 100 betalingen tot € 0,075 vanaf 2.500.",
            "De eerste 1.000 Bancontact-betalingen tot € 5 per maand zijn gratis. We passen dat toe als je gemiddelde ticket onder € 5 ligt.",
            "Kredietkaarten: 'vanaf 1,25%' binnen Europa. We rekenen met 1,25%.",
            "Huurcontract van 12 maanden. CCV vermeldt niet of de prijzen zonder btw zijn."
          ]
        }
      ],
      sources: [
        { label: "ccv.eu, pagina Betaalmethoden", url: "https://ccv.eu/be-nl/betaaloplossingen/betaalmethoden-terminal" },
        { label: "ccv.eu, pagina Betaalterminal huren", url: "https://www.ccv.eu/be-nl/betaaloplossingen/betaalterminals/betaalterminal-huren" }
      ]
    },
    {
      id: "sumup",
      name: "SumUp",
      plans: [
        {
          id: "payg",
          label: "Betaal naar gebruik",
          types: ["mobiel"],
          monthly: [],
          debit: { pct: 0.0169 },
          credit: { pct: 0.0169, fixed: 0 },
          oneOff: [{ label: "kaartlezer Solo Lite, werkt met je smartphone", amount: 34 }],
          notes: [
            "Geen abonnement en geen contract.",
            "SumUp noemt Bancontact als betaalmethode maar vermeldt er geen apart tarief voor. We rekenen met het tarief voor betaalkaarten.",
            "Andere toestellen: Solo met printer € 109, Terminal € 169."
          ]
        },
        {
          id: "plus",
          label: "Betalingen Plus",
          types: ["mobiel"],
          monthly: [{ label: "abonnement Betalingen Plus", amount: 19 }],
          debit: { pct: 0.0099 },
          credit: { pct: 0.0099, fixed: 0 },
          oneOff: [{ label: "kaartlezer Solo Lite, werkt met je smartphone", amount: 34 }],
          notes: [
            "Het abonnement is op elk moment opzegbaar.",
            "Het tarief van 0,99% geldt voor kaarten van particulieren. Zakelijke en premium kaarten, internationale kredietkaarten en American Express kosten 1,69%.",
            "SumUp noemt Bancontact als betaalmethode maar vermeldt er geen apart tarief voor. We rekenen met het tarief voor betaalkaarten.",
            "Andere toestellen: Solo met printer € 109, Terminal € 169."
          ]
        },
        {
          id: "online", channel: "online", label: "Online betalingen",
          monthly: [],
          debit: { pct: 0.025 },
          credit: { pct: 0.025, fixed: 0 },
          oneOff: [],
          notes: ["2,50% per online betaling, met of zonder abonnement.", "SumUp vermeldt niet of je online ook Bancontact kan aanbieden. We rekenen voor alle betalingen met 2,50%. Vraag dit na."]
        }
      ],
      sources: [
        { label: "sumup.com, pagina Prijzen", url: "https://www.sumup.com/nl-be/prijzen/" }
      ]
    },
    {
      id: "mypos",
      name: "myPOS",
      plans: [
        {
          id: "one",
          label: "One",
          types: ["mobiel", "smartphone"],
          monthly: [],
          debit: { pct: 0.0149 },
          credit: { pct: 0.0149, fixed: 0 },
          oneOff: null,
          notes: [
            "Geen maandelijkse kosten. Tap to Pay op je telefoon is inbegrepen; daarvoor heb je geen toestel nodig.",
            "Andere kaarten, zoals zakelijke kaarten en American Express: 2,69%.",
            "myPOS vermeldt op de tarievenpagina niet of de prijzen zonder btw zijn."
          ]
        },
        {
          id: "plus",
          label: "Plus",
          types: ["mobiel", "smartphone"],
          monthly: [{ label: "abonnement Plus", amount: 19 }],
          debit: { pct: 0.0099 },
          credit: { pct: 0.0099, fixed: 0 },
          oneOff: null,
          notes: [
            "Geen contract op lange termijn.",
            "Andere kaarten, zoals zakelijke kaarten en American Express: 2,49%.",
            "myPOS vermeldt op de tarievenpagina niet of de prijzen zonder btw zijn."
          ]
        },
        {
          id: "pro",
          label: "Pro",
          types: ["mobiel", "smartphone"],
          monthly: [{ label: "abonnement Pro", amount: 39 }],
          debit: { fixed: 0.12 },
          credit: { pct: 0.0089, fixed: 0 },
          oneOff: null,
          notes: [
            "Het vaste bedrag van € 0,12 geldt voor Bancontact. Andere kaarten van particulieren uit Europa kosten 0,89%.",
            "Andere kaarten, zoals zakelijke kaarten en American Express: 2,29%.",
            "myPOS vermeldt op de tarievenpagina niet of de prijzen zonder btw zijn."
          ]
        },
        {
          id: "one-online", channel: "online", label: "One, online",
          monthly: [],
          debit: { pct: 0.0199, fixed: 0.20 },
          credit: { pct: 0.0199, fixed: 0.20 },
          oneOff: [],
          notes: ["Geen maandelijkse kosten.", "Andere kaarten: 3,19% + € 0,20.", "myPOS vermeldt niet of de prijzen zonder btw zijn."]
        },
        {
          id: "plus-online", channel: "online", label: "Plus, online",
          monthly: [{ label: "abonnement Plus", amount: 19 }],
          debit: { pct: 0.0149, fixed: 0.15 },
          credit: { pct: 0.0149, fixed: 0.15 },
          oneOff: [],
          notes: ["Het abonnement geldt ook voor je betalingen in de zaak. Reken het dus maar één keer als je myPOS voor beide gebruikt.", "Andere kaarten: 2,99% + € 0,15.", "myPOS vermeldt niet of de prijzen zonder btw zijn."]
        },
        {
          id: "pro-online", channel: "online", label: "Pro, online",
          monthly: [{ label: "abonnement Pro", amount: 39 }],
          debit: { pct: 0.005, fixed: 0.12 },
          credit: { pct: 0.0139, fixed: 0.12 },
          oneOff: [],
          notes: ["Het abonnement geldt ook voor je betalingen in de zaak. Reken het dus maar één keer als je myPOS voor beide gebruikt.", "Andere kaarten: 2,79% + € 0,12.", "myPOS vermeldt niet of de prijzen zonder btw zijn."]
        }
      ],
      sources: [
        { label: "mypos.com, pagina Kosten en prijzen", url: "https://www.mypos.com/nl-be/pricing-and-fees" }
      ]
    },
    {
      id: "viva",
      name: "Viva.com",
      plans: [
        {
          id: "default",
          label: "Default-pakket",
          types: null,
          monthly: [{ label: "maandelijkse kost van het Default-pakket", amount: 4.99 }],
          debit: { fixed: 0.14 },
          credit: { pct: 0.0169, fixed: 0 },
          oneOff: null,
          notes: [
            "Er bestaat ook een Zero-pakket zonder maandprijs, maar met een minimumbedrag van € 4,99 per maand. We rekenen daarom met € 4,99.",
            "Zakelijke kaarten hebben een ander tarief. American Express: 2,75%.",
            "Viva.com toont op de tarievenpagina geen toestellen en vermeldt niet of de prijzen zonder btw zijn. Vraag na welke vaste en mobiele toestellen er zijn."
          ]
        },
        {
          id: "online", channel: "online", label: "Online betalingen",
          monthly: [{ label: "maandelijkse kost van het Default-pakket", amount: 4.99 }],
          debit: { fixed: 0.37 },
          credit: { pct: 0.0219, fixed: 0.24 },
          oneOff: [],
          notes: ["Het pakket geldt ook voor je betalingen in de zaak. Reken het dus maar één keer als je Viva.com voor beide gebruikt.", "Sommige webshop-plug-ins kosten volgens Viva.com 0,35% extra.", "Zakelijke kaarten en kaarten van buiten Europa hebben een ander tarief."]
        }
      ],
      sources: [
        { label: "viva.com, pagina Tarieven (geldig vanaf 16/09/2026)", url: "https://www.viva.com/nl-be/pricing" }
      ]
    },
    {
      id: "bancontactpro",
      name: "Bancontact Pro",
      plans: [
        {
          id: "qr",
          label: "QR-code, zonder toestel",
          types: ["qr"],
          debitOnly: true,
          monthly: [{ label: "jaarlijkse kost van € 18, per maand", amount: 1.5 }],
          debit: { fixed: 0.06 },
          credit: { pct: 0, fixed: 0 },
          oneOff: [],
          notes: [
            "Je klant scant een QR-code met zijn bankapp of de Bancontact Pay-app en betaalt met Bancontact of Wero.",
            "Aanvaardt geen kaarten en dus ook geen kredietkaarten. We rekenen alsof al je klanten met de QR-code betalen.",
            "Prijzen zonder btw. Maximaal € 1.500 per betaling via de Bancontact Pay-app, volgens Belfius.",
            "Je vraagt het contract aan via je bank of bij Bancontact Company."
          ]
        }
      ],
      sources: [
        { label: "belfius.be, pagina Bancontact Pro", url: "https://www.belfius.be/professional/nl/producten/betaalmiddelen/betaaloplossingen/payconiq/index.aspx" },
        { label: "bnpparibasfortis.be, pagina Wero en Bancontact", url: "https://www.bnpparibasfortis.be/nl/public/ondernemers/dagelijks-bankieren/betalingen/betaalsystemen/wero-zakelijk" }
      ]
    },
    {
      id: "mollie",
      name: "Mollie",
      onRequest: {
        winkel: "Mollie publiceert tarieven voor betalingen in de zaak, maar op de pagina die we konden nakijken staat geen tarief voor Bancontact aan de terminal. Zonder dat tarief rekenen we niets uit.",
        online: "Op de internationale prijspagina van Mollie staat voor Bancontact 1,40% + € 0,25 en voor kaarten van particulieren uit Europa 1,80% + € 0,25. Andere bronnen noemen voor Belgische accounts een vast bedrag van € 0,39 per Bancontact-betaling. We konden niet bevestigen welk tarief voor jou geldt en rekenen daarom niets uit."
      },
      sources: [{ label: "mollie.com, pagina Pricing", url: "https://www.mollie.com/pricing" }]
    },
    {
      id: "stripe",
      name: "Stripe",
      onRequest: { online: "Stripe aanvaardt Bancontact en kaarten voor Belgische ondernemingen. Het tarief voor België konden we niet nakijken op de site van Stripe." },
      sources: [{ label: "docs.stripe.com, pagina Bancontact", url: "https://docs.stripe.com/payments/bancontact" }]
    },
    {
      id: "axepta",
      name: "Axepta BNP Paribas",
      onRequest: {
        winkel: "Biedt via BNP Paribas Fortis de formule All-in-One Grow aan: een vast bedrag van 35, 55, 75 of 115 euro per maand voor de huur van de terminal met een bepaald transactievolume. Welk volume bij welk bedrag hoort, staat niet op de site. Er is ook de app Axepta BNP Paribas Soft voor je smartphone: gratis, met een minimumfactuur van 5 euro per maand; de transactiekosten staan niet op de site.",
        online: "Biedt ook betaaloplossingen voor webshops aan. De tarieven staan niet op de site van BNP Paribas Fortis."
      },
      sources: [{ label: "bnpparibasfortis.be, pagina Betaalterminal", url: "https://www.bnpparibasfortis.be/nl/public/ondernemers/dagelijks-bankieren/betalingen/betaalsystemen/betaalterminal" }]
    }
  ]
};
