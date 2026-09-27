window.PRICE_RADAR_RETAILERS = [
  {
    id: "walmart",
    name: "Walmart",
    buildSearchUrl(query) {
      return "https://www.walmart.com/search?q=" + encodeURIComponent(query);
    }
  },
  {
    id: "target",
    name: "Target",
    buildSearchUrl(query) {
      return "https://www.target.com/s?searchTerm=" + encodeURIComponent(query);
    }
  },
  {
    id: "amazon",
    name: "Amazon",
    buildSearchUrl(query) {
      return "https://www.amazon.com/s?k=" + encodeURIComponent(query);
    }
  },
  {
    id: "bestbuy",
    name: "Best Buy",
    buildSearchUrl(query) {
      return "https://www.bestbuy.com/site/searchpage.jsp?st=" + encodeURIComponent(query);
    }
  },
  {
    id: "homedepot",
    name: "Home Depot",
    buildSearchUrl(query) {
      return "https://www.homedepot.com/s/" + encodeURIComponent(query);
    }
  },
  {
    id: "lowes",
    name: "Lowe's",
    buildSearchUrl(query) {
      return "https://www.lowes.com/search?searchTerm=" + encodeURIComponent(query);
    }
  },
  {
    id: "cvs",
    name: "CVS",
    buildSearchUrl(query) {
      return "https://www.cvs.com/search?searchTerm=" + encodeURIComponent(query);
    }
  },
  {
    id: "walgreens",
    name: "Walgreens",
    buildSearchUrl(query) {
      return "https://www.walgreens.com/search/results.jsp?Ntt=" + encodeURIComponent(query);
    }
  }
];