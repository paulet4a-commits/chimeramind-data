---
title: Free Stock, Crypto and FX Quotes API Without an API Key
h1: One call for stock, crypto and FX prices — no API key, no brokerage account
short: Stock, Crypto & FX Quotes
kicker: Market data
actor: market-quotes
description: Get latest price, daily change, day range, volume and optional daily history for stocks, ETFs, indices, crypto pairs and currency pairs from one mixed watchlist — as clean JSON rows.
updated: 2026-10-03
---

A real watchlist is never one asset class. You hold a few stocks, an index ETF, some Bitcoin and you care about EUR/USD — and every data source covers only one of those, each with its own API key, symbol format and rate limit. This guide shows how to pull **all of them in one call** and get one consistently typed row per symbol, for {{price}}.

## What you get

Give the tool a mixed list such as `AAPL`, `^GSPC`, `BTC-USD`, `ETH` and `EUR/USD`. It detects each symbol's type, reads it from the right public source and returns the same fields for every row. A real row from a recent run:

{{sample}}

| Field | Meaning |
|---|---|
| `price`, `currency` | Latest price and its currency |
| `previousClose`, `changeAbs`, `changePct` | Prior close and the move since then |
| `dayHigh`, `dayLow`, `volume` | Intraday range and volume (not published for FX) |
| `assetType`, `source` | `stock` / `crypto` / `fx`, and which source answered |
| `exchange`, `marketState`, `asOf` | Exchange name, session state and the quote's own timestamp |
| `history` | Daily `{date, close}` points when **Include price history** is on |

## Where the numbers come from

| Asset | Source | Freshness |
|---|---|---|
| Stocks, ETFs, indices (`AAPL`, `^GSPC`, `BRK-B`) | Yahoo Finance public chart data | Typically 15–20 minutes delayed for US equities |
| Crypto (`BTC`, `BTC-USD`, `ETHUSDT`) | Binance public market data, CoinGecko as fallback | Close to live exchange price |
| FX (`EUR/USD`, `USDJPY=X`) | Frankfurter (European Central Bank reference rates) | Once per weekday — a reference rate, not a tradable quote |

All sources are free, public and unauthenticated, which is why you don't need an account or key anywhere.

## Step-by-step

1. Open the tool and put one symbol per line in **Symbols** — stocks, crypto and FX can be mixed.
2. Keep **Asset type** on `auto`. It treats `EUR/USD`, `EURUSD` and `=X` symbols as FX; `-USD`/`USDT` pairs and well-known coin tickers as crypto; everything else as a stock or index.
3. Turn on **Include price history** and set **History days** (up to 365) if you need daily closes for a chart or a backtest.
4. Click **Start**, then export to JSON, CSV or Excel — or schedule the run to snapshot your watchlist every day.

{{cta}}

## Call it from code

{{code}}

## Recipes

### Daily portfolio snapshot into a spreadsheet
Create a schedule in Apify that runs the tool every weekday after the US close, and connect the Google Sheets integration to the run's dataset. Each day appends one row per holding with price and daily change — a free, always-updating portfolio log.

### Price alerts
Run it every 15 minutes on a schedule and attach a webhook. Your endpoint receives the dataset, compares `changePct` or `price` against your thresholds and sends the alert. Because the tool returns `error` instead of a wrong price when a symbol can't be resolved, a broken ticker never triggers a false alarm.

### Feeding a trading model or an AI agent
`history` gives daily closes in a ready-to-use list. For an AI assistant, the tool is callable through the Apify MCP server: ask "how did my watchlist move today?" and the agent can run it and read the rows itself.

## How much does it cost?

{{pricing}}

A 50-symbol watchlist is 50 results. Even refreshed hourly during US market hours, a month of snapshots stays in the low single dollars.

## FAQ

### Do I need a Yahoo Finance, Binance or CoinGecko API key?
No. Every source the tool reads is a free, public, unauthenticated endpoint. You only need an Apify account, and the free plan's monthly credit covers small watchlists.

### Is the stock price real time?
No. US equity quotes from Yahoo Finance are typically delayed 15–20 minutes. Crypto prices come from Binance and are close to live. FX rows are the ECB's daily reference rates. Use a broker feed for anything you execute trades on.

### Why are dayHigh, dayLow and volume empty for currency pairs?
The ECB reference-rate source publishes one rate per day per pair — there is no intraday range or volume to report, so those fields are null by design.

### What if a coin isn't found?
Binance doesn't list every coin against USDT. The tool falls back to CoinGecko for a curated set of popular coins; anything outside both returns a clear error row instead of a guess.

### Is this investment advice?
No. It retrieves publicly available market data for information only and does not recommend any trade.
