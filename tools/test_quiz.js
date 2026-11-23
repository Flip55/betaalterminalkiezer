#!/usr/bin/env node
/* Tests for the calculator. Run from the repository root:  node tools/test_quiz.js */
"use strict";
const assert = require("assert");
global.window = {};
require("../assets/quiz-config.js");
const cfg = global.window.QUIZ_CONFIG;
const { compute: computeAll, stepsFor } = require("../assets/quiz.js");
const chan = (a, id) => computeAll(a, cfg).channels.find((c) => c.id === id);
const compute = (a) => chan(a, "winkel");
const online = (a) => chan(a, "online");

const near = (a, b, msg) => assert.ok(Math.abs(a - b) < 0.006, `${msg}: got ${a}, expected ${b}`);
const row = (r, id) => r.rows.find((x) => x.provider.id === id);
const base = { kanaal: "winkel", sector: "winkel", omzet: "o3", ticket: "t3", type: "mobiel", kassa: "nee", huidig: "geen" };
let n = 0;
const test = (name, fn) => { fn(); n++; console.log("ok  " + name); };

test("config: every question option is unique and every provider has a source", () => {
  cfg.questions.forEach((q) => assert.strictEqual(new Set(q.options.map((o) => o.id)).size, q.options.length, q.id));
  cfg.providers.forEach((p) => {
    assert.ok(p.sources && p.sources.length && p.sources.every((s) => /^https:\/\//.test(s.url)), p.id);
    assert.ok((p.plans && p.plans.length) || p.onRequest, p.id);
  });
  const ids = cfg.providers.map((p) => p.id);
  cfg.questions.find((q) => q.id === "huidig").options
    .filter((o) => !["geen", "andere"].includes(o.id))
    .forEach((o) => assert.ok(ids.includes(o.id), "current provider " + o.id + " missing from providers"));
});

test("input: 7.500 euro at 22 euro is 341 payments, 307 debit and 34 credit", () => {
  const r = compute(base);
  assert.strictEqual(r.input.n, 341);
  assert.strictEqual(r.input.nDebit, 307);
  assert.strictEqual(r.input.nCredit, 34);
  near(r.input.debitTurnover, 6750, "debit turnover");
  near(r.input.creditTurnover, 750, "credit turnover");
});

test("hand-calculated monthly cost per provider (7.500 euro, ticket 22)", () => {
  const r = compute(base);
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
      const r = compute(Object.assign({}, base, { omzet: o.id, ticket: t.id }));
      r.rows.forEach((x) => {
        const sum = x.lines.reduce((s, l) => s + l.amount, 0);
        assert.ok(Math.abs(sum - x.monthly) < 0.03, `${x.provider.id} ${o.id}/${t.id}: lines ${sum} vs ${x.monthly}`);
        assert.ok(x.monthly >= 0 && isFinite(x.monthly));
      });
      for (let i = 1; i < r.rows.length; i++) { assert.ok(r.rows[i - 1].monthly <= r.rows[i].monthly, "sorted"); }
      assert.ok(r.top3.length === 3);
      assert.ok(!r.top3.some((x) => x.provider.id === "bancontactpro"), "QR is not offered unless asked for");
    });
  });
});

test("best plan switches with turnover: SumUp and myPOS without subscription at 1.500 euro", () => {
  const r = compute(Object.assign({}, base, { omzet: "o1" }));
  assert.strictEqual(row(r, "sumup").plan.id, "payg");
  near(row(r, "sumup").monthly, 1500 * 0.0169, "SumUp PAYG");
  assert.strictEqual(row(r, "mypos").plan.id, "one");
  near(row(r, "mypos").monthly, 1500 * 0.0149, "myPOS One");
});

test("myPOS Pro wins at high turnover and large tickets", () => {
  const r = compute(Object.assign({}, base, { omzet: "o5", ticket: "t5" }));
  assert.strictEqual(row(r, "mypos").plan.id, "pro");
  near(row(r, "mypos").monthly, 39 + 338 * 0.12 + 3750 * 0.0089, "myPOS Pro"); // 375 payments, 338 debit
});

