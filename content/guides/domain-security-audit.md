---
title: Bulk Domain Security Check — SSL Expiry, Security Headers, HTTPS Redirects
h1: Check SSL certificates, security headers and redirects for a whole domain list
short: Domain Security Audit
kicker: Security & compliance
actor: domain-security-audit
description: Audit TLS certificates, HTTP→HTTPS redirects, HSTS, CSP and other security headers, cookie flags and robots.txt / llms.txt AI-crawler rules for any list of domains — one scored, graded row per domain.
updated: 2026-10-03
---

Checking a single domain's security basics means three tools: `openssl s_client` for the certificate, `curl -I` for headers, and a manual read of `robots.txt`. Doing it for 40 client domains, 300 sales prospects or your own portfolio of brand sites is a day of copy-paste. This guide shows how to run all of those checks over **a list of domains in one go** and get one row per domain with a 0–100 `securityScore`, an A–F `securityGrade` and plain-English `issues` — for {{price}}.

## What you get

Each domain returns 40+ fields across four areas:

| Area | Example fields |
|---|---|
| TLS certificate | `certValidTo`, `certDaysUntilExpiry`, `certIssuerOrg`, `certSubjectCN`, `certSanCount`, `certAuthorized`, `tlsProtocol` |
| Redirects | `finalUrl`, `redirectHops`, `redirectChain`, `httpsRedirect`, `wwwRedirect` |
| Security headers & cookies | `hasHsts`, `hstsMaxAge`, `hstsPreload`, `hasCsp`, `cspHasUnsafeInline`, `xFrameOptions`, `xContentTypeOptions`, `referrerPolicy`, `permissionsPolicy`, `xPoweredBy`, `cookieCount`, `secureCookieCount`, `httpOnlyCookieCount` |
| robots.txt / llms.txt | `robotsStatus`, `robotsDisallowAll`, `robotsSitemapCount`, `aiBotsDisallowed`, `llmsTxtExists`, `llmsTxtTitle` |

A real row from a recorded run:

{{sample}}

The certificate data comes from a direct TLS handshake on port 443; the rest is ordinary HTTP requests — the same public information any browser receives when it connects.

## How the score works

Points are earned for: HTTPS redirect (+20), a valid, trusted certificate (+20) with more than 14 days left (+5), HSTS (+15), Content-Security-Policy (+10), X-Frame-Options, X-Content-Type-Options, Referrer-Policy and Permissions-Policy (+5 each), no `X-Powered-By` leak (+5) and all cookies carrying the `Secure` flag (+5). Grades: A ≥ 85, B ≥ 70, C ≥ 50, D ≥ 30, otherwise F. Every missed point is spelled out in `issues`, e.g. "No HSTS header" or "TLS certificate expires in 9 day(s)".

## Step-by-step

1. Open the tool and paste domains into **Domains**. Bare domains, full URLs and `www.` are all accepted — `https://www.example.com/store` is normalised to `example.com`.
2. Keep all four checks on for the full audit: **Check TLS certificate**, **Check HTTP security headers**, **Follow redirect chain** and **Check robots.txt and llms.txt**. Turn one off to skip that section.
3. Raise **Max concurrency** for long lists and click **Start**.
4. Use the ready-made **Overview**, **TLS certificate** and **Headers, redirects & robots** views, or export everything to CSV or Excel.

{{cta}}

## Call it from code

{{code}}

## Recipes

### Certificate-expiry alerts for your domain portfolio
Schedule a daily run over every domain you own and add a webhook. Your endpoint filters rows where `certDaysUntilExpiry` is under 14 — or `certAuthorized` is `false` — and pings the on-call channel. An unreachable domain still returns a row with `error` set, so outages surface too.

### Security hygiene report for clients
MSPs and consultants run the client's domains monthly and paste `securityGrade` and `issues` straight into the report. Because the scoring rules are fixed and published above, month-over-month changes mean something.

### AI-crawler policy survey
`aiBotsDisallowed` lists which AI crawlers (GPTBot, ClaudeBot, Google-Extended, PerplexityBot and others) a site blocks in robots.txt, and `llmsTxtExists` shows whether it publishes an `llms.txt`. Run it over a competitor set to see who is opting in or out of AI search.

## How much does it cost?

{{pricing}}

Each domain is one TLS handshake, up to 10 redirect hops, one headers fetch and two small text fetches, so platform usage stays negligible. Set **Maximum cost per run** in Apify and the tool trims the list to fit the budget.

## How it compares

| Option | Good at | Watch out for |
|---|---|---|
| **This tool** | Whole domain lists in one run; TLS, redirects, headers, cookies and AI-crawler rules together; scored rows; schedules, API and MCP | Checks the homepage response of each domain, not every subpage; it is a hygiene audit, not a vulnerability scanner |
| `openssl` + `curl` by hand | Precise control over one domain | Three tools per domain, no structured output |
| Single-site header graders | Detailed explanation for one site | One domain at a time, no export |
| Certificate monitoring services | Expiry alerts | Usually certificates only, often per-domain pricing tiers |

## FAQ

### Is this a penetration test?
No. It reads public, passive signals — the certificate, response headers, redirects and robots.txt — that any visitor receives. It doesn't probe for vulnerabilities, so it's safe to run against prospects and third parties.

### What happens if a domain doesn't resolve?
You still get a row, with `error` explaining the failure and the other fields `null`. One dead domain never fails the whole run.

### Why does a site with a valid certificate still score low?
The certificate is only a quarter of the score. Missing HSTS, no Content-Security-Policy or a leaking `X-Powered-By` header each cost points; `issues` lists exactly which.

### Which headers matter most?
HSTS carries the biggest weight after HTTPS itself, followed by Content-Security-Policy. The smaller headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) are quick wins worth 5 points each.

### Is it legal to check other people's domains?
Yes. Certificates, headers and robots.txt are public information servers send to anyone who connects, and no personal data is collected.
