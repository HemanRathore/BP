/* Privacy-minimal first-party page-view counts. No cookies or personal data. */
(function () {
  "use strict";
  try {
    if (navigator.doNotTrack === "1" || window.doNotTrack === "1") return;
    var path = window.location.pathname.replace(/[?#].*$/, "").slice(0, 180);
    if (!path || path.indexOf("/admin") === 0) return;
    var key = "bp_view:" + path;
    var last = Number(sessionStorage.getItem(key) || 0);
    if (Date.now() - last < 30_000) return;
    sessionStorage.setItem(key, String(Date.now()));
    fetch("/api/analytics", {
      method: "POST", credentials: "same-origin", keepalive: true,
      headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: path })
    }).catch(function () {});
  } catch (e) { /* Privacy settings can disable storage; never block the page. */ }
})();
