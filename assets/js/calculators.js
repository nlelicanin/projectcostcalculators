/**
 * calculators.js
 * Shared calculator logic for projectcostcalculators.com
 * Safe for SEO, deferred loading, and future expansion
 */

(function () {
  "use strict";

  // Create global namespace if it doesn't exist
  window.CostTools = window.CostTools || {};

  /* ===============================
     Helpers
  ================================ */

  CostTools.formatCurrencyRangeUSD = function (min, max) {
    const fmt = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    });
    return `${fmt.format(min)} – ${fmt.format(max)}`;
  };

  CostTools.clamp = function (n, min, max) {
    return Math.min(max, Math.max(min, n));
  };

  /* ===============================
     Project Cost Estimator
     Page: /project-cost-estimator
  ================================ */

  CostTools.calculateProjectCost = function () {
    const serviceTypeEl = document.getElementById("serviceType");
    const scopeSizeEl = document.getElementById("scopeSize");
    const complexityEl = document.getElementById("complexity");
    const urgencyEl = document.getElementById("urgency");
    const providerTypeEl = document.getElementById("providerType");
    const resultEl = document.getElementById("projectCostResult");

    if (!serviceTypeEl || !scopeSizeEl || !complexityEl || !urgencyEl || !providerTypeEl || !resultEl) {
      return;
    }

    const serviceType = serviceTypeEl.value;
    const scopeSize = scopeSizeEl.value;
    const complexity = complexityEl.value;
    const urgency = urgencyEl.value;
    const providerType = providerTypeEl.value;

    /**
     * Base ranges (USD) for a "medium / medium / flexible / smallAgency" starting point.
     * Calibrated to match the "Medium Scope" column of the typical-cost-ranges
     * table above (.authority section) so the calculator's default output and
     * the static benchmarks agree. Updated 2026-08 — see SEO review K2 fix.
     */
    const BASE_RANGES = {
      website:    { min: 5000,  max: 25000 },
      saas:       { min: 30000, max: 100000 },
      freelance:  { min: 2500,  max: 10000 },
      consulting: { min: 5000,  max: 20000 },
      other:      { min: 3000,  max: 15000 }
    };

    // Multipliers for scope
    const SCOPE_MULT = {
      small: 0.65,
      medium: 1.0,
      large: 1.8
    };

    // Multipliers for complexity
    const COMPLEXITY_MULT = {
      low: 0.8,
      medium: 1.0,
      high: 1.45
    };

    // Multipliers for urgency
    const URGENCY_MULT = {
      flexible: 1.0,
      standard: 1.12,
      rush: 1.3
    };

    // Multipliers for provider type
    const PROVIDER_MULT = {
      freelancer: 0.85,
      smallAgency: 1.0,
      agency: 1.25
    };

    const base = BASE_RANGES[serviceType] || BASE_RANGES.other;

    const scopeM = SCOPE_MULT[scopeSize] ?? 1.0;
    const complexM = COMPLEXITY_MULT[complexity] ?? 1.0;
    const urgencyM = URGENCY_MULT[urgency] ?? 1.0;
    const providerM = PROVIDER_MULT[providerType] ?? 1.0;

    // Compute estimated range
    let estMin = Math.round(base.min * scopeM * complexM * urgencyM * providerM);
    let estMax = Math.round(base.max * scopeM * complexM * urgencyM * providerM);

    // Ensure logical ordering & minimum spread
    if (estMax < estMin) [estMin, estMax] = [estMax, estMin];
    const minSpread = Math.max(500, Math.round(estMin * 0.25));
    if (estMax - estMin < minSpread) estMax = estMin + minSpread;

    // Guardrails (avoid silly outputs)
    estMin = CostTools.clamp(estMin, 0, 5_000_000);
    estMax = CostTools.clamp(estMax, 0, 5_000_000);

    const rangeText = CostTools.formatCurrencyRangeUSD(estMin, estMax);

    // Explain drivers (short, useful, non-spammy)
    const drivers = [];
    if (scopeSize === "small") drivers.push("smaller scope");
    if (scopeSize === "large") drivers.push("larger scope");
    if (complexity === "low") drivers.push("lower complexity");
    if (complexity === "high") drivers.push("higher complexity");
    if (urgency === "standard") drivers.push("fixed deadline");
    if (urgency === "rush") drivers.push("rush timeline");
    if (providerType === "freelancer") drivers.push("freelancer rates");
    if (providerType === "agency") drivers.push("agency overhead");

    const driverLine = drivers.length
      ? `This estimate reflects: <strong>${drivers.join(", ")}</strong>.`
      : `This estimate uses typical assumptions for a mid-sized project.`;

    // Output
    resultEl.innerHTML = `
      <strong>Estimated project cost range:</strong><br>
      <span style="font-size:1.15rem; font-weight:800;">${rangeText}</span>
      <p style="margin:10px 0 0;">${driverLine}</p>
      <p style="margin:10px 0 0;">
        For a deeper explanation of what drives pricing, see
        <a href="/service-cost-breakdown">Service Cost Breakdown</a>.
      </p>
    `;
  };

  /* ===============================
     Website Development Cost Estimator
     Page: /website-development-cost-estimator
  ================================ */

  CostTools.calculateWebsiteDevelopmentCost = function () {
    const siteTypeEl = document.getElementById("wdSiteType");
    const pagesEl = document.getElementById("wdPages");
    const complexityEl = document.getElementById("wdComplexity");
    const integrationsEl = document.getElementById("wdIntegrations");
    const urgencyEl = document.getElementById("wdUrgency");
    const providerEl = document.getElementById("wdProvider");
    const resultEl = document.getElementById("websiteDevResult");

    if (!siteTypeEl || !pagesEl || !complexityEl || !integrationsEl || !urgencyEl || !providerEl || !resultEl) {
      return;
    }

    const siteType = siteTypeEl.value;
    const pages = pagesEl.value;
    const complexity = complexityEl.value;
    const integrations = integrationsEl.value;
    const urgency = urgencyEl.value;
    const provider = providerEl.value;

    /**
     * Base ranges for a "business site / 6-15 pages / medium / some integrations / flexible / smallAgency"
     * Conservative planning ranges (USD). Marketing/business recalibrated to match the
     * hero copy's stated bands ($1,000-$5,000 marketing, $5,000-$25,000 business) —
     * see SEO review K2 fix, same pattern as the Project Cost Estimator. Content,
     * ecommerce, and webapp were already consistent with the copy and are unchanged.
     */
    const BASE_RANGES = {
      marketing: { min: 1000, max: 5000 },
      business:  { min: 5000, max: 25000 },
      content:   { min: 1800, max: 9000 },
      ecommerce: { min: 6000, max: 30000 },
      webapp:    { min: 9000, max: 45000 }
    };

    const PAGES_MULT = {
      "1_5": 0.7,
      "6_15": 1.0,
      "16_40": 1.6,
      "40_plus": 2.3
    };

    const COMPLEXITY_MULT = {
      low: 0.85,
      medium: 1.0,
      high: 1.4
    };

    const INTEGRATIONS_MULT = {
      none: 0.95,
      some: 1.0,
      many: 1.3
    };

    const URGENCY_MULT = {
      flexible: 1.0,
      standard: 1.12,
      rush: 1.3
    };

    const PROVIDER_MULT = {
      freelancer: 0.85,
      smallAgency: 1.0,
      agency: 1.25
    };

    const base = BASE_RANGES[siteType] || BASE_RANGES.business;

    const pagesM = PAGES_MULT[pages] ?? 1.0;
    const complexM = COMPLEXITY_MULT[complexity] ?? 1.0;
    const integM = INTEGRATIONS_MULT[integrations] ?? 1.0;
    const urgencyM = URGENCY_MULT[urgency] ?? 1.0;
    const providerM = PROVIDER_MULT[provider] ?? 1.0;

    let estMin = Math.round(base.min * pagesM * complexM * integM * urgencyM * providerM);
    let estMax = Math.round(base.max * pagesM * complexM * integM * urgencyM * providerM);

    if (estMax < estMin) [estMin, estMax] = [estMax, estMin];

    // Minimum spread so it doesn't look fake-precise
    const minSpread = Math.max(750, Math.round(estMin * 0.28));
    if (estMax - estMin < minSpread) estMax = estMin + minSpread;

    estMin = CostTools.clamp(estMin, 0, 5_000_000);
    estMax = CostTools.clamp(estMax, 0, 5_000_000);

    const rangeText = CostTools.formatCurrencyRangeUSD(estMin, estMax);

    const drivers = [];
    if (pages !== "6_15") drivers.push(pages === "1_5" ? "fewer pages" : "more pages");
    if (complexity === "low") drivers.push("lower complexity");
    if (complexity === "high") drivers.push("higher complexity");
    if (integrations === "many") drivers.push("multiple integrations");
    if (urgency === "standard") drivers.push("fixed deadline");
    if (urgency === "rush") drivers.push("rush timeline");
    if (provider === "freelancer") drivers.push("freelancer pricing");
    if (provider === "agency") drivers.push("agency overhead");

    const driverLine = drivers.length
      ? `This estimate reflects: <strong>${drivers.join(", ")}</strong>.`
      : `This estimate uses typical assumptions for a mid-sized website project.`;

    resultEl.innerHTML = `
      <strong>Estimated website build cost range:</strong><br>
      <span style="font-size:1.15rem; font-weight:800;">${rangeText}</span>
      <p style="margin:10px 0 0;">${driverLine}</p>
      <p style="margin:10px 0 0;">
        Planning ongoing costs too? See the
        <a href="/website-maintenance-cost-estimator">Website Maintenance Cost Estimator</a>.
      </p>
    `;
  };

  /* ===============================
     Website Maintenance Cost Estimator
     Page: /website-maintenance-cost-estimator
  ================================ */

  CostTools.calculateWebsiteMaintenanceCost = function () {
    const siteTypeEl = document.getElementById("wmSiteType");
    const frequencyEl = document.getElementById("wmFrequency");
    const supportEl = document.getElementById("wmSupport");
    const securityEl = document.getElementById("wmSecurity");
    const providerEl = document.getElementById("wmProvider");
    const resultEl = document.getElementById("websiteMaintResult");

    if (!siteTypeEl || !frequencyEl || !supportEl || !securityEl || !providerEl || !resultEl) {
      return;
    }

    const siteType = siteTypeEl.value;
    const frequency = frequencyEl.value;
    const support = supportEl.value;
    const security = securityEl.value;
    const provider = providerEl.value;

    /**
     * Base ranges (USD per month) for:
     * "business / monthly / basic / standard security / smallAgency"
     * Marketing/business recalibrated to match the FAQ's explicit stated bands
     * ($50-$200/mo marketing, $200-$500/mo business) — see SEO review K2 fix.
     * Content/ecommerce/webapp unchanged: the FAQ only gives one combined,
     * unsplit claim for ecommerce+webapp ($500-$3,000+/mo), so picking a
     * specific split between the two would mean inventing numbers the page
     * doesn't actually state anywhere.
     */
    const BASE_RANGES = {
      marketing: { min: 50,  max: 200 },
      business:  { min: 200, max: 500 },
      content:   { min: 120, max: 550 },
      ecommerce: { min: 350, max: 1400 },
      webapp:    { min: 500, max: 2500 }
    };

    const FREQUENCY_MULT = {
      rare: 0.75,
      monthly: 1.0,
      weekly: 1.35,
      continuous: 1.75
    };

    const SUPPORT_MULT = {
      basic: 1.0,
      standard: 1.25,
      priority: 1.6
    };

    const SECURITY_MULT = {
      standard: 1.0,
      enhanced: 1.25,
      regulated: 1.6
    };

    const PROVIDER_MULT = {
      freelancer: 0.85,
      smallAgency: 1.0,
      agency: 1.25
    };

    const base = BASE_RANGES[siteType] || BASE_RANGES.business;

    const freqM = FREQUENCY_MULT[frequency] ?? 1.0;
    const supportM = SUPPORT_MULT[support] ?? 1.0;
    const secM = SECURITY_MULT[security] ?? 1.0;
    const providerM = PROVIDER_MULT[provider] ?? 1.0;

    let estMin = Math.round(base.min * freqM * supportM * secM * providerM);
    let estMax = Math.round(base.max * freqM * supportM * secM * providerM);

    if (estMax < estMin) [estMin, estMax] = [estMax, estMin];

    // Minimum spread so it doesn't look fake-precise (monthly ranges can be small)
    const minSpread = Math.max(50, Math.round(estMin * 0.35));
    if (estMax - estMin < minSpread) estMax = estMin + minSpread;

    estMin = CostTools.clamp(estMin, 0, 5_000_000);
    estMax = CostTools.clamp(estMax, 0, 5_000_000);

    const rangeText = `${CostTools.formatCurrencyRangeUSD(estMin, estMax)} / month`;

    const drivers = [];
    if (frequency === "rare") drivers.push("infrequent updates");
    if (frequency === "weekly") drivers.push("weekly updates");
    if (frequency === "continuous") drivers.push("frequent ongoing changes");
    if (support === "standard") drivers.push("standard support");
    if (support === "priority") drivers.push("priority support");
    if (security === "enhanced") drivers.push("enhanced security");
    if (security === "regulated") drivers.push("regulated requirements");
    if (provider === "freelancer") drivers.push("freelancer pricing");
    if (provider === "agency") drivers.push("agency overhead");

    const driverLine = drivers.length
      ? `This estimate reflects: <strong>${drivers.join(", ")}</strong>.`
      : `This estimate uses typical assumptions for a maintained business website.`;

    resultEl.innerHTML = `
      <strong>Estimated maintenance cost range:</strong><br>
      <span style="font-size:1.15rem; font-weight:800;">${rangeText}</span>
      <p style="margin:10px 0 0;">${driverLine}</p>
      <p style="margin:10px 0 0;">
        Need a build estimate too? See the
        <a href="/website-development-cost-estimator">Website Development Cost Estimator</a>.
      </p>
    `;
  };

  /* ===============================
     SaaS Development Cost Estimator
     Page: /saas-development-cost-estimator
  ================================ */

  CostTools.calculateSaaSDevelopmentCost = function () {
    const stageEl = document.getElementById("sdStage");
    const scopeEl = document.getElementById("sdScope");
    const complexityEl = document.getElementById("sdComplexity");
    const integrationsEl = document.getElementById("sdIntegrations");
    const urgencyEl = document.getElementById("sdUrgency");
    const providerEl = document.getElementById("sdProvider");
    const resultEl = document.getElementById("saasDevResult");

    if (!stageEl || !scopeEl || !complexityEl || !integrationsEl || !urgencyEl || !providerEl || !resultEl) {
      return;
    }

    const stage = stageEl.value;
    const scope = scopeEl.value;
    const complexity = complexityEl.value;
    const integrations = integrationsEl.value;
    const urgency = urgencyEl.value;
    const provider = providerEl.value;

    /**
     * Base ranges (USD) for:
     * "MVP / medium scope / medium complexity / some integrations / flexible / smallAgency"
     * Production recalibrated to match the FAQ's explicit claim that production-ready
     * builds "typically exceed $100,000" - the old floor of $30,000 directly contradicted
     * that at default settings. See SEO review K2 fix. Prototype/mvp unchanged - no
     * explicit page claim contradicts their current defaults.
     */
    const BASE_RANGES = {
      prototype: { min: 6000,  max: 25000 },
      mvp:       { min: 12000, max: 60000 },
      production:{ min: 100000, max: 250000 }
    };

    const SCOPE_MULT = {
      small: 0.75,
      medium: 1.0,
      large: 1.65
    };

    const COMPLEXITY_MULT = {
      low: 0.85,
      medium: 1.0,
      high: 1.45
    };

    const INTEGRATIONS_MULT = {
      none: 0.95,
      some: 1.0,
      many: 1.35
    };

    const URGENCY_MULT = {
      flexible: 1.0,
      standard: 1.12,
      rush: 1.3
    };

    const PROVIDER_MULT = {
      freelancer: 0.85,
      smallAgency: 1.0,
      agency: 1.25
    };

    const base = BASE_RANGES[stage] || BASE_RANGES.mvp;

    const scopeM = SCOPE_MULT[scope] ?? 1.0;
    const complexM = COMPLEXITY_MULT[complexity] ?? 1.0;
    const integM = INTEGRATIONS_MULT[integrations] ?? 1.0;
    const urgencyM = URGENCY_MULT[urgency] ?? 1.0;
    const providerM = PROVIDER_MULT[provider] ?? 1.0;

    let estMin = Math.round(base.min * scopeM * complexM * integM * urgencyM * providerM);
    let estMax = Math.round(base.max * scopeM * complexM * integM * urgencyM * providerM);

    if (estMax < estMin) [estMin, estMax] = [estMax, estMin];

    const minSpread = Math.max(1500, Math.round(estMin * 0.28));
    if (estMax - estMin < minSpread) estMax = estMin + minSpread;

    estMin = CostTools.clamp(estMin, 0, 5_000_000);
    estMax = CostTools.clamp(estMax, 0, 5_000_000);

    const rangeText = CostTools.formatCurrencyRangeUSD(estMin, estMax);

    const drivers = [];
    if (stage === "prototype") drivers.push("prototype stage");
    if (stage === "production") drivers.push("scale-ready build");
    if (scope === "small") drivers.push("smaller scope");
    if (scope === "large") drivers.push("larger scope");
    if (complexity === "low") drivers.push("lower complexity");
    if (complexity === "high") drivers.push("higher complexity");
    if (integrations === "many") drivers.push("multiple integrations");
    if (urgency === "standard") drivers.push("fixed deadline");
    if (urgency === "rush") drivers.push("rush timeline");
    if (provider === "freelancer") drivers.push("freelancer pricing");
    if (provider === "agency") drivers.push("agency overhead");

    const driverLine = drivers.length
      ? `This estimate reflects: <strong>${drivers.join(", ")}</strong>.`
      : `This estimate uses typical assumptions for a mid-sized SaaS MVP.`;

    resultEl.innerHTML = `
      <strong>Estimated SaaS development cost range:</strong><br>
      <span style="font-size:1.15rem; font-weight:800;">${rangeText}</span>
      <p style="margin:10px 0 0;">${driverLine}</p>
      <p style="margin:10px 0 0;">
        Planning launch and ongoing work too? See the
        <a href="/project-cost-estimator">Project Cost Estimator</a>.
      </p>
    `;
  };

  /* ===============================
     Service Hourly Rate Calculator
     Page: /service-hourly-rate-calculator
  ================================ */

  CostTools.calculateServiceHourlyRate = function () {
    const incomeEl = document.getElementById("hrIncome");
    const overheadEl = document.getElementById("hrOverhead");
    const hoursEl = document.getElementById("hrBillableHours");
    const weeksEl = document.getElementById("hrWeeks");
    const utilEl = document.getElementById("hrUtilization");
    const marginEl = document.getElementById("hrMargin");
    const resultEl = document.getElementById("hourlyRateResult");

    if (!incomeEl || !overheadEl || !hoursEl || !weeksEl || !utilEl || !marginEl || !resultEl) {
      return;
    }

    const income = Number(incomeEl.value || 0);
    const overhead = Number(overheadEl.value || 0);
    const billableHoursPerWeek = Number(hoursEl.value || 0);
    const weeksPerYear = Number(weeksEl.value || 0);
    const utilization = Number(utilEl.value || 0);
    const margin = Number(marginEl.value || 0);

    // Effective billable hours (utilization reduces realistic billable capacity)
    const rawBillableHours = billableHoursPerWeek * weeksPerYear;
    const effectiveBillableHours = rawBillableHours * utilization;

    // Guardrails
    const safeHours = Math.max(1, effectiveBillableHours);
    const safeMargin = CostTools.clamp(margin, 0, 0.9);

    // Revenue needed before profit-margin adjustment
    const costBase = Math.max(0, income) + Math.max(0, overhead);

    // Apply margin (20% margin => divide by 0.8)
    const revenueTarget = costBase / Math.max(0.1, (1 - safeMargin));

    // Hourly rate
    const hourly = revenueTarget / safeHours;

    // Display as a simple planning range (+/- 10%), rounded to nearest $5
    const roundTo5 = (n) => Math.round(n / 5) * 5;
    let low = roundTo5(hourly * 0.9);
    let high = roundTo5(hourly * 1.1);

    low = CostTools.clamp(low, 0, 100000);
    high = CostTools.clamp(high, 0, 100000);
    if (high < low) [low, high] = [high, low];

    const rangeText = `${CostTools.formatCurrencyRangeUSD(low, high)} / hour`;

    const drivers = [];
    if (utilization <= 0.6) drivers.push("lower utilization");
    if (utilization >= 0.8) drivers.push("higher utilization");
    if (safeMargin >= 0.3) drivers.push("higher profit margin");
    if (billableHoursPerWeek < 20) drivers.push("lower billable hours");
    if (billableHoursPerWeek > 30) drivers.push("higher billable hours");
    if (overhead > income * 0.25) drivers.push("higher overhead");

    const driverLine = drivers.length
      ? `This estimate reflects: <strong>${drivers.join(", ")}</strong>.`
      : `This estimate uses typical assumptions for a solo service business.`;

    // Extra clarity line (helps trust)
    const hoursLine = `Effective billable hours/year: <strong>${Math.round(safeHours).toLocaleString("en-US")}</strong>.`;

    resultEl.innerHTML = `
      <strong>Estimated hourly rate range:</strong><br>
      <span style="font-size:1.15rem; font-weight:800;">${rangeText}</span>
      <p style="margin:10px 0 0;">${hoursLine}</p>
      <p style="margin:10px 0 0;">${driverLine}</p>
      <p style="margin:10px 0 0;">
        Want to sanity-check project pricing? See the
        <a href="/project-cost-estimator">Project Cost Estimator</a>.
      </p>
    `;
  };

  CostTools.calculateFreelanceServicePrice = function () {
    const hoursEl = document.getElementById("fpHours");
    const rateEl = document.getElementById("fpRate");
    const overheadEl = document.getElementById("fpOverhead");
    const bufferEl = document.getElementById("fpBuffer");
    const marginEl = document.getElementById("fpMargin");
    const resultEl = document.getElementById("freelancePriceResult");

    if (!hoursEl || !rateEl || !overheadEl || !bufferEl || !marginEl || !resultEl) {
      return;
    }

    const hours = Math.max(0, Number(hoursEl.value || 0));
    const rate = Math.max(0, Number(rateEl.value || 0));
    const overhead = Math.max(0, Number(overheadEl.value || 0));
    const buffer = CostTools.clamp(Number(bufferEl.value || 0), 0, 0.9);
    const margin = CostTools.clamp(Number(marginEl.value || 0), 0, 0.9);

    const labor = hours * rate;
    const bufferAmount = labor * buffer;
    const withBuffer = labor + bufferAmount;
    const costBase = withBuffer + overhead;
    const revenueTarget = costBase / Math.max(0.1, (1 - margin));

    const roundTo50 = (n) => Math.round(n / 50) * 50;
    let low = roundTo50(revenueTarget * 0.92);
    let high = roundTo50(revenueTarget * 1.08);

    low = CostTools.clamp(low, 0, 5_000_000);
    high = CostTools.clamp(high, 0, 5_000_000);
    if (high < low) [low, high] = [high, low];

    const rangeText = CostTools.formatCurrencyRangeUSD(low, high);

    const drivers = [];
    if (hours >= 60) drivers.push("higher hours");
    if (hours > 0 && hours <= 20) drivers.push("smaller scope");
    if (buffer >= 0.2) drivers.push("higher uncertainty buffer");
    if (margin >= 0.3) drivers.push("higher profit margin");
    if (overhead >= 500) drivers.push("higher overhead allocation");

    const driverLine = drivers.length
      ? `This estimate reflects: <strong>${drivers.join(", ")}</strong>.`
      : `This estimate uses typical assumptions for a fixed-price freelance package.`;

    // Keep toggle state across recalcs
    const expanded = resultEl.dataset.expanded === "1";

    const breakdownId = "fpBreakdown";
    const toggleId = "fpBreakdownToggle";

    const bufferPct = Math.round(buffer * 100);
    const marginPct = Math.round(margin * 100);

    const fmtSingle = (n) => {
      const v = Math.round(n);
      return CostTools.formatCurrencyRangeUSD(v, v);
    };

    resultEl.innerHTML = `
      <strong>Suggested project/package price range:</strong><br>
      <span style="font-size:1.15rem; font-weight:800;">${rangeText}</span>

      <div class="calculator-cta" style="margin:12px 0 0;">
        <button
          id="${toggleId}"
          type="button"
          class="btn-secondary calc-toggle"
          aria-expanded="${expanded ? "true" : "false"}"
          aria-controls="${breakdownId}"
        >
          ${expanded ? "Hide breakdown" : "Show breakdown"}
        </button>
      </div>

      <div id="${breakdownId}" class="calc-breakdown" ${expanded ? "" : 'hidden="hidden"'}>
        <div style="margin:0 0 6px;">
          Base labor: <strong>${fmtSingle(labor)}</strong>
          <span class="muted">(${hours}h × ${fmtSingle(rate).replace(" – ", "")}/h)</span>
        </div>
        <div style="margin:0 0 6px;">
          Risk buffer (${bufferPct}%): <strong>${fmtSingle(bufferAmount)}</strong>
        </div>
        <div style="margin:0 0 6px;">
          Overhead allocation: <strong>${fmtSingle(overhead)}</strong>
        </div>
        <div style="margin:0 0 6px;">
          Subtotal: <strong>${fmtSingle(costBase)}</strong>
        </div>
        <div style="margin:0;">
          Profit margin (${marginPct}%): adjusts subtotal to target revenue:
          <strong>${fmtSingle(revenueTarget)}</strong>
        </div>
      </div>

      <p style="margin:10px 0 0;">${driverLine}</p>
      <p style="margin:10px 0 0;">
        Want to confirm your base rate? See the
        <a href="/service-hourly-rate-calculator">Service Hourly Rate Calculator</a>.
      </p>
    `;

    const toggleBtn = document.getElementById(toggleId);
    const breakdownEl = document.getElementById(breakdownId);

    if (toggleBtn && breakdownEl) {
      toggleBtn.addEventListener("click", function () {
        const isHidden = breakdownEl.hasAttribute("hidden");
        if (isHidden) {
          breakdownEl.removeAttribute("hidden");
          toggleBtn.textContent = "Hide breakdown";
          toggleBtn.setAttribute("aria-expanded", "true");
          resultEl.dataset.expanded = "1";
        } else {
          breakdownEl.setAttribute("hidden", "hidden");
          toggleBtn.textContent = "Show breakdown";
          toggleBtn.setAttribute("aria-expanded", "false");
          resultEl.dataset.expanded = "0";
        }
      });
    }
  };

  /* ===============================
     Mobile App Development Cost Estimator
     Page: /mobile-app-development-cost-estimator
  ================================ */

  CostTools.calculateMobileAppDevelopmentCost = function () {
    const stageEl = document.getElementById("maStage");
    const platformEl = document.getElementById("maPlatform");
    const complexityEl = document.getElementById("maComplexity");
    const urgencyEl = document.getElementById("maUrgency");
    const providerEl = document.getElementById("maProvider");
    const resultEl = document.getElementById("mobileAppResult");

    if (!stageEl || !platformEl || !complexityEl || !urgencyEl || !providerEl || !resultEl) {
      return;
    }

    const stage = stageEl.value;
    const platform = platformEl.value;
    const complexity = complexityEl.value;
    const urgency = urgencyEl.value;
    const provider = providerEl.value;

    /**
     * Base ranges (USD) for:
     * "MVP / cross-platform / moderate complexity / flexible / smallAgency"
     * Industry-standard planning ranges - please review against your own
     * data before publishing; app dev costs vary more by region/vendor
     * than web or SaaS dev costs.
     */
    const BASE_RANGES = {
      prototype: { min: 8000, max: 30000 },
      mvp: { min: 20000, max: 80000 },
      production: { min: 60000, max: 250000 }
    };

    // Building natively for both platforms means duplicating most of the
    // work, not simply doubling it (shared design/backend/QA planning) -
    // hence 1.7x rather than 2x. Single-platform native is cheaper than
    // cross-platform since there's no cross-platform framework overhead
    // or compatibility testing across two rendering engines.
    const PLATFORM_MULT = {
      ios: 0.65,
      android: 0.65,
      both: 1.7,
      crossplatform: 1.0
    };

    const COMPLEXITY_MULT = {
      simple: 0.7,
      moderate: 1.0,
      complex: 1.8
    };

    const URGENCY_MULT = {
      flexible: 1.0,
      standard: 1.12,
      rush: 1.3
    };

    const PROVIDER_MULT = {
      freelancer: 0.85,
      smallAgency: 1.0,
      agency: 1.25
    };

    const base = BASE_RANGES[stage] || BASE_RANGES.mvp;

    const platformM = PLATFORM_MULT[platform] ?? 1.0;
    const complexM = COMPLEXITY_MULT[complexity] ?? 1.0;
    const urgencyM = URGENCY_MULT[urgency] ?? 1.0;
    const providerM = PROVIDER_MULT[provider] ?? 1.0;

    let estMin = Math.round(base.min * platformM * complexM * urgencyM * providerM);
    let estMax = Math.round(base.max * platformM * complexM * urgencyM * providerM);

    if (estMax < estMin) [estMin, estMax] = [estMax, estMin];

    const minSpread = Math.max(1500, Math.round(estMin * 0.28));
    if (estMax - estMin < minSpread) estMax = estMin + minSpread;

    estMin = CostTools.clamp(estMin, 0, 5_000_000);
    estMax = CostTools.clamp(estMax, 0, 5_000_000);

    const rangeText = CostTools.formatCurrencyRangeUSD(estMin, estMax);

    const drivers = [];
    if (stage === "prototype") drivers.push("prototype stage");
    if (stage === "production") drivers.push("production-ready build");
    if (platform === "both") drivers.push("native iOS + Android");
    if (platform === "ios") drivers.push("iOS only");
    if (platform === "android") drivers.push("Android only");
    if (complexity === "simple") drivers.push("simple feature set");
    if (complexity === "complex") drivers.push("higher complexity (real-time, payments, or heavy integrations)");
    if (urgency === "standard") drivers.push("fixed deadline");
    if (urgency === "rush") drivers.push("rush timeline");
    if (provider === "freelancer") drivers.push("freelancer pricing");
    if (provider === "agency") drivers.push("agency overhead");

    const driverLine = drivers.length
      ? `This estimate reflects: <strong>${drivers.join(", ")}</strong>.`
      : `This estimate uses typical assumptions for a cross-platform MVP.`;

    resultEl.innerHTML = `
      <strong>Estimated mobile app development cost range:</strong><br>
      <span style="font-size:1.15rem; font-weight:800;">${rangeText}</span>
      <p style="margin:10px 0 0;">${driverLine}</p>
      <p style="margin:10px 0 0;">
        Planning a web app instead? See the
        <a href="/saas-development-cost-estimator">SaaS Development Cost Estimator</a>.
      </p>
    `;
  };




  /* ===============================
     Event Bindings (tool-aware)
  ================================ */

  document.addEventListener("DOMContentLoaded", function () {
    const tool = document.body?.dataset?.tool;

    switch (tool) {

      case "project-cost-estimator": {
        const ids = ["serviceType", "scopeSize", "complexity", "urgency", "providerType"];
        const els = ids.map((id) => document.getElementById(id));

        // Only bind if the full form exists
        if (els.every(Boolean)) {
          const handler = () => CostTools.calculateProjectCost();
          els.forEach((el) => el.addEventListener("change", handler));
          handler();
        }
        break;
      }

      case "website-development-cost-estimator": {
        const ids = ["wdSiteType", "wdPages", "wdComplexity", "wdIntegrations", "wdUrgency", "wdProvider"];
        const els = ids.map((id) => document.getElementById(id));

        if (els.every(Boolean)) {
          const handler = () => CostTools.calculateWebsiteDevelopmentCost();
          els.forEach((el) => el.addEventListener("change", handler));
          handler();
        }
        break;
      }

      case "website-maintenance-cost-estimator": {
        const ids = ["wmSiteType", "wmFrequency", "wmSupport", "wmSecurity", "wmProvider"];
        const els = ids.map((id) => document.getElementById(id));

        if (els.every(Boolean)) {
          const handler = () => CostTools.calculateWebsiteMaintenanceCost();
          els.forEach((el) => el.addEventListener("change", handler));
          handler();
        }
        break;
      }

            case "saas-development-cost-estimator": {
        const ids = ["sdStage", "sdScope", "sdComplexity", "sdIntegrations", "sdUrgency", "sdProvider"];
        const els = ids.map((id) => document.getElementById(id));

        if (els.every(Boolean)) {
          const handler = () => CostTools.calculateSaaSDevelopmentCost();
          els.forEach((el) => el.addEventListener("change", handler));
          handler();
        }
        break;
      }

            case "service-hourly-rate-calculator": {
        const ids = ["hrIncome", "hrOverhead", "hrBillableHours", "hrWeeks", "hrUtilization", "hrMargin"];
        const els = ids.map((id) => document.getElementById(id));

        if (els.every(Boolean)) {
          const handler = () => CostTools.calculateServiceHourlyRate();
          els.forEach((el) => {
            el.addEventListener("change", handler);
            el.addEventListener("input", handler);
          });
          handler();
        }
        break;
      }

      case "freelance-service-pricing-calculator": {
        const ids = ["fpHours", "fpRate", "fpOverhead", "fpBuffer", "fpMargin"];
        const els = ids.map((id) => document.getElementById(id));

        if (els.every(Boolean)) {
          const handler = () => CostTools.calculateFreelanceServicePrice();
          els.forEach((el) => {
            el.addEventListener("change", handler);
            el.addEventListener("input", handler);
          });
          handler();
        }
        break;
      }

      case "mobile-app-development-cost-estimator": {
        const ids = ["maStage", "maPlatform", "maComplexity", "maUrgency", "maProvider"];
        const els = ids.map((id) => document.getElementById(id));

        if (els.every(Boolean)) {
          const handler = () => CostTools.calculateMobileAppDevelopmentCost();
          els.forEach((el) => el.addEventListener("change", handler));
          handler();
        }
        break;
      }
      

      default:
        // No calculator on this page yet
        break;
    }
  });

})();