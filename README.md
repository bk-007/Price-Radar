# Price Radar

A privacy-first, zero-paid-API web app for comparing prices.

## Current approach

Price Radar no longer pretends to have live retailer pricing.

Instead it:
1. accepts a product description or barcode,
2. opens targeted retailer searches,
3. lets the user add matching prices they find,
4. sorts those observations from lowest to highest,
5. keeps all observations only in the current browser session.

This avoids paid shopping APIs, API overage risk, accounts, tracking, and a backend.

## Retailer adapters

Retailer URL builders live in `retailers.js`. Adding another retailer is just another adapter with a name and search URL builder.

Current adapters:
- Walmart
- Target
- Amazon
- Best Buy
- Home Depot
- Lowe's
- CVS
- Walgreens

## Privacy

Price Radar currently has:
- no accounts
- no analytics
- no advertising trackers
- no cookies
- no saved searches
- no persistent price history
- no persisted location
- no uploaded camera images
- no paid shopping APIs

Location is optional and lives only in JavaScript memory for the current page session.

Price observations are also memory-only and disappear on refresh.

## Barcode scanning

Where supported, the browser's `BarcodeDetector` API reads UPC/EAN codes locally from the camera feed. Images are not uploaded.

## Why retailer pages are not scraped directly

Browsers generally block cross-origin page access, and retailer sites frequently use anti-bot protections. This MVP therefore uses retailer search links instead of pretending browser-side scraping will be reliable.

A later version can add a small self-hosted fetch layer or voluntary community price submissions without changing the retailer-adapter model.

## Run locally

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`.

Built by Bryce.
