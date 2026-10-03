---
title: Zillow Scraper — Export Homes for Sale, Rentals and Recently Sold Listings
h1: Export Zillow listings — for sale, for rent and recently sold — to a spreadsheet
short: Zillow Scraper
kicker: Real estate data
actor: zillow-scraper
description: Collect Zillow search results for any city, ZIP code, neighborhood or filtered search URL — price, address, coordinates, beds, baths, square feet, Zestimate, rent Zestimate, tax-assessed value, broker, photos and sale date — as JSON, CSV or Excel.
updated: 2026-10-03
---

Zillow is where most US home searches start, and its search results already hold what an investor or analyst needs for a first pass: price, size, Zestimate, rent estimate, tax-assessed value and, for sold homes, the sale date and price. What Zillow doesn't offer is an export button. This guide shows how to turn any Zillow search into **one row per home**, for {{price}}.

## What you get

A real row from a recent run, trimmed:

{{sample}}

| Field | Meaning |
|---|---|
| `zpid`, `url`, `status`, `statusText` | Zillow's home ID, the listing link and its status |
| `price`, `priceText`, `soldPrice`, `dateSold` | Asking price, or sale price and date for sold homes |
| `address`, `street`, `city`, `state`, `zipcode`, `latitude`, `longitude` | Location |
| `beds`, `baths`, `livingArea`, `lotArea`, `lotAreaUnit`, `homeType` | The property |
| `zestimate`, `rentZestimate`, `taxAssessedValue` | Zillow's value and rent estimates, and the tax assessment |
| `daysOnZillow`, `brokerName`, `listingLabel` | Market context |
| `imageUrl`, `photos`, `has3DModel`, `hasVideo` | Media |
| `isBuilding`, `buildingName`, `units` | Apartment buildings with their units and prices (rentals) |
| `searchLocation`, `searchUrl`, `listingType`, `region`, `totalResults` | Which search produced the row |

## Step-by-step

1. Open the tool and enter **Locations** — a city, ZIP code, neighborhood or county, several separated by `;` (`Austin, TX; 90210; Brooklyn, NY`).
2. Choose a **Listing type**: homes for sale, for rent, or recently sold.
3. Optional: choose **Sort by** (newest, price low or high, beds, baths, size and more).
4. Or paste **Search URLs** copied from zillow.com after you set filters such as price range, beds, home type or a drawn map area — they are paged exactly as they are.
5. Set **Max listings** per location or URL and click **Start**. Export as JSON, CSV or Excel.

{{cta}}

## Call it from code

{{code}}

## Recipes

### Sold comps for a neighborhood
Set **Listing type** to recently sold and **Sort by** to newest for the ZIP codes around a property. `soldPrice`, `dateSold`, `livingArea` and `beds` give you a comps table; dividing price by living area gives price per square foot. Note the non-disclosure caveat below for states like Texas.

### Rental yield screening
Run the same area twice — once for sale, once for rent — or use the `rentZestimate` that comes with for-sale listings. Comparing `price` with `rentZestimate` across hundreds of homes is a fast first filter for investors before anyone looks at a single listing.

### From search results to full property details
Search results don't include a home's full description or price history. Pass this tool's dataset to [Zillow Home Details Scraper](https://apify.com/webdatatools/zillow-detail-scraper) with `inputDatasetId` set to this run's dataset ID — it reads the `url` column and returns description, photos and price history for every home you found.

## Covering a whole city

Zillow shows at most 20 pages — about 820 homes — per search. For a large city, split the area: run ZIP codes or neighborhoods separately, or paste several search URLs that split the market by price range. Each row records the search it came from and its `zpid`, so duplicates across overlapping searches are easy to remove.

## How much does it cost?

{{pricing}}

The residential proxy Zillow requires from cloud servers is included in the price. Searches that fail or find nothing are listed in the `ERRORS` record and cost nothing.

## How it compares

| Approach | Good at | Watch out for |
|---|---|---|
| **This tool** | Search results at scale: for sale, rentals and sold; any location or your own filtered search URL; proxy included | Only what search results show — full descriptions, price history, school ratings and agent phone numbers are on each home's own page |
| Browsing zillow.com | Looking at a few homes | No export; copying by hand |
| MLS access | Complete, authoritative listing data | Requires a licensed agent or a paid data agreement |
| Commercial real-estate data providers | Nationwide coverage, history, APIs | Contracts and pricing aimed at enterprises |

## FAQ

### Why is soldPrice empty for some sold homes?
Texas, Utah and other non-disclosure states don't publish sale prices, so `soldPrice` stays empty there. `dateSold` and the Zestimate are still filled.

### Why is the Zestimate missing on some homes?
Zillow doesn't publish a Zestimate for every property — new construction and rentals often don't have one.

### How many homes can one search return?
Up to about 820 (20 pages), which is Zillow's own limit. Split big areas by ZIP code or price range to collect more.

### Why does it need a residential proxy?
Zillow blocks cloud-server IP addresses, so after its first request the tool switches to a US residential proxy. That cost is already included in the per-home price.

### Is scraping Zillow legal?
The tool reads public search results that anyone can see without an account. Check that your use is allowed where you are, and respect Zillow's terms if you republish listings.
