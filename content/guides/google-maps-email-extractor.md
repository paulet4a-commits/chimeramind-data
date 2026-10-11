---
title: How to Get Emails from Google Maps — Export Business Leads to CSV or JSON
h1: Get emails from Google Maps businesses, one row per place
short: Google Maps Email Extractor
kicker: Leads
actor: google-maps-email-extractor
description: Search Google Maps by business type and city, then read each business's own website for e-mail addresses, phones and social profiles. Filter by category, reviews or rating and export one row per place.
updated: 2026-10-11
---

Google Maps is the easiest place to find local businesses, but it shows a phone number and a website, not the e-mail address you need for outreach. The address usually sits on the business's own website, on a contact or imprint page. This guide shows how to run both steps in one job: search Google Maps for a business type in a city, then read each website for e-mail addresses — and export the result as CSV, Excel or JSON. It needs no Google account, no API key and no browser extension. Pricing is {{price}}, and the cost section below explains how places without an e-mail are handled.

## How it works

The Actor runs a Google Maps search for each search term and location you give it. For every place that has a website, it opens the homepage and then the pages most likely to list an address, in this order: contact, imprint or legal notice, about, team and appointments. It reads `mailto:` links, protected addresses and simple obfuscations such as `jane [at] clinic [dot] com`, then drops placeholders, image file names and `noreply` boxes. Most sites take two or three page requests.

## What you get

One row per place. The Google Maps fields come from the search itself; the e-mail fields come from the website.

