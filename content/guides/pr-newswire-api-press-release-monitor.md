---
title: PR Newswire API Alternative: Press Release Monitor
h1: PR Newswire, Business Wire and GlobeNewswire releases in one keyword-filtered feed
short: Press release monitor
kicker: News & competitor monitoring
actor: press-release-monitor
description: Get PR Newswire, Business Wire and GlobeNewswire releases from their public RSS feeds as keyword-filtered rows. Not an official vendor API.
updated: 2026-11-07
---

If you are looking for a **PR Newswire API**, a **Business Wire API** or a **GlobeNewswire API**, this guide covers a practical alternative: **Press Release Monitor**, an Apify Actor that reads the public RSS feeds of the three wires and returns one row per press release, filtered by the keywords you choose. It is not an official vendor API. It reads the public feeds the wires publish, so you can search a **press release API**-style feed without writing a scraper.

## What you get

Each row is one press release with these fields:

- `source`: `prnewswire`, `businesswire` or `globenewswire`
- `title`, `url` (the canonical link on the wire's own site) and `publishedAt` (ISO date)
- `summary`: the feed description with HTML stripped, up to 1,000 characters
- `company`: a heuristic name taken from the headline (see the FAQ)
- `categories`: values from the feed's own category tags, when a wire publishes any
- `matchedKeywords`: which of your keywords appear in the title or summary
- `body`: up to 8,000 characters of full text, only when **Fetch full release text** is on
- `guid`, `error` and `scrapedAt`

`error` is set only on a row that stands for a wire whose feed could not be read. The other wires still return their rows. A sample row:

{{sample}}

{{cta}}

## Call it from code

Here is a bounded example input. Every key and range comes from the Actor's input schema:

```json
{
    "sources": ["prnewswire", "globenewswire"],
    "keywords": ["funding", "acquisition"],
    "maxItemsPerSource": 50,
    "sinceHours": 24,
    "includeBody": false,
    "maxConcurrency": 3
}
```

`maxItemsPerSource` accepts 1 to 1000, `sinceHours` 0 or more (0 disables the time filter) and `maxConcurrency` 1 to 20. The code below runs the Actor's default prefill, which you can change to the input above:

{{code}}

## Recipes

### Monitor a competitor
Put the competitor's name in **Keywords**. Matching is a case-insensitive substring match against the title and summary only, not the full body.

### Keyword alerts for sales triggers
Use keywords such as `funding`, `acquisition` or `partnership`, set **Only releases from the last N hours** to `24`, and put the run on an Apify schedule. The README describes attaching a webhook so each run can feed Slack, email or a CRM.

### A feed for an AI agent
The README states that the Actor is pay-per-event and callable through the Apify MCP server. An agent passes `keywords` and receives matching releases, which it can summarize into a briefing.

## How much does it cost?

Press Release Monitor charges per release row: **$0.001 per row, which is $1 per 1,000 releases**, plus a negligible actor-start fee. Current event rates by Apify plan:

{{pricing}}

Set **Maximum cost per run** and the Actor trims the collected releases, newest first, to what the budget covers. These are primary event rates; check the Actor's Pricing tab for the full list.

## How it compares

| Option | Good at | Watch out for |
|---|---|---|
| **This Actor** | Three wires in one run, keyword filter, flat rows, schedule, webhook and export | Reads only the latest feed entries (the README says PR Newswire and GlobeNewswire feeds hold up to 20, Business Wire 30 to 50); it is a live monitor, not a historical archive |
| A wire's own website | Reading any release in full in a browser | Manual; no keyword alerts and no structured export |
| Google Alerts | Simple email alerts | The README notes it indexes with a delay and sends email rather than a dataset |
| Paid PR databases or media monitoring | Searchable archives, usually a subscription | Check what the vendor covers and what it costs before you commit |
| An official vendor API, where one exists | Vendor-supported access and terms | Check availability and terms with the vendor; this guide does not verify one |

## FAQ

### Does PR Newswire have a public API?
This guide does not confirm whether PR Newswire offers an API. What the Actor does is read PR Newswire's public RSS feed. To get PR Newswire releases, select the PR Newswire source and run the Actor. Release pages are fetched only when **Fetch full release text** is on.

### Is there a Business Wire API?
The same applies: this guide does not confirm a Business Wire API. The Actor reads Business Wire's public RSS feed. Its `body` is always null, because the README says businesswire.com returns HTTP 403 to non-browser requests, so the Actor never fetches Business Wire release pages.

### Is this the full wire archive?
No. Each feed holds only the wire's most recent releases. Run the Actor on a schedule with **Only releases from the last N hours** to build your own history over time.

### Why is the company field sometimes wrong?
It is a heuristic, not a named-entity extractor. It takes the title text before the first of " Announces", " Reports", " Launches" or a comma, and falls back to the feed's creator or contributor field when the title has none of those markers. Check it on securities-style notices, where the fragment before the marker may not be the filer.

### Why are categories empty for PR Newswire and Business Wire?
The README says their RSS feeds do not publish a standard category tag on releases. GlobeNewswire's category tags carry stock ticker and ISIN codes rather than topic names, and the Actor passes them through as they are.

### Do I need an API key?
No. The README says the Actor needs no API key.

### How do I avoid getting the same release twice?
Use **Only releases from the last N hours** on a schedule. Results are also deduped by URL within a single run. The README does not describe deduplication across separate runs, so check overlap between runs yourself.

### Can I export the results?
Yes. You can export JSON, CSV, Excel or HTML from the Output tab or through the API, and the dataset has ready-made Overview and Full detail views.
