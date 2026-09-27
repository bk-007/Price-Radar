window.PriceRadarObservations = (() => {
  let items = [];

  function add(observation) {
    const clean = {
      id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
      query: String(observation.query || "").trim(),
      store: String(observation.store || "").trim(),
      price: Number(observation.price),
      note: String(observation.note || "").trim(),
      url: String(observation.url || "").trim(),
      observedAt: Date.now()
    };

    if (!clean.query || !clean.store || !Number.isFinite(clean.price) || clean.price < 0) {
      throw new Error("Invalid price observation");
    }

    items.push(clean);
    return clean;
  }

  function forQuery(query) {
    const key = normalize(query);
    return items.filter(item => normalize(item.query) === key);
  }

  function clear() {
    items = [];
  }

  function normalize(value) {
    return String(value || "").toLowerCase().replace(/\s+/g, " ").trim();
  }

  return { add, forQuery, clear };
})();