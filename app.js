const state = {
  location: null,
  stream: null,
  scanning: false,
  results: []
};

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

const statusEl = $("#status");
const resultsSection = $("#resultsSection");
const resultsList = $("#resultsList");

function setStatus(message = "", error = false) {
  statusEl.textContent = message;
  statusEl.classList.toggle("error", error);
}

function selectMode(mode) {
  $$(".tab").forEach(btn => btn.classList.toggle("active", btn.dataset.mode === mode));
  $$(".panel").forEach(panel => panel.classList.remove("active"));
  $("#" + mode + "Panel").classList.add("active");
  if (mode !== "scan") stopScanner();
}

$$(".tab").forEach(btn => btn.addEventListener("click", () => selectMode(btn.dataset.mode)));

$("#locationBtn").addEventListener("click", () => {
  if (!("geolocation" in navigator)) {
    setStatus("This browser does not support location services.", true);
    return;
  }

  setStatus("Requesting location permission…");

  navigator.geolocation.getCurrentPosition(
    (position) => {
      state.location = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      };

      $("#locationCard").classList.add("enabled");
      $("#locationTitle").textContent = "Nearby prices are on";
      $("#locationText").textContent = "Location is active for this session only and is not stored.";
      $("#locationBtn").textContent = "Location active";
      setStatus("Location ready. Searches can now be ranked by distance.");
    },
    (error) => {
      const messages = {
        1: "Location permission was denied. You can still search without nearby ranking.",
        2: "Your location could not be determined.",
        3: "Location request timed out."
      };
      setStatus(messages[error.code] || "Could not access location.", true);
    },
    { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
  );
});

$$(".search-btn").forEach(btn => btn.addEventListener("click", () => {
  const source = btn.dataset.source;
  const value = source === "barcode" ? $("#barcodeInput").value.trim() : $("#descriptionInput").value.trim();
  if (!value) {
    setStatus("Enter something to search for first.", true);
    return;
  }
  runSearch(value, source);
}));

["descriptionInput", "barcodeInput"].forEach(id => {
  $("#" + id).addEventListener("keydown", e => {
    if (e.key === "Enter") {
      const source = id === "barcodeInput" ? "barcode" : "describe";
      const value = e.target.value.trim();
      if (value) runSearch(value, source);
    }
  });
});

function runSearch(query, source) {
  setStatus("Searching for the best prices…");

  // Demo data until retailer/product providers are connected.
  state.results = [
    { store: "Nearby retailer", price: 7.94, distance: 2.4, note: "Sale price", sale: true },
    { store: "Local store", price: 8.99, distance: 1.8, note: "Regular price", sale: false },
    { store: "Online retailer", price: 9.31, distance: null, note: "Delivery", sale: false },
    { store: "Pharmacy", price: 12.49, distance: 0.9, note: "Regular price", sale: false }
  ];

  $("#resultTitle").textContent = source === "barcode" ? `Barcode ${query}` : query;
  renderResults("price");
  resultsSection.classList.remove("hidden");
  setStatus(state.location
    ? "Showing demo results. Live retailer connections are the next build step."
    : "Showing demo results. Enable location to rank future live results nearby.");
}

function renderResults(sortBy) {
  const rows = [...state.results];
  if (sortBy === "distance") {
    rows.sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
  } else {
    rows.sort((a, b) => a.price - b.price);
  }

  resultsList.innerHTML = rows.map(item => `
    <article class="result-card">
      <div>
        <div class="store">${escapeHtml(item.store)}</div>
        <div class="meta">${item.distance == null ? item.note : `${item.distance.toFixed(1)} mi · ${item.note}`}</div>
      </div>
      <div class="price">
        $${item.price.toFixed(2)}
        ${item.sale ? '<div class="sale">SALE</div>' : ''}
      </div>
    </article>
  `).join("");
}

let sortMode = "price";
$("#sortBtn").addEventListener("click", () => {
  sortMode = sortMode === "price" ? "distance" : "price";
  $("#sortBtn").textContent = "Sort: " + sortMode;
  renderResults(sortMode);
});

$("#scanBtn").addEventListener("click", async () => {
  if (state.scanning) {
    stopScanner();
    return;
  }

  if (!("BarcodeDetector" in window)) {
    setStatus("Barcode scanning is not supported by this browser yet. Enter the UPC manually instead.", true);
    return;
  }

  try {
    const formats = await BarcodeDetector.getSupportedFormats();
    const preferred = ["ean_13", "ean_8", "upc_a", "upc_e"];
    const supported = preferred.filter(f => formats.includes(f));

    state.stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false
    });

    const video = $("#video");
    video.srcObject = state.stream;
    await video.play();

    state.scanning = true;
    $(".scanner").classList.add("running");
    $("#scanBtn").textContent = "Stop scanner";
    $("#scanStatus").textContent = "Point the camera at a product barcode.";
    setStatus("");
    scanLoop(new BarcodeDetector({ formats: supported.length ? supported : undefined }));
  } catch (error) {
    setStatus("Camera access failed. You can still enter the barcode manually.", true);
  }
});

async function scanLoop(detector) {
  if (!state.scanning) return;

  try {
    const codes = await detector.detect($("#video"));
    if (codes.length) {
      const value = codes[0].rawValue;
      stopScanner();
      $("#barcodeInput").value = value;
      selectMode("barcode");
      setStatus(`Barcode detected: ${value}`);
      runSearch(value, "barcode");
      return;
    }
  } catch {}

  requestAnimationFrame(() => scanLoop(detector));
}

function stopScanner() {
  state.scanning = false;
  if (state.stream) {
    state.stream.getTracks().forEach(track => track.stop());
    state.stream = null;
  }
  const scanner = $(".scanner");
  if (scanner) scanner.classList.remove("running");
  const btn = $("#scanBtn");
  if (btn) btn.textContent = "Start scanner";
  const video = $("#video");
  if (video) video.srcObject = null;
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  }[char]));
}

window.addEventListener("pagehide", stopScanner);
