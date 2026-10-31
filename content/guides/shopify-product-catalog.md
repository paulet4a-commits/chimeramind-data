---
title: Export Shopify Products, Variants and Prices to CSV
h1: A Shopify product export you can check before comparing prices
short: Shopify catalog export
kicker: Product research
actor: shopify-products-scraper
description: Export public Shopify products and variants, distinguish stock flags from inventory quantities, and compare successful snapshots without inventing price changes.
updated: 2026-10-31
---

Use a public Shopify catalog export to research an assortment, compare product prices or prepare a product feed. Start with two products from one store, check the output, then increase the limit. This workflow reads the store's public product feed; it does not require store administrator access.

## Start with a small catalog export

Open the Actor's input form and set `stores` to the store URL, `maxProductsPerStore` to `2`, `includeVariants` to `false`, and `maxConcurrency` to `1`. Review the current Pricing tab and set Maximum cost per run before starting.

After completion, check that each row has a `productId`, `productUrl` and `title`, and that `error` is empty. Export JSON for a repeatable comparison, or CSV for a spreadsheet. These are input instructions, not a claim about how many products a particular store currently sells.

## Choose product rows or variant rows

| Mode | A row represents | Useful price fields | Stable comparison key |
| --- | --- | --- | --- |
| `includeVariants: false` | One product | `minPrice`, `maxPrice` | `store` + `productId` |
| `includeVariants: true` | One size, color or other variant | `price`, `compareAtPrice` | `store` + `variantId` |

The product limit counts products, not variant rows. A product with ten variants can produce ten rows in variant mode. Choose the mode deliberately before estimating result charges or importing a CSV.

For price comparisons, use the same variant key in both snapshots. Do not compare one product's minimum price with another variant's list price. An absent `compareAtPrice` is unknown, not zero. Product-level discount values combine price ranges and should not be treated as a particular variant's verified discount.

## Understand stock and currency limits

`available` is a public variant availability flag; it is not a promise about stock quantity. `inventoryQuantity` is null when the store does not publish a quantity. Do not convert null into zero or infer a sell-out from missing information.

The public product feed does not reliably identify currency. Treat null `currency` as unknown and confirm the storefront currency before comparing prices between stores. This tool does not convert currencies or include shipping and tax calculations.

## Preserve the last complete observation

Check the run and its `OUTPUT` key-value record before replacing a saved inventory. `failedStores`, `budgetSkippedStores`, `budgetLimitedStores`, `truncatedRows` and `deliveryUnconfirmed` flag failures or spending limits that make an export unsuitable as a full replacement. Your configured product limit and availability filters can also exclude products.

A blocked, invalid or repeating page creates a `DIAGNOSTIC-*` record instead of a billable product row. `OUTPUT.firstDiagnosticKey` points to the first record. A run with source failures and no usable products fails; a valid empty feed or no matching filter results is reported separately in `emptyStores`. Mixed runs retain usable products and expose failed-store counts. Preserve the previous inventory for failed or limited stores; an incomplete export is not evidence that stock was deleted.

Save `scrapedAt` with your snapshot. Compare successful exports with the same store, collection filters, product limit and row mode. A missing product can reflect a limit or filter change; it does not establish that a product was removed. Scheduling, snapshot storage and notifications are separate steps you configure in your automation.

## When a free direct feed is enough

If you maintain your own code and need only one occasional export, requesting the store's public `/products.json` feed directly may be sufficient. You will need to handle pagination, row mapping and failures yourself. A paid Actor is useful when you want the hosted run, standardized rows, dataset exports and API integration without operating that code. If the feed is blocked or private, this Actor does not grant access.

## API, MCP and CLI access

[Open the tool page for its MCP connection address, CLI commands and downloadable input](/tools/shopify-products-scraper/). Authenticate with your own Apify account. Review the input and run budget before an agent executes it.

{{code}}

## Pricing

{{pricing}}

Check the Actor's live Pricing tab for all applicable events and start fees. More stores and more variants can increase the result count. A diagnostic or failed request does not guarantee the entire run is free.

## Recorded example

{{sample}}

## FAQ

### Can I export a private or password-protected store?
No. The workflow requires a public product feed and does not log into stores.

### Does it automatically alert me about price changes?
No. It exports a snapshot. Store successful snapshots and compare identical variant keys in your own workflow.

### Can I use it without code?
Yes. Run it in Apify Console and export the dataset as CSV or JSON. Test a small input and inspect its result first.

{{cta}}
