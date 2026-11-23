/*
 * Betaalterminalkiezer: alle teksten, vragen, antwoorden en tarieven.
 * Pas hier aan wat je wil wijzigen; quiz.js bevat alleen de werking.
 *
 * TARIEVEN
 * - Elk tarief komt van de site van de aanbieder zelf. Bron en datum staan bij
 *   elke aanbieder onder "sources".
 * - Staat een prijs niet op de site van de aanbieder, dan krijgt die aanbieder
 *   "priceOnRequest: true" en rekent de quiz niets uit.
 * - Wijzig je een tarief, pas dan ook "checkedOn" aan.
 *
 * EEN PLAN (formule van een aanbieder)
 * - types:   ["mobiel"], ["vast"], beide, of null als de aanbieder het toestel
 *            niet op zijn tarievenpagina toont.
 * - monthly: vaste kosten per maand, elk met een label.
 * - debit:   kost per betaling met Bancontact of debetkaart.
 *              { fixed: 0.13 }            vast bedrag per betaling
 *              { pct: 0.0169 }            percentage van het bedrag
 *              { tiers: [...], small: {...} }  staffel op het aantal betalingen
 * - credit:  kost per betaling met kredietkaart: { pct, fixed }.
 * - oneOff:  eenmalige kosten (niet in de maandprijs geteld).
 * - notes:   wat de lezer bij de berekening moet weten.
 */
