---
title: Trendyol Scraper API — Products, Prices & Ratings as JSON
h1: Trendyol scraper API: product search results, prices and ratings as JSON
short: Trendyol Scraper API
kicker: E-commerce data
actor: trendyol-scraper
description: Trendyol scraper API: product names, prices, basket discounts, ratings and seller flags from keyword or search-URL results. $1 per 1,000 products.
updated: 2026-11-07
---

Trendyol is Turkey's biggest online marketplace, and most of the useful data about it sits on search pages: which products rank, what they cost, how they are rated. Copying that by hand does not scale. This guide shows how to use **Trendyol Scraper**, an Apify Actor that reads public Trendyol search results and returns one structured row per product. It is a practical trendyol scraper API for price monitoring, competitor catalogues and seller research, and it has no login step.

## What you get

Each product comes back as one row with these fields, as documented in the Actor's README:

- **Ranking and identity:** `position`, `productId`, `name`, `brand`, `variant` (size or colour), `category`, `categoryId`, `url`.
- **Prices (TRY):** `price` (selling price), `discountedPrice` (lower basket price when a promotion applies), `oldPrice` (the struck-through price), `currency`.
- **Demand signals:** `rating` (1 to 5), `ratingCount`, `favoriteCountText` and `orderCountText`. These are text exactly as Trendyol shows them, such as "19K" or "1000+", not exact counts.
- **Promotions and shipping:** `promotions`, `badges`, `freeCargo`, `sameDayShipping`, `nextDayDelivery`.
- **Seller and ads:** `hasOfficialSellerBadge`, `merchantId`, `isSponsored`.
- **Search context and images:** `searchKeyword`, `searchUrl`, `searchStrategy`, `totalResultsText`, `imageUrl`, `images`.

One product row has this shape:

{{sample}}

{{cta}}

## Call it from code

You can enter **keywords** separated by `;`, paste **Trendyol search URLs** (`https://www.trendyol.com/sr?q=…`) with your filters kept, or both. **Max products per search** defaults to 100, allows up to 5000, and Trendyol shows 36 products per page. This is a bounded example input for one keyword. Every key comes from the Actor's input schema:

```json
{
    "keywords": "kulaklık",
    "sortBy": "best_seller",
    "maxProducts": 50,
    "skipSponsored": true,
    "proxyMode": "auto"
}
```

{{code}}

## Recipes

### Trendyol price tracker: daily price snapshots
Run the same keyword list on a schedule of your own and store `price`, `discountedPrice` and `oldPrice` per `productId`. Comparing snapshots shows when a basket discount starts or ends. Keep the `searchKeyword` and `searchStrategy` fields with each row so you can tell a true price move from a search that fell back to similar products.

### Competitor catalogue
Search your competitors' brand names or product types and group the rows by `merchantId` or `brand`. Count products per seller within a fixed `maxProducts` limit, and compare `rating` and `ratingCount` per product. Turn on `skipSponsored` if you want only organic results, since ads appear among them and are flagged.

### Seller research
Filter rows where `hasOfficialSellerBadge` is `true` to see which official sellers carry a category. Use `favoriteCountText` and `orderCountText` as rough demand signals, remembering they are formatted text such as "19K". Stock levels and seller names are not in search results, so verify those on the product page.

## How much does it cost?

Trendyol Scraper is pay per product: **$0.001 per product, or $1 per 1,000**, with volume discounts on paid Apify plans. Searches that fail are listed in the `ERRORS` record and cost nothing. Set **Maximum cost per run** in Apify to cap spend. Use **Max products per search** to bound each keyword before you run it.

{{pricing}}

## How it compares

| Option | Good at | Watch out for |
|---|---|---|
| **Trendyol Scraper** | Structured rows per product, pay per product, API access, no login | Only search URLs are accepted; sponsored rows are mixed in unless you skip them |
| Copying from trendyol.com by hand | Free, no setup, fine for a handful of products | Manual, no structure, nothing repeats on a schedule |
| Building your own scraper | Full control over fields and pages | You maintain the browser, proxies and parsing yourself. The README says the Actor runs a real Chrome browser because plain HTTP scrapers get blocked on this site |

## FAQ

### Does Trendyol have a public product API?
The Actor's README does not document an official Trendyol product API, and this Actor does not use one. It reads public search results. If you need an official endpoint, check Trendyol's own developer or seller documentation; this guide does not claim one exists.

### Is trendyol scraping legal?
The README says the Actor reads public search results that anyone can see without an account. Check that your use of the data is allowed where you are.

### Can I scrape a Trendyol category page?
Not directly. Only search URLs (`trendyol.com/sr?q=…`) are accepted. Search the category name, or filter a search on trendyol.com and paste that URL.

### Why is isSponsored true on some rows?
Trendyol mixes ads into search results, often about half of the first page. They are marked `isSponsored`. Turn on **Skip sponsored products** to leave them out.

### Does the output include seller names, stock or reviews?
No. The README says seller names, stock levels and reviews are not in the search results. You get `merchantId` and the official seller badge flag instead.

### What does a searchStrategy other than DEFAULT mean?
When a search has no exact matches, Trendyol falls back to similar products. `searchStrategy` then shows something other than `DEFAULT`.

### Can I search in Turkish?
Yes. Write keywords with Turkish characters, for example `kulaklık` or `çamaşır makinesi`.

### What does proxyMode do?
It controls network routing. `auto` (the default) connects directly first and switches to an Apify Residential proxy in Turkey only if Trendyol blocks the run. `never` uses a direct connection only. `always` uses the Residential proxy from the start.
### How do I get the results out?
Download the products as JSON, CSV, Excel or HTML, or read them through the API. Each product is one row, so the output drops straight into a spreadsheet or a database table.

### How do I keep a run from costing too much?
Lower **Max products per search** for each keyword, and set **Maximum cost per run** in Apify to cap spend, as the cost section describes.
