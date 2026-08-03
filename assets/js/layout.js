/**
 * layout.js — ProjectCostCalculators.com
 * - Loads header/footer partials
 * - Sets footer year
 * - Renders the contextual header/footer highlight panel (see
 *   renderHighlight() below) from /partials/highlight-content.html
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
  loadPartial("header", "/partials/header.html", function () {
    renderHighlight("header");
  });

  // Load footer and set year
  loadPartial("footer", "/partials/footer.html", function () {
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());
    renderHighlight("footer");
  });

  /* ===============================
     Highlight panel -- contextual header/footer product pitch
     - Reads <body data-highlight-page="..."> and looks it up in
       HIGHLIGHT_CONTEXT_MAP.
     - Injects the matching variant from /partials/highlight-content.html
       into the header and footer independently (they can show different
       pitches on the same page). Header carries the higher-ROI / unique
       pitch; footer carries the safe default -- header is the more
       visible slot.
     - "none" hides the WHOLE box, not just the inner content -- an empty
       styled/bordered box looks broken, not neutral.
  ================================ */

  const HIGHLIGHT_DEFAULT = { header: "lawdepot-ica", footer: "justanswer-business" };

  // Every page from html-files.txt listed explicitly (17 total), even the
  // ones using the plain default for both slots -- so any single page's
  // pitch can be hand-edited later without needing to understand the
  // fallback mechanism. HIGHLIGHT_DEFAULT still exists as a safety net for
  // any future page not yet added here.
  const HIGHLIGHT_CONTEXT_MAP = {
    // ── No highlight panel (policy/utility pages) ──
    "404":                                  { header: "none", footer: "none" },
    "about":                                { header: "none", footer: "none" },
    "contact":                              { header: "none", footer: "none" },
    "disclaimer":                           { header: "none", footer: "none" },
    "privacy":                              { header: "none", footer: "none" },
    "sitemap":                              { header: "none", footer: "none" },
    "terms":                                { header: "none", footer: "none" },

    // ── Consulting-flavored project pages ──
    "service-pricing-guide":                 { header: "lawdepot-consulting", footer: "lawdepot-ica" },
    "saas-development-cost-estimator":       { header: "lawdepot-consulting", footer: "lawdepot-ica" },
    "website-development-cost-estimator":    { header: "lawdepot-consulting", footer: "lawdepot-ica" },
    "mobile-app-development-cost-estimator": { header: "lawdepot-consulting", footer: "lawdepot-ica" },

    // ── Everything else -- sitewide default (broadest fit: IC agreement) ──
    "freelance-service-pricing-calculator": { header: "lawdepot-ica", footer: "justanswer-business" },
    "homepage":                             { header: "lawdepot-ica", footer: "justanswer-business" },
    "project-cost-estimator":               { header: "lawdepot-ica", footer: "justanswer-business" },
    "recommended-tools":                    { header: "lawdepot-ica", footer: "justanswer-business" },
    "service-cost-breakdown":               { header: "lawdepot-ica", footer: "justanswer-business" },
    "service-hourly-rate-calculator":       { header: "lawdepot-ica", footer: "justanswer-business" },
    "website-maintenance-cost-estimator":   { header: "lawdepot-ica", footer: "justanswer-business" },
  };

  function renderHighlight(position) {
    const outer = document.querySelector(
      position === "header" ? ".header-highlight" : ".footer-highlight"
    );
    const slot = document.querySelector(`.highlight-slot[data-highlight-position="${position}"]`);
    if (!slot) return;

    const page = document.body ? document.body.dataset.highlightPage || "" : "";
    const variants = HIGHLIGHT_CONTEXT_MAP[page] || HIGHLIGHT_DEFAULT;
    const variantKey = variants[position] || HIGHLIGHT_DEFAULT[position];

    if (variantKey === "none") {
      if (outer) outer.style.display = "none";
      return;
    }

    fetch("/partials/highlight-content.html")
      .then((res) => res.text())
      .then((html) => {
        const wrap = document.createElement("div");
        wrap.innerHTML = html;
        const match = wrap.querySelector(`[data-variant="${variantKey}"]`);
        if (match) {
          slot.innerHTML = match.innerHTML;
          if (outer) outer.removeAttribute("aria-hidden");
        }
      })
      .catch((err) => console.error("Failed to load highlight", err));
  }

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
    "upwork":   { partner: "upwork",      category: "talent_marketplace", text: "Upwork (hire freelancers)" },

    // --- No-code / low-code builders ---
    "adalo":    { partner: "adalo",       category: "no_code_app_builder", text: "Adalo (no-code mobile app builder)" },

    // --- Highlight panel offers
    "lawdepot-ica":         { partner: "lawdepot",   category: "legal_documents", text: "LawDepot — Independent Contractor Agreement" },
    "lawdepot-consulting":  { partner: "lawdepot",   category: "legal_documents", text: "LawDepot — Consulting Agreement" },
    "justanswer-business":  { partner: "justanswer", category: "legal_advice",    text: "JustAnswer — Ask a Business Lawyer" }
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