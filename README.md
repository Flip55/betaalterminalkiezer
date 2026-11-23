# Betaalterminalkiezer

Demo site for a Belgian payment terminal comparator: a cost calculator that shows what each terminal provider would cost per month, overview pages for payment terminals and cash register systems, and a blog. Static files only, served by GitHub Pages. Built on the structure of `Flip55/cyberkiezer`.

## Structure

| Path | What it is |
|---|---|
| `index.html` | Homepage with the calculator as hero. Written by hand. |
| `assets/quiz-config.js` | All quiz texts, questions, answers, tariffs, sources and the date the tariffs were checked. Edit this to change the calculator. |
| `assets/quiz.js` | Calculator logic: screens, cost calculation, result page, progress saved in `localStorage`. |
| `assets/site.css` | Styles for every page. The palette is the `:root` block at the top. |
| `betaalterminals.html`, `kassasystemen.html` | Provider overview pages. Generated. |
| `blog/` | Blog overview and 10 test articles. Generated. |
| `tools/build_pages.py` | Card data and generator for the two overview pages. |
| `tools/build_blog.py` | Article texts and generator for the blog. |
| `tools/layout.py` | Shared header, navigation, footer, brand name and demo banner for generated pages. |
| `tools/test_quiz.js` | Tests for the calculation (hand-calculated cases). |
| `tools/check_links.py` | Checks every internal link and anchor. |

## Changing content

- **Questions and texts of the calculator:** edit `assets/quiz-config.js`. No build step.
- **A tariff:** edit the provider's plan in `assets/quiz-config.js`, update `checkedOn`, and update the same number on the provider's card in `tools/build_pages.py` (and `CHECKED` in `tools/layout.py`). Then run the build scripts and the tests. The date on the homepage is typed in `index.html`.
- **A new provider in the calculator:** add an entry to `providers` with at least one plan and a source URL. A provider without public prices gets `priceOnRequest: true` and a `requestNote`; the calculator then shows it without an amount.
- **The card mix:** `assumptions.debitShare` (now 0.9) is the share of payments by Bancontact or debit card. It is an assumption, not a measured figure.
- **Provider cards:** edit `TERMINALS` or `REGISTERS` in `tools/build_pages.py`, then run `python3 tools/build_pages.py`.
- **Blog:** append to `ARTICLES` in `tools/build_blog.py`, then run `python3 tools/build_blog.py`.
- **Navigation or brand name:** change `NAV` or `BRAND` in `tools/layout.py`, rerun both scripts, and update the same header and footer in `index.html`.

Before pushing:

```
python3 tools/build_pages.py && python3 tools/build_blog.py
node tools/test_quiz.js
python3 tools/check_links.py
```

## How the calculator works

1. Number of payments = monthly card turnover / average ticket, both taken as the midpoint of the chosen bracket.
2. 90% of payments are counted as Bancontact or debit, 10% as consumer credit card.
3. For each provider every plan is calculated: fixed monthly costs + cost per debit payment + cost per credit payment. The cheapest plan that matches the chosen terminal type is shown.
4. Providers are ranked by monthly cost. The top three are those that match the chosen terminal type.
5. One-off costs are shown separately. Temporary promotions are not counted.

## What this demo does not do

- No form, no database, no login. Answers stay in the visitor's browser.
- The listed companies are not partners and have not confirmed the texts.
- The amounts are estimates from public tariffs checked on 23 November 2026, not quotes.
- Cash register systems are listed but not calculated.
- The blog articles are test content and have not been reviewed by a specialist.
- No custom domain is set.
