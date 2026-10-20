/* Fetch editable public content from the server; static data is the fallback. */
(function () {
  "use strict";
  var controller = new AbortController();
  var timeout = window.setTimeout(function () { controller.abort(); }, 2200);
  window.BP_DATA_READY = fetch("/api/catalog", { credentials: "same-origin", headers: { Accept: "application/json" }, signal: controller.signal })
    .then(function (response) { return response.ok ? response.json() : null; })
    .then(function (data) {
      if (!data) return;
      if (Array.isArray(data.products) && data.products.length && Array.isArray(window.BP_PRODUCTS)) {
        window.BP_PRODUCTS.splice.apply(window.BP_PRODUCTS, [0, window.BP_PRODUCTS.length].concat(data.products));
      }
      if (Array.isArray(data.locations) && data.locations.length && window.BP_CONFIG) window.BP_CONFIG.locations = data.locations;
    })
    .catch(function () { /* Non-API static hosting keeps using its source files. */ })
    .finally(function () { window.clearTimeout(timeout); });
})();
