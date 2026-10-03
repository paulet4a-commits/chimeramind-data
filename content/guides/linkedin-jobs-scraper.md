---
title: LinkedIn Jobs Scraper Without Login — Export Job Listings to JSON, CSV or Excel
h1: Scrape LinkedIn job listings without logging in
short: LinkedIn Jobs Scraper
kicker: Jobs
actor: linkedin-jobs-scraper
description: Search LinkedIn jobs by keyword, location, date, work type and seniority and export titles, companies, salaries, applicant counts and full descriptions — from LinkedIn's public guest job pages, no account or cookies needed.
updated: 2026-10-03
---

LinkedIn is the largest job board in the world, but its search results are made for scrolling, not for analysis. If you want to track new roles every day, compare salaries across cities or feed postings into your own job board, you need them as data. This guide shows how to turn any LinkedIn job search into rows of JSON, CSV or Excel — **without a LinkedIn account, cookies or a browser extension** — for {{price}}.

## How it works (and what it doesn't do)

The tool uses the same public guest job pages that anyone sees on linkedin.com without signing in. It never logs in, never uses your session and never touches profiles or private data. That keeps your own account out of the picture entirely. The trade-off is that it sees what a logged-out visitor sees: LinkedIn caps any single search at roughly 1,000 results, and some fields (salary, applicant count) appear only when LinkedIn shows them publicly.

## What you get

One row per job. A real row from a recent run:

{{sample}}

| Field | Meaning |
|---|---|
| `jobId`, `url` | LinkedIn's posting ID and the direct job link |
| `title`, `company`, `companyUrl`, `companyLogo` | Position, hiring company, its LinkedIn page and logo |
| `location`, `postedAt`, `postedText` | Job location, ISO posting date and LinkedIn's relative text ("2 weeks ago") |
| `salary`, `applicants` | Salary range and applicant count, when LinkedIn displays them |
| `seniority`, `employmentType`, `jobFunction`, `industries` | The job criteria LinkedIn lists on the posting |
| `description`, `descriptionHtml` | Full description as plain text and HTML (when **Include job descriptions** is on) |
| `easyApply` | Whether the job uses LinkedIn's Easy Apply |
| `keyword`, `searchLocation` | Which of your searches found the job |

## Step-by-step

1. Open the tool and type what you're looking for in **Keywords** — a title or skill such as `data analyst`. Run several searches at once by separating them with semicolons: `python; golang`.
2. Set **Location** (`Berlin`, `Austin, TX`, `Germany`) or leave it empty for worldwide. Use **Locations** to repeat the same search in several places.
3. Narrow it down with **Date posted** (`past24h`, `pastWeek`, `pastMonth`), **Work type** (onsite, remote, hybrid), **Experience level** (internship, entry_level, associate, mid_level, senior, manager, director, executive) and **Job type** (full-time, part-time, contract, temporary, internship, volunteer).
4. Set **Max jobs** — the total for the whole run — and decide whether you need **Include job descriptions**. Descriptions need an extra request per job, so leave them off when titles and companies are enough.
5. Click **Start** and export to JSON, CSV or Excel.

Already have a search set up on linkedin.com with the filters you like? Paste its URL into **Search URLs** and its parameters (keywords, location, date, work type, level, job type, company filter) are applied for you.

{{cta}}

## Call it from code

{{code}}

## Recipes

### Daily alert for new roles
Schedule a run every morning with **Date posted** = `past24h`, your keywords and locations, and descriptions off. Connect the run to Slack or email through Apify's integrations (or n8n, Make and Zapier) and you get a short list of yesterday's new postings — without refreshing LinkedIn.

### Compare a role across cities
Search one title with several entries in **Locations** — say London, Manchester, Berlin and Amsterdam — and **Max jobs** high enough to cover them. Group the results by `searchLocation` to compare volume, `seniority` mix, `applicants` (competition) and, where published, `salary`.

### Watch one company's openings
Open LinkedIn's job search, filter on a company, copy the URL and paste it into **Search URLs** with **Keywords** left empty. Each run returns that company's current public postings; compare `jobId` values day to day to spot new and closed roles. For companies that use Greenhouse, Lever, Ashby or Workday, the Hiring Signals tool reads their own careers board, which is often more complete.

## How much does it cost?

{{pricing}}

You pay per job returned; there's no separate charge for compute or proxies. Set **Maximum cost per run** and the tool stops at what the budget covers.

## How it compares

| Approach | Good at | Watch out for |
|---|---|---|
| **This tool** | No login and no account risk; LinkedIn's own filters; descriptions, salary and applicant counts when public; pay per job | Logged-out view only; about 1,000 results per search; region-locked jobs may not appear |
| Logged-in scrapers and browser extensions | Data that only signed-in users see | Use your account session, which LinkedIn's terms prohibit and which can get the account restricted |
| Copy-paste from linkedin.com | Small one-off checks | Doesn't scale, no history |
| Paid job-data APIs | Large historical datasets | Subscription pricing, less control over the exact search |

## FAQ

### Do I need a LinkedIn account?
No. The tool reads LinkedIn's public guest job pages, the same ones you can open in a private browser window without signing in.

### Why do I get fewer than 1,000 jobs for a broad search?
LinkedIn caps each search at roughly 1,000 results. Split a broad search into narrower ones — by location, date posted or experience level — and run them together in one job: separate keywords with semicolons and list several locations.

### Why are salary and applicants empty on some jobs?
LinkedIn shows them only for some postings. When it doesn't display them publicly, the fields stay empty.

### What happens if LinkedIn throttles requests?
In the default `auto` proxy mode the tool starts with direct requests and switches to Apify's residential proxy only when it is blocked. Use `always` to go through the proxy from the start, or `never` to stay direct.

### Is scraping LinkedIn jobs legal?
The tool collects publicly visible job postings only — no profiles, no private data, no login. You are responsible for how you use the data and for complying with LinkedIn's terms and local data-protection law (GDPR, CCPA) in your jurisdiction.
