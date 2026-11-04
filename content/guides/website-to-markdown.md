---
title: Convert Website Pages to Markdown for RAG
h1: Convert website pages to Markdown and check them before indexing
short: Website to Markdown
kicker: AI and LLM data
actor: website-to-markdown
description: Start with one public HTML page, inspect the Markdown and run diagnostics, then expand to a bounded crawl for your RAG pipeline. Includes a free local alternative.
updated: 2026-11-04
---

Collect readable content from public documentation, blogs or help centers for a knowledge base. This Actor fetches HTML without running page scripts. Inspect one representative page before expanding the crawl or paying for embeddings. A login screen or cookie notice is not the document you wanted to index.

## Start with one page

Open the Actor, switch Input to JSON and paste this input. Replace the URL with a page you own or have permission to crawl.

```json
{
  "url": "https://docs.apify.com/platform",
  "outputFormat": "markdown",
  "maxConcurrency": 1,
  "respectRobots": true,
  "chunkForRag": false,
  "changeDetection": false
}
```

The `url` field selects single-page mode: it overrides crawl settings such as `startUrls` and `maxPages`, without sitemap seeding or link following. Review **Pricing** and set **Maximum cost per run** before starting. A page limit controls scope; the result rate alone is not a quote for every possible run charge.

In the dataset, check the requested and final URLs, HTTP status, title and actual Markdown. Confirm that the paragraphs, headings and code you need were extracted, rather than an access page or navigation text. Only then export JSON or connect your ingestion step.

{{cta}}

## Check the run outcome as well as the rows

The current source writes successful page rows to the dataset and lists failed pages separately. In the run's default key-value store, inspect:

| Record | What to check |
| --- | --- |
| `OUTPUT` | `resultRows`, `failedPages`, `discoveryFailures` and `partial` describe this process attempt. |
| `ERRORS` | Failed page requests, when failures were recorded. |
| `DISCOVERY_ERRORS` | Sitemap or discovery failures, when present. |

If `deliveryUnconfirmed` is true, inspect the existing dataset before retrying. A lost write response does not establish that no row was delivered. Retain run IDs in API integrations so a disconnected request can be reconciled without starting duplicate paid work.

A successful run can still contain a partial crawl. An empty dataset does not prove the site has no content. Check status and diagnostics before updating your knowledge base, and preserve the last good documents when a replacement crawl fails.

## Expand to a small crawl

After the single-page check, remove `url` and use a bounded crawl input:

```json
{
  "startUrls": [{ "url": "https://docs.apify.com/platform" }],
  "maxPages": 5,
  "maxDepth": 1,
  "sameDomainOnly": true,
  "includePathPrefixes": ["/platform"],
  "useSitemap": false,
  "maxConcurrency": 1,
  "respectRobots": true,
  "outputFormat": "markdown"
}
```

Replace both the URL and path prefix for your site. Sitemap seeding is off for this first crawl so discovery stays easier to inspect. Enable it later if useful, with the path filters and budget set correctly. Increase the page limit gradually; a limit does not guarantee that many usable pages will be fetched.

## Use the output in a RAG pipeline

Keep `url`, `finalUrl`, `title`, `markdown`, `contentHash` and `crawledAt` with each document. They identify the source and help compare successful observations. Embeddings, vector storage and retrieval evaluation remain separate steps in your application.

Setting `chunkForRag: true` adds heading-aware chunks. Review boundaries against your actual documents before choosing a chunk size. No chunk setting guarantees better answers.

With `changeDetection: true`, state is associated with the start URLs in your Apify account. `changeStatus` can be `new`, `changed` or `unchanged`; it describes observations, not a complete audit of a site. When `skipUnchangedContent` removes the body from unchanged rows, retain the previous document in your storage. A page missing from a partial crawl should not be treated as deleted.

## A free local alternative

[Trafilatura](https://github.com/adbar/trafilatura) is an open-source option for extracting content on infrastructure you manage. Its [command-line documentation](https://trafilatura.readthedocs.io/en/latest/usage-cli.html) supports Markdown output with `--markdown` or `--output-format markdown`.

Use a local library when you want to manage fetching, storage and operation yourself. Choose this Actor when an Apify run, dataset, export and scheduled task fit your workflow. Compare the output on your representative pages; there is no general speed, quality or total-cost advantage established here.

## Pricing and a dated example

{{pricing}}

The recorded sample below illustrates field format. Its displayed date applies to that saved run; it is not a fresh test of your target site or the current build.

{{sample}}

## FAQ

### Does the crawler execute JavaScript or log in?

It fetches public HTML without a browser. Pages requiring client-side rendering or authentication need another permitted extraction path.

### Is a successful run a complete copy of the website?

No. Page limits, filters, robots rules, access errors and time or charge budgets can leave a partial crawl. Inspect `OUTPUT` and any error records before calling it complete.

### Can I keep a knowledge base updated automatically?

You can save an Apify task and configure a schedule. Storage updates, deletion policy, embeddings and alerts belong in your pipeline. Validate a manual run and its cost before scheduling repeated work.

### What if an API request disconnects?

Check the existing run, dataset and diagnostics in Apify before retrying. A retained run ID helps prevent duplicate work and charges.
