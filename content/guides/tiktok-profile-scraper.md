---
title: TikTok Profile Scraper — Followers, Likes and Video Stats in Bulk
h1: Check TikTok follower counts and video stats for hundreds of accounts at once
short: TikTok Profile Scraper
kicker: Social media data
actor: tiktok-profile-scraper
description: Get exact follower, following, like and video counts, bio, verified and business flags for any list of public TikTok accounts — and views, likes, comments, shares and saves for specific videos. No login, no cookies.
updated: 2026-10-03
---

TikTok shows follower counts rounded ("1.8M") and one profile at a time. If you're vetting fifty creators for a campaign, tracking how fast a competitor is growing, or reporting on the videos a brand paid for, you need **exact numbers for many accounts in one table**. This guide shows how to get them from public profile and video pages — no TikTok account, no cookies — for {{price}}.

## What you get

The tool returns two kinds of rows, marked by `type`. A real row from a recent run:

{{sample}}

**Profiles** (`type: "profile"`)

| Field | Meaning |
|---|---|
| `username`, `nickname`, `userId`, `secUid`, `profileUrl` | Who the account is |
| `followers`, `following`, `likes`, `videos`, `friends` | Exact counts, not rounded |
| `bio`, `bioLink`, `language`, `avatarUrl`, `createdAt` | Profile details |
| `verified`, `privateAccount`, `isOrganization`, `commerceCategory`, `isSeller` | Account flags |

**Videos** (`type: "video"`)

| Field | Meaning |
|---|---|
| `videoId`, `url`, `description`, `createdAt` | The video |
| `views`, `likes`, `comments`, `shares`, `saves` | Engagement counts |
| `durationSec`, `hashtags`, `musicTitle`, `musicAuthor`, `coverUrl` | Content details |
| `authorUsername`, `authorNickname`, `authorVerified`, `isAd`, `locationCreated` | Author and context |

## Step-by-step

1. Open the tool and add **Profiles** — usernames (`nasa`), handles (`@khaby.lame`) or profile URLs, one per line or separated by commas.
2. Optional: add **Videos** as `https://www.tiktok.com/@user/video/…` URLs to get their stats.
3. Leave **Proxy mode** on `auto`: pages are fetched directly, and a residential proxy is used only if TikTok shows a bot check.
4. Click **Start**. Items are read three at a time; export the rows as JSON, CSV or Excel.

{{cta}}

## Call it from code

{{code}}

## Recipes

### Influencer vetting sheet
Paste your shortlist of creators and export to a spreadsheet. With exact `followers`, total `likes` and the `videos` count side by side, you can compute likes per video and spot accounts whose audience is large but inactive. `verified`, `isOrganization` and `commerceCategory` help separate creators from brands and shops.

### Daily follower tracking
Schedule the same list to run every day and append the results to a sheet or database. Because the counts are exact, day-over-day differences show real growth — useful for monitoring competitors, your own brand accounts or the creators you sponsor.

### Campaign reporting
After a campaign goes live, put the campaign's video URLs into **Videos** and run the tool on a schedule. Each run records `views`, `likes`, `comments`, `shares` and `saves` for every video, giving you an engagement curve without asking creators for screenshots.

## How much does it cost?

{{pricing}}

Accounts or videos that don't exist, are private or are banned go to the run's `ERRORS` record and cost nothing.

## How it compares

| Approach | Good at | Watch out for |
|---|---|---|
| **This tool** | Exact counts for many public profiles and specific videos; no login or cookies; cheap enough to run daily | Does not list a profile's videos, followers or comments — TikTok serves those only to its own signed app requests |
| Checking profiles in the TikTok app | A few accounts | Rounded numbers, manual copying |
| Influencer marketing platforms | Audience demographics, discovery search | Subscription pricing; you're limited to their database |
| Official TikTok APIs | Your own account's analytics | Access is limited to approved apps and use cases |

## Limits worth knowing

- To get stats for a video, give its URL in **Videos**; the tool does not discover a profile's videos on its own.
- Private accounts return their profile counts but no videos.
- `avatarUrl` and `coverUrl` are signed by TikTok and expire after some days — download images soon if you need them.
- View counts are the values TikTok shows publicly and can be rounded for very large videos.

## FAQ

### Do I need a TikTok account or cookies?
No. The tool reads public profile and video pages that anyone can open without logging in.

### How fresh are the numbers?
They're read live from TikTok when the run starts. Schedule the run if you want a history.

### Can it scrape comments or a list of followers?
No. TikTok only serves comment lists and follower lists to its own signed app requests, so the tool returns the comment and follower counts, not the lists themselves.

### What input formats does it accept?
Usernames with or without `@`, profile URLs, and video URLs. It also accepts the field names `usernames`, `username`, `profileUrls`, `videoUrls`, `url`, `urls` and `startUrls`, which makes it easy to call from existing workflows and AI agents.

### Is scraping TikTok legal?
The tool only reads pages that are publicly visible without an account. Check that your use of the data is allowed where you operate.
