/* ==========================================================================
   BP ENTERPRISES — SITE BEHAVIOUR
   Product catalogue, filtering, the enquiry list and every WhatsApp hand-off.
   ========================================================================== */
(function () {
  "use strict";

  var C    = window.BP_CONFIG   || {};
  var CATS = window.BP_CATEGORIES || [];
  var PROD = window.BP_PRODUCTS || [];
  var esc  = window.BP_esc || function (s) { return String(s == null ? "" : s); };
  var icon = window.BP_icon || function () { return ""; };
  var $  = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  var WA_ORDERS = (C.whatsapp && C.whatsapp.orders && C.whatsapp.orders.number) || "";
  var GREETING  = C.whatsappGreeting || "Hello, I would like a quotation.";
  var CURRENCY  = "\u20B9";

  /* =======================================================================
     1. WHATSAPP LINK FACTORY
     ======================================================================= */
  function waLink(number, message) {
    return "https://wa.me/" + number + "?text=" + encodeURIComponent(message);
  }
  function ordersLink(message) {
    return waLink(WA_ORDERS, message || GREETING);
  }

  /* Wire every element that carries data-wa="orders|quotes|owner" */
  function hydrateWaLinks(root) {
    $$("[data-wa]", root).forEach(function (el) {
      var key = el.getAttribute("data-wa");
      var ctx = el.getAttribute("data-wa-context") || "";
      var custom = el.getAttribute("data-wa-text");
      var num = WA_ORDERS;
      var person = (C.whatsapp && C.whatsapp.orders && C.whatsapp.orders.person) || "";
      var label = (C.whatsapp && C.whatsapp.orders && C.whatsapp.orders.label) || "";

      if (key === "quotes" && C.whatsapp && C.whatsapp.quotes) {
        num = C.whatsapp.quotes.number; person = C.whatsapp.quotes.person; label = C.whatsapp.quotes.label;
      } else if (key === "owner" && C.whatsapp && C.whatsapp.owner) {
        num = C.whatsapp.owner.number; person = C.whatsapp.owner.person; label = C.whatsapp.owner.label;
      }

      var msg = custom || GREETING;
      if (ctx && !custom) {
        msg += "\n(Ref: " + ctx + ")";
      }
      el.setAttribute("href", waLink(num, msg));
      el.setAttribute("target", "_blank");
      el.setAttribute("rel", "noopener");
      if (label && !el.getAttribute("title")) el.setAttribute("title", person ? person + " — " + label : label);
    });
  }

  /* Fill any [data-cfg="contact.email"] style placeholder */
  function hydrateConfigText(root) {
    $$("[data-cfg]", root).forEach(function (el) {
      var v = window.BP_value(el.getAttribute("data-cfg"));
      if (v) el.textContent = v;
    });
  }

  /* Replace [data-icon="whatsapp"] placeholders with the inline SVG */
  function hydrateIcons(root) {
    $$("[data-icon]", root).forEach(function (el) {
      if (el.dataset.iconDone) return;
      el.dataset.iconDone = "1";
      var name = el.getAttribute("data-icon");
      var explicit = el.getAttribute("data-icon-size");
      var size = explicit ? Number(explicit)
        : (el.classList.contains("feature__icon") || el.classList.contains("hero__meta-icon") ||
           el.classList.contains("empty-state__icon")) ? 20 : 17;
      el.innerHTML = icon(name, size);
    });
  }

  /* =======================================================================
     2. IMAGE HANDLING — graceful fallback if a photo has not been added yet
     ======================================================================= */
  function iconFallback(catId) {
    var cat = null;
    for (var i = 0; i < CATS.length; i++) if (CATS[i].id === catId) cat = CATS[i];
    var name = cat ? cat.icon : "box";
    var label = cat ? cat.name : "Packaging";
    return '<div class="media-fallback">' + icon(name, 96, "media-fallback__svg") +
      '<span class="media-fallback__label">Photo coming soon</span></div>';
  }

  function mediaBlock(src, alt, catId, cls) {
    var out = '<div class="' + (cls || "product-card__media") + '">' + iconFallback(catId);
    if (src) {
      out = '<div class="' + (cls || "product-card__media") + '">' + iconFallback(catId) +
        '<img data-img src="' + esc(src) + '" alt="' + esc(alt) + '" loading="lazy" decoding="async">' + "</div>";
    }
    return out;
  }

  function bindImages(root) {
    $$("img[data-img]", root).forEach(function (img) {
      if (img.dataset.bound) return;
      img.dataset.bound = "1";
      img.addEventListener("error", function () { img.classList.add("is-missing"); }, { once: true });
      /* If the browser resolved it before the listener was attached */
      if (img.complete && img.naturalWidth === 0) img.classList.add("is-missing");
    });
  }

  /* =======================================================================
     3. PRODUCT HELPERS
     ======================================================================= */
  function byId(id) {
    for (var i = 0; i < PROD.length; i++) if (PROD[i].id === id) return PROD[i];
    return null;
  }

  function specText(p) {
    var out = [];
    if (p.specs) for (var k in p.specs) if (p.specs.hasOwnProperty(k)) out.push(k + " " + p.specs[k]);
    return out.join(" ");
  }

  function haystack(p) {
    return [p.name, p.short || "", p.desc || "", p.sizes || "", p.print || "",
            p.moq || "", (p.badges || []).join(" "), p.search || "",
            window.BP_catName(p.cat), specText(p)].join(" ").toLowerCase();
  }

  function priceLabel(p) {
    if (!C.catalogue || C.catalogue.showPrices === false || !p.price) return "Price on request";
    var pr = p.price;
    if (pr.from == null) return "Price on request";
    return CURRENCY + fmt(pr.from) + (pr.to && pr.to !== pr.from ? " – " + CURRENCY + fmt(pr.to) : "");
  }
  function fmt(n) {
    return Number(n).toLocaleString("en-IN");
  }
  function unitLabel(p) {
    return (p.price && p.price.unit) ? p.price.unit : "";
  }

  /* The 3 short specs shown on a card */
  function topSpecs(p) {
    var keys = Object.keys(p.specs || {});
    var pick = [];
    for (var i = 0; i < keys.length && pick.length < 3; i++) {
      var k = keys[i];
      if (/Ply|GSM|Material|Thickness|Board|Construction|Size|Width|Roll size|Type|Form|Handle/.test(k)) {
        pick.push(String(p.specs[k]).split(/[/(]/)[0].trim());
      }
    }
    if (pick.length < 2) pick = keys.slice(0, 3).map(function (k) { return String(p.specs[k]).split(",")[0]; });
    return pick.slice(0, 3);
  }

  /* =======================================================================
     4. PRODUCT CARD + GRID
     ======================================================================= */
  function cardHTML(p) {
    var flags = (p.badges || []).slice(0, 2).map(function (b, i) {
      return '<span class="flag ' + (i === 0 ? "flag--gold" : "flag--kraft") + '">' + esc(b) + "</span>";
    }).join("");

    var specs = topSpecs(p).map(function (s) {
      return '<span class="spec-tag">' + esc(s) + "</span>";
    }).join("");

    var moq = (C.catalogue && C.catalogue.showMoq !== false && p.moq)
      ? '<div class="price__moq">Min. order: <strong>' + esc(p.moq) + "</strong></div>" : "";

    var showPrice = !C.catalogue || C.catalogue.showPrices !== false;

    return '' +
    '<article class="product-card" data-product="' + esc(p.id) + '">' +
      mediaBlock(p.image, p.name + " — " + window.BP_catName(p.cat) + " supplied by BP Enterprises", p.cat) +
      (flags ? '<div class="product-card__flags">' + flags + "</div>" : "") +
      '<a class="product-card__quick" href="' + ordersLink(
        GREETING + "\n\nProduct: " + p.name + "\nCategory: " + window.BP_catName(p.cat) +
        "\n\nPlease share your best rate, minimum order quantity and delivery time."
      ) + '" data-wa="orders" data-wa-text="' + esc(
        GREETING + "\n\nProduct: " + p.name + "\nCategory: " + window.BP_catName(p.cat) +
        "\n\nPlease share your best rate, minimum order quantity and delivery time."
      ) + '" target="_blank" rel="noopener" aria-label="Enquire about ' + esc(p.name) + ' on WhatsApp">' +
        icon("whatsapp", 17) + "</a>" +
      '<div class="product-card__body">' +
        '<div class="product-card__cat">' + esc(window.BP_catName(p.cat)) + "</div>" +
        '<h3 class="product-card__title" data-open="' + esc(p.id) + '">' + esc(p.name) + "</h3>" +
        '<p class="product-card__desc">' + esc(p.short || "") + "</p>" +
        '<div class="product-card__specs">' + specs + "</div>" +
        '<div class="product-card__price">' +
          (showPrice
            ? '<div class="price__row"><span class="price__label">From</span>' +
              '<span class="price__value">' + priceLabel(p) + "</span>" +
              '<span class="price__unit">' + esc(unitLabel(p)) + "</span></div>" + moq
            : '<div class="price__row"><span class="price__value" style="font-size:1rem">Price on request</span></div>' + moq) +
        "</div>" +
        '<div class="product-card__actions">' +
          '<button class="btn btn--outline" type="button" data-open="' + esc(p.id) + '">' +
            icon("fileText", 15) + " Details</button>" +
          '<button class="btn" type="button" data-add="' + esc(p.id) + '" aria-label="Add ' + esc(p.name) + ' to enquiry list">' +
            icon("plus", 15) + "</button>" +
        "</div>" +
      "</div>" +
    "</article>";
  }

  /* =======================================================================
     5. ENQUIRY LIST (localStorage backed)
     ======================================================================= */
  var STORE_KEY = "bp_enquiry_v1";
  var enquiry = [];
  var memoryFallback = false;

  function loadEnquiry() {
    try {
      var raw = window.localStorage.getItem(STORE_KEY);
      enquiry = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(enquiry)) enquiry = [];
    } catch (e) {
      memoryFallback = true;
      enquiry = [];
    }
    /* drop anything that no longer exists in the catalogue */
    enquiry = enquiry.filter(function (it) { return !!byId(it.id); });
  }
  function saveEnquiry() {
    if (memoryFallback) return;
    try { window.localStorage.setItem(STORE_KEY, JSON.stringify(enquiry)); } catch (e) { memoryFallback = true; }
  }

  function enquiryCount() {
    return enquiry.reduce(function (n, it) { return n + 1; }, 0);
  }

  function addToEnquiry(id, qty, note) {
    var p = byId(id);
    if (!p) return;
    var found = null;
    for (var i = 0; i < enquiry.length; i++) if (enquiry[i].id === id) found = enquiry[i];
    if (found) {
      found.qty = (Number(found.qty) || 0) + (Number(qty) || 0);
      if (note) found.note = note;
    } else {
      enquiry.push({ id: id, qty: Number(qty) || 0, note: note || "" });
    }
    saveEnquiry();
    syncEnquiryUI();
    toast("Added to enquiry list", '<button class="toast__action" type="button" data-drawer-open>Review</button>');
  }

  function removeFromEnquiry(id) {
    enquiry = enquiry.filter(function (it) { return it.id !== id; });
    saveEnquiry();
    syncEnquiryUI();
  }

  function setQty(id, qty) {
    for (var i = 0; i < enquiry.length; i++) {
      if (enquiry[i].id === id) enquiry[i].qty = Math.max(0, Number(qty) || 0);
    }
    saveEnquiry();
    syncEnquiryUI();
  }

  function syncEnquiryUI() {
    var n = enquiryCount();
    $$("[data-drawer-count]").forEach(function (b) {
      b.textContent = n;
      if (n > 0) b.removeAttribute("hidden"); else b.setAttribute("hidden", "");
    });
    var drawer = $("#enquiryDrawer");
    if (drawer && drawer.classList.contains("is-open")) renderDrawer();
    else if (drawer) renderDrawer();
  }

  /* ---- Drawer ---- */
  function renderDrawer() {
    var drawer = $("#enquiryDrawer");
    if (!drawer) return;

    var body, foot;

    if (!enquiry.length) {
      body = '<div class="drawer__empty">' + icon("clipboard", 52) +
        "<h3 style=\"font-size:1.05rem;margin-bottom:6px\">Your enquiry list is empty</h3>" +
        '<p>Add the products you need and send them to us on WhatsApp in one message — we will reply with rates, MOQ and delivery.</p>' +
        '<a class="btn btn--outline" href="products.html" style="margin-top:18px">Browse products</a></div>';
      foot = "";
    } else {
      body = enquiry.map(function (it) {
        var p = byId(it.id) || { name: it.id, cat: "", image: "" };
        return '' +
        '<div class="line-item">' +
          '<div class="line-item__thumb">' + iconFallback(p.cat) +
            (p.image ? '<img data-img src="' + esc(p.image) + '" alt="" loading="lazy">' : "") +
          "</div>" +
          "<div>" +
            '<div class="line-item__title">' + esc(p.name) + "</div>" +
            '<div class="line-item__meta">' + esc(window.BP_catName(p.cat)) +
              (p.moq ? " &middot; MOQ " + esc(p.moq) : "") + "</div>" +
            (it.note ? '<div class="line-item__note">"' + esc(it.note) + '"</div>' : "") +
            '<div class="line-item__controls">' +
              '<span class="stepper">' +
                '<button type="button" data-step="-1" data-id="' + esc(it.id) + '" aria-label="Decrease quantity">' + icon("minus", 13) + "</button>" +
                "<span>" + (it.qty ? fmt(it.qty) : "—") + "</span>" +
                '<button type="button" data-step="1" data-id="' + esc(it.id) + '" aria-label="Increase quantity">' + icon("plus", 13) + "</button>" +
              "</span>" +
              '<button type="button" class="btn btn--ghost btn--sm" data-note="' + esc(it.id) + '">' + (it.note ? "Edit note" : "Add note") + "</button>" +
            "</div>" +
          "</div>" +
          '<button type="button" class="line-item__remove" data-remove="' + esc(it.id) + '" aria-label="Remove">' + icon("trash", 16) + "</button>" +
        "</div>";
      }).join("");

      foot = '' +
      '<div class="drawer__summary"><span><strong>' + enquiry.length + '</strong> product' +
        (enquiry.length === 1 ? "" : "s") + " selected</span><span>Sent from this device only</span></div>" +
      '<div class="field" style="margin-bottom:14px">' +
        '<label for="drawerNote">Anything specific? <span class="text-muted">(optional)</span></label>' +
        '<textarea id="drawerNote" placeholder="Sizes, quantity per size, delivery city, required-by date…"></textarea>' +
      "</div>" +
      '<button class="btn btn--wa btn--block btn--lg" type="button" data-send-enquiry>' +
        icon("whatsapp", 19) + " Send enquiry on WhatsApp</button>" +
      '<p class="text-xs text-muted" style="margin:10px 0 0;text-align:center">Opens WhatsApp with your list ready to send.</p>';
    }

    drawer.innerHTML = '' +
      '<div class="drawer__scrim" data-drawer-close></div>' +
      '<aside class="drawer__panel">' +
        '<div class="drawer__head">' +
          "<div>" +
            '<h3 class="drawer__title">Enquiry List</h3>' +
            '<div class="drawer__count">' + (enquiry.length ? enquiry.length + " product" + (enquiry.length === 1 ? "" : "s") : "Nothing added yet") + "</div>" +
          "</div>" +
          '<button class="drawer__close" type="button" data-drawer-close aria-label="Close">' + icon("close", 19) + "</button>" +
        "</div>" +
        '<div class="drawer__body">' + body + "</div>" +
        (foot ? '<div class="drawer__foot">' + foot + "</div>" : "") +
      "</aside>";

    bindImages(drawer);
    hydrateWaLinks(drawer);
  }

  function openDrawer() {
    var d = $("#enquiryDrawer");
    if (!d) return;
    renderDrawer();
    d.classList.add("is-open");
    d.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked");
    var c = $(".drawer__close", d); if (c) c.focus();
  }
  function closeDrawer() {
    var d = $("#enquiryDrawer");
    if (!d) return;
    d.classList.remove("is-open");
    d.setAttribute("aria-hidden", "true");
    if (!$("#productModal.is-open")) document.body.classList.remove("is-locked");
  }

  /* ---- Build the WhatsApp message from the list ---- */
  function buildEnquiryMessage() {
    var lines = ["Hello " + (C.brand ? C.brand.name : "BP Enterprises") + ",", "", "I would like a quotation for the following:", ""];
    enquiry.forEach(function (it, i) {
      var p = byId(it.id) || { name: it.id };
      lines.push((i + 1) + ". " + p.name + (it.qty ? "  —  Qty: " + fmt(it.qty) + " " + guessUnit(p) : ""));
      if (it.note) lines.push("    Note: " + it.note);
    });
    var note = $("#drawerNote");
    if (note && note.value.trim()) {
      lines.push("", "Additional details: " + note.value.trim());
    }
    lines.push("", "Please share your best rate, MOQ and delivery time.", "Thank you.");
    return lines.join("\n");
  }
  function guessUnit(p) {
    var u = (p.moq || "").split(" ").pop();
    return /pcs|box|cases|carton|bags|sets|pallets|rolls|sheets/i.test(u) ? u : "pcs";
  }

  /* =======================================================================
     6. PRODUCT DETAIL MODAL
     ======================================================================= */
  var lastFocus = null;

  function openProduct(id, fromPush) {
    var p = byId(id);
    if (!p) return;
    var modal = $("#productModal");
    if (!modal) return;

    var specRows = "";
    if (p.specs) {
      for (var k in p.specs) {
        if (p.specs.hasOwnProperty(k)) {
          specRows += "<tr><th>" + esc(k) + "</th><td>" + esc(p.specs[k]) + "</td></tr>";
        }
      }
    }
    if (p.sizes) specRows += "<tr><th>Available sizes</th><td>" + esc(p.sizes) + "</td></tr>";
    if (p.print) specRows += "<tr><th>Printing</th><td>" + esc(p.print) + "</td></tr>";
    if (p.moq)   specRows += "<tr><th>Minimum order</th><td>" + esc(p.moq) + "</td></tr>";

    var showPrice = !C.catalogue || C.catalogue.showPrices !== false;
    var priceHTML = showPrice
      ? '<div class="price__row"><span class="price__label">Indicative rate</span>' +
        '<span class="price__value" style="font-size:1.5rem">' + priceLabel(p) + "</span>" +
        '<span class="price__unit">' + esc(unitLabel(p)) + "</span></div>"
      : '<div class="price__row"><span class="price__value" style="font-size:1.15rem">Price on request</span></div>';

    var waMsg = GREETING + "\n\nProduct: " + p.name +
      "\nCategory: " + window.BP_catName(p.cat) +
      "\n\nPlease share your best rate, minimum order quantity and delivery time.";

    modal.innerHTML = '' +
      '<div class="modal__scrim" data-modal-close></div>' +
      '<div class="modal__panel">' +
        '<button class="modal__close" type="button" data-modal-close aria-label="Close">' + icon("close", 19) + "</button>" +
        '<div class="modal__media">' + iconFallback(p.cat) +
          (p.image ? '<img data-img src="' + esc(p.image) + '" alt="' + esc(p.name) + '">' : "") +
        "</div>" +
        '<div class="modal__body">' +
          '<div class="modal__cat">' + esc(window.BP_catName(p.cat)) + "</div>" +
          '<h2 class="modal__title">' + esc(p.name) + "</h2>" +
          '<p class="modal__desc">' + esc(p.desc || p.short || "") + "</p>" +
          '<table class="spec-table">' + specRows + "</table>" +
          '<div class="modal__price">' + priceHTML +
            (C.catalogue && C.catalogue.priceNote
              ? '<p class="text-xs text-muted" style="margin:8px 0 0">' + esc(C.catalogue.priceNote) + "</p>" : "") +
          "</div>" +
          '<div class="modal__qty">' +
            '<span class="text-sm" style="font-weight:600;color:var(--ink)">Quantity required</span>' +
            '<span class="qty">' +
              '<button type="button" data-mqty="-1" aria-label="Decrease">' + icon("minus", 14) + "</button>" +
              '<input type="number" id="modalQty" min="0" step="1" value="' + defaultQty(p) + '" inputmode="numeric" aria-label="Quantity">' +
              '<button type="button" data-mqty="1" aria-label="Increase">' + icon("plus", 14) + "</button>" +
            "</span>" +
            '<span class="text-xs text-muted">' + esc(guessUnit(p)) + (p.moq ? " &middot; MOQ " + esc(p.moq) : "") + "</span>" +
          "</div>" +
          '<div class="field note-field" style="margin-bottom:16px">' +
            '<label for="modalNote">Your requirement <span class="text-muted">(optional)</span></label>' +
            '<textarea id="modalNote" placeholder="Size, GSM, ply, printing, delivery city…"></textarea>' +
          "</div>" +
          '<div class="btn-row">' +
            '<button class="btn btn--wa btn--lg" type="button" data-modal-add="' + esc(p.id) + '">' +
              icon("clipboard", 17) + " Add to enquiry list</button>" +
            '<a class="btn btn--outline btn--lg" href="' + ordersLink(waMsg) + '" data-wa="orders" data-wa-text="' +
              esc(waMsg) + '" target="_blank" rel="noopener">' + icon("whatsapp", 17) + " Chat now</a>" +
          "</div>" +
        "</div>" +
      "</div>";

    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("is-locked");
    bindImages(modal);
    hydrateWaLinks(modal);

    lastFocus = document.activeElement;
    var closeBtn = $(".modal__close", modal);
    if (closeBtn) closeBtn.focus();

    if (!fromPush && window.history.replaceState) {
      var url = new URL(window.location.href);
      url.searchParams.set("p", p.id);
      window.history.replaceState({}, "", url);
    }
  }

  function defaultQty(p) {
    if (!p.moq) return 100;
    var m = String(p.moq).replace(/,/g, "").match(/\d+/);
    return m ? Number(m[0]) : 100;
  }

  function closeProduct(pop) {
    var modal = $("#productModal");
    if (!modal || !modal.classList.contains("is-open")) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    modal.innerHTML = "";
    if (!$("#enquiryDrawer.is-open")) document.body.classList.remove("is-locked");
    if (pop !== false && window.history.replaceState) {
      var url = new URL(window.location.href);
      url.searchParams.delete("p");
      window.history.replaceState({}, "", url);
    }
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* =======================================================================
     7. CATALOGUE PAGE — filters
     ======================================================================= */
  var SPEC_FILTERS = [
    { id: "3ply",   label: "3 Ply",        kw: "3 ply" },
    { id: "5ply",   label: "5 Ply",        kw: "5 ply" },
    { id: "7ply",   label: "7 Ply",        kw: "7 ply" },
    { id: "custom", label: "Made to size", kw: "custom" },
    { id: "food",   label: "Food grade",   kw: "food" },
    { id: "heavy",  label: "Heavy duty",   kw: "heavy" },
    { id: "bulk",   label: "Bulk stock",   kw: "bulk" },
    { id: "export", label: "Export ready", kw: "export" }
  ];

  var state = { cat: "all", q: "", specs: [], sort: "recommended" };

  /* Every word the visitor typed must appear somewhere in the product. */
  function matchesTokens(p, q) {
    if (!q) return true;
    var tokens = q.split(/\s+/).filter(Boolean);
    var h = haystack(p);
    for (var i = 0; i < tokens.length; i++) {
      if (h.indexOf(tokens[i]) === -1) return false;
    }
    return true;
  }

  /* Put the most obviously relevant product first when someone searches. */
  function relevance(p, q) {
    if (!q) return 0;
    var n = p.name.toLowerCase();
    var s = (p.short || "").toLowerCase();
    var sc = 0;
    if (n === q) sc += 200;
    if (n.indexOf(q) === 0) sc += 120;
    else if (n.indexOf(q) > -1) sc += 80;
    var tokens = q.split(/\s+/).filter(Boolean);
    for (var i = 0; i < tokens.length; i++) {
      if (n.indexOf(tokens[i]) > -1) sc += 22;
      if (s.indexOf(tokens[i]) > -1) sc += 8;
      if ((p.search || "").toLowerCase().indexOf(tokens[i]) > -1) sc += 5;
      if (window.BP_catName(p.cat).toLowerCase().indexOf(tokens[i]) > -1) sc += 6;
    }
    if (p.featured) sc += 4;
    return sc;
  }

  function applyFilters() {
    var q = state.q.trim().toLowerCase();
    var out = PROD.filter(function (p) {
      if (state.cat !== "all" && p.cat !== state.cat) return false;
      if (!matchesTokens(p, q)) return false;
      var h = haystack(p);
      for (var i = 0; i < state.specs.length; i++) {
        var f = null;
        for (var j = 0; j < SPEC_FILTERS.length; j++) if (SPEC_FILTERS[j].id === state.specs[i]) f = SPEC_FILTERS[j];
        if (f && h.indexOf(f.kw) === -1) return false;
      }
      return true;
    });

    if (state.sort === "name") {
      out.sort(function (a, b) { return a.name.localeCompare(b.name); });
    } else if (state.sort === "price-asc" || state.sort === "price-desc") {
      out.sort(function (a, b) {
        var av = (a.price && a.price.from != null) ? a.price.from : Infinity;
        var bv = (b.price && b.price.from != null) ? b.price.from : Infinity;
        return state.sort === "price-asc" ? av - bv : bv - av;
      });
    } else if (q) {
      /* relevance first while searching */
      out.sort(function (a, b) { return relevance(b, q) - relevance(a, q); });
    } else {
      out.sort(function (a, b) { return (b.featured ? 1 : 0) - (a.featured ? 1 : 0); });
    }
    return out;
  }

  function renderCatalogue() {
    var grid = $("[data-render='product-grid']");
    if (!grid) return;

    var list = applyFilters();
    var countEl = $("[data-results-count]");

    if (countEl) {
      var catName = state.cat === "all" ? "all categories" : window.BP_catName(state.cat);
      countEl.innerHTML = list.length
        ? "Showing <strong>" + list.length + "</strong> product" + (list.length === 1 ? "" : "s") +
          (state.q ? " for <strong>\u201C" + esc(state.q) + "\u201D</strong>" : "") +
          " in <strong>" + esc(catName) + "</strong>"
        : "";
    }

    if (!list.length) {
      grid.innerHTML = '' +
      '<div class="empty-state" style="grid-column:1/-1">' +
        '<div class="empty-state__icon">' + icon("search", 28) + "</div>" +
        "<h3>No products match that search</h3>" +
        '<p class="text-muted" style="max-width:44ch;margin:0 auto 22px">Tell us what you need and we will source or manufacture it — we handle custom sizes and non-standard specifications every day.</p>' +
        '<div class="btn-row" style="justify-content:center">' +
          '<button class="btn btn--outline" type="button" data-clear-filters>Clear filters</button>' +
          '<a class="btn btn--wa" href="' + ordersLink(GREETING + "\n\nI am looking for a packaging product I could not find on your website.") +
            '" data-wa="orders" data-wa-text="' + esc(GREETING + "\n\nI am looking for a packaging product I could not find on your website.") +
            '" target="_blank" rel="noopener">' + icon("whatsapp", 17) + " Ask on WhatsApp</a>" +
        "</div>" +
      "</div>";
    } else {
      grid.innerHTML = list.map(cardHTML).join("");
    }

    grid.dataset.count = list.length;
    bindImages(grid);
    hydrateWaLinks(grid);
  }

  function renderPills() {
    var host = $("[data-render='pills']");
    if (!host) return;
    var counts = {};
    PROD.forEach(function (p) { counts[p.cat] = (counts[p.cat] || 0) + 1; });

    var html = '<button class="pill is-active" type="button" data-cat="all">All products <span class="pill__n">' + PROD.length + "</span></button>";
    CATS.forEach(function (c) {
      html += '<button class="pill" type="button" data-cat="' + esc(c.id) + '">' + esc(c.name) +
        ' <span class="pill__n">' + (counts[c.id] || 0) + "</span></button>";
    });
    host.innerHTML = html;
  }

  function renderSpecFilters() {
    var host = $("[data-render='spec-filters']");
    if (!host) return;
    if (C.catalogue && C.catalogue.showSpecFilters === false) { host.remove(); return; }
    var used = SPEC_FILTERS.filter(function (f) {
      return PROD.some(function (p) { return haystack(p).indexOf(f.kw) !== -1; });
    });
    host.innerHTML = '<span class="spec-filters__label">Filter</span>' +
      used.map(function (f) {
        return '<button class="spec-chip" type="button" data-spec="' + esc(f.id) + '">' + esc(f.label) + "</button>";
      }).join("") +
      '<button class="spec-chip" type="button" data-spec-clear style="border-style:solid">Clear all</button>';
  }

  function setCat(id) {
    state.cat = id;
    $$("[data-render='pills'] .pill").forEach(function (b) {
      b.classList.toggle("is-active", b.getAttribute("data-cat") === id);
    });
    renderCatalogue();
    syncUrl();
  }
  function syncUrl() {
    if (!window.history.replaceState) return;
    var url = new URL(window.location.href);
    if (state.cat !== "all") url.searchParams.set("cat", state.cat); else url.searchParams.delete("cat");
    if (state.q) url.searchParams.set("search", state.q); else url.searchParams.delete("search");
    window.history.replaceState({}, "", url);
  }

  /* =======================================================================
     8. HOME PAGE SECTIONS
     ======================================================================= */
  function renderHome() {
    /* client marquee */
    var mq = $("[data-render='clients']");
    if (mq && C.clients && C.clients.length) {
      var row = C.clients.map(function (c) {
        return '<span class="marquee__item">' + esc(c) + "</span>";
      }).join("");
      mq.innerHTML = '<div class="marquee__track">' + row + row + "</div>";
    }

    /* stats */
    var st = $("[data-render='stats']");
    if (st && C.stats) {
      st.innerHTML = C.stats.map(function (s) {
        var v = String(s.value || "");
        var num = v, sup = "";
        var m = v.match(/^([\d,]+)(.*)$/);
        if (m) { num = m[1]; sup = m[2] || ""; }
        return '<div class="stat">' +
          '<div class="stat__value"><span data-count="' + esc(num.replace(/,/g, "")) + '">' + esc(num) + "</span>" +
          (sup ? "<sup>" + esc(sup) + "</sup>" : "") + (s.suffix ? "<sup>" + esc(s.suffix) + "</sup>" : "") + "</div>" +
          '<div class="stat__label">' + esc(s.label) + "</div></div>";
      }).join("");
    }

    /* category tiles */
    var cg = $("[data-render='cat-grid']");
    if (cg) {
      var counts = {};
      PROD.forEach(function (p) { counts[p.cat] = (counts[p.cat] || 0) + 1; });
      cg.innerHTML = CATS.map(function (c) {
        return '' +
        '<a class="cat-card" href="products.html?cat=' + esc(c.id) + '">' +
          '<div class="cat-card__media">' + iconFallback(c.id) +
            (c.image ? '<img data-img src="' + esc(c.image) + '" alt="' + esc(c.title) + '" loading="lazy">' : "") +
          "</div>" +
          '<div class="cat-card__body">' +
            '<h3 class="cat-card__title">' + esc(c.title) + "</h3>" +
            '<p class="cat-card__desc">' + esc(c.desc) + "</p>" +
            '<div class="cat-card__foot">' +
              '<span class="cat-card__count">' + (counts[c.id] || 0) + " product" + ((counts[c.id] === 1) ? "" : "s") + "</span>" +
              '<span class="cat-card__go">View range' + icon("arrowRight", 14) + "</span>" +
            "</div>" +
          "</div>" +
        "</a>";
      }).join("");
      bindImages(cg);
    }

    /* featured products */
    var fp = $("[data-render='featured']");
    if (fp) {
      var feats = PROD.filter(function (p) { return p.featured; }).slice(0, 6);
      if (feats.length < 6) {
        PROD.forEach(function (p) { if (feats.length < 6 && feats.indexOf(p) === -1) feats.push(p); });
      }
      fp.innerHTML = feats.map(cardHTML).join("");
      bindImages(fp);
      hydrateWaLinks(fp);
    }

    /* locations */
    var lc = $("[data-render='locations']");
    if (lc && C.locations) {
      lc.innerHTML = C.locations.map(function (l) {
        var waMsg = GREETING + "\n\nI would like to visit / collect from: " + l.name + ".";
        return '' +
        '<div class="loc-card">' +
          '<span class="loc-card__type">' + esc(l.type) + "</span>" +
          '<div class="loc-card__name">' + esc(l.name) + "</div>" +
          '<p class="loc-card__addr">' + esc(l.address) + "</p>" +
          (l.storage ? '<span class="chip chip--gold" style="align-self:flex-start">' + icon("layers", 13) + " " + esc(l.storage) + "</span>" : "") +
          '<div class="loc-card__foot">' +
            '<a class="btn btn--outline btn--sm" href="' + esc(l.map) + '" target="_blank" rel="noopener">' +
              icon("mapPin", 14) + " Directions</a>" +
            (l.phone ? '<a class="btn btn--ghost btn--sm" href="tel:' + esc(String(l.phone).replace(/\s/g, "")) + '">' + icon("phone", 14) + " Call</a>" : "") +
            (l.wa ? '<a class="btn btn--ghost btn--sm" data-wa="orders" data-wa-text="' + esc(waMsg) + '" href="#">' + icon("whatsapp", 14) + "</a>" : "") +
          "</div>" +
        "</div>";
      }).join("");
      hydrateWaLinks(lc);
    }

    /* team — one or more hosts, optionally split by group */
    $$("[data-render='team']").forEach(function (tm) {
      if (!C.team) return;
      var grp = tm.getAttribute("data-team-group");
      var list = grp ? C.team.filter(function (p) { return p.group === grp; }) : C.team;
      tm.innerHTML = list.map(function (p) {
        var initials = p.name.split(" ").map(function (w) { return w.charAt(0); }).join("").slice(0, 2);
        return '<div class="person">' +
          '<div class="person__avatar">' + esc(initials) + "</div>" +
          '<div class="person__name">' + esc(p.name) + "</div>" +
          '<div class="person__role">' + esc(p.role) + "</div>" +
        "</div>";
      }).join("");
    });

    /* clients as a grid (about page) */
    var cgrid = $("[data-render='client-grid']");
    if (cgrid && C.clients) {
      cgrid.innerHTML = C.clients.map(function (c) {
        return '<div class="chip" style="justify-content:center;padding:20px 14px;font-size:.9rem;font-weight:600;border-radius:var(--r-md)">' + esc(c) + "</div>";
      }).join("");
    }

    /* vision / values list — static in HTML, nothing to render */
  }

  /* =======================================================================
     9. CONTACT FORM -> WHATSAPP
     ======================================================================= */
  function initForms() {
    $$("[data-enquiry-form]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var ok = true;

        $$("[data-required]", form).forEach(function (input) {
          var field = input.closest(".field");
          var valid = String(input.value || "").trim().length > 1;
          if (input.type === "email" && valid) valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value);
          if (input.type === "tel" && valid) valid = String(input.value).replace(/\D/g, "").length >= 10;
          if (field) field.classList.toggle("has-error", !valid);
          if (!valid && ok) { input.focus(); ok = false; }
        });
        if (!ok) return;

        var data = {};
        $$("input, select, textarea", form).forEach(function (f) {
          if (!f.name) return;
          data[f.name] = String(f.value || "").trim();
        });

        var msg = [
          "Hello " + (C.brand ? C.brand.name : "BP Enterprises") + ",",
          "",
          "New enquiry from the website:",
          "",
          "Name: " + (data.name || "—"),
          data.company ? "Company: " + data.company : null,
          data.phone ? "Phone: " + data.phone : null,
          data.email ? "Email: " + data.email : null,
          data.city ? "City: " + data.city : null,
          data.product ? "Product needed: " + data.product : null,
          data.quantity ? "Approx. quantity: " + data.quantity : null,
          data.message ? "" : null,
          data.message ? "Requirement:" : null,
          data.message ? data.message : null,
          "",
          "Looking forward to your quotation."
        ].filter(function (l) { return l !== null; }).join("\n");

        var slot = C.whatsapp && C.whatsapp.quotes ? C.whatsapp.quotes.number : WA_ORDERS;
        if (!slot) slot = WA_ORDERS;

        var win = window.open(waLink(slot, msg), "_blank", "noopener");
        if (!win) window.location.href = waLink(slot, msg);

        toast("Opening WhatsApp with your enquiry…", "");
        form.reset();
      });

      $$("[data-required]", form).forEach(function (input) {
        input.addEventListener("input", function () {
          var field = input.closest(".field");
          if (field) field.classList.remove("has-error");
        });
      });
    });
  }

  /* =======================================================================
     10. ACCORDION
     ======================================================================= */
  function initAccordions() {
    $$(".acc__btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var panel = btn.nextElementSibling;
        var open = btn.getAttribute("aria-expanded") === "true";
        var acc = btn.closest(".acc");

        if (acc && !acc.dataset.multi) {
          $$(".acc__btn", acc).forEach(function (other) {
            if (other !== btn) {
              other.setAttribute("aria-expanded", "false");
              var p = other.nextElementSibling;
              if (p) p.style.height = "0px";
            }
          });
        }
        btn.setAttribute("aria-expanded", open ? "false" : "true");
        if (panel) panel.style.height = open ? "0px" : panel.firstElementChild.offsetHeight + "px";
      });
    });
    $$(".acc__btn[aria-expanded='true']").forEach(function (btn) {
      var panel = btn.nextElementSibling;
      if (panel) panel.style.height = panel.firstElementChild.offsetHeight + "px";
    });
    window.addEventListener("resize", function () {
      $$(".acc__btn[aria-expanded='true']").forEach(function (btn) {
        var panel = btn.nextElementSibling;
        if (panel) panel.style.height = panel.firstElementChild.offsetHeight + "px";
      });
    });
  }

  /* =======================================================================
     11. TOAST
     ======================================================================= */
  var toastTimer;
  function toast(message, actionHTML) {
    var el = $("#toast");
    if (!el) return;
    el.innerHTML = '<span class="toast__icon">' + icon("check", 16) + "</span><span>" + esc(message) + "</span>" +
      (actionHTML || "");
    el.classList.add("is-show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(function () { el.classList.remove("is-show"); }, 3800);
  }

  /* =======================================================================
     12. SCROLL REVEAL + STAT COUNTERS
     ======================================================================= */
  function initReveal() {
    if (!("IntersectionObserver" in window)) {
      $$(".reveal").forEach(function (el) { el.classList.add("is-in"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
    $$(".reveal").forEach(function (el) { io.observe(el); });

    var co = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var el = en.target;
        var target = Number(el.getAttribute("data-count"));
        if (!isFinite(target)) return;
        var dur = 1400, start = performance.now();
        function tick(now) {
          var t = Math.min(1, (now - start) / dur);
          var eased = 1 - Math.pow(1 - t, 3);
          el.textContent = Math.round(target * eased).toLocaleString("en-IN");
          if (t < 1) requestAnimationFrame(tick);
        }
        requestAnimationFrame(tick);
        co.unobserve(el);
      });
    }, { threshold: 0.4 });
    $$("[data-count]").forEach(function (el) { co.observe(el); });
  }

  /* =======================================================================
     13. HEADER, MENU, SCROLL
     ======================================================================= */
  function initChrome() {
    var header = $("#siteHeader");
    var toTop = $(".to-top");
    var onScroll = function () {
      var y = window.pageYOffset || document.documentElement.scrollTop;
      if (header) header.classList.toggle("is-stuck", y > 8);
      if (toTop) toTop.classList.toggle("is-show", y > 700);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (toTop) toTop.addEventListener("click", function () {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });

    var burger = $(".hamburger");
    var menu = $("#mobileMenu");
    if (burger && menu) {
      burger.addEventListener("click", function () {
        var open = burger.getAttribute("aria-expanded") === "true";
        burger.setAttribute("aria-expanded", open ? "false" : "true");
        menu.classList.toggle("is-open", !open);
        menu.setAttribute("aria-hidden", open ? "true" : "false");
        document.body.classList.toggle("is-locked", !open);
      });
      $$("a", menu).forEach(function (a) {
        a.addEventListener("click", function () {
          burger.setAttribute("aria-expanded", "false");
          menu.classList.remove("is-open");
          menu.setAttribute("aria-hidden", "true");
          document.body.classList.remove("is-locked");
        });
      });
    }

    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      closeProduct();
      closeDrawer();
      if (burger && menu && menu.classList.contains("is-open")) {
        burger.setAttribute("aria-expanded", "false");
        menu.classList.remove("is-open");
        menu.setAttribute("aria-hidden", "true");
        document.body.classList.remove("is-locked");
      }
    });
  }

  /* =======================================================================
     14. GLOBAL EVENT DELEGATION
     ======================================================================= */
  function initDelegation() {
    document.addEventListener("click", function (e) {
      var t;

      /* open product */
      if ((t = e.target.closest("[data-open]"))) {
        e.preventDefault();
        openProduct(t.getAttribute("data-open"));
        return;
      }
      /* add to enquiry */
      if ((t = e.target.closest("[data-add]"))) {
        e.preventDefault();
        addToEnquiry(t.getAttribute("data-add"), defaultQty(byId(t.getAttribute("data-add")) || {}), "");
        return;
      }
      /* add from inside the modal */
      if ((t = e.target.closest("[data-modal-add]"))) {
        e.preventDefault();
        var id = t.getAttribute("data-modal-add");
        var qtyInput = $("#modalQty");
        var noteInput = $("#modalNote");
        addToEnquiry(id, qtyInput ? Number(qtyInput.value) : 0, noteInput ? noteInput.value.trim() : "");
        closeProduct();
        return;
      }
      if ((t = e.target.closest("[data-mqty]"))) {
        e.preventDefault();
        var inp = $("#modalQty");
        if (inp) {
          var step = Number(t.getAttribute("data-mqty"));
          var base = Number(inp.value) || 0;
          var delta = step > 0 ? Math.max(10, Math.round(base * 0.1)) : -Math.max(10, Math.round(base * 0.1));
          inp.value = Math.max(0, base + delta);
        }
        return;
      }
      if (e.target.closest("[data-modal-close]")) { e.preventDefault(); closeProduct(); return; }

      /* drawer */
      if (e.target.closest("[data-drawer-open]")) { e.preventDefault(); openDrawer(); return; }
      if (e.target.closest("[data-drawer-close]")) { e.preventDefault(); closeDrawer(); return; }

      /* drawer line items */
      if ((t = e.target.closest("[data-step]"))) {
        e.preventDefault();
        var sid = t.getAttribute("data-id"), dir = Number(t.getAttribute("data-step"));
        var item = null;
        enquiry.forEach(function (it) { if (it.id === sid) item = it; });
        if (item) {
          var p = byId(sid) || {};
          var inc = dir > 0 ? Math.max(10, Math.round((Number(item.qty) || 0) * 0.1) || 10)
                            : -Math.max(10, Math.round((Number(item.qty) || 0) * 0.1) || 10);
          setQty(sid, Math.max(0, (Number(item.qty) || 0) + inc));
        }
        return;
      }
      if ((t = e.target.closest("[data-remove]"))) {
        e.preventDefault();
        removeFromEnquiry(t.getAttribute("data-remove"));
        return;
      }
      if ((t = e.target.closest("[data-note]"))) {
        e.preventDefault();
        var nid = t.getAttribute("data-note");
        var cur = "";
        enquiry.forEach(function (it) { if (it.id === nid) cur = it.note || ""; });
        var val = window.prompt("Add a note for this product (size, GSM, printing…)", cur);
        if (val !== null) {
          enquiry.forEach(function (it) { if (it.id === nid) it.note = val.trim(); });
          saveEnquiry();
          renderDrawer();
        }
        return;
      }
      if ((t = e.target.closest("[data-send-enquiry]"))) {
        e.preventDefault();
        var link = ordersLink(buildEnquiryMessage());
        var w = window.open(link, "_blank", "noopener");
        if (!w) window.location.href = link;
        toast("Opening WhatsApp with your enquiry list…", "");
        return;
      }

      /* catalogue filters */
      if ((t = e.target.closest("[data-cat]"))) { e.preventDefault(); setCat(t.getAttribute("data-cat")); return; }
      if ((t = e.target.closest("[data-spec-clear]"))) {
        e.preventDefault();
        state.specs = [];
        $$("[data-spec]").forEach(function (b) { b.classList.remove("is-active"); });
        renderCatalogue();
        return;
      }
      if ((t = e.target.closest("[data-spec]"))) {
        e.preventDefault();
        var fid = t.getAttribute("data-spec");
        var idx = state.specs.indexOf(fid);
        if (idx === -1) state.specs.push(fid); else state.specs.splice(idx, 1);
        t.classList.toggle("is-active", idx === -1);
        renderCatalogue();
        return;
      }
      if (e.target.closest("[data-clear-filters]")) {
        e.preventDefault();
        state = { cat: "all", q: "", specs: [], sort: state.sort };
        $$("[data-spec]").forEach(function (b) { b.classList.remove("is-active"); });
        var si = $("[data-search]");
        if (si) { si.value = ""; si.closest(".search").classList.remove("has-value"); }
        $$("[data-render='pills'] .pill").forEach(function (b) { b.classList.toggle("is-active", b.getAttribute("data-cat") === "all"); });
        renderCatalogue();
        syncUrl();
        return;
      }
    });

    /* search input */
    var si = $("[data-search]");
    if (si) {
      var debounce;
      si.addEventListener("input", function () {
        var wrap = si.closest(".search");
        if (wrap) wrap.classList.toggle("has-value", si.value.length > 0);
        window.clearTimeout(debounce);
        debounce = window.setTimeout(function () {
          state.q = si.value;
          renderCatalogue();
          syncUrl();
        }, 180);
      });
      var clearBtn = $(".search__clear");
      if (clearBtn) clearBtn.addEventListener("click", function () {
        si.value = ""; state.q = "";
        si.closest(".search").classList.remove("has-value");
        renderCatalogue(); syncUrl(); si.focus();
      });
    }

    /* sort */
    var sortEl = $("[data-sort]");
    if (sortEl) sortEl.addEventListener("change", function () {
      state.sort = sortEl.value;
      renderCatalogue();
    });

    /* browser back / forward on catalogue */
    window.addEventListener("popstate", function () {
      if (!$("[data-render='product-grid']")) return;
      readUrlState();
      renderCatalogue();
    });
  }

  /* =======================================================================
     15. URL STATE
     ======================================================================= */
  function readUrlState() {
    var params = new URLSearchParams(window.location.search);
    var cat = params.get("cat");
    var q = params.get("search") || "";

    state.cat = (cat && CATS.some(function (c) { return c.id === cat; })) ? cat : "all";
    state.q = q;

    var si = $("[data-search]");
    if (si && q) {
      si.value = q;
      var wrap = si.closest(".search");
      if (wrap) wrap.classList.add("has-value");
    }
  }

  /* =======================================================================
     16. BOOT
     ======================================================================= */
  function boot() {
    loadEnquiry();
    hydrateIcons(document);
    hydrateConfigText(document);
    hydrateWaLinks(document);
    initChrome();
    initDelegation();
    initAccordions();
    initForms();
    renderHome();
    initReveal();

    if ($("[data-render='product-grid']")) {
      renderPills();
      renderSpecFilters();
      readUrlState();
      renderCatalogue();
      $$("[data-render='pills'] .pill").forEach(function (b) {
        b.classList.toggle("is-active", b.getAttribute("data-cat") === state.cat);
      });
    }

    syncEnquiryUI();

    /* deep link: ?p=product-id opens the detail panel */
    var deep = new URLSearchParams(window.location.search).get("p");
    if (deep && byId(deep)) window.setTimeout(function () { openProduct(deep, true); }, 120);

    if (window.BP_onReady) window.BP_onReady();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () { window.setTimeout(boot, 0); });
  } else {
    window.setTimeout(boot, 0);
  }
})();
