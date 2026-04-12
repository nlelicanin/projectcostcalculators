/**
 * layout.js — ProjectCostCalculators.com
 * - Loads header/footer partials
 * - Sets footer year
 * - Privacy-friendly GA enablement (analytics_storage granted after first interaction)
 * - Tracks affiliate gateway clicks (/go/*) as GA4 event: affiliate_click
 *   with helpful parameters for reporting:
 *     affiliate_slug, affiliate_partner, affiliate_category, affiliate_link_text
 */

(function () {
  "use strict";

  function loadPartial(id, url, callback) {
    const container = document.getElementById(id);
    if (!container) return;

    fetch(url)
      .then((res) => res.text())
      .then((html) => {
        container.innerHTML = html;
        if (typeof callback === "function") callback();
      })
      .catch((err) => {
        console.error(`Failed to load ${url}`, err);
      });
  }

  // Load header
  loadPartial("header", "/partials/header.html");

  // Load footer and set year
  loadPartial("footer", "/partials/footer.html", function () {
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
  });

  /* ===============================
     Privacy-friendly GA enablement
     Default is denied in your GA snippet.
     We grant analytics only after first user interaction.
  ================================ */

  function enableAnalyticsOnce() {
    if (typeof window.gtag !== "function") return;
    window.gtag("consent", "update", { analytics_storage: "granted" });
  }

  ["click", "keydown", "scroll", "touchstart"].forEach((evt) => {
    window.addEventListener(evt, enableAnalyticsOnce, { once: true, passive: true });
  });

  /* ===============================
     Google Analytics — affiliate clicks
     - Detect clicks on /go/* gateway links
     - Fire event: affiliate_click
     - Fill parameters from:
         1) data-attributes on the link (optional)
         2) fallback metadata map keyed by slug (recommended / no HTML edits)
  ================================ */

  // Update this map as you add new /go/ slugs in _redirects
  const AFFILIATE_META = {
    // --- Project management / ops ---
    "clickup":  { partner: "clickup",     category: "project_management", text: "ClickUp (project management)" },
    "monday":   { partner: "monday",      category: "project_management", text: "Monday.com (work management)" },
    "notion":   { partner: "notion",      category: "docs_workspace",     text: "Notion (docs & workspace)" },

    // --- Freelance pricing / billing ---
    "bonsai":   { partner: "bonsai",      category: "freelance_billing",  text: "Bonsai (proposals & invoicing)" },
    "freshbooks": { partner: "freshbooks",category: "invoicing_accounting", text: "FreshBooks (invoicing & accounting)" },
    "honeybook":  { partner: "honeybook", category: "crm_billing",        text: "HoneyBook (client management)" },

    // --- Hosting / infrastructure ---
    "digitalocean": { partner: "digitalocean", category: "hosting_cloud", text: "DigitalOcean (cloud hosting)" },
    "cloudways":    { partner: "cloudways",    category: "hosting_managed", text: "Cloudways (managed hosting)" },

    // --- Premium lead-value / marketplaces ---
    "toptal":   { partner: "toptal",      category: "talent_marketplace", text: "Toptal (hire vetted talent)" },
    "upwork":   { partner: "upwork",      category: "talent_marketplace", text: "Upwork (hire freelancers)" }
  };

  function normalizeGoSlug(href) {
    const h = String(href || "").trim();
    if (!h) return "";

    // Remove site origin if absolute. Keep this robust for www/non-www.
    return h
      .replace(/^https?:\/\/(www\.)?projectcostcalculators\.com\/go\//i, "")
      .replace(/^\/go\//i, "")
      .replace(/\/+$/g, "") // strip trailing slashes
      .trim();
  }

  function cleanParam(v, fallback) {
    const s = String(v == null ? "" : v).trim();
    return s ? s : fallback;
  }

  function getAffiliateParams(link, slug) {
    const ds = link && link.dataset ? link.dataset : {};
    const meta = AFFILIATE_META[slug] || {};

    // Optional overrides (no JS changes required):
    // data-affiliate-partner="clickup"
    // data-affiliate-category="project_management"
    // data-affiliate-text="ClickUp for project tracking"
    const partner = cleanParam(ds.affiliatePartner, cleanParam(meta.partner, "unknown"));
    const category = cleanParam(ds.affiliateCategory, cleanParam(meta.category, "unknown"));

    // Prefer explicit text, then map text, then visible link text.
    const textFromLink = link ? String(link.textContent || "").trim() : "";
    const linkText = cleanParam(ds.affiliateText, cleanParam(meta.text, cleanParam(textFromLink, "affiliate link"))).slice(0, 120);

    return {
      affiliate_slug: slug,
      affiliate_partner: partner,
      affiliate_category: category,
      affiliate_link_text: linkText
    };
  }

  document.addEventListener("click", function (e) {
    const link = e.target.closest(
      "a[href^='/go/'], a[href^='https://projectcostcalculators.com/go/'], a[href^='https://www.projectcostcalculators.com/go/']"
    );
    if (!link) return;

    const slug = normalizeGoSlug(link.getAttribute("href"));
    if (!slug) return;

    const params = getAffiliateParams(link, slug);

    if (typeof window.gtag === "function") {
      window.gtag("event", "affiliate_click", {
        ...params,
        // Keep continuity with older GA reporting patterns
        event_category: "affiliate",
        event_label: slug,
        transport_type: "beacon"
      });
    }
  });
})();
