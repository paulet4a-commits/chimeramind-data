---
title: Scrape LinkedIn Jobs Without Login — Export Job Listings to JSON, CSV or Excel
h1: Scrape LinkedIn jobs without logging in
short: LinkedIn Jobs Scraper
kicker: Jobs
actor: linkedin-jobs-scraper
description: Scrape LinkedIn job postings by keyword, location, date, work type and seniority, drop unwanted titles and companies, and export titles, companies, pay ranges, applicant counts and descriptions — from public guest job pages, no account or cookies.
updated: 2026-10-11
---

LinkedIn is the largest job board in the world, but its search pages are built for scrolling, not for analysis. If you want to track new roles every day, compare pay across cities or feed postings into your own job board, you need them as rows. This guide shows how to scrape LinkedIn job searches into JSON, CSV or Excel — **without a LinkedIn account, cookies or a browser extension** — for {{price}}.

## How it works (and what it doesn't do)

The tool reads the same public guest job pages that anyone sees on linkedin.com without signing in. It never logs in, never uses a session and never touches profiles or private data. The trade-off is that it sees what a logged-out visitor sees: LinkedIn caps any single search at roughly 1,000 results, and some fields (pay, applicant count) appear only when LinkedIn shows them publicly.

## What you get

One row per job:

{{sample}}

| Field | Meaning |
|---|---|
| `jobId`, `url` | LinkedIn's posting ID and the direct job link |
| `title`, `company`, `companyUrl`, `companyLogo` | Position, hiring company, its LinkedIn page and logo |
| `location`, `postedAt`, `postedText` | Job location, ISO posting date and LinkedIn's relative text ("2 weeks ago") |
| `salary` | Pay range as written in the posting text, copied unchanged. Null when the posting states no range |
| `applicants` | Applicant count, when LinkedIn displays it |
| `seniority`, `employmentType`, `jobFunction`, `industries` | The job criteria LinkedIn lists on the posting |
| `description`, `descriptionHtml` | Full description as plain text and HTML, when **Include job descriptions** is on |
| `easyApply` | Whether the job uses LinkedIn's Easy Apply |
| `keyword`, `searchLocation` | Which of your searches found the job |

## Step-by-step

1. Type what you are looking for in **Keywords**, such as `data analyst`. Run several searches in one job by separating them with semicolons: `python; golang`.
2. Set **Location** (`Berlin`, `Austin, TX`, `Germany`) or leave it empty for worldwide. Use **Locations** to repeat the same search in several places.
3. Narrow the results with **Date posted** (`past24h`, `pastWeek`, `pastMonth`), **Work type** (onsite, remote, hybrid), **Experience level** (the input field is `experienceLevel`: internship, entry_level, associate, mid_level, senior, manager, director, executive) and **Job type** (full-time, part-time, contract, temporary, internship, volunteer).
4. Set **Max jobs** for the whole run. Decide whether you need **Include job descriptions**: descriptions cost one extra request per job, so leave them off when titles and companies are enough.
5. Click **Start** and export to JSON, CSV or Excel.

Already have a search set up on linkedin.com with the filters you like? Paste its URL into **Search URLs**, and its keywords, location, date, work type, level and job type are applied for you.

## Filter out the noise before you pay

Filters that run before a job is returned keep unwanted rows out of your dataset, and dropped jobs are not charged:

- **Title includes** (`titleIncludes`): keep only titles containing one of these words or phrases, such as `["data engineer", "analytics engineer"]`. Matching is case-insensitive and on whole words.
- **Title excludes** (`titleExcludes`): drop titles containing words such as `senior`, `staff` or `intern`.
- **Exclude companies** (`excludeCompanies`): drop jobs from named companies, matched on the whole name.
- **Apply on company site only** (`externalApplyOnly`): return only jobs that send applicants to the company's own site. This costs one detail-page request per candidate job, so it is slower and a little more expensive.

