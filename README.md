# Constitution and Public Register of the Republic of Fluid

A static site publishing the constitution of a fictional eco-socialist republic, together with the register, guidance, world material and organ sites that surround it.

The repository holds three constitutional texts. The text in force is the third, adopted by referendum on 7 June 2026 and commenced on 7 July 2026. It runs to 340 articles in 13 titles.

Two texts it repealed are preserved unmodified in `/archive`: the seven-article constitution of 2024, and the text of the First National Council of 1890.

This file documents what the repository contains. The changelog and the longer material sit in the files listed under Documentation below.

## Status

| Item | Value |
| - | - |
| Text in force | 340 articles, 13 titles, preamble, transitional provisions to Article 340 |
| Adopted | Referendum of 7 June 2026, 64.1 per cent of votes cast |
| Commenced | 7 July 2026 |
| Pages | 226 HTML files, of which 14 are the preserved archive |
| Machine-readable sources | `constitution.md`, `constitution.json`, `summary.md`, `history.md`, `regions.json`, `xref.json` |
| Territory of record | 2 regions, 20 sub-regions, 22 named towns |
| Area and population | 230,000 km², 18,402,000 residents |
| Legislature | Assembly of 200 seats, interim National Council of 100 until 2027 |

## Repository layout

```
index.html                 register front page
constitution/              full text, one page per title, anchors at #a<n>
summary/                   official plain-language summary, one line per article
concepts/                  guidance: usufruct, sortition, minimum core, steady state, and others
questions/                 questions put to committee chairs and office holders, with answers
economy/                   the economic order, its objections, and its unresolved problems
assembly/                  composition of the chamber and the party register
map/                       interactive map, geography, and 22 town pages
world/                     the union, neighbouring states, and relations beyond the bloc
history/                   narrative history and chronology
register/                  publication notes, external links, archive index
websites/                  16 organ sites, one directory per organ, with a shared frame
text/                      machine-readable sources
assets/                    flag and region geometry
css/ js/                   register stylesheet and behaviour, no dependencies
pod-bus-lindoma/           a dialogue set on a Lindoma pod bus, self-contained
archive/                   the repealed programmes of 2024 and 1890, unmodified
```

## Running locally

Serve the directory with any static file server and open `index.html`.

Nothing is fetched from outside the repository, so the site works offline once the relative links resolve.

The article finder loads `js/articles.js`, a single array of all 340 headings and one-line summaries.

## Documentation

| File | Contents |
| - | - |
| [`CHANGELOG.md`](CHANGELOG.md) | What changed between the 2024 programme in `/archive` and the text in force |
| [`docs/design-and-limits.md`](docs/design-and-limits.md) | The debt and conditionality provisions, and the questions the design leaves open |
| [`docs/real-life-implications.md`](docs/real-life-implications.md) | Where the Republic sits, legislation outside the economy, provisions derived from EU law, and the autarky classification |
| [`docs/quirks.md`](docs/quirks.md) | Transport, Exceptional Transports, the common vehicle fleet, public transport, the technological sector, social norms, and other regulations that differ from the norm |
| [`docs/method-and-archive.md`](docs/method-and-archive.md) | How the text was drafted, the use of machine assistance, and the standing of the archived constitutions |

## Licensing

| Component | Licence |
| - | - |
| The program: HTML, CSS, JavaScript and page templates | GNU General Public License version 3, in `LICENSE` |
| The text: the Constitution, the official summary, the history, the concept and guidance pages, and the world material | Public domain |
