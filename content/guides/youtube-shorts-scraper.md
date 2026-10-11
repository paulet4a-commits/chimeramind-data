---
title: How to Scrape YouTube Shorts — Channels, Hashtags and Search to JSON
h1: Scrape YouTube Shorts from channels, hashtags and search
short: YouTube Shorts Scraper
kicker: Social & video
actor: youtube-shorts-scraper
description: Collect YouTube Shorts from a channel's Shorts tab, a hashtag feed or search results — titles, views, hashtags and thumbnails, plus exact publish dates and descriptions on request. No YouTube API key and no quota.
updated: 2026-10-11
---

Shorts are where many channels now test ideas, so tracking them tells you what is working: which hashtags are growing, which creators post every day, which search terms bring short videos up. YouTube's official Data API has no Shorts-only feed or hashtag endpoint, and a single search call costs 100 of the 10,000 daily quota units. This guide shows how to collect Shorts from three sources — a channel, a hashtag or a search — as one clean JSON row per Short, for {{price}}.

## What you get

One row per Short. Fields marked "with details" appear only when **Include details** is on, or, for dates, when **Published after** is set.

| Field | Meaning |
|---|---|
| `videoId`, `url` | The Short's 11-character ID and its `youtube.com/shorts/…` link |
| `title`, `thumbnail` | Title as shown on the card, and the vertical thumbnail URL |
| `viewCount`, `viewCountText` | Views as a number and as YouTube displays them ("650K views") |
| `channelName`, `channelId`, `channelHandle` | The creator and their `@handle`. Always filled for channel rows; for hashtag and search rows, with details or a date filter |
| `publishDate` | Exact publish time in ISO 8601 UTC (with details or a date filter) |
| `hashtags` | Words after `#` in the title, plus the description with details |
| `source`, `sourceType` | Which channel, hashtag or search query produced the row, and its type |
| `description`, `descriptionStatus`, `lengthSeconds`, `keywords` | With details: the description, its length and tags. `descriptionStatus` is `present`, `empty` (YouTube has none) or `unavailable` (YouTube did not answer) |
| `scrapedAt` | When the row was collected |

## Step-by-step

1. Add **channels** in any of three forms: a handle (`@MrBeast`), a channel URL, or a `UC…` channel ID.
2. Add **hashtags** without the `#` symbol (`cooking`), and **search queries** such as `iphone tips`, which return Shorts only.
3. Set **Max Shorts per source** (default 30, up to 500). The limit applies to each channel, hashtag or query separately.
4. Optional: turn on **Include details** for descriptions, tags, length, exact views and the exact publish date. Each Short then needs extra requests, so runs are slower.
5. Optional: set **Published after** (ISO format, such as `2026-10-01`) to keep only newer Shorts. Older ones are dropped before they are charged.
6. Keep **Max concurrency** at 2 to 4 for large lists to avoid HTTP 429 rate limits.
7. Click **Start** and export as JSON, CSV, Excel or HTML, or read the rows through the API.

{{cta}}

## Call it from code

{{code}}

## Use it in n8n or Make

In **n8n**, add an **HTTP Request** node: method `POST`, URL `https://api.apify.com/v2/acts/webdatatools~youtube-shorts-scraper/run-sync-get-dataset-items`, a header `Authorization` with the value `Bearer YOUR_APIFY_TOKEN`, and a JSON body. The response is an array with one item per Short. In **Make**, use **HTTP > Make a request** with the same method, URL and header, body type Raw with JSON content, and **Parse response** on, then iterate over the array.

Synchronous calls wait for the run to finish. For a long list of sources, start the run asynchronously and read the dataset when it completes.

Body example:

```json
{
    "channels": ["@MrBeast"],
    "hashtags": ["cooking"],
    "searchQueries": ["iphone tips"],
    "maxShortsPerSource": 20,
    "publishedAfter": "2026-10-01",
    "includeDetails": false
}
```

[Download the n8n workflow (JSON)](/templates/youtube-shorts-scraper.n8n.json) — a manual trigger, the HTTP Request node above and a placeholder for your token.

## Recipes

### Track a channel's new Shorts every day
Schedule a run with the channel in **Channels** and **Published after** set to yesterday's date. Each run returns only the Shorts published since the last check, and the rows are easy to append to a sheet or database.

### Find the hashtags that are growing
Run a list of hashtags with **Include details** on, so every row has an exact `publishDate` and `viewCount`. Group the rows by hashtag and compare the views per Short across the dates you collected.

### Compare creators in one niche
Put several channels in one run and group the rows by `source`. Compare the number of Shorts, the median `viewCount` and how often each channel posted in the window you chose.

## How much does it cost?

{{pricing}}

You pay per Short that lands in your dataset. A channel, hashtag or query that fails is recorded in the run log and costs nothing. Shorts removed by **Published after** are not charged. Set **Maximum cost per run** to cap a run.

## Limits

- Public Shorts only. There are no like or comment counts.
- View counts on cards are rounded ("650K") unless **Include details** is on.
- Exact publish dates need **Include details** or **Published after**, and YouTube omits them for some Shorts. Those Shorts are kept when a date filter is active.
- A hashtag or search feed ends when YouTube stops returning new Shorts, so some channels and tags return fewer rows than you asked for.

## FAQ

### Is scraping YouTube Shorts legal?
The Actor reads only public pages and does not log in. You are responsible for how you use the data, including YouTube's terms, privacy law and the copyright of the videos.

### Why is `channelName` empty on hashtag or search rows?
Those feeds do not show the creator on the card. Turn on **Include details** to fill it from the video's own page data.

### Why is `description` empty on some Shorts?
Many Shorts have no description. `descriptionStatus` set to `empty` means YouTube returned none. `unavailable` means YouTube did not answer for that Short, so the text is unknown.

### Does **Published after** cost more?
There is no extra Apify charge. The filter adds one YouTube request per Short to read its date. Filtered Shorts are not returned and not charged. The limit applies to the candidates each source fetches (up to **Max Shorts per source**), so a filter can return fewer Shorts than you asked for.

### Why do I get fewer Shorts than I asked for?
A hashtag or search feed ends when YouTube stops returning new Shorts, and some channels have only a few.

### Can I get the same data from the YouTube Data API?
Not as a Shorts feed. The Data API has no Shorts-only endpoint, and a single search call costs 100 of your 10,000 daily quota units. This Actor reads the public pages used by the YouTube app, with no key and no quota.
