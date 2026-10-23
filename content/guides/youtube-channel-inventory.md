---
title: Export YouTube Channel Videos to CSV and Track New Uploads
h1: A YouTube channel inventory you can use again
short: YouTube channel inventory
kicker: Video research
actor: youtube-channel-scraper
description: Start with 10 public videos, export titles and URLs to CSV, and compare saved runs by video ID to find newly observed uploads.
updated: 2026-10-23
---

Use this workflow for content research, a channel inventory or a recurring upload check. You get one row per public video, with its URL, title and available public metrics. You do not need a YouTube API key; you do need an Apify account with enough credit to run the Actor.

## Start with 10 videos

[Open the small channel-inventory recipe](/start/youtube-channel-inventory/). Download its input, open the Actor, switch Input to JSON and paste it. Review **Pricing** and set **Maximum cost per run** before starting. The recipe uses one channel, a 10-video cap and concurrency 1.

After the run completes, open the dataset. Confirm each usable row has `videoId`, `title` and `url`, and that `error` is empty. Then export CSV, JSON or Excel. Fewer than 10 rows can be correct when the channel has fewer public videos.

For multiple channels, increase the list gradually. `maxVideosPerChannel` is a per-channel cap, not a total-run cap. Five channels with a cap of 100 can produce up to 500 video rows.

## What the fields mean

| Field | How to use it |
| --- | --- |
| `channelId`, `videoId` | Stable keys for comparing successful runs |
| `title`, `url` | Human-readable inventory and a link to the video |
| `viewCount`, `viewCountText` | Public counts; abbreviated labels can yield approximate numbers |
| `publishedAtApprox` | Estimated from a relative label, not an exact publication timestamp |
| `scrapedAt` | When this observation was collected |
| `error` | Check this before importing a row or comparing datasets |

Descriptions may be absent from the channel grid. This Actor does not return transcripts, watch time, audience demographics or private channel analytics.

## Repeat the check without duplicating rows

[Use the upload-check recipe](/start/youtube-upload-monitor/) and save it as an Apify task. Run it manually first. After verifying the output and cost, configure a schedule that suits the channel's upload frequency and your budget.

Store rows keyed by `channelId` and `videoId`. A video ID absent from the previous successful dataset is **newly observed**; it is not necessarily newly published. Preserve your previous dataset when a run fails or returns an error. Compare only successful observations.

The starter checks the newest 20 videos. If more than 20 videos can appear between checks, increase the cap or shorten the interval. Scheduling alone does not send alerts or compare datasets: configure storage, comparison and notifications in your automation tool.

## Connect n8n, Python or JavaScript

The recipe includes an inactive, manual-trigger n8n starter. Import it and select an **HTTP Header Auth** credential on the HTTP Request node: header name `Authorization`, value `Bearer` followed by your Apify token. Keep the credential in n8n's credential store, not in the workflow JSON. The starter runs the extraction only; it does not include scheduling, comparison or notifications.

For larger jobs, use Apify's asynchronous run endpoint and fetch the dataset after completion. If a synchronous request times out, check the run in Apify before retrying: a disconnected request does not prove the run stopped, and retrying can duplicate work and charges.

The API examples below use the catalog's existing input. Replace it with the small recipe input when testing.

{{code}}

## Pricing and limits

{{pricing}}

A cap of 10 means up to 10 video rows **per channel**, plus any applicable start or other charges. Handle resolution may need proxy access. A known channel ID avoids resolving a handle. Check your selected plan's current rates and use a maximum run budget.

`videos`, `shorts` and `streams` select different tabs. A missing tab can produce an error row. Popular sorting is best-effort and may fall back to newest; Shorts use newest order. Changes to YouTube or blocking can affect availability.

## Recorded output

The following block is a dated saved observation when available, not a promise that today's channel contains the same videos. The recipe inputs above are instructions, not measured output.

{{sample}}

## FAQ

### Can I export all videos?
Increase maxVideosPerChannel gradually, up to the Actor's documented limit of 5,000 per channel. The channel must expose the requested videos publicly, and the run must have enough budget and time.

### Can I use this to monitor views?
You can compare viewCount across successful observations of the same video ID. Channel-grid counts can be rounded, so this is not a replacement for exact owner analytics.

### Does the upload-check recipe send alerts automatically?
No. It supplies a bounded extraction input. Save and schedule a task, retain the previous successful dataset, compare video IDs and connect your own notification step.

### What should I do with an error row?
Keep it out of your video inventory and inspect the error. Do not overwrite a previous successful inventory with an error or assume the channel has no videos.

{{cta}}
