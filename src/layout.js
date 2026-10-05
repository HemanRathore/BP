/* ==========================================================================
   BP ENTERPRISES — LAYOUT
   Renders the header, footer and the floating UI that appears on every page,
   so the whole site stays consistent from a single place.
   Load order: site.config.js  ->  products.js  ->  layout.js  ->  app.js
   ========================================================================== */
(function () {
  "use strict";

  var C = window.BP_CONFIG || {};
  var CATS = window.BP_CATEGORIES || [];

  /* -----------------------------------------------------------------------
     ICONS — a tiny inline SVG set. Call BP.icon("whatsapp", 18)
     ----------------------------------------------------------------------- */
  var PATHS = {
    whatsapp:   '<path fill="currentColor" stroke="none" d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.95 1.17-.17.2-.35.22-.65.07-.3-.15-1.27-.47-2.42-1.49-.9-.8-1.5-1.79-1.68-2.09-.17-.3-.02-.46.13-.61.14-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.08-.15-.68-1.63-.93-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.03 1.01-1.03 2.46 0 1.45 1.06 2.85 1.21 3.05.15.2 2.06 3.29 5.02 4.48.7.3 1.25.48 1.68.62.71.22 1.35.19 1.86.12.57-.09 1.76-.72 2.01-1.41.25-.7.25-1.29.17-1.42-.07-.13-.27-.2-.57-.35z"/><path fill="currentColor" stroke="none" d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21 5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2zm0 18.13c-1.53 0-3.03-.41-4.34-1.19l-.31-.18-3.23.85.86-3.15-.2-.32a8.16 8.16 0 0 1-1.25-4.36c0-4.53 3.69-8.21 8.22-8.21 4.53 0 8.21 3.69 8.21 8.21 0 4.53-3.68 8.22-8.21 8.22z"/>',
    phone:      '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.2 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/>',
    mail:       '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>',
    mapPin:     '<path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',
    clock:      '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
    search:     '<circle cx="11" cy="11" r="7.5"/><path d="m21 21-4.3-4.3"/>',
    close:      '<path d="M18 6 6 18M6 6l12 12"/>',
    chevronRight:'<path d="m9 18 6-6-6-6"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    arrowRight: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    arrowUp:    '<path d="M12 19V5"/><path d="m5 12 7-7 7 7"/>',
    check:      '<path d="M20 6 9 17l-5-5"/>',
    plus:       '<path d="M12 5v14M5 12h14"/>',
    minus:      '<path d="M5 12h14"/>',
    trash:      '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    clipboard:  '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/>',
    box:        '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
    layers:     '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 17 10 5 10-5"/><path d="m2 12 10 5 10-5"/>',
    shield:     '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    shieldCheck:'<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4.5-4.5"/>',
    truck:      '<path d="M1 3h15v13H1z"/><path d="M16 8h4l3 3v5h-7z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>',
    factory:    '<path d="M2 21h20"/><path d="M4 21V10l5 3V10l5 3V10l6 3.5V21"/><path d="M8 21v-4M12 21v-4M16 21v-4"/>',
    leaf:       '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10z"/><path d="M2 21c0-3 1.9-5.4 5.1-6C9.5 14.5 12 13 13 12"/>',
    users:      '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    award:      '<circle cx="12" cy="8" r="6"/><path d="M8.2 13.9 7 23l5-3 5 3-1.2-9.1"/>',
    zap:        '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
    ruler:      '<path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3 14 10"/><path d="M3 21l7-7"/><path d="M9 3H3v6"/><path d="M21 15v6h-6"/>',
    fileText:   '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 13h6M9 17h4"/>',
    star:       '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.9L12 17.8 5.8 21l1.2-6.9-5-4.9 6.9-1z"/>',
    thumbsUp:   '<path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.3a2 2 0 0 0 2-1.7l1.4-9a2 2 0 0 0-2-2.3z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>',
    target:     '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
    info:       '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    calendar:   '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    message:    '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    send:       '<path d="M22 2 11 13"/><path d="M22 2 15 22l-4-9-9-4z"/>',
    printer:    '<path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>',
    menu:       '<path d="M3 6h18M3 12h18M3 18h18"/>',
    paper:      '<path d="M4 4h13l3 3v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"/><path d="M8 9h8M8 13h8M8 17h5"/>',
    roll:       '<ellipse cx="12" cy="6" rx="7" ry="3.2"/><path d="M5 6v12a7 3.2 0 0 0 14 0V6"/><path d="M19 6v12"/><path d="M19 6c2 0 2.5 2 1.5 5"/>',
    pallet:     '<path d="M3 21h18"/><path d="M5 17h14"/><rect x="7" y="8" width="10" height="9"/>',
    print:      '<path d="M6 9V2h12v7"/><rect x="6" y="14" width="12" height="8"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>',
    trending:   '<path d="m23 6-9.5 9.5-5-5L1 18"/><path d="M17 6h6v6"/>',
    sparkle:    '<path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"/>'
  };

  function icon(name, size, extraClass) {
    var d = PATHS[name] || PATHS.info;
    var filled = name === "whatsapp" || name === "star";
    return '<svg class="' + (extraClass || "") + '" width="' + (size || 18) + '" height="' + (size || 18) +
      '" viewBox="0 0 24 24" fill="' + (filled ? "currentColor" : "none") +
      '" stroke="' + (filled ? "none" : "currentColor") +
      '" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + "</svg>";
  }
  window.BP_icon = icon;

  /* -----------------------------------------------------------------------
     Small helpers
     ----------------------------------------------------------------------- */
  function catName(id) {
    for (var i = 0; i < CATS.length; i++) if (CATS[i].id === id) return CATS[i].name;
    return "";
  }
  function esc(s) {
    return String(s == null ? "" : s)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  }
  window.BP_esc = esc;

  /* Config path lookup, e.g. valueAt("contact.email") */
  function valueAt(path) {
    var parts = String(path).split("."), cur = C;
    for (var i = 0; i < parts.length; i++) {
      if (cur == null) return "";
      cur = cur[parts[i]];
    }
    return cur == null ? "" : cur;
  }
  window.BP_value = valueAt;

  /* -----------------------------------------------------------------------
     HEADER
     ----------------------------------------------------------------------- */
  function buildHeader() {
    var wa = (C.whatsapp && C.whatsapp.orders) || {};
    var waGeneral = "https://wa.me/" + (wa.number || "") + "?text=" +
      encodeURIComponent(C.whatsappGreeting || "Hello, I would like a quotation.");
    var phones = (C.contact && C.contact.phones) || [];
    var primary = phones[0] || { number: "", label: "" };

    var nav = [
      { href: "index.html",    label: "Home",     key: "home" },
      { href: "products.html", label: "Products", key: "products" },
      { href: "about.html",    label: "About Us", key: "about" },
      { href: "contact.html",  label: "Contact",  key: "contact" }
    ];
    var page = (document.body && document.body.dataset.page) || "";

    function navLinks(cls) {
      return nav.map(function (n) {
        var active = n.key === page;
        return '<a class="' + cls + (active ? " is-active" : "") + '" href="' + n.href + '"' +
          (active ? ' aria-current="page"' : "") + ">" + n.label + "</a>";
      }).join("");
    }

    return '' +
    /* ---- top utility bar ---- */
    '<div class="topbar">' +
      '<div class="container">' +
        '<div class="topbar__group topbar__group--left">' +
          '<span class="topbar__note">' + icon("shieldCheck", 14) + " " + esc(C.contact ? C.contact.responseTime : "") + "</span>" +
        "</div>" +
        '<div class="topbar__group topbar__group--right">' +
          '<a href="tel:' + esc(String(primary.number || "").replace(/\s/g, "")) + '">' +
            icon("phone", 14) + "<span>" + esc(primary.number) + "</span></a>" +
          '<a class="topbar__phone" href="mailto:' + esc(C.contact ? C.contact.email : "") + '">' +
            icon("mail", 14) + "<span>" + esc(C.contact ? C.contact.email : "") + "</span></a>" +
          '<span class="topbar__note">' + icon("clock", 14) + " " + esc(C.contact ? C.contact.hours : "") + "</span>" +
        "</div>" +
      "</div>" +
    "</div>" +

    /* ---- main header ---- */
    '<header class="site-header" id="siteHeader">' +
      '<div class="container navbar">' +
        '<a class="brand" href="index.html" aria-label="' + esc(C.brand ? C.brand.name : "Home") + '">' +
          '<img class="brand__mark" src="' + esc(C.brand ? C.brand.logo : "assets/img/bp-logo-192.png") + '" alt="' + esc(C.brand ? C.brand.name : "") + ' logo" width="42" height="42">' +
          '<span class="brand__text">' +
            '<span class="brand__name">' + esc(C.brand ? C.brand.name : "") + "</span>" +
            '<span class="brand__sub">' + esc(C.brand ? C.brand.tagline : "") + "</span>" +
          "</span>" +
        "</a>" +
        '<nav class="nav" aria-label="Main">' + navLinks("") + "</nav>" +
        '<div class="nav-actions">' +
          '<button class="btn btn--ghost btn--sm" type="button" data-drawer-open aria-label="Open enquiry list">' +
            icon("clipboard", 16) + '<span class="btn--quote-label">Enquiry</span>' +
            '<span class="badge-count" data-drawer-count hidden>0</span>' +
          "</button>" +
          '<a class="btn btn--wa btn--sm" href="' + waGeneral + '" data-wa="orders" data-wa-context="header" target="_blank" rel="noopener">' +
            icon("whatsapp", 16) + '<span class="btn--quote-label">WhatsApp</span>' +
          "</a>" +
          '<button class="hamburger" type="button" aria-label="Menu" aria-expanded="false" aria-controls="mobileMenu">' +
            "<span></span><span></span><span></span>" +
          "</button>" +
        "</div>" +
      "</div>" +
    "</header>" +

    /* ---- mobile menu ---- */
    '<div class="mobile-menu" id="mobileMenu" aria-hidden="true">' +
      '<nav aria-label="Mobile">' + navLinks("mobile-link") + "</nav>" +
      '<div class="btn-row">' +
        '<a class="btn btn--wa" href="' + waGeneral + '" data-wa="orders" data-wa-context="mobile" target="_blank" rel="noopener">' +
          icon("whatsapp", 17) + " Order on WhatsApp</a>" +
        '<a class="btn btn--outline" href="products.html">Browse all products</a>' +
      "</div>" +
      '<div class="mobile-menu__contact">' +
        '<div class="footer__contact-item text-sm">' + icon("mapPin", 16) +
          "<span>" + esc(C.locations && C.locations[0] ? C.locations[0].address : "") + "</span></div>" +
        '<div class="footer__contact-item text-sm" style="margin-top:12px">' + icon("clock", 16) +
          "<span>" + esc(C.contact ? C.contact.hours : "") + "</span></div>" +
      "</div>" +
    "</div>";
  }

  /* -----------------------------------------------------------------------
     FOOTER
     ----------------------------------------------------------------------- */
  function buildFooter() {
    var wa = (C.whatsapp && C.whatsapp.orders) || {};
    var year = new Date().getFullYear();
    var head = (C.locations || []).filter(function (l) { return l.primary; })[0] || (C.locations || [])[0] || {};

    var catLinks = CATS.map(function (c) {
      return '<a href="products.html?cat=' + esc(c.id) + '">' + esc(c.name) + "</a>";
    }).join("");

    var phoneLinks = (C.contact && C.contact.phones ? C.contact.phones : []).map(function (p) {
      return '<a href="tel:' + esc(p.number.replace(/\s/g, "")) + '">' + icon("phone", 15) +
        "<span>" + esc(p.number) + '<br><span class="text-xs" style="opacity:.65">' + esc(p.label) + "</span></span></a>";
    }).join("");

    return '' +
    '<footer class="footer">' +
      '<div class="container">' +
        '<div class="footer__main">' +

          /* brand column */
          "<div>" +
            '<div class="footer__brand">' +
              '<img class="footer__brand-mark" src="' + esc(C.brand ? C.brand.logo : "assets/img/bp-logo-192.png") + '" alt="" width="46" height="46">' +
              "<div>" +
                '<div class="footer__brand-name">' + esc(C.brand ? C.brand.name : "") + "</div>" +
                '<div class="footer__brand-sub">' + esc(C.brand ? C.brand.tagline : "") + "</div>" +
              "</div>" +
            "</div>" +
            '<p class="footer__about">' + esc(C.brand ? C.brand.intro : "") +
              " " + esc(C.teamNote || "") + "</p>" +
            '<p class="footer__tagline">' +
              "Established " + esc(C.brand ? C.brand.established : "") +
              ", formerly " + esc(C.brand ? C.brand.formerName : "") +
              " (since " + esc(C.brand ? C.brand.formerSince : "") + ")." +
              (C.gstin ? "<br>GSTIN: " + esc(C.gstin) : "") +
            "</p>" +
          "</div>" +

          /* quick links */
          "<div>" +
            "<h4>Company</h4>" +
            '<div class="footer__list">' +
              '<a href="index.html">Home</a>' +
              '<a href="products.html">All products</a>' +
              '<a href="about.html">About us</a>' +
              '<a href="about.html#clients">Our clients</a>' +
              '<a href="contact.html">Contact & locations</a>' +
              '<a href="contact.html#enquiry">Request a quotation</a>' +
            "</div>" +
          "</div>" +

          /* categories */
          "<div>" +
            "<h4>What we supply</h4>" +
            '<div class="footer__list">' + catLinks +
              '<a href="products.html?search=pallets">Wooden pallets</a>' +
              '<a href="products.html?search=tape">BOPP tape</a>' +
            "</div>" +
          "</div>" +

          /* contact */
          "<div>" +
            "<h4>Reach us</h4>" +
            '<div class="footer__list">' +
              '<div class="footer__contact-item">' + icon("mapPin", 15) +
                "<span>" + esc(head.address || "") + "</span></div>" +
              phoneLinks +
              '<div class="footer__contact-item">' + icon("mail", 15) +
                '<a href="mailto:' + esc(C.contact ? C.contact.email : "") + '">' + esc(C.contact ? C.contact.email : "") + "</a></div>" +
              '<div class="footer__contact-item">' + icon("clock", 15) +
                "<span>" + esc(C.contact ? C.contact.hours : "") + "</span></div>" +
              '<div class="footer__contact-item">' + icon("whatsapp", 15) +
                '<a href="https://wa.me/' + esc(wa.number || "") + '" target="_blank" rel="noopener">WhatsApp ' + esc(wa.number ? "+" + wa.number : "") + "</a></div>" +
            "</div>" +
          "</div>" +

        "</div>" +

        '<div class="footer__bottom">' +
          "<span>© " + year + " " + esc(C.brand ? C.brand.name : "") + ". All rights reserved.</span>" +
          '<div class="footer__legal">' +
            '<a href="products.html">Products</a>' +
            '<a href="about.html">About</a>' +
            '<a href="contact.html">Contact</a>' +
            '<span style="opacity:.5">Serving Mathura &middot; Kosi Kalan &middot; Chhata &middot; Gurugram</span>' +
          "</div>" +
        "</div>" +
      "</div>" +
    "</footer>";
  }

  /* -----------------------------------------------------------------------
     FLOATING UI — WhatsApp button, back-to-top, toast host, overlays
     ----------------------------------------------------------------------- */
  function buildChrome() {
    var wa = (C.whatsapp && C.whatsapp.orders) || {};
    var waHref = "https://wa.me/" + (wa.number || "") + "?text=" +
      encodeURIComponent(C.whatsappGreeting || "Hello, I would like a quotation.");
    var fab = "";
    if (!C.features || C.features.floatingWhatsapp !== false) {
      fab = '<a class="fab-wa" href="' + waHref + '" data-wa="orders" data-wa-context="fab" target="_blank" rel="noopener" aria-label="Chat with us on WhatsApp">' +
        '<span class="fab-wa__pulse" aria-hidden="true"></span>' +
        '<span class="fab-wa__icon">' + icon("whatsapp", 17) + "</span>" +
        '<span class="fab-wa__text"><small>Order / Enquire</small><span>Chat on WhatsApp</span></span>' +
      "</a>";
    }

    return '' +
    fab +
    '<button class="to-top" type="button" aria-label="Back to top">' + icon("arrowUp", 18) + "</button>" +
    '<div class="toast" id="toast" role="status" aria-live="polite"></div>' +
    '<div class="drawer" id="enquiryDrawer" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Enquiry list"></div>' +
    '<div class="modal" id="productModal" aria-hidden="true" role="dialog" aria-modal="true" aria-label="Product details"></div>';
  }

  /* -----------------------------------------------------------------------
     Render
     ----------------------------------------------------------------------- */
  function render() {
    var headerHost = document.querySelector("[data-layout='header']");
    var footerHost = document.querySelector("[data-layout='footer']");
    var chromeHost = document.querySelector("[data-layout='chrome']");

    if (headerHost) {
      headerHost.innerHTML = buildHeader();
      document.body.insertAdjacentHTML("afterbegin",
        '<a class="skip-link" href="#main">Skip to content</a>');
    }
    if (footerHost) footerHost.innerHTML = buildFooter();
    if (chromeHost) chromeHost.innerHTML = buildChrome();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", render);
  } else {
    render();
  }

  window.BP_catName = catName;
})();
