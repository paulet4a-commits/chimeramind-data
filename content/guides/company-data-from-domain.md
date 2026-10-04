---
title: Company Data from a Domain — Contacts, Tech Stack, Firmographics and Hiring in One Row
h1: Get a full company profile from just a domain name
short: Company 360
kicker: Leads & company data
actor: company-360
description: Turn a list of company domains into enriched profiles — contacts, tech stack, email security, TLS and SEO checks, hiring signals and company facts like headquarters, employees and founding date — merged into one flat row per company.
updated: 2026-10-03
---

Account research usually means six browser tabs per company: the website for contacts, a tech-lookup tool, a DNS checker, the careers page, a company database for headcount and headquarters, and an SEO checker. Multiply by a few hundred accounts and the research costs more than the deal. This guide shows how to get all of that **from a domain name alone**, merged into one row per company, for {{price}}.

## What you get

Each domain becomes one flat, scored row with up to seven sections. A real row from a recent run:

{{sample}}

| Section | Fields |
|---|---|
| Identity | `domain`, `websiteUrl`, `companyName`, `description` |
| Contacts | `emails`, `phones`, `socials`, plus `linkedinUrl`, `twitterUrl`, `facebookUrl`, `instagramUrl`, `youtubeUrl` |
| Tech stack | `cms`, `ecommercePlatform`, `analytics`, `adPixels`, `chatWidget`, `paymentProviders`, `technologyCount` |
| DNS & email security | `emailProvider`, `dnsProvider`, `spfPolicy`, `dmarcPolicy`, `emailSecurityGrade`, `registrar`, `domainAgeDays` |
| Security audit | `tlsValid`, `tlsDaysUntilExpiry`, `securityGrade`, `securityScore` |
| SEO | `seoScore`, `seoIssues` |
| Hiring | `openJobs`, `hiringVelocity`, `topDepartments` |
| Company facts | `industries`, `headquarters`, `country`, `employees`, `revenue`, `founders`, `foundedAt`, `crunchbaseId`, `wikidataQid` |
| Quality | `profileCompleteness` (0–100), `warnings`, `error` |

Every section is independent. If one check finds nothing or fails, its fields stay empty and a line is added to `warnings` — you always get the row, and `profileCompleteness` shows at a glance how much of it filled in.

## Where each section comes from

Contacts come from the company's homepage plus one likely contact page (or from Wikidata when the site lists none). DNS and email security come from public DNS and RDAP records, and the tech stack is fingerprinted from the same homepage and contact page — all three inside Company 360 itself. The security audit, SEO, hiring and company facts come from specialist tools in the same suite — Domain Security Audit, On-Page SEO Audit, Hiring Signals and Wikidata Entity Enrichment — which Company 360 runs for you in parallel. Company facts come from Wikidata, so they are richest for companies that have a Wikidata entry; hiring data appears when the company runs a supported ATS job board under its own name.

## Step-by-step

1. Open the tool and paste your list into **Domains**. Full URLs and `www.` prefixes are stripped automatically, so a CRM export works as-is.
2. Keep all seven **Include…** switches on for a full profile, or turn off the sections you don't need — each one you skip makes the run faster.
3. Click **Start**. Each domain's checks run in parallel, so a single profile typically finishes in under a minute.
4. Export to CSV or Excel, or read the dataset through the API.

{{cta}}

## Call it from code

{{code}}

## Recipes

### Enrich a CRM export before outreach
Export accounts with their website, paste the domains (or point `inputDatasetId` at a dataset and `inputField` at the column holding the domain) and import the result back on `domain`. Reps get headcount, HQ, tech stack and a contact channel on every account without opening a single tab.

### Qualify agency or SaaS prospects by their stack
Running a Shopify agency, or selling a product that competes with a specific chat widget or analytics tool? Profile a long list with only **Include tech stack**, **Include contacts** and **Include company facts** on, then filter on `ecommercePlatform`, `cms`, `chatWidget` or `analytics`. You get a target list of companies that use exactly what you work with.

### Spot technical opportunities
For a security, deliverability or SEO service, the profile is a ready-made reason to reach out: `dmarcPolicy` missing or set to `none`, `tlsDaysUntilExpiry` low, `securityGrade` poor or a low `seoScore` with a list of `seoIssues`. Sort by the weakness you fix.

## How much does it cost?

{{pricing}}

One result is one company profile. Contacts, DNS/email security and tech stack are included in that price. The four specialist sections (security audit, SEO, hiring, company facts) run as separate tool runs on your Apify account and are billed at those tools' own per-result prices — about one extra cent per company with all four on. Switch off any you don't need with the `include…` options to pay exactly the profile price, and set **Maximum cost per run** to cap the total.

## How it compares

| Approach | Good at | Watch out for |
|---|---|---|
| **This tool** | One joined row from public sources; seven sections in one call; per-section warnings instead of silent gaps | A first-pass profile, lighter than running each specialist tool directly; company facts depend on Wikidata coverage; hiring data only for companies on supported ATS boards |
| Separate tools per data type | Depth on one axis | Several logins, exports and a manual join on domain name |
| Commercial firmographic databases | Large curated datasets, named contacts | Subscription pricing; data is a third-party snapshot rather than read from the company's own site and DNS |

Need more depth on one section? Each specialist tool behind Company 360 is available on its own — for example the full Tech Stack Detector or the Email Extractor, which crawls up to your chosen page budget instead of just the homepage and one contact page.

## Responsible use

All sources are public: the company's own website, public DNS and RDAP records, public job boards and Wikidata. Contact details can still include personal data (a named person's email), so use them under a lawful basis such as legitimate interest, follow GDPR, KVKK and CAN-SPAM rules for outreach, and honour opt-outs.

## FAQ

### Why is a section empty even though I switched it on?
That check found nothing for the domain, failed or timed out. The reason is in `warnings`, and the rest of the row is unaffected.

### Why is hiringVelocity empty for most companies?
Hiring data is matched by the domain's name (`apify` for `apify.com`) against public ATS job boards. Most companies don't run a board under exactly that name, so an empty value is normal. For a reliable hiring picture, give the Hiring Signals tool the company's actual board URL.

### How is profileCompleteness calculated?
It's the share of the sections you switched on that returned usable data, rounded to a whole percent.

### Can I feed it domains from another tool?
Yes. Set `inputDatasetId` to another run's dataset and `inputField` to the column that holds the domain or website; those are combined with anything in Domains.

### How fast is it for a long list?
Each profile runs several checks in parallel, and checks are throttled to stay within Apify's concurrent-run limits, so very long lists take proportionally longer. Split huge lists across scheduled runs if you need results continuously.
