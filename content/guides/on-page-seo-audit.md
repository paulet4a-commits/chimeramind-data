---
title: Bulk On-Page SEO Audit — Check Titles, Meta Tags and Headings for Any URL List
h1: Audit on-page SEO for a whole list of URLs in seconds
short: On-Page SEO Audit
kicker: SEO & site audits
actor: seo-page-audit
description: Check titles, meta descriptions, headings, canonicals, indexability, image alt text, links, Open Graph and schema.org for any list of pages, and get one scored row per URL with plain-English issues.
updated: 2026-10-03
---

Most on-page SEO problems are boring and mechanical: a template that drops the meta description, a canonical pointing at the wrong URL, a `noindex` that survived a staging deploy, product images without alt text. Finding them across hundreds of pages by hand is the expensive part. This guide shows how to audit **any list of URLs** and get one row per page with the facts, a 0–100 score, an A–F grade and a list of issues in plain English — for {{price}}.

## What you get

Every audited page returns the raw on-page facts and a verdict:

| Area | Fields |
|---|---|
| Title & description | `title`, `titleLength`, `metaDescription`, `metaDescriptionLength` |
| Indexing | `canonical`, `canonicalMatches`, `robotsMeta`, `isIndexable`, `statusCode`, `finalUrl` |
| Structure | `h1Count`, `h1`, `h2Count`, `h3Count`, `headingsOutline`, `wordCount`, `textToHtmlRatio` |
| Images | `imageCount`, `imagesMissingAlt`, `imagesMissingAltSample` |
| Links | `internalLinkCount`, `externalLinkCount`, `nofollowLinkCount`, `brokenLinks` |
| Social & structured data | `openGraphComplete`, `twitterCardPresent`, `schemaTypes` |
| Verdict | `issues`, `seoScore`, `seoGrade` |

A real row from a recorded run:

{{sample}}

## How the score works

Every page starts at 100 and loses points per issue: missing or too-long title (15 / 5), missing or too-long meta description (10 / 5), no H1 or several H1s (10 each), images missing alt text (5), `noindex` (20), canonical mismatch (10), missing viewport (5), missing `lang` attribute (5), thin content under 300 words (15) and mixed HTTP content on an HTTPS page (10). The score is floored at 0 and graded A ≥ 90, B ≥ 75, C ≥ 60, D ≥ 40, otherwise F. Because every deduction also appears as a sentence in `issues`, the score is never a black box — you can see exactly why a page lost points.

## Step-by-step

1. Open the tool and paste page URLs into **URLs** — one row comes back per URL. Bare domains get `https://` added.
2. Optional: turn on **Check internal links for broken ones** to HEAD-check up to 50 internal links per page and list the broken ones in `brokenLinks`. It adds requests, so leave it off for quick passes.
3. Click **Start**. A page typically audits in under a second, so a few hundred pages finish in minutes.
4. Sort the dataset by `seoScore`, or filter `isIndexable = false`, and export to CSV or Excel.

{{cta}}

## Call it from code

{{code}}

## Recipes

### Audit a whole site from its sitemap
Run the Sitemap Extractor on the domain, then start this audit with `inputDatasetId` set to that run's dataset (and `inputField` to the URL column). Every URL in the sitemap gets a scored row without you copying a single link.

### Catch template regressions after a deploy
Pick one URL per template and schedule a daily run. A drop in `seoScore` on the product template, or a new "Missing meta description" issue, means the last deploy broke something — you'll know before Search Console does.

### Content QA before publishing
Writers paste draft preview URLs (if they're publicly reachable) and fix anything flagged in `issues` — thin content, missing H1, images without alt text — before the page goes live.

## How much does it cost?

{{pricing}}

Pages that fail to load are not charged. Auditing 1,000 pages is 1,000 results, with no subscription and no software to install.

## How it compares

| Option | Good at | Watch out for |
|---|---|---|
| **This tool** | Any URL list, from any source; API, schedules and MCP; scored rows with explicit issues; nothing to install | Reads raw HTML, so content injected by JavaScript after load isn't seen; audits the pages you give it rather than discovering a whole site |
| Desktop SEO crawlers | Full-site discovery, deep reports, JavaScript rendering options | Installed software and licences; harder to automate in a pipeline |
| SEO suite site audits | Dashboards, trends, many extra checks | Monthly subscription, project limits |
| Browser extensions | Instant check of the page you're on | One page at a time, nothing to export |

## FAQ

### Does it render JavaScript?
No. It fetches the raw HTML, which is what many crawlers see on their first pass. If your titles or content are injected client-side, they won't appear in the audit — which is itself a useful warning.

### Why doesn't alt="" count as missing alt text?
An empty `alt=""` is the correct, deliberate way to mark decorative images for screen readers. Only a missing `alt` attribute is counted as an issue.

### Can it crawl my whole site by itself?
It audits the URLs you give it. To cover a whole site, feed it a sitemap or a crawl result through `inputDatasetId`, as in the first recipe.

### How does broken-link checking work?
With Check internal links on, it HEAD-checks up to 50 internal links per page and lists the ones that fail in `brokenLinks`. External links are counted but not checked.

### Can an AI assistant use it?
Yes. It's callable through the Apify MCP server, so you can ask an assistant to "audit these ten blog posts and tell me which need a meta description" and it runs the audit itself.
