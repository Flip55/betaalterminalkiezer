/* Betaalterminalkiezer: werking van de rekenquiz. Teksten en tarieven staan in quiz-config.js. */
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
  function planCost(plan, input) {
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
      } else if (d.fixed != null) {
        lines.push({ kind: "debitFixed", n: input.nDebit, rate: d.fixed, amount: round2(input.nDebit * d.fixed) });
        total += input.nDebit * d.fixed;
      } else {
        lines.push({ kind: "debitPct", rate: d.pct, base: input.debitTurnover, amount: round2(input.debitTurnover * d.pct) });
        total += input.debitTurnover * d.pct;
      }
    }

    var c = plan.credit;
    if (input.nCredit > 0) {
      lines.push({ kind: "creditPct", rate: c.pct, base: input.creditTurnover, amount: round2(input.creditTurnover * c.pct) });
      total += input.creditTurnover * c.pct;
      if (c.fixed) {
        lines.push({ kind: "creditFixed", n: input.nCredit, rate: c.fixed, amount: round2(input.nCredit * c.fixed) });
        total += input.nCredit * c.fixed;
      }
    }

    var oneOff = plan.oneOff ? plan.oneOff.reduce(function (s, o) { return s + o.amount; }, 0) : null;
    return { plan: plan, lines: lines, monthly: round2(total), oneOff: oneOff };
  }

  function fitsType(plan, type) {
    if (type !== "vast" && type !== "mobiel") { return true; }
    if (!plan.types) { return true; }
    return plan.types.indexOf(type) !== -1;
  }

  function compute(answers, cfg) {
    var turnover = optionOf(cfg, "omzet", answers.omzet).value;
    var ticket = optionOf(cfg, "ticket", answers.ticket).value;
    var share = cfg.assumptions.debitShare;
    var n = Math.max(1, Math.round(turnover / ticket));
    var nDebit = Math.round(n * share);
    var input = {
      turnover: turnover, ticket: ticket, n: n,
      nDebit: nDebit, nCredit: n - nDebit,
      debitTurnover: round2(turnover * share), creditTurnover: round2(turnover * (1 - share))
    };
    var type = answers.type;

    var rows = [], onRequest = [];
    cfg.providers.forEach(function (p) {
      if (p.priceOnRequest) { onRequest.push(p); return; }
      var costs = p.plans.map(function (pl) {
        var c = planCost(pl, input);
        c.fits = fitsType(pl, type);
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

    var notes = [];
    cfg.questions.forEach(function (q) {
      var o = optionOf(cfg, q.id, answers[q.id]);
      if (o && o.note) { notes.push(o.note); }
    });

    return { input: input, type: type, rows: rows, top3: top3, onRequest: onRequest, current: current, notes: notes };
  }

  if (typeof module !== "undefined") { module.exports = { compute: compute, planCost: planCost }; }
  if (typeof document === "undefined") { return; }

  /* ---------- Opslag ---------- */

  var cfg = window.QUIZ_CONFIG;
  var root = document.getElementById("quiz");
  if (!cfg || !root) { return; }

  var steps = cfg.questions;
  var state = { i: -1, answers: {} };

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
    state.i = i;
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

  function lineText(l) {
    var L = cfg.labels;
    switch (l.kind) {
      case "fixed": return fill(L.calcFixed, { label: l.label });
      case "debitFixed": return fill(L.calcDebitFixed, { n: num(l.n, 0), rate: rate(l.rate) });
      case "debitPct": return fill(L.calcDebitPct, { rate: pct(l.rate), amount: eur0(l.base) });
      case "debitFree": return fill(L.calcDebitFree, { n: num(l.n, 0) });
      case "debitSmallExtra": return fill(L.calcDebitSmallExtra, { n: num(l.n, 0), free: num(l.free, 0), rate: rate(l.rate) });
      case "creditPct": return fill(L.calcCreditPct, { rate: pct(l.rate), amount: eur0(l.base) });
      case "creditFixed": return fill(L.calcCreditFixed, { n: num(l.n, 0), rate: rate(l.rate) });
    }
    return "";
  }

  function oneOffText(r) {
    if (r.oneOff == null) { return cfg.labels.oneOffUnknown; }
    return fill(cfg.labels.oneOff, { amount: eur(r.oneOff) });
  }

  function calcBox(r) {
    var box = el("div", "calcbox");
    var table = el("table");
    r.lines.forEach(function (l) {
      var tr = el("tr");
      tr.appendChild(el("td", null, lineText(l)));
      tr.appendChild(el("td", null, eur(l.amount)));
      table.appendChild(tr);
    });
    var sum = el("tr", "sum");
    sum.appendChild(el("td", null, cfg.labels.calcTotal));
    sum.appendChild(el("td", null, eur(r.monthly)));
    table.appendChild(sum);
    box.appendChild(table);

    var ul = el("ul");
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

  function renderResult() {
    var r = compute(state.answers, cfg);
    var L = cfg.labels;
    var box = el("div", "quiz-result");

    var intro = el("div", "result-intro");
    intro.appendChild(el("h2", null, L.resultTitle));
    intro.appendChild(el("p", null, fill(L.resultIntro, { n: num(r.input.n, 0), ticket: eur0(r.input.ticket), turnover: eur0(r.input.turnover) })));
    var chips = el("ul", "inputs");
    steps.forEach(function (s) { chips.appendChild(el("li", null, optionOf(cfg, s.id, state.answers[s.id]).label)); });
    intro.appendChild(chips);
    box.appendChild(intro);

    var top = el("section", "result-block");
    top.appendChild(el("h3", null, L.top3Title));
    var grid = el("div", "top3");
    r.top3.forEach(function (row, i) {
      var c = el("div", "pick" + (i === 0 ? " first" : ""));
      c.appendChild(el("span", "rank", fill(L.rank, { n: i + 1 })));
      c.appendChild(el("h4", null, row.provider.name));
      c.appendChild(el("p", "plan", row.plan.label));
      var price = el("div", "price", eur(row.monthly) + " ");
      price.appendChild(el("small", null, L.perMonth));
      c.appendChild(price);
      c.appendChild(el("p", "once", fill(L.shareOfTurnover, { pct: pct(Math.round(row.share * 10000) / 10000) })));
      c.appendChild(el("p", "once", oneOffText(row)));
      grid.appendChild(c);
    });
    top.appendChild(grid);
    box.appendChild(top);

    var all = el("section", "result-block");
    all.appendChild(el("h3", null, L.allTitle));
    var rows = el("div", "rows");
    r.rows.forEach(function (row, i) {
      var d = el("details", "row" + (row.isCurrent ? " current" : ""));
      var s = el("summary");
      s.appendChild(el("span", "pos", String(i + 1)));
      var who = el("span", "who");
      who.appendChild(el("b", null, row.provider.name));
      who.appendChild(el("span", null, row.plan.label));
      if (row.isCurrent) { who.appendChild(el("span", "flag you", L.current)); }
      if (!row.fits) { who.appendChild(el("span", "flag", fill(L.notFit, { type: cfg.typeLabels[r.type] }))); }
      s.appendChild(who);
      var amt = el("span", "amt", eur(row.monthly));
      amt.appendChild(el("small", null, L.perMonth));
      s.appendChild(amt);
      s.appendChild(el("span", "more", L.showCalc));
      d.appendChild(s);
      d.appendChild(calcBox(row));
      if (i === 0) { d.open = true; }
      rows.appendChild(d);
    });
    all.appendChild(rows);
    all.appendChild(el("p", "checked", fill(L.checked, { date: cfg.checkedOn })));
    box.appendChild(all);

    var notes = el("div", "result-notes");
    if (r.current) {
      var cur = el("section", "note note-info");
      cur.appendChild(el("h3", null, L.currentTitle));
      var text = L.currentUnknown;
      if (r.current.status === "best") {
        text = fill(L.currentBest, { current: r.current.row.provider.name });
      } else if (r.current.status === "cheaper") {
        text = fill(L.currentCheaper, {
          current: r.current.row.provider.name, amount: eur(r.current.row.monthly),
          best: r.current.best.provider.name, bestAmount: eur(r.current.best.monthly), diff: eur(r.current.diff)
        });
      }
      cur.appendChild(el("p", null, text));
      notes.appendChild(cur);
    }
    if (r.notes.length) {
      var nb = el("section", "note note-warn");
      nb.appendChild(el("h3", null, L.notesTitle));
      r.notes.forEach(function (t) { nb.appendChild(el("p", null, t)); });
      notes.appendChild(nb);
    }
    if (notes.children.length) { box.appendChild(notes); }

    if (r.onRequest.length) {
      var req = el("section", "result-block");
      req.appendChild(el("h3", null, L.onRequestTitle));
      req.appendChild(el("p", null, L.onRequestIntro));
      var ul = el("ul", "onrequest");
      r.onRequest.forEach(function (p) {
        var li = el("li");
        li.appendChild(el("b", null, p.name));
        li.appendChild(el("span", null, p.requestNote));
        li.appendChild(sourceLine(p));
        ul.appendChild(li);
      });
      req.appendChild(ul);
      box.appendChild(req);
    }

    var how = el("section", "result-block");
    how.appendChild(el("h3", null, L.assumptionsTitle));
    var al = el("ul", "assume");
    L.assumptionsList.forEach(function (t) {
      al.appendChild(el("li", null, fill(t, { debit: pct(cfg.assumptions.debitShare), credit: pct(1 - cfg.assumptions.debitShare) })));
    });
    how.appendChild(al);
    box.appendChild(how);

    var actions = el("div", "result-actions");
    var cta = el("a", "btn primary big", cfg.cta.label);
    cta.href = cfg.cta.url;
    actions.appendChild(cta);
    var again = el("button", "btn ghost", L.restart);
    again.type = "button";
    again.onclick = function () { reset(); go(-1); };
    actions.appendChild(again);
    box.appendChild(actions);

    box.appendChild(el("p", "disclaimer", L.disclaimer));
    return box;
  }

  function render() {
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
