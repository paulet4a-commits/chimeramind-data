---
title: Google Search Results API — Scrape Google SERPs to JSON
h1: Get Google search results as JSON, with real destination URLs
short: Google Search Results API
kicker: Search data
actor: google-search-scraper
description: Turn any list of Google queries into structured organic results — position, title, real URL, snippet — localised by country and language, priced per results page with the proxy included.
updated: 2026-10-03
---

You want to know who ranks for a keyword, feed search results into an AI agent, or build a list of websites from a set of queries. Copying results out of a browser doesn't scale, Google's official Custom Search API only searches sites you configure, and running your own scraper means fighting CAPTCHAs and proxy bans. This guide shows how to send a list of queries and get back **clean JSON rows of organic results**, each with a real, clickable destination URL, for {{price}}.

## What you get

One row comes back per query per results page. Each row carries the request that produced it (`query`, `page`, `countryCode`, `languageCode`, `device`, `searchUrl`) and an `organicResults` array where every listing has `position`, `title`, `url`, `displayedUrl`, `snippet`, `date` and `sitelinks`. A real row from a recent run, trimmed:

{{sample}}

### Why "real URLs" matters

Google's modern results page wraps organic links in an opaque click tracker that most scrapers pass through unresolved — you get a link you can't crawl or deduplicate. This tool deliberately requests Google's lightweight "basic HTML" rendering, which still exposes the destination as a decodable redirect. In live verification runs roughly nine out of ten organic results came back with a fully decoded `url`; the rest get a best-effort URL built from the breadcrumb, or `null` with `displayedUrl` still filled.

### What it does not return

That lighter rendering is a trade-off. **People Also Ask, related searches, ads and featured snippets are usually absent** from it, so those fields (`peopleAlsoAsk`, `relatedSearches`, `ads`, `featuredSnippet`) are almost always empty. They stay in the schema and are filled whenever Google includes them, but if your project is specifically about PAA questions or ad copy, this is not the right tool today.

## Step-by-step

1. Open the tool and put your keywords in **Search queries**, one per line.
2. Set **Country code** (`gl`, e.g. `us`, `gb`, `de`) and **Language code** (`hl`, e.g. `en`, `de`) to see results the way a local searcher does.
3. Choose **Max pages per query** (1–10). Each page is one billed unit. **Results per page** requests up to 100 listings; Google decides how many it actually returns, so check `organicCount`.
4. Pick **Device** — `desktop` honours the basic-HTML mode most consistently.
5. Click **Start** and export JSON, CSV or Excel from the Output tab, or read the dataset through the API.

{{cta}}

## Call it from code

{{code}}

The `organicResults` array is nested; in CSV export use the ready-made view, or flatten it yourself — one line of pandas (`pd.json_normalize(rows, "organicResults", ["query", "page"])`) turns it into one row per ranking.

## Recipes

### Rank tracking for a keyword list
Schedule the run weekly with your 50–200 target keywords and your market's country code. Join the rows on `query` and find your domain in `organicResults[].url` — a free, exportable rank history with no seat-based SEO subscription.

### Building a prospect list from search
Queries like `"bookkeeping" "Austin" accountant` return the websites of businesses that match. Because every `url` is real, you can chain the dataset straight into the [Email & Contact Extractor](/guides/email-extractor-from-websites/) or the Tech Stack Detector using their `inputDatasetId` option.

### Giving an AI agent live search
The tool is callable through the Apify MCP server, so an assistant can run a query and read the organic results itself. For agents that also need each page's content as Markdown, the AI Web Search tool in the same catalog fetches the top results and returns them cleaned.

## How much does it cost?

{{pricing}}

You pay **per results page fetched**, not per listing, and Google's SERP proxy traffic is included in that price — there is no separate proxy bill. A 100-keyword weekly rank check on page one is 100 units per run. If a page is blocked or unparseable, you get exactly one row with the reason in `error` (and the raw HTML saved for inspection), never a silent duplicate.

## How it compares

| Option | Good at | Watch out for |
|---|---|---|
| **This tool** | Real destination URLs; flat per-page price with the proxy included; country/language targeting; works from API, no-code tools and MCP | People Also Ask, ads and featured snippets are usually missing in the lightweight rendering |
| Google's Custom Search JSON API | Official and stable | Searches a configured set of sites rather than the full public results page you see in a browser |
| Full-featured SERP scrapers on the Apify Store | Rich SERP features (PAA, ads, AI overviews) | Read their pricing model carefully; organic links may arrive as tracker URLs |
| DIY with your own proxies | Full control | CAPTCHAs, proxy costs and markup changes become your maintenance job |

## FAQ

### Do I need my own proxies or a Google API key?
No. Every request goes through Apify's Google SERP proxy group automatically, and that cost is already inside the per-page price. You only need an Apify account.

### Why are People Also Ask and related searches empty?
They're not part of the lightweight results rendering this tool uses to get decodable URLs. The fields are parsed when Google does include them, but expect them to be empty on most runs.

### Can I get 100 results in one page?
You can request up to 100 with Results per page, and the price per page stays the same, but Google decides how many listings it actually returns. Check `organicCount` on each row; use more pages if you need deeper results.

### What happens when Google shows a CAPTCHA?
That page comes back as one row with `error` explaining the block, and the HTML is saved to the run's key-value store. Lower Max concurrency and retry later.

### Can I search in other countries and languages?
Yes. `countryCode` maps to Google's `gl` parameter and `languageCode` to `hl`, so `de` + `de` returns German results as a searcher in Germany would see them.

### Is it legal to scrape Google results?
The tool collects publicly visible search results and no personal account data. You remain responsible for complying with Google's terms and the laws that apply to your use case.