test("CCV tiers: boundaries pick the right price", () => {
  // 37.500 / 10 = 3750 payments, 3375 debit -> 0,075
  let r = compute(Object.assign({}, base, { omzet: "o5", ticket: "t2" }));
  near(row(r, "ccv").monthly, 29.35 + 3375 * 0.075 + 3750 * 0.0125, "CCV top tier");
  // 1.500 / 22 = 68 payments, 61 debit -> 0,240
  r = compute(Object.assign({}, base, { omzet: "o1" }));
  near(row(r, "ccv").monthly, 29.35 + 61 * 0.240 + 150 * 0.0125, "CCV first tier");
});

test("CCV small tickets: first 1.000 Bancontact payments up to 5 euro are free, then 0,02", () => {
  // 7.500 / 4 = 1875 payments, 1688 debit -> 1000 free + 688 x 0,02
  const r = compute(Object.assign({}, base, { ticket: "t1" }));
  near(row(r, "ccv").monthly, 29.35 + 688 * 0.02 + 750 * 0.0125, "CCV small tickets");
});

test("terminal type: fixed picks CCV Duo-Base and flags mobile-only providers", () => {
  const r = compute(Object.assign({}, base, { type: "vast" }));
  assert.strictEqual(row(r, "ccv").plan.id, "duobase-huur");
  assert.strictEqual(row(r, "sumup").fits, false);
  assert.strictEqual(row(r, "mypos").fits, false);
  assert.strictEqual(row(r, "worldline").fits, true);
  assert.strictEqual(row(r, "viva").fits, true);
  r.top3.forEach((x) => assert.ok(x.fits));
  assert.deepStrictEqual(r.top3.map((x) => x.provider.id).sort(), ["ccv", "viva", "worldline"]);
  const m = compute(Object.assign({}, base, { type: "mobiel" }));
  assert.strictEqual(row(m, "ccv").plan.id, "a77-huur");
  m.rows.forEach((x) => assert.strictEqual(x.fits, x.provider.id !== "bancontactpro", x.provider.id));
  assert.strictEqual(row(m, "worldline").plan.id, "saturn-huur");
});

test("providers without public prices get no amount", () => {
  const r = compute(base);
  assert.deepStrictEqual(r.onRequest.map((o) => o.provider.id).sort(), ["axepta", "mollie"]);
  r.onRequest.forEach((o) => assert.ok(o.note.length > 20));
  assert.ok(!row(r, "mollie") && !row(r, "axepta"));
});

test("current provider: difference with the cheapest fitting provider", () => {
  let r = compute(Object.assign({}, base, { huidig: "worldline" }));
  assert.strictEqual(r.current.status, "cheaper");
  near(r.current.diff, row(r, "worldline").monthly - r.top3[0].monthly, "diff");
  r = compute(Object.assign({}, base, { huidig: r.top3[0].provider.id }));
  assert.strictEqual(r.current.status, "best");
  r = compute(Object.assign({}, base, { huidig: "andere" }));
  assert.strictEqual(r.current.status, "unknown");
  assert.strictEqual(compute(base).current, null);
});

test("notes follow the answers", () => {
  assert.strictEqual(computeAll(base, cfg).notes.length, 0);
  assert.strictEqual(computeAll(Object.assign({}, base, { sector: "horeca", kassa: "ja" }), cfg).notes.length, 2);
});

test("questions follow the channel: 7 in store, 5 online, 9 for both", () => {
  assert.deepStrictEqual(stepsFor({ kanaal: "winkel" }, cfg).map((q) => q.id), ["kanaal", "sector", "omzet", "ticket", "type", "kassa", "huidig"]);
  assert.deepStrictEqual(stepsFor({ kanaal: "online" }, cfg).map((q) => q.id), ["kanaal", "sector", "omzetOnline", "ticketOnline", "huidig"]);
  assert.strictEqual(stepsFor({ kanaal: "beide" }, cfg).length, 9);
  const r = computeAll({ kanaal: "online", sector: "winkel", omzetOnline: "o3", ticketOnline: "t4", huidig: "geen" }, cfg);
  assert.deepStrictEqual(r.channels.map((c) => c.id), ["online"]);
});

