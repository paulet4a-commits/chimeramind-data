---
title: Bulk Core Web Vitals Check — PageSpeed Insights for Hundreds of URLs
h1: Check Core Web Vitals and PageSpeed scores for hundreds of URLs at once
short: Bulk Core Web Vitals
kicker: SEO & site audits
actor: core-web-vitals-audit
description: Run Google PageSpeed Insights over a whole URL list and get one flat row per page — Lighthouse scores, LCP, CLS, INP, TBT, real-user field data, a Core Web Vitals pass/fail and the biggest fixes.
updated: 2026-10-03
---

pagespeed.web.dev is perfect for one page. It is painful for a site migration with 300 templates, an agency checking 50 client homepages every month, or a sales team that wants to open with "your mobile site fails Core Web Vitals". This guide shows how to run **Google PageSpeed Insights over an entire list of URLs** and get one flat row per URL and device — the same numbers Google shows you, ready for a spreadsheet — for {{price}}.

## What you get

Each row combines two kinds of data that PageSpeed Insights reports:

- **Lab data** — a fresh Lighthouse run on Google's servers: `performanceScore` (0–100), optional `seoScore`, `accessibilityScore` and `bestPracticesScore`, plus `lcpMs`, `cls`, `tbtMs`, `fcpMs`, `speedIndexMs`, `ttiMs` and `ttfbMs`.
- **Field data** — real Chrome users over the trailing 28 days from the Chrome UX Report, in `fieldData` (`lcpMs`, `cls`, `inpMs`, `fcpMs`, `ttfbMs`, `overallCategory`), when the site has enough traffic to be included.

On top of that you get `passesCoreWebVitals` (field LCP ≤ 2500 ms, CLS ≤ 0.1 and INP ≤ 200 ms), a `labGrade` (`good`, `needs-improvement`, `poor`) and `topOpportunities` — up to five failed Lighthouse audits with their estimated savings, biggest first. A real row from a recorded run:

{{sample}}

## Before you start: the free API key

PageSpeed Insights has a shared anonymous quota that is almost always exhausted. Runs of **up to 5 URLs work without a key** on a demo quota so you can try the tool immediately. For anything bigger, create a free PageSpeed Insights API key in Google Cloud (no billing required; Google allows 25,000 requests per day) and paste it into **Google PageSpeed Insights API key**. Without one, rows come back with an HTTP 429 in `error` and empty metrics rather than failing the run.

## Step-by-step

1. Open the tool and paste the pages into **URLs to audit**, one full URL per line — the exact pages you care about, not just the homepage.
2. Paste your API key.
3. Choose the **Device strategy**: `mobile` is what Google uses for ranking; `both` returns two rows per URL.
4. Add extra **Lighthouse categories** (`seo`, `accessibility`, `best-practices`) if you want those scores too.
5. Keep **Max concurrency** at 2–3 and click **Start**. Expect roughly 10–30 seconds per URL and device, a few in parallel.

{{cta}}

## Call it from code

{{code}}

## Recipes

### Pre- and post-migration comparison
Export one URL per page template (home, category, product, article, landing page) before a redesign and run the audit. Run the same list after launch and diff `performanceScore`, `lcpMs` and `cls` per URL. Regressions show up per template instead of as a vague "the site feels slower".

### Weekly regression watch
Schedule the run for your 20–50 most valuable pages. Point a webhook or the Google Sheets integration at the dataset and alert when `labGrade` drops to `poor` or `passesCoreWebVitals` flips to `false`. Lab scores move a few points between runs, so alert on thresholds, not on every change.

### Prospecting with a concrete opener
Agencies run a list of prospect homepages overnight, filter rows where `passesCoreWebVitals` is `false`, and quote the first item of `topOpportunities` ("Reduce unused JavaScript — about 2 s of savings") in the outreach email. Feeding the list from another tool's dataset works through `inputDatasetId`.

## How much does it cost?

{{pricing}}

One row is one URL on one device, so `strategy: "both"` doubles the count. The Lighthouse work happens on Google's servers, which keeps platform usage tiny. Set **Maximum cost per run** in Apify and the tool trims the list to what the budget covers.

## How it compares

| Option | Good at | Watch out for |
|---|---|---|
| **This tool** | Hundreds of URLs per run, flat rows, field + lab data, schedule and API access, pay per row | Needs your free PSI key beyond 5 URLs; lab scores vary run to run like any Lighthouse test |
| pagespeed.web.dev | Quick one-off check with visual report | One URL per click, no export, no history |
| Lighthouse CLI on your machine | Full report, any URL including staging | Your hardware and network skew the numbers; no CrUX field data unless you query it separately |
| Monitoring subscriptions | Dashboards, alerts, long-term trends | Monthly seats whether or not you run checks |

## FAQ

### Why is fieldData null for my site?
The Chrome UX Report only covers origins with enough real Chrome traffic. Smaller sites get lab data only, and `passesCoreWebVitals` is then `null`, because INP cannot be measured in a lab run.

### Why did the score change between two runs?
Lighthouse is a live measurement on shared hardware, so performance scores move a few points from run to run. Treat field data as the stable truth and lab data as directional.

### Which device should I test?
Mobile, unless you have a specific reason. Google uses mobile performance for ranking, and mobile scores are usually the lower of the two.

### Is my API key safe?
The key field is a secret input in Apify, hidden in the Console and logs. The key only needs the PageSpeed Insights API enabled; restrict it to that API in Google Cloud.

### Can I check pages behind a login or on localhost?
No. PageSpeed Insights fetches the URL from Google's servers, so the page must be publicly reachable.
