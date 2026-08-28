# Keeping the search text updated

`js/search-data.js` is a flattened copy of the searched material. It covers `text/constitution.md`, `text/summary.md` and `text/history.md`, together with the pages of `concepts/`, `economy/`, `questions/`, `assembly/`, `map/` including the town pages, `about/`, and `world/index.html`. Left out are `websites/`, the country subsites under `world/`, `pod-bus-lindoma/`, `archive/`, `docs/` and the changelog.

After editing a source, apply the same edit to the copy with the full-text find and replace of an editor, across the file or across the repository.

## From the Markdown sources

Prose is stored verbatim, so a sentence copied out of the Markdown will be found in `js/search-data.js` unchanged. Four differences govern what to search for:

| In the Markdown | In `js/search-data.js` |
| - | - |
| `**Article 12. Heading**` | the number, the title and the chapter as integers, and `Heading` as its own string |
| `**bold**` and `*italic*` inside a clause | the same words without the asterisks |
| A clause on its own line | joined to the clauses around it by a single space |
| Table rows and `---` rules | absent |

So a search string has to sit inside one line of the source and have no emphasis marks.

## From the register pages

Page text is taken from inside `<main>`, with the breadcrumb line, the `h1`, and every `nav`, `script`, `style` and `svg` removed. Tags are stripped, entities are resolved, and runs of whitespace collapse to one space.

A sentence is therefore stored as a reader sees it. A sentence carrying a link or emphasis is stored as its words alone, so `<p>fixed centrally under <a href="...">Article 178</a>(1)(b)</p>` appears as `fixed centrally under Article 178 (1)(b)`. A search string has to be a run of visible text with no markup inside it, and `&rsaquo;` and `&#x27;` appear as the characters they denote.

Each `h2`, `h3` and `h4` opens a record, whose text runs to the next heading. Where a heading carries an `id`, the record links to that anchor, and where it carries none, the record links to the page.

## Both

The Markdown sources contain no double quote and no backslash at present, and the page text may contain either. Write a double quote in `js/search-data.js` as `\"` and a backslash as `\\`, since the file is JSON.

Adding or removing an entry means editing an array by hand, in the shape the neighbouring entries already use:

```
"con": [[12, 1, 0, "Heading", "1. First clause. 2. Second clause."], ...]
"sum": [[12, 1, "Heading", "One line of plain language."], ...]
"his": [["anchor-slug", "period-slug", 3, "Heading", "The prose of the section."], ...]
"concepts": [["concepts/usufruct.html", "anchor-or-empty", "Page title", "Heading", "The prose of the section."], ...]
```

The array for each register section is named by its key, and `"secs"` lists those keys with the labels the search page prints above each group of results.

## Note

The queries typed in the search dialog (which takes the form of a lightbox) are transmitted using sessionStorage, which requires the presence of an HTTP server. On file:// this transmission does not work, which means the search page will receive an empty query after Enter has been pressed.
