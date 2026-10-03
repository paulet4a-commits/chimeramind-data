---
title: Email Extractor for Websites — Find Emails, Phones and Social Profiles in Bulk
h1: Extract emails, phone numbers and social profiles from a list of websites
short: Email Extractor
kicker: Leads & company data
actor: contact-extractor
description: Paste a list of company websites and get one clean row per domain with every public email address, phone number and social profile the site exposes — de-duplicated, ready for a CRM import.
updated: 2026-10-03
---

You have a list of company websites — from a trade-show exhibitor list, a Google Maps search, a directory or your own CRM — and you need a way to contact each one. Opening every site, hunting for the contact page and copy-pasting addresses works for ten companies, not for a thousand. This guide shows how to crawl the whole list in one run and get **one row per website** with every public email, phone number and social profile, for {{price}}.

## What you get

The tool visits each website's pages (home, about, contact and whatever they link to, up to your page budget), collects every contact channel it finds and merges them into a single row per domain. Two hundred crawled pages still produce one usable lead, not two hundred fragments. A real row from a recent run:

{{sample}}

| Field | What it holds |
|---|---|
| `domain`, `startUrl` | Root domain (`www.` stripped) and the URL you gave |
| `title`, `description` | The site's `<title>` and meta description — a ready-made label for the lead |
| `emails` | Unique, lower-cased addresses from `mailto:` links and page source |
| `phones` | Numbers from `tel:` links, normalised so formatting variants de-duplicate |
| `socials` | Profile URLs grouped by platform: LinkedIn, X/Twitter, Instagram, Facebook, YouTube, TikTok, GitHub, Telegram, WhatsApp, Discord |
| `whatsapp`, `telegram`, `discord` | Messaging links, normalised (WhatsApp always as `https://wa.me/<digits>`) |
| `emailCount`, `phoneCount`, `pagesCrawled` | Quick sort keys and how many pages were actually visited |

## Step-by-step

1. Open the tool and paste your websites into **Websites** — bare domains (`example.com`) and full URLs both work.
2. Keep **Max pages per website** at 30 and **Max link depth** at 2. Contact details almost always sit on the home, about and contact pages, so going deeper mostly adds cost and time.
3. Switch off **Extract e-mails**, **Extract phone numbers** or **Extract social profiles** if you only need one channel.
4. Click **Start**. When the run finishes, export to CSV or Excel for your CRM, or read the dataset through the API.

{{cta}}

## Call it from code

{{code}}

## Recipes

### Google Maps search → contact list
Run a Google Maps search for your target niche and city (for example "dental clinic, Berlin"). Its results include a `website` column. Start this tool with `inputDatasetId` set to that run's dataset ID and `inputField` set to `website`: every business website is crawled and you get emails and social profiles next to the phone numbers Maps already gave you. No copy-pasting between runs.

### Contact list → validated email list
Bounces hurt your sender reputation, so check addresses before the first send. Take this tool's dataset ID and start the Email Validator with `inputDatasetId` set to it and `inputField` set to `emails`. The `emails` array of every domain is flattened into one row per address, each with a syntax check, MX lookup, disposable/free-provider/role flags and a 0–100 score. Filter on `deliverability` and import only the good ones.

### Find the social accounts of a competitor list
Turn off emails and phones, keep **Extract social profiles** on, and run your competitor domains. The `socials` object gives you every LinkedIn page, X account, YouTube channel and TikTok profile they link from their own site — a clean starting point for social monitoring.

## How much does it cost?

{{pricing}}

Billing is **per website, not per page**. A site that takes 25 pages to crawl is still one result. Set **Maximum cost per run** in the run options and the tool trims its own website list to fit the budget instead of overspending.

## How it compares

| Approach | Good at | Watch out for |
|---|---|---|
| **This tool** | One merged row per domain; emails, phones, 10 social and messaging platforms in one pass; plain HTTP, so fast and cheap; billed per website | Reads what the site publishes — it does not guess addresses that aren't on the page, and does not run page JavaScript |
| Manual research | Judgement on which contact is the right person | Doesn't scale past a few dozen companies |
| Email-finder databases | Named people and job titles | Subscription pricing; data can be stale; contacts come from a third-party database rather than the company's own site |
| Page-level scrapers | Raw extraction from any URL | You get one row per page and must merge and de-duplicate yourself |

The two approaches combine well: use this tool for the company's own public channels (info@, sales@, press@, its social accounts) and a people database only where you need a named decision-maker.

## Responsible use

Everything this tool returns is published on the company's own website. That still doesn't make every use lawful. Under the GDPR and similar laws (the UK GDPR, Turkey's KVKK), even a business email that contains a person's name is personal data: you need a lawful basis such as legitimate interest, you must tell people where you got their address when you first contact them, and you must honour opt-outs promptly. US commercial email falls under CAN-SPAM: identify yourself, include a working unsubscribe link and a physical address. Generic role addresses (info@, sales@) carry less risk than named ones. Crawl only sites you are allowed to crawl, and don't keep data you don't need.

## FAQ

### How accurate are the email addresses?
They are taken from `mailto:` links and the page source, then filtered through a blocklist that removes common false positives such as image file names, error-tracking keys and placeholder addresses. Unusual markup can still let some noise through, which is one more reason to run the list through the Email Validator before sending.

### Why are there no phone numbers for a site that clearly shows one?
Phone numbers are only taken from `tel:` links. Scraping digits out of plain text produces far more wrong numbers than right ones, so numbers written only as text are skipped on purpose.

### Can it find the email of a specific person?
Only if that address is published somewhere on the site. The tool doesn't guess patterns like firstname.lastname@ — it reports what the website actually shows.

### Does it crawl subdomains like blog.example.com?
Not by default. Turn on **Follow subdomains** to include them.

### Can I feed it from another tool's results?
Yes. Set `inputDatasetId` to another run's dataset and `inputField` to the column that holds the website (for example `website` or `url`). Those URLs are combined with anything typed into Websites.

### What if a site blocks the crawler?
Add a proxy in **Proxy configuration** — Apify's datacenter proxy is enough for most sites and keeps runs cheap — or lower **Max concurrency** for sites that rate-limit.
