---
title: Export YouTube Video Metadata to CSV from Video URLs
h1: Export titles and public metrics from a list of YouTube videos
short: YouTube video metadata
kicker: Video research
actor: youtube-video-details
description: Start with one YouTube video URL, check titles and public metrics, then export CSV or JSON. Includes field limits, proxy behavior and the official API alternative.
updated: 2026-11-04
---

Use this workflow when you already have video URLs and want titles, descriptions, uploader keywords and available public counts in a spreadsheet. For discovering uploads from a channel, start with the [channel inventory guide](/guides/youtube-channel-inventory/) instead.

You need an Apify account and enough credit for the run. A YouTube Data API key is not required for this Actor. Public data can still be unavailable, blocked or incomplete.

## Start with one video

Open the Actor, switch Input to JSON and paste this small input. Replace the example ID with a public video you want to inspect.

```json
{
  "videos": ["jNQXAC9IVRw"],
  "maxConcurrency": 1,
  "proxyMode": "auto"
}
```

Before starting, review the Actor's current **Pricing** tab and set **Maximum cost per run**. A one-video input limits the requested videos; it does not promise that the total run costs exactly one displayed video event. Start fees and other applicable charges must fit the budget too.

After completion, check that `error` is empty and `videoId`, `url` and `title` identify the intended video. Inspect the fields your workflow needs before exporting CSV, JSON or Excel. A successful run does not mean every row contains usable data.

{{cta}}

## Know which fields you are importing

| Field | Meaning and limit |
| --- | --- |
| `videoId`, `url` | Use the video ID as the stable key when joining observations. |
| `title`, `description`, `keywords` | Public metadata; keywords may be absent and are not a search ranking score. |
| `viewCount`, `likeCount` | Available public counters at collection time. Missing values are not zero. |
| `commentCountText`, `subscriberCountText` | Display text that may be abbreviated or unavailable. Preserve it as text. |
| `channelId`, `channelName`, `channelUrl` | The video's channel identity. |
| `publishDate`, `uploadDate`, `durationSeconds` | Inspect availability before using these in calculations. |
| `error`, `scrapedAt` | Row outcome and observation time. Keep both with the export. |

This workflow does not retrieve watch time, audience demographics, creator revenue, comment bodies or transcripts. For captions, see the separate [transcript guide](/guides/youtube-transcript-api/).

## Check proxy behavior and missing data

With `proxyMode: "auto"`, the Actor tries direct requests first and can switch to the configured Apify proxy when blocked. Proxy access must be available in your account. `never` avoids proxy use but can leave blocked videos with errors; increasing concurrency does not fix an access block.

The proxy path skips an extra request used for optional fields, so subscriber text, comment-count text or a like-count fallback may be missing. If those are required, inspect one representative result before submitting a larger list. Restricted or inaccessible videos may not produce usable metadata.

## Repeat a check without losing the last good observation

Save successful observations with `videoId` and `scrapedAt`. Compare like-for-like fields from successful rows. Preserve previous values when a new row has an error or a missing field; missing counts should not look like a fall to zero.

For API use, keep the Apify token in your environment or your automation tool's credential store. Retain the run ID, then retrieve its dataset after completion. If a synchronous request disconnects, check the existing run in Apify before starting another: a connection timeout does not prove the run stopped.

## When to use the official YouTube API

The [official videos.list endpoint](https://developers.google.com/youtube/data/reference/rest/v3/videos/list) supports public video metadata and statistics. Google documents a quota cost of one unit per request. Its [setup guide](https://developers.google.com/youtube/data/getting-started) covers the project, API and credentials.

Choose that route if you already maintain a YouTube API integration and it provides the fields you need. Choose this Actor when an Apify dataset, Console export or existing Apify task fits your workflow and you accept its price and scraping limitations. Neither route gives you another creator's private analytics.

## Pricing

{{pricing}}

## FAQ

### Can I paste Shorts links or a bare video ID?

The input accepts IDs and watch, Shorts or youtu.be URLs. Accepted URL syntax does not guarantee access to the video.

### Can this discover every video on a channel?

This Actor starts from URLs or IDs you supply. Use the channel inventory workflow to discover public video URLs, then enrich the selected videos here.

### Does an empty field mean zero?

No. Check `error` and field availability. Preserve missing values instead of overwriting a previous successful observation with zero.

### Will opening the link start a paid run?

No. Review the Actor's input, applicable pricing events and maximum run budget before starting it.
