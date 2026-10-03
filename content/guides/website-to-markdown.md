---
title: How to Convert a Website to Markdown for LLMs and RAG
h1: Turn any website into clean Markdown for your LLM or RAG pipeline
short: Website to Markdown
kicker: AI & LLM data
actor: website-to-markdown
description: Crawl a docs site, blog or help center and get one clean Markdown document per page — navigation and cookie banners stripped, headings and code kept — ready for chunking and embeddings.
updated: 2026-10-03
---

Large language models read Markdown far better than raw HTML. A typical documentation page is 80–90 % markup, scripts and navigation; the part you actually want an LLM to see — headings, paragraphs, code blocks, tables — is buried inside it. This guide shows how to crawl a whole site and get **one clean Markdown document per page**, with the boilerplate removed, in a few minutes and for about {{price}}.

## What you get

Each crawled page becomes one row with the page's `url`, `title`, `description`, `markdown` (or plain `text`), a `wordCount`, the page's heading outline and its outgoing links. Here is a real row from a recent run, trimmed for length:

{{sample}}

The crawler keeps what matters for retrieval and drops what doesn't:

| Kept | Removed |
|---|---|
| Headings (`#`…`######`) and their hierarchy | Site navigation, menus and breadcrumbs |
| Paragraphs, lists, block quotes | Footers, sidebars, "related posts" |
| Code blocks, with their language when the site marks it | Cookie banners and newsletter pop-ups |
| Tables | Scripts, styles, tracking pixels |
| Links, rewritten to absolute URLs | Decorative icon links |

## Step-by-step: crawl a site in the Apify Console

1. Open the tool and paste a start URL — for example the root of a docs site such as `https://docs.apify.com/platform`.
2. Set **Max pages**. This is the billed unit and the crawl stops at exactly that number, so a 200-page crawl can never cost more than 200 results.
3. Leave **Use sitemap** on. The crawler reads `/sitemap.xml` (including nested sitemap indexes) and starts from real content pages instead of discovering them link by link.
4. Optional: add **Include path prefixes** such as `/docs` to stay inside one section of a large site.
5. Click **Start**. A 50-page docs crawl usually finishes in under a minute; download the results as JSON, CSV or Excel, or read them through the API.

{{cta}}

## Call it from code

The same crawl from Python, JavaScript or the command line. Replace the token with your own from the Apify Console (Settings → API & Integrations).

{{code}}

## Getting RAG-ready chunks in the same run

Most pipelines split each page into chunks before embedding. Turn on **Add RAG chunks** (`chunkForRag: true`) and every row gets a `chunks` array: heading-aware pieces of the Markdown, each with its token count and the heading path it sits under (`["Platform", "Actors", "Running"]`). Chunk size is set with `chunkSize` (500 tokens by default). Because chunks never cross a heading, a retrieved chunk always comes with the context of the section it belongs to — which measurably improves answer quality compared with fixed-length splitting.

## Keeping a knowledge base fresh

Re-crawling a 2,000-page site every day just to find the ten pages that changed is wasteful. With **Change detection** on, the crawler remembers each page's content hash from the previous run with the same start URLs and marks every row `new`, `changed` or `unchanged`. Unchanged pages can come back without their body text (`skipUnchangedContent`), so your pipeline only re-embeds what actually changed. Schedule the run daily in Apify and connect a webhook to your ingestion job.

## How much does it cost?

{{pricing}}

A practical example: a 300-page documentation site costs **300 results** on the free plan price above. There is no separate charge for compute, bandwidth or proxies — those are included in the per-result price.

## How it compares

| Approach | Good at | Watch out for |
|---|---|---|
| **This tool** (HTTP crawler) | Fast, cheap, predictable cost; docs sites, blogs, help centers, marketing sites; sitemap-aware; chunks and change detection built in | Does not execute JavaScript, so single-page apps that render all content client-side come back nearly empty |
| Browser-based crawlers (e.g. Apify's Website Content Crawler) | JavaScript-heavy sites and SPAs | Each page loads a full browser, so runs are slower and more expensive per page |
| Hosted "URL to Markdown" APIs | Converting one URL at a time from an app | You build the crawling, deduplication and page limits yourself; credit-based pricing |
| DIY (`requests` + an HTML-to-Markdown library) | Full control | You maintain boilerplate removal, link resolution, sitemaps, retries and politeness rules |

Rule of thumb: if you can see the content with JavaScript disabled in your browser, this HTTP crawler will get it — at a fraction of browser cost.

## FAQ

### Can it crawl sites that need JavaScript?
No. It fetches raw HTML without running page scripts. Most documentation, blogs and help centers render on the server and work well; client-side single-page apps need a browser-based crawler instead.

### Does it respect robots.txt?
Yes, by default. URLs disallowed by the site's robots.txt are skipped. You can turn this off only for sites you own or have permission to crawl.

### How do I crawl only part of a site?
Use Include path prefixes (for example `/docs` or `/blog`) and Exclude patterns for things like `/login` or file downloads. Max depth limits how many links deep the crawl goes from the start URL.

### What happens if my run hits its timeout?
The crawler stops shortly before the run timeout and finishes successfully with every page crawled so far. You are only billed for pages that were delivered.

### Can an AI agent call it directly?
Yes. Every Apify tool is available through the Apify MCP server, so assistants such as Claude or ChatGPT with MCP support can run the crawl and read the Markdown themselves.