window.QUIZ_CONFIG = {
  storageKey: "btk-calculator-v1",
  checkedOn: "23 november 2026",

  /* Aannames van de berekening. Zichtbaar op de resultaatpagina. */
  assumptions: {
    debitShare: 0.9 /* deel van de betalingen met Bancontact of debetkaart; de rest is kredietkaart */
  },

  start: {
    title: "Wat kost een betaalterminal jou per maand?",
    subtitle: "Zes korte vragen over je zaak. Je ziet per aanbieder de geschatte maandkost, met de berekening erbij.",
    button: "Bereken mijn maandkost",
    note: "6 vragen · 1 minuut · geen gegevens nodig",
    resume: "Ga verder waar je gebleven was"
  },

  labels: {
    progress: "Vraag {n} van {total}",
    explain: "Waarom vragen we dit?",
    previous: "Vorige",
    next: "Volgende",
    restart: "Opnieuw berekenen",
    resultTitle: "Jouw geschatte maandkost per aanbieder",
    resultIntro: "Gerekend met {n} betalingen per maand van gemiddeld {ticket}, samen {turnover} omzet met de kaart.",
    top3Title: "De drie voordeligste voor jouw zaak",
    rank: "Nummer {n}",
    perMonth: "per maand",
    shareOfTurnover: "{pct} van je kaartomzet",
    oneOff: "Eenmalig: {amount}",
    oneOffUnknown: "Prijs van het toestel staat niet op de tarievenpagina",
    allTitle: "Alle aanbieders met publieke tarieven",
    showCalc: "Bekijk de berekening",
    calcFixed: "Vaste kosten: {label}",
    calcDebitFixed: "{n} betalingen met Bancontact of debetkaart × {rate}",
    calcDebitPct: "{rate} op {amount} met Bancontact of debetkaart",
    calcDebitFree: "{n} Bancontact-betalingen tot € 5: gratis",
    calcDebitSmallExtra: "{n} Bancontact-betalingen tot € 5 boven de eerste {free} × {rate}",
    calcCreditPct: "{rate} op {amount} met kredietkaart",
    calcCreditFixed: "{n} betalingen met kredietkaart × {rate}",
    calcTotal: "Geschat per maand",
    calcOneOff: "Eenmalig: {label}",
    sources: "Bron",
    notFit: "Past niet bij je keuze: {type}",
    current: "Je huidige aanbieder",
    currentTitle: "Vergelijking met je huidige aanbieder",
    currentCheaper: "Bij {current} kom je met deze tarieven uit op {amount} per maand. De voordeligste aanbieder die bij je keuze past, {best}, kost {bestAmount}. Dat is een verschil van {diff} per maand. Vergelijk dit met je eigen factuur: je betaalt misschien een ouder of onderhandeld tarief.",
    currentBest: "Met deze tarieven is {current} al de voordeligste keuze voor jouw zaak. Vergelijk het bedrag wel met je eigen factuur: je betaalt misschien een ouder tarief.",
    currentUnknown: "Van je huidige aanbieder hebben we geen publieke tarieven. Leg de bedragen hierboven naast je laatste factuur.",
    onRequestTitle: "Prijs op aanvraag",
    onRequestIntro: "Deze aanbieders publiceren geen volledige tarieven voor België. We schatten niets en tonen hen daarom zonder bedrag.",
    notesTitle: "Goed om te weten voor jouw zaak",
    checked: "Tarieven nagekeken op {date}.",
    assumptionsTitle: "Zo rekenden we",
    assumptionsList: [
      "Het aantal betalingen is je kaartomzet gedeeld door je gemiddelde ticket.",
      "We nemen aan dat {debit} van je betalingen met Bancontact of een debetkaart gebeurt en {credit} met een kredietkaart van een particulier uit Europa. Zakelijke kaarten en kaarten van buiten Europa kosten bij elke aanbieder meer.",
      "Per aanbieder tonen we de formule die voor jouw cijfers het goedkoopst uitkomt.",
      "Eenmalige kosten zoals de aankoop van het toestel staan apart en zitten niet in de maandprijs.",
      "Tijdelijke kortingen en acties tellen niet mee.",
      "De meeste bedragen zijn zonder btw. Bij sommige aanbieders staat niet op de site of de btw inbegrepen is."
    ],
    disclaimer: "Dit is een schatting op basis van publieke tarieven, geen offerte. De vermelde bedrijven zijn geen partner van deze site en hebben de teksten niet bevestigd. Controleer de prijs altijd bij de aanbieder."
  },

  cta: {
    label: "Bekijk de aanbieders en vraag offertes aan",
    url: "betaalterminals.html"
  },

  /*
   * Vragen. "value" is het getal waarmee we rekenen.
   * "note" bij een antwoord verschijnt op de resultaatpagina.
   */
  questions: [
    {
      id: "sector",
      text: "In welke sector werk je?",
      explain: "De sector verandert de prijs niet. We gebruiken hem om je onderaan het resultaat te wijzen op wat voor jouw soort zaak telt, zoals de geregistreerde kassa in de horeca.",
      options: [
        { id: "horeca", label: "Horeca (café, restaurant, frituur)", note: "In de horeca kies je de terminal best samen met je kassa. Wie maaltijden serveert, heeft vanaf een bepaalde omzet een geregistreerd kassasysteem nodig. Bekijk de kassasystemen op deze site en vraag je boekhouder of de regel voor jou geldt." },
        { id: "voeding", label: "Voedingswinkel (bakker, slager, kruidenier)", note: "Veel kleine bedragen? Dan weegt een vast bedrag per betaling zwaarder door. Kijk in de berekening welke aanbieder kleine Bancontact-betalingen goedkoper of gratis verwerkt." },
        { id: "winkel", label: "Winkel (kleding, cadeau, doe-het-zelf)" },
        { id: "diensten", label: "Diensten en vrije beroepen" },
        { id: "zorg", label: "Schoonheid en zorg (kapper, kinesist)" },
        { id: "markt", label: "Markt, foodtruck of evenementen", note: "Werk je op verplaatsing, kies dan een toestel met een eigen simkaart of een goede verbinding via je telefoon. Vraag ook hoe lang de batterij meegaat." },
        { id: "andere", label: "Iets anders" }
      ]
    },
    {
      id: "omzet",
      text: "Hoeveel omzet ontvang je per maand met de kaart?",
      explain: "Tel alleen wat klanten met Bancontact, debetkaart of kredietkaart betalen. Start je nog, kies dan wat je verwacht. We rekenen met het midden van de schijf.",
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
      id: "ticket",
      text: "Hoeveel betaalt een klant gemiddeld per keer?",
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
      id: "type",
      text: "Wil je een vaste of een mobiele terminal?",
      explain: "Een vaste terminal staat aan de toonbank en werkt via je internetkabel. Een mobiele terminal neem je mee naar de tafel, het terras of de klant en werkt via wifi of een simkaart.",
      options: [
        { id: "vast", label: "Vast, aan de toonbank" },
        { id: "mobiel", label: "Mobiel, om mee te nemen" },
        { id: "beide", label: "Maakt mij niet uit" }
      ]
    },
    {
      id: "kassa",
      text: "Moet de terminal samenwerken met je kassa?",
      explain: "Met een koppeling stuurt de kassa het bedrag zelf naar de terminal. Je tikt niets twee keer in en maakt minder fouten. Niet elke terminal werkt met elke kassa.",
      options: [
        { id: "ja", label: "Ja, ik heb een kassa of wil er een", note: "Je wil een koppeling met je kassa. Vraag elke aanbieder vóór je tekent of zijn terminal met jouw kassasysteem werkt en wat de koppeling kost. Die kost zit niet in de bedragen hierboven. Op de pagina Kassasystemen vind je kassa's met een eigen betaaloplossing." },
        { id: "nee", label: "Nee, de terminal staat los" },
        { id: "weetniet", label: "Dat weet ik nog niet", note: "Twijfel je over een kassa? Lees eerst het blogartikel over kassa en terminal koppelen. Een losse terminal kan je later meestal vervangen zonder hoge kosten." }
      ]
    },
    {
      id: "huidig",
      text: "Bij wie zit je vandaag?",
      explain: "Heb je al een terminal, dan zetten we je huidige aanbieder in de lijst in de kijker. Zo zie je meteen of overstappen iets kan opleveren.",
      options: [
        { id: "geen", label: "Nog bij niemand, ik start" },
        { id: "worldline", label: "Worldline" },
        { id: "ccv", label: "CCV" },
        { id: "sumup", label: "SumUp" },
        { id: "mypos", label: "myPOS" },
        { id: "viva", label: "Viva.com" },
        { id: "andere", label: "Een andere aanbieder of via mijn bank" }
      ]
    }
  ],

  typeLabels: { vast: "vaste terminal", mobiel: "mobiele terminal" },

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
        }
      ],
      sources: [
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
          types: ["mobiel"],
          monthly: [],
          debit: { pct: 0.0149 },
          credit: { pct: 0.0149, fixed: 0 },
          oneOff: null,
          notes: [
            "Geen maandelijkse kosten.",
            "Andere kaarten, zoals zakelijke kaarten en American Express: 2,69%.",
            "myPOS vermeldt op de tarievenpagina niet of de prijzen zonder btw zijn."
          ]
        },
        {
          id: "plus",
          label: "Plus",
          types: ["mobiel"],
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
          types: ["mobiel"],
          monthly: [{ label: "abonnement Pro", amount: 39 }],
          debit: { fixed: 0.12 },
          credit: { pct: 0.0089, fixed: 0 },
          oneOff: null,
          notes: [
            "Het vaste bedrag van € 0,12 geldt voor Bancontact. Andere kaarten van particulieren uit Europa kosten 0,89%.",
            "Andere kaarten, zoals zakelijke kaarten en American Express: 2,29%.",
            "myPOS vermeldt op de tarievenpagina niet of de prijzen zonder btw zijn."
          ]
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
        }
      ],
      sources: [
        { label: "viva.com, pagina Tarieven (geldig vanaf 16/09/2026)", url: "https://www.viva.com/nl-be/pricing" }
      ]
    },
    {
      id: "mollie",
      name: "Mollie",
      priceOnRequest: true,
      requestNote: "Mollie publiceert tarieven voor betalingen in de winkel, maar op de pagina die we konden nakijken staat geen tarief voor Bancontact aan de terminal. Zonder dat tarief rekenen we niets uit.",
      sources: [{ label: "mollie.com, pagina Pricing", url: "https://www.mollie.com/pricing" }]
    },
    {
      id: "axepta",
      name: "Axepta BNP Paribas",
      priceOnRequest: true,
      requestNote: "Biedt via BNP Paribas Fortis de formule All-in-One Grow aan: een vast bedrag van 35, 55, 75 of 115 euro per maand voor de huur van de terminal met een bepaald transactievolume. Welk volume bij welk bedrag hoort, staat niet op de site.",
      sources: [{ label: "bnpparibasfortis.be, pagina Betaalterminal", url: "https://www.bnpparibasfortis.be/nl/public/ondernemers/dagelijks-bankieren/betalingen/betaalsystemen/betaalterminal" }]
    }
  ]
};
