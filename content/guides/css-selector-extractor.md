---
title: Extract Data from a Website with CSS Selectors — No Scraper Code Needed
h1: Extract data from any static page with CSS selectors
short: CSS Selector Extractor
kicker: Web data
actor: css-selector-extractor
description: Describe the fields once as CSS selectors and get one row per page — text, attributes, HTML tables, list items, pagination, sitemaps and page metadata — over plain HTTP, with headers and cookies for pages that need them.
updated: 2026-10-11
---

Most product pages, articles, directories and documentation sites are plain HTML. If you need one value from each page, such as a price, a title or a download link, writing a custom scraper is overkill. This guide shows how to turn a list of URLs and a short list of CSS selectors into structured rows, with no code to write and no browser to set up. The tool makes plain HTTP requests, so it is fast and cheap: {{price}}.

## What you get

For every URL the tool fetches, it returns exactly one row. Each selector you define becomes one key in `fields`:

| Field | Meaning |
|---|---|
| `url`, `finalUrl` | The URL you gave and the URL after redirects |
| `statusCode`, `contentType` | HTTP status and content type of the response |
| `fields` | One key per selector name: a string, an array of strings, a number for `count`, or row objects for `table` |
| `matchCounts` | How many elements each selector matched. Zero means the selector found nothing |
| `items`, `itemCount` | List mode only: one object per repeated element, and the total count |
| `metadata` | With `includeMetadata`: title, description, canonical URL, language, Open Graph tags and JSON-LD blocks |
| `foundOn` | When the page was reached by following a link, the page that linked to it |
| `htmlSizeBytes`, `usedProxy`, `error`, `scrapedAt` | Size of the HTML, whether a proxy was needed, the error if the page failed, and the fetch time |

A URL that fails to load still gets a row, with `error` set and the other fields empty. A typo in one selector never stops the run.

## Selector types

Each selector is an object with a `name`, a CSS `selector` and a `type`:

| Type | Returns |
|---|---|
| `text` | The element's text |
| `html` | The element's outer HTML |
| `attr` | An attribute value. Add `"attribute": "href"` or similar |
| `count` | How many elements matched, with no value |
| `table` | The matched `<table>` as an array of row objects keyed by its header row |

## Step-by-step

1. Fill `urls` with one page per line.
2. Fill `selectors` with a JSON array. Up to 25 selectors per run.
3. Leave `firstMatchOnly` on to get one value per selector. Turn it off to get every match as an array, capped by `maxMatchesPerSelector`.
4. Set `trimWhitespace` on to collapse spacing in text and attribute values.
5. Click **Start** and export the dataset as JSON, CSV, Excel or HTML, one row per page.

```json
{
    "urls": ["https://example.com", "https://apify.com"],
    "selectors": [
        { "name": "title", "selector": "h1", "type": "text" },
        { "name": "canonicalUrl", "selector": "link[rel='canonical']", "type": "attr", "attribute": "href" }
    ],
    "firstMatchOnly": true,
    "trimWhitespace": true
}
```

{{cta}}

## Scrape lists, follow pagination and read sitemaps

**List pages.** Set `itemSelector` to the repeated element, such as `article.product_pod`. Every other selector is then searched inside each item, and the row gets an `items` array with one object per product, post or listing. A page with 200 products is still one billed page.

```json
{
    "urls": ["https://books.toscrape.com/"],
    "itemSelector": "article.product_pod",
    "selectors": [
        { "name": "title", "selector": "h3 a", "type": "attr", "attribute": "title" },
        { "name": "price", "selector": ".price_color", "type": "text" }
    ],
    "linkSelector": "li.next a",
    "maxPages": 3
}
```

**Pagination and detail pages.** `linkSelector` follows the links you point it at: `li.next a` for the next page of a list, or `a.product-link` for detail pages. Followed pages get the same extraction, and each one is a row with `foundOn` set. The tool stays on the same domain unless `sameDomainOnly` is switched off, can be narrowed with a `urlPattern` regular expression, and stops at `maxPages` (default 100).

**Whole sites from a sitemap.** Give `sitemapUrls`, such as `https://example.com/sitemap.xml`, instead of or with the URL list. Sitemap indexes, nested sitemaps and `.xml.gz` files are expanded automatically. Add a URL pattern such as `/products/` to keep only the pages you want.

