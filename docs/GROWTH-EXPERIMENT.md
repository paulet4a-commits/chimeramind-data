# Flagship onboarding — 23 October 2026

Campaign: `flagship_20261023`. These pages are the acquisition destinations:

- `/start/website-fields/`: one static page and one field; CSS Extractor.
- `/start/youtube-channel-inventory/`: at most 10 recent videos from one channel.
- `/start/youtube-upload-monitor/`: at most 20 videos; guidance for a separately configured recurring comparison.

The home page links to all three; each recipe links to the correct Actor with source page,
Actor, placement and campaign parameters. Existing catalog prices and prefills are unchanged.
Downloads contain no credentials; n8n requires a separately selected Header Auth credential.
The n8n starters are inactive, structurally tested exports; no n8n runtime acceptance is claimed.

## Measurement contract

Use the existing Cloudflare Web Analytics property for `data.chimeramind.com`, with the same
date range, bot/country settings and path filter for each `/start/` page. Report page views
and visits with their source date. Internal QA visits must not be called customers.

UTM parameters label the outbound Actor links. They do **not** prove that Apify reports
click counts, paid conversions or revenue by campaign. No new visitor identifier, cookie,
local tracking store or analytics collector is introduced. A page view is not an outbound click.

For Apify, compare the same Actor, calendar month and discount filters in Console Insights.
Record detail views, input views, starts, paying users, profit and cost independently.
Acquisition excludes API, schedules and integrations. Differences between cumulative
snapshots are not a user cohort; run counts are not paying-user counts. Cross-Actor user
counts cannot be summed. Retention and channel-paid attribution remain unknown until the
provider supplies matching evidence. Do not manufacture conversion rates across the two systems.

The dated financial and acquisition baseline belongs in the private operations record,
alongside the source timestamp and filters. Do not put account revenue, paying-user counts,
customer records or access credentials in public site content or campaign documents.

Review after 7 and 14 complete days of exposure. Record the exact measurement timestamp and
filters, the source and missing fields. Compare CSS and YouTube separately, and preserve
calendar-month boundaries at November 1. An increase is an observation, not causal proof.
Decide whether to keep the new entry points from useful/paid use, not the number of pages built.

## Distribution order

1. Link the existing catalog and Actor descriptions to the relevant recipe.
2. Show the CSS recipe in a focused website-to-CSV guide and the YouTube recipe in a channel
   inventory guide. Use the dated recorded sample if available; never invent output.
3. Record one short screen demo per recipe when a real run is available. The owner's free
   testing budget must permit it; this implementation starts no cloud runs and changes no
   paid plan. Do not present a local preview as cloud execution.
4. Share each guide only on a relevant authorized channel, with its campaign URL. Publication
   and independently verified public URL must be recorded; prepared text is not a published post.

The rollout uses the existing PR/quality/Pages deployment pipeline. Pricing, Actor runtime,
existing publication queue and spending limits are unaffected.
