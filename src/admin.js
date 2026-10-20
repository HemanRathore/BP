(function () {
  "use strict";
  var $ = function (s, root) { return (root || document).querySelector(s); };
  var $$ = function (s, root) { return Array.prototype.slice.call((root || document).querySelectorAll(s)); };
  var auth = $("#admin-auth"), dashboard = $("#admin-dashboard"), noticeEl = $("#admin-notice");
  var products = [], locations = [], editingId = null;
  var categories = window.BP_CATEGORIES || [];

  function esc(value) {
    return String(value == null ? "" : value).replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  function api(action, options) {
    options = options || {};
    return fetch("/api/admin?action=" + encodeURIComponent(action), {
      method: options.method || "GET", credentials: "same-origin",
      headers: options.body ? { "Content-Type": "application/json" } : {},
      body: options.body ? JSON.stringify(options.body) : undefined
    }).then(function (res) {
      return res.json().catch(function () { return {}; }).then(function (data) {
        if (!res.ok) throw new Error(data.error || "Request failed.");
        return data;
      });
    });
  }
  function announce(message, bad) {
    noticeEl.textContent = message || "";
    noticeEl.classList.toggle("is-error", !!bad);
    noticeEl.classList.toggle("is-visible", !!message);
    if (message) window.setTimeout(function () { noticeEl.classList.remove("is-visible"); }, 5000);
  }
  function showDashboard(email) {
    auth.hidden = true; dashboard.hidden = false;
    $("#admin-user").textContent = email || "Signed in";
  }
  function categoryLabel(id) {
    var found = categories.find(function (cat) { return cat.id === id; });
    return found ? found.name : id || "Uncategorised";
  }
  function slug(value) {
    return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 75);
  }
  function renderProducts(filter) {
    var host = $("#product-list");
    var term = (filter || "").toLowerCase().trim();
    var rows = products.map(function (item, index) { return { item: item, index: index }; })
      .filter(function (row) { return !term || (row.item.name + " " + row.item.cat + " " + row.item.id).toLowerCase().indexOf(term) >= 0; });
    $("#product-count").textContent = products.length + " products";
    host.innerHTML = rows.length ? rows.map(function (row) {
      var p = row.item, i = row.index;
      var price = p.price ? "₹" + esc(p.price.from) + " – ₹" + esc(p.price.to) + " " + esc(p.price.unit || "") : "Price on request";
      return '<article class="admin-product-row"><div class="admin-product-row__main"><span class="admin-product-row__order">' + String(i + 1).padStart(2, "0") + '</span><div><h3>' + esc(p.name) + '</h3><p>' + esc(categoryLabel(p.cat)) + ' <span>·</span> ' + esc(price) + '</p><small>' + esc(p.id) + (p.featured ? ' · <b>Featured</b>' : '') + '</small></div></div><div class="admin-product-row__actions"><button class="admin-icon-btn" type="button" data-move="up" data-index="' + i + '" aria-label="Move ' + esc(p.name) + ' up" ' + (i === 0 ? 'disabled' : '') + '>↑</button><button class="admin-icon-btn" type="button" data-move="down" data-index="' + i + '" aria-label="Move ' + esc(p.name) + ' down" ' + (i === products.length - 1 ? 'disabled' : '') + '>↓</button><button class="btn btn--outline btn--sm" type="button" data-edit="' + esc(p.id) + '">Edit</button><button class="admin-delete" type="button" data-delete="' + esc(p.id) + '">Remove</button></div></article>';
    }).join("") : '<div class="admin-empty">No matching products.</div>';
  }
  function fillCategories(selected) {
    $("#product-category").innerHTML = categories.map(function (cat) {
      return '<option value="' + esc(cat.id) + '" ' + (cat.id === selected ? 'selected' : '') + '>' + esc(cat.name) + '</option>';
    }).join("");
  }
  function openProduct(product) {
    editingId = product ? product.id : null;
    var form = $("#product-form"); form.reset();
    $("#product-dialog-title").textContent = product ? "Edit product" : "Add product";
    $("#product-form-message").textContent = "";
    fillCategories(product ? product.cat : (categories[0] || {}).id);
    var values = product || { name: "", id: "", cat: (categories[0] || {}).id, image: "", short: "", desc: "", sizes: "", moq: "", print: "", specs: {}, badges: [], featured: false, price: null };
    ["name", "id", "cat", "image", "short", "desc", "sizes", "moq", "print"].forEach(function (key) {
      if (form.elements[key]) form.elements[key].value = values[key] == null ? "" : values[key];
    });
    form.elements.specs.value = JSON.stringify(values.specs || {}, null, 2);
    form.elements.badges.value = (values.badges || []).join(", ");
    form.elements.featured.checked = !!values.featured;
    form.elements["no-price"].checked = !values.price;
    form.elements.priceFrom.value = values.price ? values.price.from : "";
    form.elements.priceTo.value = values.price ? values.price.to : "";
    form.elements.priceUnit.value = values.price ? values.price.unit || "" : "";
    form.elements.priceBasis.value = values.price ? values.price.basis || "" : "";
    togglePriceFields();
    $("#product-dialog").showModal();
  }
  function togglePriceFields() {
    var disabled = $("#product-form").elements["no-price"].checked;
    $$(".admin-price-fields input").forEach(function (input) { input.disabled = disabled; });
  }
  function renderLocations() {
    $("#location-list").innerHTML = locations.map(function (loc, index) {
      return '<article class="admin-location-card" data-location-index="' + index + '"><div class="admin-location-card__heading"><strong>' + esc(loc.name || "New location") + '</strong><button class="admin-delete" type="button" data-remove-location="' + index + '">Remove</button></div><input type="hidden" data-field="id" value="' + esc(loc.id || "") + '"><div class="admin-form-grid"><label class="admin-field">Location name<input data-field="name" required maxlength="120" value="' + esc(loc.name) + '"></label><label class="admin-field">Type<input data-field="type" maxlength="80" value="' + esc(loc.type) + '"></label></div><label class="admin-field">Full address<textarea data-field="address" required rows="2" maxlength="500">' + esc(loc.address) + '</textarea></label><div class="admin-form-grid"><label class="admin-field">City / area<input data-field="city" maxlength="160" value="' + esc(loc.city) + '"></label><label class="admin-field">Google Maps share URL<input data-field="map" type="url" required maxlength="1000" value="' + esc(loc.map) + '"></label></div><div class="admin-form-grid"><label class="admin-field">Phone<input data-field="phone" maxlength="60" value="' + esc(loc.phone) + '"></label><label class="admin-field">WhatsApp number<input data-field="wa" maxlength="30" value="' + esc(loc.wa) + '"></label></div><label class="admin-field">Storage / additional note<input data-field="storage" maxlength="160" value="' + esc(loc.storage) + '"></label><label class="admin-check"><input type="checkbox" data-field="primary" ' + (loc.primary ? 'checked' : '') + '> Primary location</label></article>';
    }).join("");
  }
  function loadContent() {
    return api("content").then(function (data) {
      products = Array.isArray(data.products) ? data.products : [];
      locations = Array.isArray(data.locations) ? data.locations : [];
      if (!products.length && Array.isArray(window.BP_PRODUCTS) && window.BP_PRODUCTS.length) {
        products = JSON.parse(JSON.stringify(window.BP_PRODUCTS));
        locations = locations.length ? locations : JSON.parse(JSON.stringify((window.BP_CONFIG || {}).locations || []));
        return api("products", { method: "PUT", body: { products: products } }).then(function () {
          return api("locations", { method: "PUT", body: { locations: locations } });
        }).then(function () { renderProducts(); renderLocations(); announce("Initial catalogue copied into the database."); });
      }
      renderProducts(); renderLocations();
    });
  }
  function renderAnalytics(data) {
    $("#analytics-stats").innerHTML = '<article class="admin-stat"><span>Page views — 30 days</span><strong>' + esc(data.total || 0) + '</strong></article><article class="admin-stat"><span>Views today</span><strong>' + esc(data.today || 0) + '</strong></article><article class="admin-stat"><span>Pages tracked</span><strong>' + esc((data.pages || []).length) + '</strong></article>';
    var series = data.series || [], max = Math.max(1, ...series.map(function (x) { return x.views; }));
    var width = 780, height = 220, pad = 12, step = (width - pad * 2) / Math.max(series.length, 1), bar = Math.max(2, step * .62);
    var svg = '<svg viewBox="0 0 ' + width + ' ' + height + '" role="img" aria-label="Daily page views for the last 30 days">';
    svg += '<line x1="' + pad + '" y1="' + (height - 24) + '" x2="' + (width - pad) + '" y2="' + (height - 24) + '" stroke="currentColor" opacity=".15"/>';
    series.forEach(function (point, index) {
      var h = (height - 45) * point.views / max, x = pad + index * step + (step - bar) / 2, y = height - 25 - h;
      svg += '<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) + '" width="' + bar.toFixed(1) + '" height="' + Math.max(h, 2).toFixed(1) + '" rx="3" fill="var(--gold)"><title>' + esc(point.day) + ': ' + esc(point.views) + ' views</title></rect>';
    });
    svg += '</svg><div class="admin-chart-labels"><span>' + esc(series[0] ? series[0].day : "") + '</span><span>' + esc(series[series.length - 1] ? series[series.length - 1].day : "") + '</span></div>';
    $("#analytics-chart").innerHTML = series.length ? svg : '<p class="admin-empty">No page-view data yet. It will appear as visitors browse the site.</p>';
    $("#top-pages").innerHTML = data.pages && data.pages.length ? data.pages.map(function (p) {
      return '<div class="admin-page-stat"><span>' + esc(p.path) + '</span><strong>' + esc(p.views) + '</strong></div>';
    }).join("") : '<p class="admin-empty">No page-view data yet.</p>';
  }
  function loadAnalytics() { return api("analytics").then(renderAnalytics); }

  $("#login-form").addEventListener("submit", function (event) {
    event.preventDefault();
    var form = event.currentTarget, button = form.querySelector("button[type=submit]"), msg = $("#login-message");
    msg.textContent = "Signing in…"; button.disabled = true;
    api("login", { method: "POST", body: { email: form.elements.email.value, password: form.elements.password.value, otp: form.elements.otp.value } })
      .then(function (data) { showDashboard(data.email); form.reset(); return loadContent(); })
      .then(function () { announce("Signed in. Your changes will be saved to the database."); })
      .catch(function (err) { msg.textContent = err.message; })
      .finally(function () { button.disabled = false; });
  });
  $("#logout-button").addEventListener("click", function () {
    api("logout", { method: "POST", body: {} }).catch(function () {}).finally(function () { window.location.reload(); });
  });
  $$(".admin-tab").forEach(function (button) {
    button.addEventListener("click", function () {
      $$(".admin-tab").forEach(function (tab) { var active = tab === button; tab.classList.toggle("is-active", active); tab.setAttribute("aria-selected", String(active)); });
      $$(".admin-panel").forEach(function (panel) { var active = panel.dataset.panel === button.dataset.tab; panel.classList.toggle("is-active", active); panel.hidden = !active; });
      if (button.dataset.tab === "analytics") loadAnalytics().catch(function (err) { announce(err.message, true); });
    });
  });
  $("#product-search").addEventListener("input", function (event) { renderProducts(event.currentTarget.value); });
  $("#add-product").addEventListener("click", function () { openProduct(null); });
  $("#product-category").addEventListener("change", function () {});
  $("#product-form").elements["no-price"].addEventListener("change", togglePriceFields);
  $$('[data-close-dialog]').forEach(function (button) { button.addEventListener("click", function () { $("#product-dialog").close(); }); });
  $("#product-list").addEventListener("click", function (event) {
    var edit = event.target.closest("[data-edit]"), remove = event.target.closest("[data-delete]"), move = event.target.closest("[data-move]");
    if (edit) openProduct(products.find(function (p) { return p.id === edit.dataset.edit; }));
    if (remove) {
      var product = products.find(function (p) { return p.id === remove.dataset.delete; });
      if (!product || !window.confirm('Remove “' + product.name + '” from the catalogue?')) return;
      products = products.filter(function (p) { return p.id !== product.id; });
      api("products", { method: "PUT", body: { products: products } }).then(function (data) { products = data.products; renderProducts($("#product-search").value); announce("Product removed."); }).catch(function (err) { announce(err.message, true); });
    }
    if (move) {
      var index = Number(move.dataset.index), next = index + (move.dataset.move === "up" ? -1 : 1);
      if (next < 0 || next >= products.length) return;
      var item = products.splice(index, 1)[0]; products.splice(next, 0, item);
      api("products", { method: "PUT", body: { products: products } }).then(function (data) { products = data.products; renderProducts($("#product-search").value); announce("Product order saved."); }).catch(function (err) { announce(err.message, true); });
    }
  });
  $("#product-form").addEventListener("submit", function (event) {
    event.preventDefault();
    var form = event.currentTarget, data = Object.fromEntries(new FormData(form).entries());
    var specs;
    try { specs = JSON.parse(data.specs || "{}"); if (!specs || Array.isArray(specs) || typeof specs !== "object") throw new Error(); }
    catch (_) { $("#product-form-message").textContent = "Specifications must be valid JSON, for example {\"Ply\":\"5 Ply\"}."; return; }
    var price = form.elements["no-price"].checked ? null : {
      from: Number(data.priceFrom), to: Number(data.priceTo), unit: data.priceUnit.trim(), basis: data.priceBasis.trim()
    };
    if (price && (!data.priceFrom.trim() || !data.priceTo.trim() || !Number.isFinite(price.from) || !Number.isFinite(price.to) || price.from < 0 || price.to < price.from)) {
      $("#product-form-message").textContent = "Enter valid prices; the upper price must be at least the lower price."; return;
    }
    var original = products.find(function (p) { return p.id === editingId; }) || {};
    var product = Object.assign({}, original, {
      id: data.id.trim(), name: data.name.trim(), cat: data.cat, image: data.image.trim(), short: data.short.trim(),
      desc: data.desc.trim(), sizes: data.sizes.trim(), moq: data.moq.trim(), print: data.print.trim(), specs: specs,
      badges: data.badges.split(",").map(function (x) { return x.trim(); }).filter(Boolean), featured: form.elements.featured.checked, price: price
    });
    if (editingId && editingId !== product.id && products.some(function (p) { return p.id === product.id; })) {
      $("#product-form-message").textContent = "That product ID is already in use."; return;
    }
    if (!editingId && products.some(function (p) { return p.id === product.id; })) {
      $("#product-form-message").textContent = "That product ID is already in use."; return;
    }
    if (editingId) products = products.map(function (p) { return p.id === editingId ? product : p; });
    else products.push(product);
    var save = $("#product-form").querySelector('button[type="submit"]'); save.disabled = true;
    api("products", { method: "PUT", body: { products: products } })
      .then(function (result) { products = result.products; renderProducts($("#product-search").value); $("#product-dialog").close(); announce("Product saved and published."); })
      .catch(function (err) { $("#product-form-message").textContent = err.message; })
      .finally(function () { save.disabled = false; });
  });
  $("#add-location").addEventListener("click", function () {
    locations.push({ id: "location-" + Date.now(), type: "Office", name: "", address: "", city: "", map: "", phone: "", wa: "" }); renderLocations();
    var cards = $$(".admin-location-card"); cards[cards.length - 1].scrollIntoView({ behavior: "smooth", block: "center" });
  });
  $("#location-list").addEventListener("click", function (event) {
    var button = event.target.closest("[data-remove-location]"); if (!button) return;
    var index = Number(button.dataset.removeLocation);
    if (locations.length <= 1) { announce("At least one location must remain.", true); return; }
    locations.splice(index, 1); renderLocations();
  });
  $("#locations-form").addEventListener("submit", function (event) {
    event.preventDefault();
    var next = $$(".admin-location-card").map(function (card) {
      var original = locations[Number(card.dataset.locationIndex)] || {};
      var result = Object.assign({}, original);
      $$('[data-field]', card).forEach(function (field) { result[field.dataset.field] = field.type === "checkbox" ? field.checked : field.value.trim(); });
      return result;
    });
    if (next.filter(function (x) { return x.primary; }).length > 1) { announce("Choose only one primary location.", true); return; }
    var button = event.currentTarget.querySelector('button[type="submit"]'); button.disabled = true;
    api("locations", { method: "PUT", body: { locations: next } }).then(function (data) {
      locations = data.locations; renderLocations(); announce("Locations saved and published.");
    }).catch(function (err) { announce(err.message, true); }).finally(function () { button.disabled = false; });
  });
  $("#refresh-analytics").addEventListener("click", function () { loadAnalytics().then(function () { announce("Analytics refreshed."); }).catch(function (err) { announce(err.message, true); }); });
  $("#product-form").elements.name.addEventListener("input", function (event) {
    var id = $("#product-form").elements.id;
    if (!editingId || id.dataset.edited !== "true") id.value = slug(event.currentTarget.value);
  });
  $("#product-form").elements.id.addEventListener("input", function (event) { event.currentTarget.dataset.edited = "true"; });

  api("session").then(function (data) {
    showDashboard(data.email);
    return loadContent();
  }).catch(function () { auth.hidden = false; dashboard.hidden = true; });
})();
