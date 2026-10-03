---
title: Bulk Email Validator — Check Syntax, MX Records and Disposable Domains
h1: Validate an email list in bulk before you send
short: Email Validator
kicker: Leads & company data
actor: email-validator
description: Check thousands of email addresses for valid syntax, a mail-accepting domain (MX), disposable and free providers, role accounts and typos — one scored row per address, for a fraction of what SMTP verifiers charge.
updated: 2026-10-03
---

Every bounced email costs you a little sender reputation, and a list full of typos, throwaway sign-ups and dead domains costs a lot. Before a campaign, a CRM import or an ad-audience upload you want to know which addresses are worth keeping. This guide shows how to check a whole list at once and get **a verdict and a 0–100 score for every address**, for {{price}}.

One thing up front, because it matters: this is **syntax + DNS/MX + list-based validation**. It does not open an SMTP connection to ask a mail server whether one specific mailbox exists — outbound port 25 is blocked on Apify, as on most cloud platforms. Below we explain what that means in practice and when you should add an SMTP check on top.

## What you get

Each address becomes one row. A real row from a recent run:

{{sample}}

| Field | What it tells you |
|---|---|
| `isValidSyntax`, `localPart`, `domain`, `domainAscii` | Structural check result and the split address (with the punycode form of international domains) |
| `hasMx`, `mxRecords`, `mxFallback` | Whether the domain can receive mail at all, its mail servers, and whether an A/AAAA record was used as fallback |
| `mxProvider` | The mailbox vendor behind the domain, such as Google Workspace, Microsoft 365 or Zoho Mail |
| `isDisposable` | The domain is on a curated list of throwaway providers (mailinator, guerrillamail, 10minutemail, temp-mail, yopmail and their mirrors) |
| `isFreeProvider` | A consumer mailbox (Gmail, Outlook, Yahoo…) rather than a company domain |
| `isRoleAddress` | A generic inbox such as `info@`, `support@` or `sales@` rather than a person |
| `didYouMean` | A likely intended address when the domain looks like a typo, e.g. `gmial.com` |
| `normalizedEmail` | Lower-cased, with Gmail dot/plus canonicalisation, so duplicates collapse |
| `deliverability`, `score`, `reasons` | `deliverable-likely`, `risky`, `undeliverable` or `unknown`, a 0–100 confidence and the reasons behind it |

## Step-by-step

1. Open the tool and paste your list into **Emails** — straight from a CRM export or sign-up log. Blank lines and duplicates are ignored.
2. Keep **Check MX / A records** on. This is the check that catches dead and misspelled domains. Turn it off only for a quick syntax-and-lists pass.
3. For lists of thousands, raise **Max concurrency** to 20–30. Lower it to 2–3 if you see DNS timeouts.
4. Click **Start**, then filter the results on `deliverability` or `score` and export to CSV or Excel.

{{cta}}

## Call it from code

{{code}}

For single addresses in real time — say, a sign-up form — the tool also runs in Apify's **Standby** mode: a `GET` request with `?email=` (or `?emails=a@x.com,b@y.com`) to its standby URL returns the scored rows directly, without starting a batch run.

## Recipes

### Clean a lead list before the first send
Run the list, keep rows with `deliverability` = `deliverable-likely`, and review the `risky` ones by hand. Drop every `undeliverable` row and every `isDisposable: true` address. If your campaign targets people rather than inboxes, set role addresses aside as well.

### Validate what the Email Extractor found
Crawled a list of company websites with the Email Extractor? Start this tool with `inputDatasetId` set to that run's dataset ID and `inputField` set to `emails`. The `emails` array of every domain is flattened, so a 50-domain run with two or three addresses per site becomes 100–150 scored rows. Addresses from the dataset are merged and de-duplicated with anything you also paste into Emails.

### Catch typos at sign-up
Call the standby endpoint from your form's backend. When `didYouMean` is filled — `jane@gmial.com` → `jane@gmail.com` — ask the user "did you mean…?" before saving. Typos fixed at the door never become bounces later.

## How much does it cost?

{{pricing}}

Each address needs at most one DNS lookup, so a list of 10,000 runs in a few minutes. Set **Maximum cost per run** and the tool trims the list to what the budget covers.

## How it compares

| | This tool | SMTP verification services |
|---|---|---|
| Syntax check | Yes | Yes |
| Domain accepts mail (MX / A) | Yes | Yes |
| Disposable, free-provider and role flags | Yes | Yes |
| Typo suggestions | Yes (`didYouMean`) | Usually |
| Mailbox exists (SMTP handshake) | **No** — port 25 is blocked on Apify | Yes |
| Catch-all domain detection | **No** — needs the same SMTP connection | Yes |
| Pricing | Pay per address, platform usage included | Usually credit packs or subscriptions, typically priced well above DNS-only checks |
| Runs inside your Apify pipeline (API, schedules, dataset chaining) | Yes | Separate service and export |

The honest summary: DNS and list checks catch most real-world problems — typos, dead domains, throwaway addresses, generic inboxes — at very low cost. When a near-zero bounce rate matters more than cost (a high-value cold campaign, a paid audience upload), run this tool first and send only the survivors to an SMTP verifier. You pay the expensive check on a much shorter list.

## Responsible use

Validating addresses you already hold is routine list hygiene. If those addresses belong to people, data-protection law (GDPR, UK GDPR, KVKK) and anti-spam rules (CAN-SPAM, PECR) still apply to how you collected and use them: keep a lawful basis, honour unsubscribes and suppress opted-out addresses before every send. The tool only reads public DNS records — it never sends a message or reads any mailbox.

## FAQ

### Does it confirm that a mailbox actually exists?
No. It confirms the address is well formed, that its domain can receive mail and whether it is disposable, free or a role account. A valid address on a working domain can still bounce if that particular mailbox was never created; ruling that out needs an SMTP handshake, which cloud platforms block.

### What does "unknown" mean?
The domain's mail setup wasn't confirmed in this run — either **Check MX / A records** was off or the DNS lookup failed (for example a timeout). The address may be fine; re-run it or treat it as unverified.

### How current is the disposable-domain list?
It is a curated snapshot embedded in the tool, not a live feed. New throwaway services appear constantly, so treat `isDisposable` as a strong signal rather than a guarantee.

### Why didn't my Gmail address get a typo suggestion?
`didYouMean` only fires when the domain is not already an exact known provider and is within a couple of characters of one — `gmial.com` or `yahooo.com`. A correct `gmail.com` never triggers it.

### Can I export the results?
Yes — JSON, CSV, Excel or HTML from the Output tab, or through the API.
