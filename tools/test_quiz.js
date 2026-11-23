#!/usr/bin/env node
/* Tests for the calculator. Run from the repository root:  node tools/test_quiz.js */
"use strict";
const assert = require("assert");
global.window = {};
require("../assets/quiz-config.js");
const cfg = global.window.QUIZ_CONFIG;
const { compute } = require("../assets/quiz.js");

const near = (a, b, msg) => assert.ok(Math.abs(a - b) < 0.006, `${msg}: got ${a}, expected ${b}`);
const row = (r, id) => r.rows.find((x) => x.provider.id === id);
const base = { sector: "winkel", omzet: "o3", ticket: "t3", type: "beide", kassa: "nee", huidig: "geen" };
let n = 0;
const test = (name, fn) => { fn(); n++; console.log("ok  " + name); };

test("config: every question option is unique and every provider has a source", () => {
  cfg.questions.forEach((q) => assert.strictEqual(new Set(q.options.map((o) => o.id)).size, q.options.length, q.id));
  cfg.providers.forEach((p) => {
    assert.ok(p.sources && p.sources.length && p.sources.every((s) => /^https:\/\//.test(s.url)), p.id);
    assert.ok(p.priceOnRequest ? p.requestNote : p.plans.length, p.id);
  });
  const ids = cfg.providers.map((p) => p.id);
  cfg.questions.find((q) => q.id === "huidig").options
    .filter((o) => !["geen", "andere"].includes(o.id))
    .forEach((o) => assert.ok(ids.includes(o.id), "current provider " + o.id + " missing from providers"));
});

test("input: 7.500 euro at 22 euro is 341 payments, 307 debit and 34 credit", () => {
  const r = compute(base, cfg);
  assert.strictEqual(r.input.n, 341);
  assert.strictEqual(r.input.nDebit, 307);
  assert.strictEqual(r.input.nCredit, 34);
  near(r.input.debitTurnover, 6750, "debit turnover");
  near(r.input.creditTurnover, 750, "credit turnover");
});

test("hand-calculated monthly cost per provider (7.500 euro, ticket 22)", () => {
  const r = compute(base, cfg);
  near(row(r, "worldline").monthly, 36 + 5 + 307 * 0.13 + 750 * 0.014 + 34 * 0.10, "Worldline");
  near(row(r, "ccv").monthly, 29.35 + 307 * 0.140 + 750 * 0.0125, "CCV A77");
  near(row(r, "sumup").monthly, 19 + 7500 * 0.0099, "SumUp Plus");
  near(row(r, "mypos").monthly, 39 + 307 * 0.12 + 750 * 0.0089, "myPOS Pro"); // Plus would be 19 + 74,25 = 93,25
  assert.strictEqual(row(r, "mypos").plan.id, "pro");
  near(row(r, "viva").monthly, 4.99 + 307 * 0.14 + 750 * 0.0169, "Viva");
  assert.strictEqual(row(r, "sumup").plan.id, "plus");
});

test("lines of each calculation add up to the monthly total", () => {
  cfg.questions.find((q) => q.id === "omzet").options.forEach((o) => {
    cfg.questions.find((q) => q.id === "ticket").options.forEach((t) => {
      const r = compute(Object.assign({}, base, { omzet: o.id, ticket: t.id }), cfg);
      r.rows.forEach((x) => {
        const sum = x.lines.reduce((s, l) => s + l.amount, 0);
        assert.ok(Math.abs(sum - x.monthly) < 0.03, `${x.provider.id} ${o.id}/${t.id}: lines ${sum} vs ${x.monthly}`);
        assert.ok(x.monthly >= 0 && isFinite(x.monthly));
      });
      for (let i = 1; i < r.rows.length; i++) { assert.ok(r.rows[i - 1].monthly <= r.rows[i].monthly, "sorted"); }
      assert.ok(r.top3.length === 3);
    });
  });
});

test("best plan switches with turnover: SumUp and myPOS without subscription at 1.500 euro", () => {
  const r = compute(Object.assign({}, base, { omzet: "o1" }), cfg);
  assert.strictEqual(row(r, "sumup").plan.id, "payg");
  near(row(r, "sumup").monthly, 1500 * 0.0169, "SumUp PAYG");
  assert.strictEqual(row(r, "mypos").plan.id, "one");
  near(row(r, "mypos").monthly, 1500 * 0.0149, "myPOS One");
});

test("myPOS Pro wins at high turnover and large tickets", () => {
  const r = compute(Object.assign({}, base, { omzet: "o5", ticket: "t5" }), cfg);
  assert.strictEqual(row(r, "mypos").plan.id, "pro");
  near(row(r, "mypos").monthly, 39 + 338 * 0.12 + 3750 * 0.0089, "myPOS Pro"); // 375 payments, 338 debit
});

test("CCV tiers: boundaries pick the right price", () => {
  // 37.500 / 10 = 3750 payments, 3375 debit -> 0,075
  let r = compute(Object.assign({}, base, { omzet: "o5", ticket: "t2" }), cfg);
  near(row(r, "ccv").monthly, 29.35 + 3375 * 0.075 + 3750 * 0.0125, "CCV top tier");
  // 1.500 / 22 = 68 payments, 61 debit -> 0,240
  r = compute(Object.assign({}, base, { omzet: "o1" }), cfg);
  near(row(r, "ccv").monthly, 29.35 + 61 * 0.240 + 150 * 0.0125, "CCV first tier");
});

test("CCV small tickets: first 1.000 Bancontact payments up to 5 euro are free, then 0,02", () => {
  // 7.500 / 4 = 1875 payments, 1688 debit -> 1000 free + 688 x 0,02
  const r = compute(Object.assign({}, base, { ticket: "t1" }), cfg);
  near(row(r, "ccv").monthly, 29.35 + 688 * 0.02 + 750 * 0.0125, "CCV small tickets");
});

test("terminal type: fixed picks CCV Duo-Base and flags mobile-only providers", () => {
  const r = compute(Object.assign({}, base, { type: "vast" }), cfg);
  assert.strictEqual(row(r, "ccv").plan.id, "duobase-huur");
  assert.strictEqual(row(r, "sumup").fits, false);
  assert.strictEqual(row(r, "mypos").fits, false);
  assert.strictEqual(row(r, "worldline").fits, true);
  assert.strictEqual(row(r, "viva").fits, true);
  r.top3.forEach((x) => assert.ok(x.fits));
  assert.deepStrictEqual(r.top3.map((x) => x.provider.id).sort(), ["ccv", "viva", "worldline"]);
  const m = compute(Object.assign({}, base, { type: "mobiel" }), cfg);
  assert.strictEqual(row(m, "ccv").plan.id, "a77-huur");
  m.rows.forEach((x) => assert.ok(x.fits));
});

test("providers without public prices get no amount", () => {
  const r = compute(base, cfg);
  assert.deepStrictEqual(r.onRequest.map((p) => p.id).sort(), ["axepta", "mollie"]);
  assert.ok(!row(r, "mollie") && !row(r, "axepta"));
});

test("current provider: difference with the cheapest fitting provider", () => {
  let r = compute(Object.assign({}, base, { huidig: "worldline" }), cfg);
  assert.strictEqual(r.current.status, "cheaper");
  near(r.current.diff, row(r, "worldline").monthly - r.top3[0].monthly, "diff");
  r = compute(Object.assign({}, base, { huidig: r.top3[0].provider.id }), cfg);
  assert.strictEqual(r.current.status, "best");
  r = compute(Object.assign({}, base, { huidig: "andere" }), cfg);
  assert.strictEqual(r.current.status, "unknown");
  assert.strictEqual(compute(base, cfg).current, null);
});

test("notes follow the answers", () => {
  assert.strictEqual(compute(base, cfg).notes.length, 0);
  assert.strictEqual(compute(Object.assign({}, base, { sector: "horeca", kassa: "ja" }), cfg).notes.length, 2);
});

console.log(`\n${n} tests passed`);
