# Price Radar

A privacy-first web app for finding lower prices and nearby sales.

## What it does

- Search by plain-language product description
- Enter a UPC / EAN manually
- Scan barcodes with the phone camera when the browser supports `BarcodeDetector`
- Optionally use browser location to rank nearby prices
- Avoid storing personal data

## Privacy model

Price Radar currently has:
- no accounts
- no analytics
- no advertising trackers
- no cookies
- no saved searches
- no persisted location
- no uploaded camera images

Location is requested only after the user taps **Use my location**. Coordinates live only in JavaScript memory for the current page session.

See [privacy.md](privacy.md) for details.

## Current state

The interface and privacy/location/barcode flows are working. Price results are demo data until live retailer/product providers are connected.

## Run it

This MVP is plain HTML, CSS, and JavaScript. Serve the repository over HTTPS for camera and geolocation access.

For local development, any simple static server works, for example:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000`.

## Next build step

Add a provider layer for:
1. UPC/product identification
2. retailer pricing and inventory
3. nearby-store search
4. normalization for unit price, sale price, distance, and availability

Built by Bryce.
