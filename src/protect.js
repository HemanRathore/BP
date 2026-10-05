/* ==========================================================================
   BP ENTERPRISES — CLIENT-SIDE CONTENT PROTECTION
   --------------------------------------------------------------------------
   READ THIS FIRST — what this file can and cannot do.

   This is a static website. Its code is delivered to the visitor's browser,
   so it is impossible to hide it completely: anyone determined can read the
   HTML, CSS and JavaScript regardless of what runs here. Treat everything in
   this file as a DETERRENT against casual copying, not as security.

   The genuine protection for a site like this is on the server, and lives in
   the _headers / .htaccess / vercel.json files in the project root.

   What this file actually does:
     * removes the easy routes — right-click menu, view-source shortcuts, the
       keyboard shortcuts that open developer tools
     * stops images being dragged out or saved through the context menu
     * prints a copyright notice in the browser console
     * optionally notices when developer tools are open

   What it deliberately does NOT do:
     * disable copy/paste — customers copy our address and phone number, and
       taking that away costs business
     * disable printing or zooming — accessibility, and print is often how a
       purchase order gets raised
     * run a debugger trap — it would tank the frame rate, and this site is
       meant to feel fast

   All of it can be switched off from data/site.config.js -> security.
   ========================================================================== */
(function () {
  "use strict";

  var C = (window.BP_CONFIG || {}).security || {};

  /* Every protection is opt-in through the config, defaulting to on. */
  if (C.protectClient === false) return;

  var blockContextMenu = C.blockRightClick !== false;
  var allowOnForms = C.allowRightClickOnForms !== false;
  var allowOnLinks = C.allowRightClickOnLinks !== false;
  var blockShortcuts = C.blockDevtoolsShortcuts !== false;
  var noticeOnDevtools = C.noticeOnDevtools !== false;
  var consoleNotice = C.consoleNotice !== false;

  var isTouch = ("ontouchstart" in window) ||
                (navigator.maxTouchPoints > 0) ||
                /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);

  var NOTICE = C.noticeText ||
    "\u00A9 " + new Date().getFullYear() +
    " BP Enterprises. Website design and source code are protected.";

  /* -----------------------------------------------------------------------
     1. Right-click menu
     ----------------------------------------------------------------------- */
  function contextAllowed(target) {
    if (!target || !target.closest) return false;
    if (allowOnForms && target.closest("input, textarea, select, [contenteditable]")) return true;
    if (allowOnLinks && target.closest("a[href]")) return true;
    if (target.closest("[data-allow-context]")) return true;
    return false;
  }

  if (blockContextMenu) {
    document.addEventListener("contextmenu", function (e) {
      if (contextAllowed(e.target)) return;
      e.preventDefault();
      return false;
    }, { passive: false });
  }

  /* -----------------------------------------------------------------------
     2. Image dragging and saving
     ----------------------------------------------------------------------- */
  document.addEventListener("dragstart", function (e) {
    if (e.target && e.target.tagName === "IMG") {
      e.preventDefault();
      return false;
    }
  }, { passive: false });

  /* Stop long-press "save image" on touch devices, without blocking scroll. */
  document.addEventListener("touchstart", function (e) {
    var el = e.target;
    if (el && el.tagName === "IMG" && !el.closest("[data-allow-context]")) {
      el.addEventListener("contextmenu", function (ev) { ev.preventDefault(); }, { once: true });
    }
  }, { passive: true });

  /* -----------------------------------------------------------------------
     3. Keyboard shortcuts that expose the source or developer tools
     ----------------------------------------------------------------------- */
  var BLOCKED_KEYS = ["I", "J", "C"];   /* combined with Ctrl+Shift */

  document.addEventListener("keydown", function (e) {
    if (!blockShortcuts) return;
    var k = (e.key || "").toUpperCase();

    /* F12 */
    if (e.key === "F12" || e.keyCode === 123) {
      e.preventDefault();
      return false;
    }
    /* Ctrl+Shift+I / J / C  and  Cmd+Opt+I / J / C */
    if ((e.ctrlKey || e.metaKey) && e.shiftKey && BLOCKED_KEYS.indexOf(k) > -1) {
      e.preventDefault();
      return false;
    }
    /* Ctrl+U — view source */
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && k === "U") {
      e.preventDefault();
      return false;
    }
    /* Ctrl+S — save page. Only blocked outside form fields. */
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && k === "S") {
      var t = e.target;
      if (!(t && t.closest && t.closest("input, textarea, select, [contenteditable]"))) {
        e.preventDefault();
        return false;
      }
    }
  }, false);

  /* -----------------------------------------------------------------------
     4. Console copyright notice
     ----------------------------------------------------------------------- */
  if (consoleNotice && window.console && console.log) {
    try {
      console.log(
        "%c" + NOTICE + "%c\n\nThis site is the property of BP Enterprises.\n" +
        "For packaging enquiries: " + ((window.BP_CONFIG || {}).contact || {}).email,
        "color:#a67c2e;font-size:15px;font-weight:700;",
        "color:#6c7178;font-size:12px;"
      );
    } catch (err) { /* console may be unavailable */ }
  }

  /* -----------------------------------------------------------------------
     5. Developer-tools notice
     -----------------------------------------------------------------------
     Detected by comparing the rendered window against the outer window size.
     Deliberately conservative:
       * skipped entirely on touch devices, where the check false-positives
       * requires a large, stable gap over several consecutive samples
     When it fires, it shows a dismissible banner. It does NOT blank the page,
     because a false positive would lock real customers out of a working site.
     ----------------------------------------------------------------------- */
  if (!noticeOnDevtools || isTouch) return;

  var THRESHOLD = 200;      /* px of unexplained space */
  var STABLE = 3;           /* consecutive samples before we believe it */
  var hits = 0;
  var shown = false;

  function devtoolsOpen() {
    var wGap = window.outerWidth - window.innerWidth;
    var hGap = window.outerHeight - window.innerHeight;
    return wGap > THRESHOLD || hGap > THRESHOLD;
  }

  function showNotice() {
    if (shown) return;
    shown = true;
    var el = document.createElement("div");
    el.setAttribute("role", "status");
    el.style.cssText =
      "position:fixed;left:50%;bottom:24px;transform:translate(-50%,0);z-index:9999;" +
      "max-width:min(440px,calc(100vw - 32px));background:#101113;color:#fff;" +
      "padding:14px 18px;border-radius:10px;font:500 13px/1.5 Inter,system-ui,sans-serif;" +
      "box-shadow:0 12px 40px -12px rgba(0,0,0,.55);display:flex;gap:12px;align-items:flex-start";
    el.innerHTML =
      '<span style="color:#e5c27e;flex:0 0 auto;margin-top:1px">\u25C6</span>' +
      '<span style="flex:1">' + NOTICE + "</span>" +
      '<button type="button" aria-label="Dismiss" style="background:none;border:0;color:#8c9198;' +
      'font-size:18px;line-height:1;cursor:pointer;padding:0 2px">\u00D7</button>';
    el.querySelector("button").addEventListener("click", function () { el.remove(); });
    document.body.appendChild(el);
    window.setTimeout(function () { if (el.parentNode) el.remove(); }, 9000);
  }

  var timer = window.setInterval(function () {
    hits = devtoolsOpen() ? hits + 1 : 0;
    if (hits >= STABLE) {
      window.clearInterval(timer);
      showNotice();
    }
  }, 1200);

  /* Never leave an interval running on a backgrounded tab. */
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) {
      window.clearInterval(timer);
    } else if (!shown) {
      timer = window.setInterval(function () {
        hits = devtoolsOpen() ? hits + 1 : 0;
        if (hits >= STABLE) { window.clearInterval(timer); showNotice(); }
      }, 1200);
    }
  });
})();
