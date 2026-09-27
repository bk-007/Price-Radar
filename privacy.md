# Privacy

Price Radar is designed to work without collecting personal data.

## Location

Location access is optional and is requested through the browser only after the user presses **Use my location**.

The current implementation:
- keeps latitude, longitude, and accuracy only in JavaScript memory;
- does not write location to localStorage, sessionStorage, IndexedDB, cookies, or a database;
- does not transmit location anywhere because live retailer APIs are not connected yet;
- loses the location when the page is refreshed or closed.

When live retailer search is added, location should be sent only to the selected search provider for the immediate query and should not be logged or persisted by Price Radar.

## Camera and barcode scanning

Camera access is optional and begins only when the user starts the scanner.

Barcode detection happens in the browser using the BarcodeDetector API. The camera feed is not uploaded or stored.

## Other data

The starter app has:
- no accounts;
- no analytics;
- no advertising trackers;
- no saved search history;
- no user profiles.

Any future feature that changes these guarantees should update this document before release.
