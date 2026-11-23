/* Betaaloplossingkiezer: werking van de rekenquiz. Teksten en tarieven staan in quiz-config.js. */
(function () {
  "use strict";

  /* ---------- Berekening ---------- */

  function round2(n) { return Math.round(n * 100) / 100; }

  function optionOf(cfg, qid, answer) {
    var q = cfg.questions.filter(function (x) { return x.id === qid; })[0];
    if (!q) { return null; }
    return q.options.filter(function (o) { return o.id === answer; })[0] || null;
  }

  /* Kost van één formule. Geeft de regels van de berekening terug als gegevens; de tekst maakt de weergave. */
  function planCost(plan, base) {
    var input = base;
    if (plan.debitOnly) {
      input = { turnover: base.turnover, ticket: base.ticket, n: base.n, nDebit: base.n, nCredit: 0, debitTurnover: base.turnover, creditTurnover: 0 };
    }
    var lines = [];
    var total = 0;

    (plan.monthly || []).forEach(function (m) {
      lines.push({ kind: "fixed", label: m.label, amount: m.amount });
      total += m.amount;
    });

    var d = plan.debit;
    if (input.nDebit > 0) {
      if (d.tiers) {
        if (d.small && input.ticket <= d.small.maxTicket) {
          var free = Math.min(input.nDebit, d.small.free);
          var paid = input.nDebit - free;
          lines.push({ kind: "debitFree", n: free, amount: 0 });
          if (paid > 0) {
            lines.push({ kind: "debitSmallExtra", n: paid, free: d.small.free, rate: d.small.after, amount: round2(paid * d.small.after) });
            total += paid * d.small.after;
          }
        } else {
          var tier = d.tiers.filter(function (t) { return t.upTo === null || input.nDebit <= t.upTo; })[0];
          lines.push({ kind: "debitFixed", n: input.nDebit, rate: tier.amount, amount: round2(input.nDebit * tier.amount) });
          total += input.nDebit * tier.amount;
        }
      } else {
        if (d.pct) {
          lines.push({ kind: "debitPct", rate: d.pct, base: input.debitTurnover, amount: round2(input.debitTurnover * d.pct) });
          total += input.debitTurnover * d.pct;
        }
        if (d.fixed) {
          lines.push({ kind: "debitFixed", n: input.nDebit, rate: d.fixed, amount: round2(input.nDebit * d.fixed) });
          total += input.nDebit * d.fixed;
        }
      }
    }

    var c = plan.credit;
    if (input.nCredit > 0) {
      if (c.pct) {
        lines.push({ kind: "creditPct", rate: c.pct, base: input.creditTurnover, amount: round2(input.creditTurnover * c.pct) });
        total += input.creditTurnover * c.pct;
      }
      if (c.fixed) {
        lines.push({ kind: "creditFixed", n: input.nCredit, rate: c.fixed, amount: round2(input.nCredit * c.fixed) });
        total += input.nCredit * c.fixed;
      }
    }

    var oneOff = plan.oneOff ? plan.oneOff.reduce(function (s, o) { return s + o.amount; }, 0) : null;
    return { plan: plan, lines: lines, monthly: round2(total), oneOff: oneOff };
  }

  function fitsType(plan, allowed) {
    if (!allowed || !plan.types) { return true; }
    return plan.types.some(function (t) { return allowed.indexOf(t) !== -1; });
  }

  /* De vragen die bij het gekozen kanaal horen. */
  function stepsFor(answers, cfg) {
    var k = optionOf(cfg, "kanaal", answers.kanaal);
    var chans = k ? k.channels : [];
    return cfg.questions.filter(function (q) { return !q.when || chans.indexOf(q.when) !== -1; });
  }

  function computeChannel(id, answers, cfg) {
    var ch = cfg.channels[id];
    var turnover = optionOf(cfg, ch.turnover, answers[ch.turnover]).value;
    var ticket = optionOf(cfg, ch.ticket, answers[ch.ticket]).value;
    var share = cfg.assumptions.debitShare[id];
    var n = Math.max(1, Math.round(turnover / ticket));
    var nDebit = Math.round(n * share);
    var input = {
      turnover: turnover, ticket: ticket, n: n,
      nDebit: nDebit, nCredit: n - nDebit,
      debitTurnover: round2(turnover * share), creditTurnover: round2(turnover * (1 - share))
    };
    var typeOpt = id === "winkel" ? optionOf(cfg, "type", answers.type) : null;
    var allowed = typeOpt ? typeOpt.types : null;

    var rows = [], onRequest = [];
    cfg.providers.forEach(function (p) {
      if (p.onRequest && p.onRequest[id]) { onRequest.push({ provider: p, note: p.onRequest[id] }); }
      var plans = (p.plans || []).filter(function (pl) { return (pl.channel || "winkel") === id; });
      if (!plans.length) { return; }
      var costs = plans.map(function (pl) {
        var c = planCost(pl, input);
        c.fits = fitsType(pl, allowed);
        return c;
      });
      var pool = costs.filter(function (c) { return c.fits; });
      var fits = pool.length > 0;
      if (!fits) { pool = costs; }
      var best = pool.reduce(function (a, b) { return b.monthly < a.monthly ? b : a; });
      rows.push({
        provider: p, plan: best.plan, lines: best.lines, monthly: best.monthly, oneOff: best.oneOff,
        fits: fits, isCurrent: answers.huidig === p.id,
        share: turnover ? best.monthly / turnover : 0
      });
    });

    rows.sort(function (a, b) { return (a.monthly - b.monthly) || a.provider.name.localeCompare(b.provider.name); });
    var top3 = rows.filter(function (r) { return r.fits; }).slice(0, 3);

    var current = null;
    if (answers.huidig && answers.huidig !== "geen") {
      var mine = rows.filter(function (r) { return r.isCurrent; })[0];
      if (!mine) { current = { status: "unknown" }; }
      else if (!top3.length || top3[0] === mine) { current = { status: "best", row: mine }; }
      else { current = { status: "cheaper", row: mine, best: top3[0], diff: round2(mine.monthly - top3[0].monthly) }; }
    }
    return { id: id, input: input, type: answers.type, rows: rows, top3: top3, onRequest: onRequest, current: current };
  }

  function compute(answers, cfg) {
    var chans = optionOf(cfg, "kanaal", answers.kanaal).channels;
    var notes = [];
    stepsFor(answers, cfg).forEach(function (q) {
      var o = optionOf(cfg, q.id, answers[q.id]);
      if (o && o.note) { notes.push(o.note); }
    });
    return { channels: chans.map(function (id) { return computeChannel(id, answers, cfg); }), notes: notes };
  }

  if (typeof module !== "undefined") { module.exports = { compute: compute, planCost: planCost, stepsFor: stepsFor }; }
  if (typeof document === "undefined") { return; }

  /* ---------- Opslag ---------- */

  var cfg = window.QUIZ_CONFIG;
  var root = document.getElementById("quiz");
  if (!cfg || !root) { return; }

  var steps = cfg.questions;
  var state = { i: -1, answers: {} };
  /* Zolang de eerste vraag niet beantwoord is, tellen we de vragen voor een zaak zonder webshop. */
  function syncSteps() { steps = stepsFor(state.answers.kanaal ? state.answers : { kanaal: "winkel" }, cfg); }

  function load() {
    try {
      var saved = JSON.parse(localStorage.getItem(cfg.storageKey));
      if (saved && typeof saved.i === "number" && saved.answers) { state = saved; }
    } catch (e) { /* geen opslag beschikbaar: de quiz werkt zonder */ }
  }
  function save() {
    try { localStorage.setItem(cfg.storageKey, JSON.stringify(state)); } catch (e) { /* idem */ }
  }
  function reset() {
    state = { i: -1, answers: {} };
    try { localStorage.removeItem(cfg.storageKey); } catch (e) { /* idem */ }
  }
  function complete() {
    return steps.every(function (s) { return optionOf(cfg, s.id, state.answers[s.id]); });
  }

  /* ---------- Hulpjes ---------- */

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) { n.className = cls; }
    if (text != null) { n.textContent = text; }
    return n;
  }
  function fill(tpl, vals) {
    return tpl.replace(/\{(\w+)\}/g, function (m, k) { return vals[k] != null ? vals[k] : m; });
  }
  function num(n, dec) {
    var parts = n.toFixed(dec).split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    return parts.join(",");
  }
  function eur(n) { return "€ " + num(n, 2); }
  function eur0(n) { return "€ " + num(n, n % 1 ? 2 : 0); }
  function rate(n) { return "€ " + num(n, Math.round(n * 1000) % 10 ? 3 : 2); }
  function pct(n) { return String(parseFloat((n * 100).toFixed(2))).replace(".", ",") + "%"; }
  var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function go(i) {
    syncSteps();
    state.i = Math.min(i, steps.length);
    save();
    render();
    root.scrollIntoView({ block: "nearest", behavior: reduced ? "auto" : "smooth" });
    root.focus({ preventScroll: true });
  }

  /* ---------- Schermen ---------- */

  function renderStart() {
    var box = el("div", "quiz-start");
    box.appendChild(el("h1", null, cfg.start.title));
    box.appendChild(el("p", "lead", cfg.start.subtitle));
    var hasProgress = Object.keys(state.answers).length > 0;
    var b = el("button", "btn primary big", hasProgress ? cfg.start.resume : cfg.start.button);
    b.type = "button";
    b.onclick = function () {
      syncSteps();
      var next = 0;
      while (next < steps.length && state.answers[steps[next].id] != null) { next++; }
      go(hasProgress ? Math.min(next, steps.length) : 0);
    };
    box.appendChild(b);
    box.appendChild(el("p", "quiz-note", cfg.start.note));
    return box;
  }

  function renderQuestion() {
    var step = steps[state.i];
    var box = el("div", "quiz-card");

    var bar = el("div", "quiz-progress");
    bar.setAttribute("role", "progressbar");
    bar.setAttribute("aria-valuemin", "0");
    bar.setAttribute("aria-valuemax", String(steps.length));
    bar.setAttribute("aria-valuenow", String(state.i));
    var fillBar = el("i");
    fillBar.style.width = (state.i / steps.length * 100) + "%";
    bar.appendChild(fillBar);
    box.appendChild(bar);

    box.appendChild(el("p", "quiz-count", fill(cfg.labels.progress, { n: state.i + 1, total: steps.length })));
    box.appendChild(el("h2", "quiz-question", step.text));

    var det = el("details", "quiz-explain");
    det.appendChild(el("summary", null, cfg.labels.explain));
    det.appendChild(el("p", null, step.explain));
    box.appendChild(det);

    var current = state.answers[step.id];
    var list = el("div", "quiz-options");
    step.options.forEach(function (o) {
      var b = el("button", "quiz-option" + (current === o.id ? " selected" : ""), o.label);
      b.type = "button";
      b.setAttribute("aria-pressed", current === o.id ? "true" : "false");
      b.onclick = function () {
        Array.prototype.forEach.call(list.children, function (c) { c.classList.remove("selected"); });
        b.classList.add("selected");
        state.answers[step.id] = o.id;
        save();
        setTimeout(function () { go(state.i + 1); }, reduced ? 0 : 220);
      };
      list.appendChild(b);
    });
    box.appendChild(list);

    var nav = el("div", "quiz-nav");
    var prev = el("button", "btn ghost", cfg.labels.previous);
    prev.type = "button";
    prev.onclick = function () { go(state.i - 1); };
    nav.appendChild(prev);
    if (current != null) {
      var next = el("button", "btn", cfg.labels.next);
      next.type = "button";
      next.onclick = function () { go(state.i + 1); };
      nav.appendChild(next);
    }
    box.appendChild(nav);
    return box;
  }

  function lineText(l, ch) {
    var L = cfg.labels, D = cfg.channels[ch].debit, C = cfg.channels[ch].credit;
    switch (l.kind) {
      case "fixed": return fill(L.calcFixed, { label: l.label });
      case "debitFixed": return fill(L.calcDebitFixed, { n: num(l.n, 0), rate: rate(l.rate), debit: D });
      case "debitPct": return fill(L.calcDebitPct, { rate: pct(l.rate), amount: eur0(l.base), debit: D });
      case "debitFree": return fill(L.calcDebitFree, { n: num(l.n, 0) });
      case "debitSmallExtra": return fill(L.calcDebitSmallExtra, { n: num(l.n, 0), free: num(l.free, 0), rate: rate(l.rate) });
      case "creditPct": return fill(L.calcCreditPct, { rate: pct(l.rate), amount: eur0(l.base), credit: C });
      case "creditFixed": return fill(L.calcCreditFixed, { n: num(l.n, 0), rate: rate(l.rate), credit: C });
    }
    return "";
  }

  function oneOffText(r) {
    if (r.oneOff == null) { return cfg.labels.oneOffUnknown; }
    if (r.oneOff === 0) { return cfg.labels.oneOffNone; }
    return fill(cfg.labels.oneOff, { amount: eur(r.oneOff) });
  }

  function calcBox(r, ch) {
    var box = el("div", "calcbox");
    var table = el("table");
    r.lines.forEach(function (l) {
      var tr = el("tr");
      tr.appendChild(el("td", null, lineText(l, ch)));
      tr.appendChild(el("td", null, eur(l.amount)));
      table.appendChild(tr);
    });
    var sum = el("tr", "sum");
    sum.appendChild(el("td", null, cfg.labels.calcTotal));
    sum.appendChild(el("td", null, eur(r.monthly)));
    table.appendChild(sum);
    box.appendChild(table);

    var ul = el("ul");
    if (r.plan.oneOff && !r.plan.oneOff.length && (r.plan.channel || "winkel") === "winkel") {
      ul.appendChild(el("li", null, cfg.labels.oneOffNone + "."));
    }
    if (r.plan.oneOff) {
      r.plan.oneOff.forEach(function (o) {
        ul.appendChild(el("li", null, fill(cfg.labels.calcOneOff, { label: o.label }) + ": " + eur(o.amount)));
      });
    } else {
      ul.appendChild(el("li", null, cfg.labels.oneOffUnknown + "."));
    }
    (r.plan.notes || []).forEach(function (n) { ul.appendChild(el("li", null, n)); });
    box.appendChild(ul);
    box.appendChild(sourceLine(r.provider));
    return box;
  }

  function sourceLine(p) {
    var src = el("p", "src", cfg.labels.sources + ": ");
    p.sources.forEach(function (s, i) {
      if (i) { src.appendChild(document.createTextNode("; ")); }
      var a = el("a", null, s.label);
      a.href = s.url; a.rel = "noopener";
      src.appendChild(a);
    });
    src.appendChild(document.createTextNode(". " + fill(cfg.labels.checked, { date: cfg.checkedOn })));
    return src;
  }

  function renderChannel(c, box, multi) {
    var L = cfg.labels, ch = cfg.channels[c.id];
    var top = el("section", "result-block");
    if (multi) { top.appendChild(el("h3", "chan", ch.title)); }
    top.appendChild(el("p", "chan-intro", fill(ch.intro, { n: num(c.input.n, 0), ticket: eur0(c.input.ticket), turnover: eur0(c.input.turnover) })));
    top.appendChild(el(multi ? "h4" : "h3", "sub", L.top3Title));
    var grid = el("div", "top3");
    c.top3.forEach(function (row, i) {
      var k = el("div", "pick" + (i === 0 ? " first" : ""));
      k.appendChild(el("span", "rank", fill(L.rank, { n: i + 1 })));
      k.appendChild(el("h4", null, row.provider.name));
      k.appendChild(el("p", "plan", row.plan.label));
      var price = el("div", "price", eur(row.monthly) + " ");
      price.appendChild(el("small", null, L.perMonth));
      k.appendChild(price);
      k.appendChild(el("p", "once", fill(L.shareOfTurnover, { pct: pct(Math.round(row.share * 10000) / 10000) })));
      if (c.id === "winkel") { k.appendChild(el("p", "once", oneOffText(row))); }
      grid.appendChild(k);
    });
    top.appendChild(grid);

    top.appendChild(el(multi ? "h4" : "h3", "sub", L.allTitle));
    var rows = el("div", "rows");
    c.rows.forEach(function (row, i) {
      var d = el("details", "row" + (row.isCurrent ? " current" : ""));
      var s = el("summary");
      s.appendChild(el("span", "pos", String(i + 1)));
      var who = el("span", "who");
      who.appendChild(el("b", null, row.provider.name));
      who.appendChild(el("span", null, row.plan.label));
      if (row.isCurrent) { who.appendChild(el("span", "flag you", L.current)); }
      if (!row.fits) { who.appendChild(el("span", "flag", fill(L.notFit, { type: cfg.typeLabels[c.type] }))); }
      s.appendChild(who);
      var amt = el("span", "amt", eur(row.monthly));
      amt.appendChild(el("small", null, L.perMonth));
      s.appendChild(amt);
      s.appendChild(el("span", "more", L.showCalc));
      d.appendChild(s);
      d.appendChild(calcBox(row, c.id));
      if (i === 0) { d.open = true; }
      rows.appendChild(d);
    });
    top.appendChild(rows);

    if (c.onRequest.length) {
      top.appendChild(el(multi ? "h4" : "h3", "sub", L.onRequestTitle));
      top.appendChild(el("p", null, L.onRequestIntro));
      var ul = el("ul", "onrequest");
      c.onRequest.forEach(function (o) {
        var li = el("li");
        li.appendChild(el("b", null, o.provider.name));
        li.appendChild(el("span", null, o.note));
        li.appendChild(sourceLine(o.provider));
        ul.appendChild(li);
      });
      top.appendChild(ul);
    }
    box.appendChild(top);
  }

  function renderResult() {
    var r = compute(state.answers, cfg);
    var L = cfg.labels;
    var box = el("div", "quiz-result");
    var multi = r.channels.length > 1;

    var intro = el("div", "result-intro");
    intro.appendChild(el("h2", null, L.resultTitle));
    var chips = el("ul", "inputs");
    steps.forEach(function (s) { chips.appendChild(el("li", null, optionOf(cfg, s.id, state.answers[s.id]).label)); });
    intro.appendChild(chips);
    box.appendChild(intro);

    r.channels.forEach(function (c) { renderChannel(c, box, multi); });
    box.appendChild(el("p", "checked", fill(L.checked, { date: cfg.checkedOn })));

    var notes = el("div", "result-notes");
    var curTexts = [], unknown = 0;
    r.channels.forEach(function (c) {
      if (!c.current) { return; }
      var title = cfg.channels[c.id].title;
      if (c.current.status === "best") {
        curTexts.push(fill(L.currentBest, { channel: title, current: c.current.row.provider.name }));
      } else if (c.current.status === "cheaper") {
        curTexts.push(fill(L.currentCheaper, {
          channel: title, current: c.current.row.provider.name, amount: eur(c.current.row.monthly),
          best: c.current.best.provider.name, bestAmount: eur(c.current.best.monthly), diff: eur(c.current.diff)
        }));
      } else { unknown++; }
    });
    if (!curTexts.length && unknown) { curTexts.push(L.currentUnknown); }
    if (curTexts.length) {
      var cur = el("section", "note note-info");
      cur.appendChild(el("h3", null, L.currentTitle));
      curTexts.forEach(function (t) { cur.appendChild(el("p", null, t)); });
      notes.appendChild(cur);
    }
    if (r.notes.length) {
      var nb = el("section", "note note-warn");
      nb.appendChild(el("h3", null, L.notesTitle));
      r.notes.forEach(function (t) { nb.appendChild(el("p", null, t)); });
      notes.appendChild(nb);
    }
    if (notes.children.length) { box.appendChild(notes); }

    var how = el("section", "result-block");
    how.appendChild(el("h3", null, L.assumptionsTitle));
    var al = el("ul", "assume");
    var sh = cfg.assumptions.debitShare;
    var shown = r.channels.map(function (c) { return c.id; });
    L.assumptionsList.forEach(function (t) {
      if (t.when && shown.indexOf(t.when) === -1) { return; }
      al.appendChild(el("li", null, fill(t.text || t, {
        debitWinkel: pct(sh.winkel), creditWinkel: pct(1 - sh.winkel),
        debitOnline: pct(sh.online), creditOnline: pct(1 - sh.online)
      })));
    });
    how.appendChild(al);
    box.appendChild(how);

    var actions = el("div", "result-actions");
    r.channels.forEach(function (c, i) {
      var cta = el("a", "btn big" + (i === 0 ? " primary" : ""), cfg.channels[c.id].cta.label);
      cta.href = cfg.channels[c.id].cta.url;
      actions.appendChild(cta);
    });
    var again = el("button", "btn ghost", L.restart);
    again.type = "button";
    again.onclick = function () { reset(); go(-1); };
    actions.appendChild(again);
    box.appendChild(actions);

    box.appendChild(el("p", "disclaimer", L.disclaimer));
    return box;
  }

  function render() {
    syncSteps();
    root.innerHTML = "";
    root.className = "quiz";
    if (state.i >= steps.length && !complete()) { state.i = -1; }
    if (state.i < 0) { root.appendChild(renderStart()); }
    else if (state.i >= steps.length) { root.classList.add("is-result"); root.appendChild(renderResult()); }
    else { root.appendChild(renderQuestion()); }
  }

  load();
  if (state.i > steps.length) { state.i = steps.length; }
  root.setAttribute("tabindex", "-1");
  render();
})();