| Field | Meaning |
|---|---|
| `name`, `primaryCategory`, `categories` | Business name and its Google categories |
| `address`, `phone`, `website`, `googleMapsUrl` | Address, phone and links as Google Maps shows them |
| `rating`, `reviewsCount` | Star rating and number of Google reviews |
| `primaryEmail` | The address to contact first (the business's own domain is preferred) |
| `emails`, `emailSource` | Every address found on the site, and the page where the primary one was read |
| `sitePhones`, `socials` | Phone numbers and social profile links found on the website |
| `contactPagesChecked`, `enrichmentError` | Which pages were read, and why a site could not be read |
| `searchQuery`, `searchLocation`, `rank` | Which search found the place and where it ranked |

The tool returns addresses as the website publishes them. It does not verify that a mailbox exists. Run the list through an [email validator](https://apify.com/webdatatools/email-validator) before a campaign.

## Step-by-step

1. Enter the business types in **Search terms**: one term (`dentist`), several separated by semicolons (`dentist; orthodontist`), or a JSON array.
2. Set **Location** to a city, district or country (`Austin, TX`). Leave it empty if the term already contains the place, such as `plumber in Chicago`.
3. Set **Max places per search term** (1 to 120). Google returns about 120 places per search, so 120 is the ceiling for one search.
4. Turn on **Only places with an e-mail** if you want only contactable rows. Places without an e-mail are still searched and their websites read, but they are not returned and not charged.
5. Narrow the list before it is charged: **Category filter** keeps only exact Google category names (`Dentist` matches "Dentist", not "Pediatric dentist"), **Minimum reviews** and **Minimum rating** drop weak listings, and **Skip closed places** removes places Google marks as closed.
6. Click **Start** and export as CSV, Excel or JSON.

Already have a list of Google Maps links? Put them in **Google Maps links**. A search link runs its text, and a place link returns that one place. Clear the search term and location to run only your links.

## Going past 120 places

A single search stops at about 120 places. You have three ways to cover more ground:

- **Several locations.** Fill **Locations** with postal codes or districts (`["78701", "78704", "78745"]`). Every search term runs in every location, and each place is returned once.
- **Split the map area.** Turn on **Split the map area** and set **Max places per query** (up to 1,000). The area of each search is divided into smaller cells, up to three levels deep, and duplicates are removed. Searches take longer, but you pay only for places returned.
- **One run per city.** For a national list, one run per city is easier to check and to schedule.

```json
{
    "searchQueries": ["dentist"],
    "locations": ["78701", "78704", "78745"],
    "maxPlacesPerSearch": 120,
    "categoryFilter": ["Dentist"],
    "minReviews": 20,
    "onlyWithEmail": true
}
```

{{cta}}

## Call it from code

{{code}}

## Use it in n8n or Make

The Actor can be started over the Apify API from any workflow tool. In **n8n**, add an **HTTP Request** node: method `POST`, URL `https://api.apify.com/v2/acts/webdatatools~google-maps-email-extractor/run-sync-get-dataset-items`, a header `Authorization` with the value `Bearer YOUR_APIFY_TOKEN`, and a JSON body. The response is an array with one item per place, ready for the next node. In **Make**, use the **HTTP > Make a request** module with the same method, URL and header, body type Raw with JSON content, and **Parse response** switched on; then iterate over the returned array.

Synchronous calls wait for the run to finish, so keep the body small for quick tests. For large lists, start the run asynchronously and read its dataset when it completes.

Body example for this guide:

```json
{
    "searchQueries": ["dentist"],
    "location": "Austin, TX",
    "maxPlacesPerSearch": 50,
    "onlyWithEmail": true
}
```

[Download the n8n workflow (JSON)](/templates/google-maps-email-extractor.n8n.json) — a manual trigger, the HTTP Request node above and a placeholder for your token.

## Recipes

### Outreach list for one city and one trade
Run one search term in one city with **Only places with an e-mail** on and **Minimum reviews** at 10 or more. Sort by `reviewsCount` and send the top rows to your validator, then to your CRM.

### Weekly refresh of a lead list
Schedule the run weekly with the same input. Compare `googleMapsUrl` or `website` between runs to find new businesses, and keep the previous rows for businesses that have since closed.

### Cover a region in postal codes
Use **Locations** with postal codes, one search term and `maxPlacesPerSearch` set to 120. Each place appears once in the output even when two postal-code searches overlap, so the total is easier to read than separate runs.

## How much does it cost?

{{pricing}}

Two events are charged, as the Actor's listing describes: one for each place returned, and one for each returned place where an e-mail was found. With **Only places with an e-mail** on, a place without an e-mail is not returned and not charged. Places removed by the category, review or rating filters are not charged either. Set **Maximum cost per run** to cap a run; the Actor stops once the next place would exceed the cap.

In the Actor's own test on 2026-10-09 ("dentist" in "Austin, TX"), an e-mail was found on 12 of 19 unique websites (63 %). A site that offers only a contact form will usually have no address to read.

## Limits to plan for

- Websites behind strong bot protection, such as challenge pages or CAPTCHAs, are reported in `enrichmentError` and not retried through a proxy.
- E-mail addresses that only appear after JavaScript runs, or that a browser plugin decodes, are not found.
- Google Maps results carry today's opening hours only, with no review text or photos.
- Place IDs are not accepted as input. Paste the place's full Google Maps link instead.
- Short `maps.app.goo.gl` links are not followed. Copy the full `google.com/maps/…` link from the address bar.

## FAQ

### Is it legal to extract e-mails from Google Maps businesses?
The tool reads publicly visible business listings and each business's public website, without logging in. You are responsible for how you use the data, especially under privacy and anti-spam rules such as GDPR and CAN-SPAM when you contact people.

### Why do some places have no e-mail?
Many small businesses publish only a contact form, or load the address with JavaScript after the page opens. `contactPagesChecked` shows which pages were read, and `enrichmentError` says when a site could not be read at all.

### Does it verify the e-mails?
No. It returns addresses as published on the website. Check them with an [email validator](https://apify.com/webdatatools/email-validator) for syntax, mail-server and disposable-address checks.

### Why do two places share the same e-mail?
They share one website, such as a chain or a shared office. The site is read once, so the same address can appear on both rows.

### Why are there at most about 120 places per search?
Google stops returning results after about 120 per search. For bigger areas, turn on **Split the map area** with **Max places per query**, list several postal codes or districts in **Locations**, or run one job per city.

### Can I use it from n8n, Make or Zapier?
Yes. Start a run through the Apify integrations or the HTTP API, then read the dataset. The section above shows the exact request.
