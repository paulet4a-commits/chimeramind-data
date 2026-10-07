---
title: Google Maps Scraper — Export Businesses, Phones, Websites and Ratings to CSV
h1: Export Google Maps businesses to a spreadsheet — phones, websites, ratings and coordinates
short: Google Maps Scraper
kicker: Leads & local data
actor: google-maps-scraper
description: Search Google Maps for any business type in any city or country and get one row per place — name, category, address, phone, website, rating, review count, coordinates and today's opening hours — as JSON, CSV or Excel.
updated: 2026-10-03
---

Google Maps is the most complete directory of local businesses there is, but it's built for finding one coffee shop, not for exporting five hundred of them. Sales teams building lead lists, agencies auditing local SEO, analysts mapping competitors and founders sizing a market all need the same thing: **every result of a Maps search as a row in a spreadsheet**. This guide shows how to get exactly that in seconds, for {{price}}.

## What you get

Search for a term in a location — `dentist` in `Austin, TX`, `restoran` in `Kadıköy, İstanbul` — and every place in the results becomes one row. A real row from a recorded run:

{{sample}}

| Field | Meaning |
|---|---|
| `name`, `primaryCategory`, `categories` | Business name and its Google categories |
| `address`, `street`, `neighborhood`, `city`, `postalCode`, `countryCode` | Full address and its parts |
| `phone`, `phoneInternational` | Local and E.164 phone number, when the business lists one |
| `website` | The business's own site |
| `rating`, `reviewsCount` | Star rating and number of Google reviews |
| `latitude`, `longitude`, `timeZone` | Location |
| `hoursToday`, `openStatus` | Today's opening hours and the live status line ("Closed · Opens 8 AM") |
| `permanentlyClosed`, `temporarilyClosed` | Closure flags |
| `placeId`, `cid`, `kgmid`, `googleMapsUrl` | Google identifiers and a direct Maps link |
| `searchQuery`, `searchLocation`, `rank` | Which search found the place and its position in the results |

## Step-by-step

1. Open the tool and type one or more **Search queries**, separated by semicolons: `dentist; orthodontist`.
2. Enter a **Location** — a city, district, region or country.
3. Set **Max places per search**. Google itself stops at about 120 results per search, so 120 is the ceiling.
4. Optional: set **Language** and **Country** for local results, a **Minimum rating** such as `4.0`, or **Skip closed places**. You can also search around **Coordinates** with a radius, or paste Google Maps search URLs into **Start URLs**.
5. Click **Start**. A 120-place search finishes in a few seconds; export the results as JSON, CSV or Excel.

{{cta}}

## Call it from code

{{code}}

## Covering a whole city or country

Because Google returns roughly 120 places per search, a single search for "restaurant" in "London" only scratches the surface. Split the area instead: run one search per borough, district or postcode, or list several locations across runs. Every row carries `searchQuery`, `searchLocation` and `placeId`, so merging the results and dropping duplicates (the same place found by two neighbouring searches) is one line in a spreadsheet or a script.

## Recipes

### Local lead list with e-mail addresses
Google Maps gives you the website but not the e-mail. Run the Maps search, then pass its dataset to [Email Extractor — Website Contact & Social Finder](https://apify.com/webdatatools/contact-extractor) with `inputDatasetId` set to the Maps run's dataset ID and `inputField` set to `website`. It visits each business site and returns e-mails, phone numbers and social profiles you can join back on the website.

### Competitor and market map
Search a category across the cities you care about with a minimum rating, and plot `latitude`/`longitude` on a map. `rating` and `reviewsCount` show who dominates each area; places with many reviews but a low rating are often the easiest to win customers from.

### Keeping a place database fresh
Schedule the same searches weekly. `permanentlyClosed` and `temporarilyClosed` flag businesses that shut down, and new `placeId` values show new openings — useful for directories, delivery platforms and field-sales territories.

## How much does it cost?

{{pricing}}

Searches that fail are recorded in the run's `ERRORS` record and cost nothing. Set **Maximum cost per run** in Apify to cap what any single run can spend.

## How it compares

| Approach | Good at | Watch out for |
|---|---|---|
| **This tool** | Fast, low-cost lead lists and place databases; any country and language; no browser, so runs finish in seconds | Only what the search results carry: today's hours, not the full week; review count, not review text; no photos or Q&A |
| Browser-based Maps scrapers that open each place page | Full weekly hours, review texts, photos | Slower and more expensive per place |
| Google Places API | Official, documented access | Requires a Google Cloud billing account and API key; usage-based pricing and terms on storing results |
| Copying results by hand | A handful of places | Doesn't scale past one screen of results |

## FAQ

### Why do I get at most about 120 places per search?
That's Google's own limit — Maps stops returning results after roughly 120 per search. Split large areas into several smaller locations to collect more.

### Does it extract reviews or the full opening hours?
No. Search results carry today's hours and the review count only. The tool stays fast and cheap by not opening every place page. Use a dedicated reviews tool if you need review text.

### Why are phone or website empty for some places?
Not every business lists them on Google Maps. The fields are null when Google has nothing to show.

### Does it work outside the US?
Yes. Set the location to any city or region, and use **Language** and **Country** to get local names and results, for example `tr` and `tr` for Turkey.

### Is it legal to scrape Google Maps?
The tool collects publicly visible business listings without logging in. How you use the data is your responsibility — especially privacy and anti-spam rules if you contact businesses.

### Can I switch from another Google Maps scraper without changing my code?
Often yes. Besides its own input names, the tool accepts `searchStringsArray`, `locationQuery`, `query` and `keyword`, which many existing workflows and AI agents already use.
