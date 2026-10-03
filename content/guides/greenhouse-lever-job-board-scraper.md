---
title: Greenhouse, Lever, Ashby and Workday Job Scraper — Company Hiring Data via Official APIs
h1: Scrape company job boards on Greenhouse, Lever, Ashby, Workday and six more ATS
short: Hiring Signals
kicker: Jobs
actor: hiring-signals
description: Get every open job a company publishes on its applicant tracking system — or a one-row hiring summary with job counts, departments, locations and hiring velocity — from the boards' official public data.
updated: 2026-10-03
---

Most fast-growing companies don't post their jobs primarily on job sites — they publish them on their own careers page, which is almost always powered by an applicant tracking system (ATS) such as Greenhouse, Lever or Ashby. Those boards are the most complete and most current source of a company's open roles, and they are also one of the best public signals of where a company is growing. This guide shows how to read them for any list of companies, either as **one row per job** or as **one hiring summary per company**, for {{price}}.

## Supported job boards

Greenhouse, Lever, Ashby, Workable, SmartRecruiters, Recruitee, Personio, Teamtailor, BambooHR and Workday. The tool reads each board's official public job-board data (for Greenhouse, for example, `boards-api.greenhouse.io`) — no browser, no proxy and no login.

You don't need to know which ATS a company uses. Give it a bare slug like `stripe` and it is checked against every board except Workday in parallel; every board that actually has postings is returned. Workday is the one exception: it identifies a company by a tenant *and* a site, so paste the full board URL (`https://<tenant>.wd<N>.myworkdayjobs.com/<site>`).

## What you get

In **One row per job** mode, each posting becomes a row. A real row from a recent run:

{{sample}}

| Field | Meaning |
|---|---|
| `company`, `companyName`, `ats` | Your input, the name the board reports, and which ATS answered |
| `jobId`, `title`, `url` | The board's own posting ID, the job title and the public job page |
| `department`, `team`, `location`, `isRemote` | Org unit, sub-team, location as published, and a remote flag |
| `employmentType`, `postedAt` | Employment type as each ATS labels it, and the ISO date the posting went live |
| `salaryMin`, `salaryMax`, `salaryCurrency` | Pay ranges where the board publishes them (in practice Ashby, sometimes Recruitee) |
| `description` | Plain-text job description, HTML stripped, up to 5,000 characters (optional) |

In **One row per company** mode, each company becomes a summary: `totalJobs`, `remoteJobs`, `jobsByDepartment`, `jobsByLocation` (top 10), `newestPostedAt`, `oldestPostedAt`, `jobsPostedLast30Days`, `topTitles` (the five newest), `boardUrl` and `hiringVelocity` — `high` for 20+ new jobs in the last 30 days, `medium` for 5+, `low` for 1+, otherwise `none`.

## Step-by-step

1. Open the tool and add companies to **Companies**: bare slugs (`stripe`), board URLs (`https://jobs.lever.co/spotify`) or a mix.
2. Choose **Output mode**: *One row per job* for job aggregators and recruiters, *One row per company* for sales intelligence and competitor tracking.
3. Leave **Max jobs per company** at 200 (it caps cost in job mode and is ignored in company mode, where the summary always counts the whole board).
4. Turn on **Include job descriptions** only if you need the full text, then click **Start** and export.

{{cta}}

## Call it from code

{{code}}

## Recipes

### Sales: find accounts that are scaling right now
Put your target-account list in **Companies**, choose *One row per company* and sort by `jobsPostedLast30Days`. A company with `hiringVelocity: high` and twenty new engineering roles is building something and has budget; `jobsByDepartment` tells you which team to talk to. Re-run monthly to catch accounts as they accelerate.

### Track competitors' hiring every day
Schedule a daily run in job mode for your competitors' boards and compare `jobId` values with the previous run: new IDs are new roles, missing IDs are closed ones. A sudden cluster of roles in a new city or a new department often shows a strategy move months before any announcement.

### Build a niche job board
Collect slugs of companies in your niche (climate tech, Rust shops, remote-first startups), run job mode with descriptions on, and filter on `isRemote` or `department`. Every row links to the original `url`, so applicants go straight to the employer's own page.

## How much does it cost?

{{pricing}}

Most boards answer with all their jobs in a single request (SmartRecruiters and Workday paginate internally for very large boards), and you pay one result per job row or per company summary. Company mode is the cheap way to scan a large list: one row per company regardless of how many jobs it has. Set **Maximum cost per run** and the tool trims its work to fit.

## How it compares

| Approach | Good at | Watch out for |
|---|---|---|
| **This tool** | Ten ATS normalised into one schema; finds the right board from a bare slug; company summaries with hiring velocity | Only companies that run one of the ten supported boards; salaries only where the board publishes them |
| General job-site scrapers | Broad coverage across many employers by keyword | Duplicated and reposted listings; less complete per company; job sites often block automated access |
| Writing your own ATS clients | Full control | Ten payload shapes (JSON, XML, RSS), a dozen date formats, pagination quirks and boards that answer HTTP 200 for empty, merely reserved slugs |
| Paid hiring-data providers | Historical data and huge coverage | Subscription pricing; you don't see how the data was collected |

## FAQ

### Which ATS platforms are not supported?
Boards on SuccessFactors, iCIMS, JazzHR or Taleo aren't covered. For those, the row comes back with an `error` saying which boards were checked.

### Why does a company show zero jobs?
Its board exists but has nothing published right now. You still get a row, with `error: "No open jobs found"`, so you can tell an empty board from a missing one.

### Are salaries included?
Only where the board publishes them — in practice Ashby's compensation data and occasionally Recruitee. All other boards return empty salary fields.

### Why is the description empty for SmartRecruiters and Workday?
Their public list endpoints carry job metadata only; the description sits behind a separate per-job request that the tool skips to keep runs fast. All other boards return descriptions when **Include job descriptions** is on.

### Does it collect personal data?
No. It reads job listings that companies publish for candidates. You remain responsible for following each board's terms and the law where you operate.

### Can I run it on a schedule?
Yes. Schedule it daily in Apify and compare `jobId` values between runs to detect new and closed roles.
