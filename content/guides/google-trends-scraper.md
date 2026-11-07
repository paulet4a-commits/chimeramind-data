---
title: Google Trends Scraper: Interest, Regions and Related Queries
h1: Scrape Google Trends by keyword: interest over time, regions and related queries
short: Google Trends Scraper
kicker: Search & market research
actor: google-trends-scraper
description: Google Trends Scraper returns interest over time, regional breakdown and top and rising related queries for any keyword. No API key needed, pay per keyword.
updated: 2026-11-07
---

Google Trends is useful for one query at a time in a browser. When you need the same numbers for a list of keywords, in a spreadsheet or a pipeline, you need a Google Trends scraper. **Google Trends Scraper** is an Actor for google trends scraping by keyword, country and timeframe: it returns one row per keyword, ready for a download or an API call. This guide covers the fields, a bounded example input, the price model and the limits to plan around.

## What you get

Each row is one keyword. The Actor's README documents these fields:

- `keyword`, `geo` (country code, or an empty string for worldwide), `timeframe` and `category`: the parameters the row was run with.
- `interestOverTime`: a dated timeline of interest values on a 0-100 scale.
- `averageInterest`: the mean interest across the timeframe.
- `peakDate`: the ISO date when interest peaked.
- `interestByRegion`: region name, region code and value, when regional output is on.
- `relatedQueries`: `top` and `rising` lists, each with a query, a numeric `value` and a `formatted` string.
- `scrapedAt`: the ISO timestamp when the data was retrieved.

Values are relative. 100 means peak popularity for your region and timeframe, not an absolute search count. The layout of one dataset row:

{{sample}}

{{cta}}

## Example input

The input schema accepts `keywords` (up to 100 per run), `keyword` (one keyword, merged into the list), `geo`, `timeframe`, `category`, `includeRegions` and `includeRelatedQueries`. `timeframe` takes one of seven values: `now 1-d`, `now 7-d`, `today 1-m`, `today 3-m`, `today 12-m`, `today 5-y` or `all`. Leave `geo` empty for worldwide data. `category` is a Google Trends category ID, where `0` means all categories.

```json
{
  "keywords": ["coffee", "tea"],
  "geo": "US",
  "timeframe": "today 12-m",
  "category": 0,
  "includeRegions": true,
  "includeRelatedQueries": true
}
```

## Call it from code

Start the Actor with the same input and read its dataset. Each keyword comes back as one item:

{{code}}

## Recipes

### Compare brands on one timeline
Put competing brand names in `keywords`, set one `geo` and one `timeframe`, then compare `averageInterest` and `peakDate` per row. The scale is relative, so compare keywords that were run with the same `geo` and `timeframe`.

### Find where interest is concentrated
Keep `includeRegions` on and read `interestByRegion`. Each entry has a region name, a code and a value, so you can rank regions for a local campaign. Region names are as Google reports them.

### Pick content ideas from rising queries
Read `relatedQueries.rising` and sort by the numeric `value`. The README's example shows a `formatted` string of `+1,250%`, so keep the number for sorting and the string for display.

### Weekly monitoring
The README notes that data is typically 1-2 days behind and that weekly or monthly runs are typical for trend monitoring. Daily runs are unnecessary for that reason. Keep lists under the 100-keyword limit per run and split larger lists across runs.

## How much does it cost?

{{pricing}}

The Actor is pay per keyword at {{price}} on the Free plan; the table above shows the rate for each Apify plan. Set Maximum cost per run before you start to cap the total.

## How it compares

| Option | Good at | Watch out for |
|---|---|---|
| **Google Trends Scraper** | Many keywords per run, one row each, JSON, CSV, Excel or HTML download, no API key | Relative 0-100 values, per-keyword cost, data 1-2 days behind |
| Google Trends website | A quick visual check, or exploring one keyword by hand | One query at a time in the browser, and any export or comparison is manual |
| pytrends (Python library) | Code you control end to end | You write, run and maintain the script, and handle its retries yourself. This guide did not check the library's current behaviour or status |

If you only need a few keywords, the website is the fastest option. Choose the Actor when the same keyword list has to run again on a schedule and land in a dataset.

## FAQ

### Is there an official Google Trends API?
This guide does not cover Google's own programs, so it cannot say whether one exists. What this Actor does is scrape the public Google Trends website directly, as its README says. It needs no API key, and you call it through the Apify API as shown above.

### How much does the Google Trends API cost?
The Actor is pay per keyword: {{price}} on the Free plan, lower on higher Apify plans (see the pricing table). Set Maximum cost per run before a large run.

### Is there a Google Trends scraper API I can call from code?
Yes. Start the Actor through the Apify client with the input JSON from this guide, then read the items from the run's default dataset. The code examples above show both Python and JavaScript.

### Do I need an API key?
No. The README says Google Trends is public and no key is required.

### Is Google Trends data accurate?
It measures relative interest on a 0-100 scale, not absolute search volume. Google does not publicly share absolute search volumes, so use the data for trends and comparisons, not for exact counts.

### Why is my keyword empty?
Very new or niche keywords may have no historical data in Google Trends.

### Can I use the data commercially?
The README says yes, as long as you follow Google's Terms of Service. Do not claim Google's data as your own, and do not resell it directly. Use it for analysis, content and decisions.

### How often should I run it?
Weekly or monthly is typical. Google updates the data roughly every 1-2 days, so daily runs add little.
