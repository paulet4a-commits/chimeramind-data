---
title: llms.txt Generator — Create llms.txt and llms-full.txt for Any Website
h1: Generate llms.txt and llms-full.txt for your site or any docs site
short: llms.txt Generator
kicker: AI & LLM data
actor: llms-txt-generator
description: Crawl a website or documentation site and get a ready-to-publish llms.txt (sectioned page index in the llmstxt.org format) plus llms-full.txt (every page as clean Markdown in one file), with token counts per page.
updated: 2026-10-03
---

AI assistants and AI search engines increasingly look for a file called `/llms.txt`: a short Markdown index that tells a language model what a site is about and where its important pages are — the way `robots.txt` and `sitemap.xml` do for search crawlers. Writing one by hand for a site with hundreds of pages is tedious, and keeping it current is worse. This guide shows how to **generate `llms.txt` and `llms-full.txt` automatically** from any site, for {{price}}.

## What you get

Two files in the run's key-value store, plus one dataset row per page:

| Output | Content |
|---|---|
| `llms.txt` | `# Site name`, a `> summary` line, then `## Section` headings with `- [Page title](url): description` lines. Blog, changelog, legal and similar pages go under `## Optional`, as the llmstxt.org format suggests |
| `llms-full.txt` | The same header, then every page's full Markdown under its title and source URL — one file you can paste into ChatGPT, Claude or Cursor |
| `SUMMARY` | Per site: page and section counts, token counts of both files, download links, and whether the site already publishes its own `/llms.txt` |
| Dataset rows | `site`, `url`, `title`, `description`, `section`, `wordCount`, `tokens` and (optionally) `markdown` for each page |

A real dataset row from a recent run:

{{sample}}

Titles are cleaned (the repeated "| Site Name" suffix is removed) and descriptions come from each page's meta description — or its first paragraph when the meta description is missing or the same boilerplate on every page.

## Step-by-step

1. Open the tool and enter one or more **Start URLs** — your home page, or the entry page of a docs site.
2. Set **Max pages** per website (100 by default). This is the billed unit.
3. A start URL inside a folder keeps the crawl in that folder: `https://example.com/docs/intro` reads only `/docs` pages. Use **Include path prefixes** to choose folders yourself.
4. Leave **Use sitemap** on so the crawl starts from the site's real pages.
5. Click **Start**, then open the Output tab and download `llms.txt` and `llms-full.txt`.
6. To publish, upload `llms.txt` to your web root so it is served at `https://yoursite.com/llms.txt`.

{{cta}}

## Call it from code

{{code}}

## Recipes

### Publish an llms.txt for your own product docs
Run the tool on your docs URL, review the generated `llms.txt` (section names come from your URL structure), and deploy it with your site. Schedule a monthly run and diff the new file against the published one to catch pages that were added or removed.

### Give an AI assistant a library's documentation
Generate `llms-full.txt` for a framework or API you're working with and attach it to your assistant or IDE. The `tokens` count in `SUMMARY` tells you up front whether the whole file fits the model's context window; if not, narrow the crawl with **Include path prefixes**.

### Build a RAG index from a docs site
Pass the run's dataset to [RAG Text Chunker](https://apify.com/webdatatools/rag-text-chunker) with `inputDatasetId` set to this run's dataset ID. It finds the Markdown column automatically and returns heading-aware, token-counted chunks with the page URL attached, ready for embeddings.

## How much does it cost?

{{pricing}}

The `llms.txt` and `llms-full.txt` files themselves are free; you pay per page read. Pages that fail to load are listed in the `ERRORS` record and cost nothing.

## How it compares

| Approach | Good at | Watch out for |
|---|---|---|
| **This tool** | Both files plus per-page token counts in one run; cleaned titles and descriptions; noise pages (tags, authors, archives, search, login, cart) skipped; respects robots.txt | Plain HTTP: pages that render their text with JavaScript come out short |
| Writing llms.txt by hand | Small sites, full editorial control | Slow for large sites; goes stale as pages change |
| Docs-platform plugins | Sites built on that platform | Only works for sites you own on that platform — not for third-party docs you want to read |
| General website-to-Markdown crawlers | Markdown for each page | You still assemble the llms.txt index and sections yourself |

## FAQ

### What is llms.txt?
A proposed standard, described at llmstxt.org, for a Markdown file at `/llms.txt` that tells language models what a site contains and where its key pages are.

### The site already has an llms.txt. Why generate one?
`SUMMARY` tells you when it does. A generated file is still useful to compare coverage, or when you need `llms-full.txt` and the site doesn't publish one.

### Can I generate files for several sites in one run?
Yes. Each domain gets its own pair of files, prefixed with the domain name, for example `docs.example.com-llms.txt`.

### Does it work on JavaScript-heavy sites?
Only partly. It reads the HTML the server sends, so sites that render their text in the browser come out short. Server-rendered docs sites such as Docusaurus work well.

### How are pages grouped into sections?
Each page goes under its first folder in the URL — `/docs/…` pages under `## Docs`, `/guides/…` under `## Guides` — with language and version folders such as `/en/` or `/v2/` skipped, and top-level pages under `## Main`. Blog, news, changelog, careers, legal and similar sections are placed under `## Optional` so models can skip them when context is tight.
