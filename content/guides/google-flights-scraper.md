---
title: Google Flights Scraper: Flight Prices, Airlines and Stops
h1: Google Flights Scraper: scrape flight prices for any route and date
short: Google Flights Scraper
kicker: Travel & flight prices
actor: google-flights-scraper
description: Google Flights scraper API for flight prices by route and date, with airlines, flight numbers, times, stops, layovers and CO2. $2 per 1,000 flights, no login.
updated: 2026-11-07
---

A flight price scraper turns Google Flights search results into rows you can sort, filter and track. The Google Flights website is built around one search at a time. If you need the same route checked across many dates, or a record of prices over time, you need to scrape Google Flights in bulk. **Google Flights Scraper** does that. Give it origins, destinations and dates, and it returns every flight Google shows for each search, one row per flight, for $2 per 1,000 flights.

It works as a Google Flights scraper API: call it from code, or run it by hand in Apify. Use it for fare tracking, travel market research, comparing airlines on a route, or feeding a travel tool. No login and no browser are needed.

## What you get

Each row is one flight option from the results page. These fields come from the Actor's dataset schema:

- **The search:** `searchFrom`, `searchTo`, `departureDate`, `returnDate`, `tripType`, `cabinClass`, `adults`, `currency`.
- **Price:** `price` and `priceNote`, for all passengers. On round trips the price covers the whole trip. `isBest` marks flights listed under Google's "Best" flights.
- **Flight:** `airlines`, `flightNumbers`, `departureAirport`, `departureTime`, `arrivalAirport`, `arrivalTime`, `durationMinutes`, `stops`. Times are local, for example `2026-11-12T08:00`.
- **Layovers and legs:** `layovers` (airport, city and minutes for each stop) and `legs` (flight number, airline, airports, times, duration, aircraft and legroom for each segment).
- **Emissions:** `co2Grams`, `co2TypicalGrams` and `co2DiffPercent`, an estimate compared with the typical figure for the route.
- **Provenance:** `searchUrl`, the Google Flights link for the search, and `scrapedAt`, when the row was scraped.

Most fields are nullable in the schema, so a field can be empty when Google does not show it.

{{sample}}

## Step-by-step

1. Enter **From** and **To** as airport codes or city names. Separate several with `;`. Every origin is searched to every destination.
2. Enter **Departure dates** as `YYYY-MM-DD`, separated by `;`. If you leave this empty, the Actor searches dates 30 days from today.
3. For a round trip, set a **Return date**, or a **Trip length (days)** from 1 to 60.
4. Optional: pick the cabin (economy, premium economy, business or first), set adults from 1 to 9, turn on **Nonstop only**, or change the currency (any ISO code, default USD).
5. Set **Max flights per search** from 1 to 100 (default 30) and run. Download the flights as JSON, CSV, Excel or HTML, or read them through the API.

## Example input

This input stays bounded: 2 dates on 1 route make 2 searches, with at most 20 flights each.

```json
{
    "from": "JFK",
    "to": "LHR",
    "departureDates": "2026-11-12; 2026-11-19",
    "cabinClass": "economy",
    "adults": 1,
    "nonstopOnly": true,
    "currency": "USD",
    "maxFlightsPerSearch": 20
}
```

{{cta}}

## Call it from code

{{code}}

## Recipes

### Fare tracking for one route
Schedule the Actor daily with the same input, for example one route and one date. Store `price` and `scrapedAt` from each run and compare them over time. Each run is a fresh search, so a change between runs shows what Google displayed at that moment.

### Compare dates for one trip
List several dates in `departureDates`, separated by `;`, or set `tripLengthDays` for round trips. Sort the rows by `price` to find the cheapest date. Each date is a separate search, so the cost grows with the number of dates.

### Price alerts
Run the Actor on a daily schedule, read the dataset through the API, and compare the lowest `price` for your route with your own threshold. Alert only when the threshold is crossed, not on every small change.

## How much does it cost?

{{pricing}}

You pay per result: $0.002 per flight, which is $2 per 1,000 flights, with volume discounts on paid Apify plans. Searches that fail or find no flights are listed in the `ERRORS` record and cost nothing. Set **Maximum cost per run** to cap spending. The example input above costs at most 40 flights, or $0.08.

## How it compares

| Option | Good at | Watch out for |
|---|---|---|
| **This Actor** | Many routes and dates in one run, one row per flight, JSON, CSV or Excel export, API access and scheduling | Prices are logged-out results for a US visitor; booking links are not collected |
| Google Flights website | Checking one search by hand and reading the results on screen | Built for one search at a time, so many routes and dates take many manual searches |
| Paid flight-data APIs | Access through the provider's own API, with its own terms | Pricing, coverage and terms vary by provider; compare their current pages yourself |
| Your own scraper | Full control over the logic | You maintain the parsing, the proxies and any changes on Google's side |

This table compares how each option is used. It does not measure accuracy, coverage or speed against any other source.

## FAQ

### Is there a Google Flights API?
This guide cannot confirm whether Google offers an official flight API, so nothing here should be read as one. This Actor reads the public Google Flights results page and returns the rows through the Apify API.

### Is scraping Google Flights legal?
This guide does not give legal advice. The Actor reads the public results page that anyone can open without an account. Check that your use of the data is allowed where you live and where you operate.

### Can I track flight prices over time?
Yes. Schedule the Actor, for example daily, with the same input, and compare `price` across runs. See the fare-tracking recipe above.

### Do I need a Google account or a browser?
No. The Actor needs no login, and it does not require a browser on your side.

### Are the prices what I will pay?
Not necessarily. Prices are what Google shows logged out for a US visitor (`gl=us`), in the currency you choose. The airline's or agent's checkout can differ.

### Why do round trips show only outbound flights?
For round trips, each row is an outbound option with the round-trip price that Google shows. The return flight is chosen on the next Google screen, which the Actor does not open.

### Does the output include booking links?
No. The booking links behind each price are not collected. The `searchUrl` field links to the Google Flights search itself.

### How many flights can one search return?
Set **Max flights per search** from 1 to 100; the default is 30. The input help notes that Google shows up to about 100 per route and date.

### Can I search several routes in one run?
Yes. Separate origins and destinations with `;`, and every origin is searched to every destination. The number of searches is origins times destinations times dates.
