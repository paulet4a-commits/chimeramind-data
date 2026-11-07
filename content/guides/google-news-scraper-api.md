---
title: Google News Scraper API — Articles, Sources and Publisher Links
h1: Google News scraper API: one clean row per article, with the real publisher link
short: Google News scraper
kicker: News monitoring
actor: google-news-scraper
description: Google News scraper API for keyword, site: and topic searches. One row per article with headline, source, date and publisher URL, from $0.50 per 1,000 articles.
updated: 2026-11-07
---

If you need a **Google News scraper API**, this guide shows how to pull headlines for a list of keywords, `site:` searches or section topics and get one flat row per article. The Google News Scraper Actor on Apify reads Google News' public RSS feeds, so you do not need a Google API key or a browser. It costs {{price}}, billed per article returned, so it is a paid tool rather than a free news API.

## What you get

Each article is one row with these fields:

- `query` — the search, or `topic:NAME`, the article was found for
- `title` — the headline as Google News shows it, often "Headline - Publisher"
- `googleUrl` — the `news.google.com/rss/articles/...` link from the feed
- `publisherUrl` — the article's real URL on the publisher's site, resolved best-effort, or `null`
- `source` and `sourceUrl` — publisher name and homepage from the feed
- `publishedAt` — publish time in ISO 8601 UTC
- `snippet` — plain text from the feed description; Google News does not publish a real summary, so it mirrors the title and source
- `guid` — the feed's stable item id, used to remove duplicates across overlapping queries
- `error` — a note when a query's feed request failed or returned nothing
- `scrapedAt` — when the row was produced

Rows are plain JSON, so the output loads easily into a spreadsheet, a database or an AI pipeline.

{{sample}}

{{cta}}

## Step-by-step

1. Enter one or more **Search queries**. Plain keywords work, and so do Google operators such as `site:reuters.com AI` or `"exact phrase"`. Add **Section topics** only if you want whole section feeds: WORLD, NATION, BUSINESS, TECHNOLOGY, ENTERTAINMENT, SCIENCE, SPORTS or HEALTH.
2. Pick a **Time range preset** (past hour, 24 hours, 7 days, 30 days or year), or set **Only articles from the last N days**. The preset wins when both are set.
3. Add **Exclude words** to drop noise. Each word becomes a `-word` operator on every search.
4. If one search needs more than about 100 articles, turn on **Split by date** and raise **Max items per query**.
5. Keep **Resolve publisher URLs** on for real article links, click Start, then export as JSON, CSV, Excel or HTML.

## Example input

This bounded input fits a weekly monitoring run and uses only fields from the Actor's input schema:

```json
{
    "queries": ["web scraping", "site:reuters.com AI"],
    "topics": ["TECHNOLOGY"],
    "timeRange": "7d",
    "excludeWords": ["ETF"],
    "splitByDate": true,
    "maxItemsPerQuery": 150,
    "maxItems": 300,
    "resolvePublisherUrls": true,
    "maxConcurrency": 5
}
```

`splitByDate` needs a span of at least two days, which a 7-day range satisfies. `maxItems` caps the whole run, keeping the newest articles. Topic feeds ignore both `timeRange` and `sinceDays`.

## Call it from code

The snippets below use the Actor's prefilled input. Replace it with the JSON above for a bounded run. They need an Apify API token in `APIFY_TOKEN`.

{{code}}

## Recipes

### Brand monitoring
Run your brand name as a query with `timeRange: "1d"` and schedule the run. Inside one run, the Actor already removes duplicates across overlapping queries. Across scheduled runs, keep the `guid` values you have seen and alert only on new ones.

### Topic feed
Leave `queries` empty and set `topics` to `["BUSINESS", "TECHNOLOGY"]` for section feeds. Topic feeds return the latest headlines for each section, ignore the date filters and are not split by date, so they suit a regular digest rather than a historical search.

### site: tracking
Use `queries: ["site:reuters.com AI"]` with a 7-day range to follow one publisher's coverage of a subject. Keep **Resolve publisher URLs** on so the report links to the publisher's own page instead of a Google redirect.

## How much does it cost?

{{pricing}}

The Actor bills per article: $0.0005 each, plus a negligible actor-start fee. A 100-article query therefore costs about $0.05 in article charges. Resolving publisher URLs adds requests to Google but no extra dataset charge. Set **Maximum cost per run** and the Actor keeps only the newest articles the budget covers.

## How it compares

| Option | Good at | Watch out for |
|---|---|---|
| **This Actor** | Keyword, `site:` and topic searches in one run, flat rows, publisher links, scheduled runs and API access, pay per article | Google News coverage only; about 100 articles per request unless split; publisher links are best-effort |
| Google News website | Free to read, fine for a quick look | One search at a time, no export, Google-branded links |
| Hand-built RSS script | No per-article fee; full control | You write the parsing, date splitting, de-duplication, link resolution and error handling |
| Paid news APIs | May cover sources that Google News does not index, with vendor support | Subscription or per-request pricing; check their coverage and terms yourself |

## FAQ

### Is there a Google News API?
The Actor's README does not describe an official Google News search API. This Actor instead reads the public RSS feeds at `news.google.com/rss/...`, which need no Google API key. Google's feed notice limits use to personal, non-commercial feed reading, so check the terms before building on them.

### Is this a free news API?
No. It is pay-per-event at $0.0005 per article returned. Reading the Google News website or writing your own RSS script costs nothing in fees, but the work of parsing, filtering and linking is yours.

### Does it return the full article text?
No. It extracts metadata and links only: headline, source, date, the Google News link and the publisher URL. It does not copy article bodies, and `snippet` is derived from the feed description.

### Why is publisherUrl null on some rows?
Either Resolve publisher URLs was off, the resolution request failed or timed out, or Google changed its redirect format. Resolution uses an undocumented Google endpoint that the README says could change without notice. The row keeps its `googleUrl`, title, source and date.

### Why do I get only about 100 articles per query?
One Google News request returns about 100 articles at most. Turn on **Split by date** and use a range of at least two days to get more. Topic feeds are always the latest headlines and are not split.

### Can I reuse the results commercially?
The README says Google's feed notice limits the feed to personal, non-commercial feed-reader use, and that bulk or commercial reuse of the underlying articles is your responsibility. Publishers keep their own copyright. Check the terms with your legal adviser before commercial use.

### Can an AI agent call it?
The README says the Actor meets the requirements for the Apify MCP server, being pay-per-event with limited permissions. An agent passes `queries` or `topics` and receives one row per article to summarize or route.

### What happens if a run times out early?
The Actor stops fetching and resolving close to the run timeout, saves every article it has, and ends as SUCCEEDED rather than TIMED-OUT. Unresolved rows have `publisherUrl: null`. Read the run's status message to tell a complete result from a partial one.