```json
{
    "keywords": "data engineer",
    "location": "Germany",
    "datePosted": "pastWeek",
    "experienceLevel": ["entry_level", "associate", "mid_level"],
    "titleExcludes": ["senior", "staff", "intern"],
    "excludeCompanies": ["Example Staffing Ltd"],
    "includeDescription": false,
    "maxJobs": 100
}
```

{{cta}}

## Call it from code

{{code}}

## Use it in n8n or Make

In **n8n**, add an **HTTP Request** node: method `POST`, URL `https://api.apify.com/v2/acts/webdatatools~linkedin-jobs-scraper/run-sync-get-dataset-items`, a header `Authorization` with the value `Bearer YOUR_APIFY_TOKEN`, and a JSON body such as the one above. The response is an array with one item per job. In **Make**, use the **HTTP > Make a request** module with the same method, URL and header, body type Raw with JSON content, and **Parse response** on. Then iterate over the returned array with an iterator.

Synchronous calls wait for the run to finish, so use them for small searches. For large searches, start the run asynchronously and read the dataset when it completes.

[Download the n8n workflow (JSON)](/templates/linkedin-jobs-scraper.n8n.json) — a manual trigger, the HTTP Request node above and a placeholder for your token.

## Recipes

### Daily alert for new roles
Schedule a run each morning with **Date posted** set to `past24h`, your keywords and locations, and descriptions off. Send the new rows to Slack or email through Apify's integrations, n8n, Make or Zapier, and you get yesterday's postings without opening LinkedIn.

### Compare a role across cities
Search one title with several entries in **Locations**, for example London, Manchester, Berlin and Amsterdam, and set **Max jobs** high enough to cover them. Group the results by `searchLocation` to compare volume, the `seniority` mix, `applicants` (competition) and, where published, `salary`.

### Watch one company's openings
Open LinkedIn's job search, filter it to one company, copy the URL and paste it into **Search URLs** with **Keywords** left empty. Each run returns that company's current public postings. Compare `jobId` values from day to day to spot new and closed roles. For companies that use Greenhouse, Lever, Ashby or Workday, the [Hiring Signals](/tools/hiring-signals/) tool reads their own careers board, which is often more complete.

## How much does it cost?

{{pricing}}

You pay per job returned; there is no separate charge for compute or proxies. Filtered-out jobs are not charged. Set **Maximum cost per run** and the Actor stops when the budget is used up.

## How it compares

| Approach | Good at | Watch out for |
|---|---|---|
| **This tool** | No login and no account risk; LinkedIn's own filters plus title and company filters; descriptions, pay and applicant counts when public | Logged-out view only; about 1,000 results per search; some jobs may be region-locked |
| Logged-in scrapers and browser extensions | Data that only signed-in users see | They use your account session, which LinkedIn's terms prohibit and which can get the account restricted |
| Copy-paste from linkedin.com | Small one-off checks | Does not scale and keeps no history |

## FAQ

### Do I need a LinkedIn account?
No. The tool reads LinkedIn's public guest job pages, the same pages you can open in a private browser window without signing in.

### Why do I get fewer than 1,000 jobs for a broad search?
LinkedIn caps each search at roughly 1,000 results. Split a broad search into narrower ones by location, date posted or experience level, and run them together: separate keywords with semicolons and list several locations.

### Can I filter by salary?
Not in the input. Pay appears only when the posting states a range, and it is copied as written, so filter the `salary` column after the run. Postings with no stated range keep `salary` empty.

### Why are salary and applicants empty on some jobs?
LinkedIn shows them only for some postings. When it does not display them publicly, the fields stay empty.

### What happens if LinkedIn throttles requests?
In the default `auto` proxy mode the tool starts with direct requests and switches to Apify's residential proxy only when it is blocked. Use `always` to use the proxy from the start, or `never` to stay direct.

### Is scraping LinkedIn jobs legal?
The tool collects publicly visible job postings only: no profiles, no private data and no login. You are responsible for how you use the data and for complying with LinkedIn's terms and local data-protection law (GDPR, CCPA) where you operate.