test("no preference: terminals and smartphone apps compete, QR code is left out", () => {
  const r = compute(Object.assign({}, base, { type: "beide" }));
  assert.strictEqual(row(r, "worldline").plan.id, "tap");
  assert.strictEqual(row(r, "bancontactpro").fits, false);
  assert.ok(!r.top3.some((x) => x.provider.id === "bancontactpro"));
});

test("without a device: Tap on Mobile, Tap to Pay and the QR code, hand-calculated", () => {
  const r = compute(Object.assign({}, base, { type: "zonder" }));
  assert.strictEqual(row(r, "worldline").plan.id, "tap");
  near(row(r, "worldline").monthly, 307 * 0.13 + 750 * 0.014 + 34 * 0.10, "Tap on Mobile");
  near(row(r, "bancontactpro").monthly, 1.5 + 341 * 0.06, "Bancontact Pro: all 341 payments by QR");
  near(row(r, "mypos").monthly, 39 + 307 * 0.12 + 750 * 0.0089, "myPOS Tap to Pay");
  assert.strictEqual(row(r, "ccv").fits, false);
  assert.strictEqual(row(r, "sumup").fits, false);
  assert.strictEqual(r.top3[0].provider.id, "bancontactpro");
});

test("online: hand-calculated (7.500 euro, order of 45 euro, 167 orders, 117 Bancontact and 50 cards)", () => {
  const a = { kanaal: "online", sector: "winkel", omzetOnline: "o3", ticketOnline: "t4", huidig: "viva" };
  const r = online(a);
  assert.strictEqual(r.input.n, 167); assert.strictEqual(r.input.nDebit, 117); assert.strictEqual(r.input.nCredit, 50);
  near(row(r, "viva").monthly, 4.99 + 117 * 0.37 + 2250 * 0.0219 + 50 * 0.24, "Viva online");
  near(row(r, "sumup").monthly, 7500 * 0.025, "SumUp online");
  // myPOS: One 149,25+33,40 = 182,65; Plus 19+111,75+25,05 = 155,80; Pro 39+26,25+14,04+31,28+6,00 = 116,57
  assert.strictEqual(row(r, "mypos").plan.id, "pro-online");
  near(row(r, "mypos").monthly, 39 + 5250 * 0.005 + 117 * 0.12 + 2250 * 0.0139 + 50 * 0.12, "myPOS Pro online");
  assert.deepStrictEqual(r.onRequest.map((o) => o.provider.id).sort(), ["axepta", "mollie", "stripe", "worldline"]);
  assert.ok(!row(r, "worldline") && !row(r, "ccv") && !row(r, "bancontactpro"));
  assert.strictEqual(r.current.status, row(r, "viva") === r.top3[0] ? "best" : "cheaper");
  r.rows.forEach((x) => assert.ok(Math.abs(x.lines.reduce((s, l) => s + l.amount, 0) - x.monthly) < 0.03, x.provider.id + " lines"));
});

test("both channels give two independent lists", () => {
  const r = computeAll(Object.assign({}, base, { kanaal: "beide", type: "beide", omzetOnline: "o1", ticketOnline: "t2" }), cfg);
  assert.deepStrictEqual(r.channels.map((c) => c.id), ["winkel", "online"]);
  near(r.channels[1].rows.find((x) => x.provider.id === "sumup").monthly, 1500 * 0.025, "SumUp online small");
  assert.strictEqual(r.notes.length, 2); // "allebei" + "maakt mij niet uit"
});

console.log(`\n${n} tests passed`);
