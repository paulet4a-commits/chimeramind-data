---
title: Website Tech Stack Lookup in Bulk — a Wappalyzer and BuiltWith Alternative
h1: Find out what any website is built with — for thousands of sites at once
short: Tech Stack Lookup
kicker: Leads & company data
actor: tech-stack-detector
description: Detect the CMS, e-commerce platform, analytics, ad pixels, payment providers, chat widgets, frameworks and hosting of any list of websites — one row per site, with tracking IDs and confidence scores.
updated: 2026-10-03
---

"Which of these 2,000 companies run Shopify and use Klaviyo?" is a question sales, partnership and market-research teams ask every week. Browser extensions answer it one site at a time; lookup subscriptions answer it with monthly caps. This guide shows how to fingerprint **a whole list of websites** and get one clean row per site — CMS, shop platform, analytics, ad pixels, payments, chat, frameworks, hosting and tracking IDs — for {{price}}.

## What you get

The tool crawls a few pages per site over plain HTTP and matches them against 7,000+ open-source Wappalyzer fingerprints. Each website becomes one row:

| Field | What it tells you |
|---|---|
| `cms`, `ecommerce`, `primaryCms`, `primaryEcommerce`, `isEcommerce` | Content and shop platforms, plus a best single guess |
| `analytics`, `advertising` | Analytics tools and ad pixels |
| `emailMarketing`, `chat`, `payments` | Marketing, live-chat and payment providers |
| `frameworks`, `cookieConsent`, `cdn`, `server` | Front-end stack, consent tool, hosting and web server |
| `trackingIds` | GA4, GTM, Google Ads, Meta Pixel, Hotjar, Yandex and TikTok IDs found on the site |
| `technologies`, `byCategory`, `technologyCount` | Every detection with categories, version and confidence (0–100) |
| `domain`, `title`, `description`, `generator`, `pagesCrawled` | Who the site is and how much was crawled |

A real row from a recorded run:

{{sample}}

Detections are anchored to signals a site can only have if it truly runs the technology — HTTP headers, cookies, generator tags, script sources from the vendor's own hosts, namespaced JavaScript globals — rather than brand names appearing in page text.

## Step-by-step

1. Open the tool and paste websites into **Websites** — bare domains or full URLs.
2. Leave **Max pages per website** at 3 (homepage plus a couple of internal pages catches most scripts). Raise it if a tool you expect is missing.
3. Optional: narrow **Technology categories** (for example `cms`, `ecommerce`, `advertising`). Empty means detect everything.
4. Turn on **Follow subdomains** when the shop or app lives on `shop.` or `app.`.
5. Click **Start** and export JSON, CSV or Excel. `trackingIds` and `byCategory` are objects; the flat fields like `primaryCms` and `isEcommerce` filter nicely in a spreadsheet.

{{cta}}

## Call it from code

{{code}}

## Recipes

### Build a segmented lead list
Start from a list of company domains (a CRM export, a directory scrape, or Google results from the search tool chained through `inputDatasetId`). Run the detector, then filter `primaryEcommerce = "Shopify"` and `emailMarketing` containing your competitor. You now have a list of shops that use the product you replace.

### Competitive and market mapping
Fingerprint the top 500 sites in a niche and count `primaryCms`, `payments` and `analytics` values. It's a quick, defensible answer to "what share of DTC brands in Germany run Shopware vs. Shopify?" — with the raw rows to back it up.

### Agency audit prep
Before a pitch, run the prospect's domains and note the analytics and ad pixels (`trackingIds` shows the exact GA4 and Meta Pixel IDs). Missing GA4, duplicate tag containers or no consent tool are concrete talking points.

## Limitations worth knowing

- **Tags loaded through Google Tag Manager are invisible.** They're injected at runtime by JavaScript; this tool reads HTML, so it reports the GTM container (and its ID) but not the tags inside it.
- It reads a few pages per site. A script that only appears on the checkout page may be missed unless you raise **Max pages per website**.
- Sites that block automated HTTP requests return a row with `error` instead of detections.

## How much does it cost?

{{pricing}}

One website is one result, however many pages are crawled for it. Narrowing categories and keeping the page budget low also keeps platform usage down. Set **Maximum cost per run** to cap spend.

## How it compares

| Option | Good at | Watch out for |
|---|---|---|
| **This tool** | Thousands of sites per run, one row per site, tracking IDs, confidence scores; API, schedules and MCP; pay per site | HTML-only: misses tags injected through Google Tag Manager or loaded only after user interaction |
| Browser extensions | Instant answer for the site you're viewing, including runtime-loaded scripts | One site at a time, no export |
| Lookup subscriptions | Historical data and large precomputed databases | Monthly plans with lookup caps |
| DIY fingerprinting | Full control | Maintaining thousands of signatures yourself |

## FAQ

### How accurate is it?
Signatures are anchored to technical evidence such as vendor script hosts, headers, cookies and generator tags, so false positives are rare. Each detection carries a confidence score so you can filter borderline ones.

### Why is a tool I know they use missing?
Most often it's loaded through Google Tag Manager, which this HTML-based tool can't see inside. Otherwise the script may live on a page outside the crawl budget — raise Max pages per website.

### Does it detect regional platforms?
Yes, the open-source ruleset covers many regional platforms, and the tool adds its own signatures for Turkish e-commerce and payments: Ticimax, IdeaSoft, T-Soft, ikas, Platin Market, iyzico, PayTR and Shopier.

### Do I need a proxy?
Usually not — it runs on plain HTTP. A proxy option is available for sites that rate-limit repeated requests.

### Can an AI agent call it?
Yes. It's available through the Apify MCP server, so an assistant can fingerprint a list of domains and summarise the results for you.