**Numbered pages without a next link.** Use `urlTemplate` with a `{page}` placeholder and a `pageRange`. For example, `https://books.toscrape.com/catalogue/page-{page}.html` with `{"from": 1, "to": 2}` fetches two pages. For offset-style URLs such as `?start={page}`, add a `step`: `{"from": 0, "to": 100, "step": 20}`. Generated URLs are capped by the 10,000 limit and your cost cap, not by `maxPages`.

**HTML tables.** A selector with `"type": "table"` returns the table as rows. Blank headers become `column_N`, repeated headers get a `_2` suffix, and cells that span several columns are repeated so the columns stay aligned. Up to 1,000 rows per table.

```json
{ "name": "customers", "selector": "#customers", "type": "table" }
```

**Headers and cookies.** Use `headers` for things such as `{"Accept-Language": "de-DE"}`, and `cookies` for pages that sit behind a session or a locale switch. Cookies can be given as `["name=value"]` or as the list a browser cookie-export extension produces. Values are never written to the run log, but they are stored in the run input like any other field. Use short-lived or test credentials, and do not paste a live account session into a shared or scheduled run.

**Metadata and JSON-LD.** Turn on `includeMetadata` to get the page title, description, canonical URL, language, Open Graph tags and every schema.org JSON-LD block. Product prices, ratings, article dates and organisation details come out without writing a selector.

## Call it from code

{{code}}

## Use it in n8n or Make

In **n8n**, add an **HTTP Request** node: method `POST`, URL `https://api.apify.com/v2/acts/webdatatools~css-selector-extractor/run-sync-get-dataset-items`, a header `Authorization` with the value `Bearer YOUR_APIFY_TOKEN`, and a JSON body. The response is an array with one row per page, ready for the next step. In **Make**, use **HTTP > Make a request** with the same method, URL and header, body type Raw with JSON content, and **Parse response** on.

Keep the token in the header. Do not put it in the URL, where it can end up in logs and history.

Body example:

```json
{
    "urls": ["https://books.toscrape.com/"],
    "selectors": [{ "name": "title", "selector": "h1", "type": "text" }]
}
```

[Download the n8n workflow (JSON)](/templates/css-selector-extractor.n8n.json) — a manual trigger, the HTTP Request node above and a placeholder for your token.

## Recipes

### Price and availability watch
Put your product URLs in `urls` with one `text` selector for the price and one for the stock status. Schedule the run daily and compare rows by `url`. A row with a non-empty `error` means that page could not be read, so check it before you act on a missing price.

### Product catalogue from a category
Set `itemSelector` to the product card, add a `linkSelector` for the next page, and map name, price and link inside each item. You get one `items` array per listing page, which you can flatten into a table.

### Site inventory from a sitemap
Give the sitemap URL, leave the selectors to `title` and `h1`, turn on `includeMetadata` and filter with a URL pattern. You get the title, canonical URL and JSON-LD for every page in one run.

## How much does it cost?

{{pricing}}

The price is per page, not per field. Five selectors on 100 URLs cost the same as one selector on 100 URLs. In list mode, a page with 200 items is still one page. Pages found by following links or reading sitemaps are billed the same way. Set **Maximum cost per run** to stop at a budget.

## Limits

- Plain HTTP only. Content added by JavaScript after the page loads is not visible, so a `matchCounts` of 0 can mean the content is rendered client-side.
- Up to 25 selectors per run, 1 to 500 matches per selector, and 1 to 20 parallel page fetches.
- `proxyMode` `auto` requests each page directly first and switches to Apify's residential proxy only after a block. `always` and `never` force one path.
- If a run reaches its timeout, pages already processed keep their rows, and the run ends with a status message listing how many pages were completed.

## FAQ

### Does it use a headless browser?
No. It fetches the HTML with plain HTTP requests and parses it. That is much faster and cheaper than a browser, but it cannot see content that only appears after client-side JavaScript runs.

### Why is a field empty?
Check `matchCounts` first. Zero means the selector matched nothing on that page. Open the page, confirm the element exists in the HTML source (not only in the rendered page), and test the selector in your browser's developer tools. A typo in the selector is the most common cause.

### Why is a page missing from the dataset?
Each page you give gets one row, even when the fetch fails. A page missing from the output was not reached, which happens when a link or sitemap limit or the run timeout stops the run. The run's status message says how many pages were done.

### How do I scrape a whole site?
Use the sitemap, or a link selector with `maxPages` raised to the number of pages you expect. Keep `sameDomainOnly` on unless you have a reason to follow other domains.

### Is it legal?
The tool reads pages you ask it to fetch. You are responsible for checking a site's terms and robots rules, and for how you use the data.
