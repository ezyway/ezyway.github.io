/*
 * Live project statistics.
 *
 * GNOME Extensions does not send CORS headers, so the browser cannot call its
 * API directly. A scheduled GitHub Action (.github/workflows/update-rezmon-stats.yml)
 * queries it server-side and commits js/rezmon-stats.json instead. This file
 * reads that same-origin snapshot and upgrades the hardcoded fallback values
 * in js/data.js, so the page still renders correctly if the fetch fails.
 */
(function () {
  "use strict";

  var STATS_URL = "js/rezmon-stats.json";
  var PROJECT_KEY = "rezmon";

  function compact(n) {
    if (n >= 1000000) return trim(n / 1000000) + "M";
    if (n >= 1000) return trim(n / 1000) + "K";
    return String(n);
  }

  function trim(value) {
    return (Math.round(value * 10) / 10).toString().replace(/\.0$/, "");
  }

  function formatFull(n) {
    return n.toLocaleString("en-US");
  }

  function applyToData(badge, impact) {
    if (typeof resumeData === "undefined" || !Array.isArray(resumeData.projects)) return;

    resumeData.projects.forEach(function (proj) {
      if (proj.key === PROJECT_KEY) {
        proj.badge = badge;
        proj.impact = impact;
      }
    });
  }

  function impactItems(impact) {
    return String(impact)
      .split("·")
      .map(function (item) {
        return item.trim();
      })
      .filter(Boolean);
  }

  function applyToDom(badge, impact) {
    var card = document.querySelector('[data-project-key="' + PROJECT_KEY + '"]');
    if (!card) return;

    var badgeEl = card.querySelector(".project-stat-badge");
    if (badgeEl) badgeEl.textContent = badge;

    var impactEl = card.querySelector(".project-impact");
    if (impactEl) {
      impactEl.textContent = "";
      impactItems(impact).forEach(function (item) {
        var li = document.createElement("li");
        li.textContent = item;
        impactEl.appendChild(li);
      });
    }
  }

  function apply(stats) {
    var downloads = Number(stats && stats.downloads);
    if (!isFinite(downloads) || downloads <= 0) return;

    var badge = compact(downloads) + "+ Downloads";
    var impact = formatFull(downloads) + "+ Downloads · Published on GNOME Marketplace";

    applyToData(badge, impact);
    applyToDom(badge, impact);
  }

  function load() {
    if (typeof fetch !== "function") return;

    fetch(STATS_URL)
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(apply)
      .catch(function () {
        /* Keep the static fallback from js/data.js. */
      });
  }

  if (document.readyState !== "loading") load();
  else document.addEventListener("DOMContentLoaded", load, { once: true });
})();
