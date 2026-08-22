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
    const workingHoursPerWeek = Number(hoursEl.value || 0);
    const weeksPerYear = Number(weeksEl.value || 0);
    const utilization = Number(utilEl.value || 0);
    const margin = Number(marginEl.value || 0);

    // Prevent invalid working-time inputs from producing a misleading capped rate.
    if (income < 0 || overhead < 0 || workingHoursPerWeek <= 0 || weeksPerYear <= 0) {
      resultEl.innerHTML = `
        <strong>Enter valid planning inputs.</strong>
        <p style="margin:10px 0 0;">Income and overhead cannot be negative, and working hours/week and working weeks/year must both be greater than 0.</p>
      `;
      return;
    }

    // Effective billable hours (utilization reduces realistic billable capacity)
    const rawBillableHours = workingHoursPerWeek * weeksPerYear;
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
    if (workingHoursPerWeek < 20) drivers.push("lower weekly working capacity");
    if (workingHoursPerWeek > 30) drivers.push("higher weekly working capacity");
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
          <span class="muted">(${hours}h × ${fmtSingle(rate).split(" – ")[0]}/h)</span>
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
     Website Redesign Cost Calculator
     Page: /website-redesign-cost-calculator
  ================================ */

  CostTools.calculateWebsiteRedesignCost = function () {
    const depthEl = document.getElementById("wrDepth");
    const pagesEl = document.getElementById("wrPages");
    const migrationEl = document.getElementById("wrMigration");
    const contentEl = document.getElementById("wrContent");
    const seoEl = document.getElementById("wrSeo");
    const integrationsEl = document.getElementById("wrIntegrations");
    const urgencyEl = document.getElementById("wrUrgency");
    const providerEl = document.getElementById("wrProvider");
    const resultEl = document.getElementById("websiteRedesignResult");

    if (!depthEl || !pagesEl || !migrationEl || !contentEl || !seoEl || !integrationsEl || !urgencyEl || !providerEl || !resultEl) return;

    const BASE_RANGES = {
      refresh: { min: 2500, max: 8000 },
      business: { min: 6000, max: 18000 },
      rebuild: { min: 12000, max: 40000 },
      ecommerce: { min: 20000, max: 70000 }
    };
    const PAGE_MULT = { "1_5": 0.8, "6_15": 1.0, "16_40": 1.25, "40_plus": 1.6 };
    const MIGRATION_MULT = { same: 1.0, cms: 1.15, major: 1.35 };
    const CONTENT_MULT = { reuse: 0.9, light: 1.0, rewrite: 1.2 };
    const SEO_MULT = { basic: 0.95, preserve: 1.1, complex: 1.25 };
    const INTEGRATION_MULT = { none: 0.95, some: 1.1, many: 1.3 };
    const URGENCY_MULT = { flexible: 1.0, standard: 1.12, rush: 1.3 };
    const PROVIDER_MULT = { freelancer: 0.85, smallAgency: 1.0, agency: 1.25 };

    const base = BASE_RANGES[depthEl.value] || BASE_RANGES.business;
    let estMin = Math.round(base.min * (PAGE_MULT[pagesEl.value] ?? 1) * (MIGRATION_MULT[migrationEl.value] ?? 1) * (CONTENT_MULT[contentEl.value] ?? 1) * (SEO_MULT[seoEl.value] ?? 1) * (INTEGRATION_MULT[integrationsEl.value] ?? 1) * (URGENCY_MULT[urgencyEl.value] ?? 1) * (PROVIDER_MULT[providerEl.value] ?? 1));
    let estMax = Math.round(base.max * (PAGE_MULT[pagesEl.value] ?? 1) * (MIGRATION_MULT[migrationEl.value] ?? 1) * (CONTENT_MULT[contentEl.value] ?? 1) * (SEO_MULT[seoEl.value] ?? 1) * (INTEGRATION_MULT[integrationsEl.value] ?? 1) * (URGENCY_MULT[urgencyEl.value] ?? 1) * (PROVIDER_MULT[providerEl.value] ?? 1));

    estMin = CostTools.clamp(estMin, 0, 5_000_000);
    estMax = CostTools.clamp(estMax, 0, 5_000_000);
    if (estMax < estMin) [estMin, estMax] = [estMax, estMin];

    const drivers = [];
    if (migrationEl.value !== "same") drivers.push("platform migration");
    if (contentEl.value === "rewrite") drivers.push("substantial content work");
    if (seoEl.value === "preserve") drivers.push("SEO preservation and redirects");
    if (seoEl.value === "complex") drivers.push("complex SEO/URL migration");
    if (integrationsEl.value === "many") drivers.push("integration-heavy scope");
    if (urgencyEl.value === "rush") drivers.push("rush timeline");
    if (providerEl.value === "agency") drivers.push("full-service agency delivery");

    resultEl.innerHTML = `
      <strong>Estimated website redesign cost range:</strong><br>
      <span style="font-size:1.15rem; font-weight:800;">${CostTools.formatCurrencyRangeUSD(estMin, estMax)}</span>
      <p style="margin:10px 0 0;">${drivers.length ? `Key cost drivers: <strong>${drivers.join(", ")}</strong>.` : "This configuration keeps migration and redesign complexity relatively contained."}</p>
      <p style="margin:10px 0 0;">New site rather than a redesign? Use the <a href="/website-development-cost-estimator">Website Development Cost Estimator</a>.</p>
    `;
  };

  /* ===============================
     Ecommerce Website Cost Calculator
     Page: /ecommerce-website-cost-calculator
  ================================ */

  CostTools.calculateEcommerceWebsiteCost = function () {
    const platformEl = document.getElementById("ecPlatform");
    const catalogEl = document.getElementById("ecCatalog");
    const designEl = document.getElementById("ecDesign");
    const integrationsEl = document.getElementById("ecIntegrations");
    const migrationEl = document.getElementById("ecMigration");
    const internationalEl = document.getElementById("ecInternational");
    const providerEl = document.getElementById("ecProvider");
    const resultEl = document.getElementById("ecommerceCostResult");
    if (!platformEl || !catalogEl || !designEl || !integrationsEl || !migrationEl || !internationalEl || !providerEl || !resultEl) return;

    const BASE_RANGES = {
      hostedTemplate: { min: 1500, max: 6000 },
      hostedCustom: { min: 6000, max: 25000 },
      openSource: { min: 10000, max: 40000 },
      headless: { min: 30000, max: 120000 }
    };
    const CATALOG_MULT = { small: 0.9, medium: 1.0, large: 1.2, veryLarge: 1.5 };
    const DESIGN_MULT = { template: 0.85, custom: 1.0, advanced: 1.3 };
    const INTEGRATION_MULT = { basic: 0.95, some: 1.15, many: 1.4 };
    const MIGRATION_MULT = { none: 0.9, standard: 1.1, complex: 1.3 };
    const INTERNATIONAL_MULT = { single: 1.0, multi: 1.2 };
    const PROVIDER_MULT = { freelancer: 0.85, smallAgency: 1.0, agency: 1.25 };

    const base = BASE_RANGES[platformEl.value] || BASE_RANGES.hostedCustom;
    let estMin = Math.round(base.min * (CATALOG_MULT[catalogEl.value] ?? 1) * (DESIGN_MULT[designEl.value] ?? 1) * (INTEGRATION_MULT[integrationsEl.value] ?? 1) * (MIGRATION_MULT[migrationEl.value] ?? 1) * (INTERNATIONAL_MULT[internationalEl.value] ?? 1) * (PROVIDER_MULT[providerEl.value] ?? 1));
    let estMax = Math.round(base.max * (CATALOG_MULT[catalogEl.value] ?? 1) * (DESIGN_MULT[designEl.value] ?? 1) * (INTEGRATION_MULT[integrationsEl.value] ?? 1) * (MIGRATION_MULT[migrationEl.value] ?? 1) * (INTERNATIONAL_MULT[internationalEl.value] ?? 1) * (PROVIDER_MULT[providerEl.value] ?? 1));
    estMin = CostTools.clamp(estMin, 0, 5_000_000);
    estMax = CostTools.clamp(estMax, 0, 5_000_000);
    if (estMax < estMin) [estMin, estMax] = [estMax, estMin];

    const drivers = [];
    if (catalogEl.value === "large" || catalogEl.value === "veryLarge") drivers.push("larger catalog");
    if (designEl.value === "advanced") drivers.push("advanced storefront UX");
    if (integrationsEl.value === "many") drivers.push("complex integrations");
    if (migrationEl.value === "complex") drivers.push("complex data migration");
    if (internationalEl.value === "multi") drivers.push("international or multi-store requirements");
    if (platformEl.value === "headless") drivers.push("headless/custom architecture");

    resultEl.innerHTML = `
      <strong>Estimated ecommerce website build cost:</strong><br>
      <span style="font-size:1.15rem; font-weight:800;">${CostTools.formatCurrencyRangeUSD(estMin, estMax)}</span>
      <p style="margin:10px 0 0;">${drivers.length ? `Key cost drivers: <strong>${drivers.join(", ")}</strong>.` : "This configuration represents a relatively standard commerce implementation."}</p>
      <p style="margin:10px 0 0;">Recurring platform, payment, app, hosting, and maintenance costs are <strong>not included</strong>.</p>
    `;
  };

  /* ===============================
     Software Development Cost Calculator
     Page: /software-development-cost-calculator
  ================================ */

  CostTools.calculateSoftwareDevelopmentCost = function () {
    const typeEl = document.getElementById("swType");
    const modulesEl = document.getElementById("swModules");
    const complexityEl = document.getElementById("swComplexity");
    const integrationsEl = document.getElementById("swIntegrations");
    const migrationEl = document.getElementById("swMigration");
    const complianceEl = document.getElementById("swCompliance");
    const urgencyEl = document.getElementById("swUrgency");
    const providerEl = document.getElementById("swProvider");
    const resultEl = document.getElementById("softwareCostResult");
    if (!typeEl || !modulesEl || !complexityEl || !integrationsEl || !migrationEl || !complianceEl || !urgencyEl || !providerEl || !resultEl) return;

    const BASE_RANGES = {
      internal: { min: 15000, max: 45000 },
      business: { min: 35000, max: 120000 },
      portal: { min: 45000, max: 150000 },
      enterprise: { min: 100000, max: 350000 }
    };
    const MODULE_MULT = { few: 0.85, several: 1.0, many: 1.3 };
    const COMPLEXITY_MULT = { low: 0.8, medium: 1.0, high: 1.4 };
    const INTEGRATION_MULT = { basic: 0.9, some: 1.1, many: 1.4 };
    const MIGRATION_MULT = { none: 0.9, standard: 1.05, complex: 1.25 };
    const COMPLIANCE_MULT = { standard: 1.0, enhanced: 1.15, regulated: 1.35 };
    const URGENCY_MULT = { flexible: 1.0, standard: 1.12, rush: 1.3 };
    const PROVIDER_MULT = { freelancer: 0.85, smallAgency: 1.0, agency: 1.25 };

    const base = BASE_RANGES[typeEl.value] || BASE_RANGES.business;
    let estMin = Math.round(base.min * (MODULE_MULT[modulesEl.value] ?? 1) * (COMPLEXITY_MULT[complexityEl.value] ?? 1) * (INTEGRATION_MULT[integrationsEl.value] ?? 1) * (MIGRATION_MULT[migrationEl.value] ?? 1) * (COMPLIANCE_MULT[complianceEl.value] ?? 1) * (URGENCY_MULT[urgencyEl.value] ?? 1) * (PROVIDER_MULT[providerEl.value] ?? 1));
    let estMax = Math.round(base.max * (MODULE_MULT[modulesEl.value] ?? 1) * (COMPLEXITY_MULT[complexityEl.value] ?? 1) * (INTEGRATION_MULT[integrationsEl.value] ?? 1) * (MIGRATION_MULT[migrationEl.value] ?? 1) * (COMPLIANCE_MULT[complianceEl.value] ?? 1) * (URGENCY_MULT[urgencyEl.value] ?? 1) * (PROVIDER_MULT[providerEl.value] ?? 1));
    estMin = CostTools.clamp(estMin, 0, 10_000_000);
    estMax = CostTools.clamp(estMax, 0, 10_000_000);
    if (estMax < estMin) [estMin, estMax] = [estMax, estMin];

    const drivers = [];
    if (modulesEl.value === "many") drivers.push("broad module scope");
    if (complexityEl.value === "high") drivers.push("high technical complexity");
    if (integrationsEl.value === "many") drivers.push("integration-heavy architecture");
    if (migrationEl.value === "complex") drivers.push("complex legacy-data migration");
    if (complianceEl.value === "regulated") drivers.push("regulated/audit-heavy requirements");
    if (urgencyEl.value === "rush") drivers.push("rush delivery");

    resultEl.innerHTML = `
      <strong>Estimated custom software development cost:</strong><br>
      <span style="font-size:1.15rem; font-weight:800;">${CostTools.formatCurrencyRangeUSD(estMin, estMax)}</span>
      <p style="margin:10px 0 0;">${drivers.length ? `Key cost drivers: <strong>${drivers.join(", ")}</strong>.` : "This configuration represents a mid-scope custom business application."}</p>
      <p style="margin:10px 0 0;">Building a SaaS product, mobile app, or ordinary website? Use the dedicated calculator linked below for a more specific model.</p>
    `;
  };

  /* ===============================
     Project Estimate Template / Builder
     Page: /project-estimate-template
  ================================ */

  CostTools.calculateProjectEstimateTemplate = function () {
    const hoursEl = document.getElementById("peHours");
    const rateEl = document.getElementById("peRate");
    const materialsEl = document.getElementById("peMaterials");
    const subcontractorsEl = document.getElementById("peSubcontractors");
    const overheadEl = document.getElementById("peOverhead");
    const contingencyEl = document.getElementById("peContingency");
    const marginEl = document.getElementById("peMargin");
    const resultEl = document.getElementById("projectEstimateResult");
    if (!hoursEl || !rateEl || !materialsEl || !subcontractorsEl || !overheadEl || !contingencyEl || !marginEl || !resultEl) return null;

    const hours = Math.max(0, Number(hoursEl.value || 0));
    const rate = Math.max(0, Number(rateEl.value || 0));
    const materials = Math.max(0, Number(materialsEl.value || 0));
    const subcontractors = Math.max(0, Number(subcontractorsEl.value || 0));
    const overhead = Math.max(0, Number(overheadEl.value || 0));
    const contingencyPct = CostTools.clamp(Number(contingencyEl.value || 0), 0, 0.9);
    const marginPct = CostTools.clamp(Number(marginEl.value || 0), 0, 0.9);

    const labor = hours * rate;
    const baseCost = labor + materials + subcontractors + overhead;
    const contingency = baseCost * contingencyPct;
    const costWithContingency = baseCost + contingency;
    const clientEstimate = costWithContingency / Math.max(0.1, (1 - marginPct));
    const profit = clientEstimate - costWithContingency;
    const fmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

    resultEl.innerHTML = `
      <strong>Project estimate:</strong><br>
      <span style="font-size:1.15rem; font-weight:800;">${fmt.format(clientEstimate)}</span>
      <div class="calc-breakdown">
        <p><strong>Labor:</strong> ${fmt.format(labor)} (${hours.toLocaleString("en-US")} hrs × ${fmt.format(rate)})</p>
        <p><strong>Direct expenses:</strong> ${fmt.format(materials)}</p>
        <p><strong>Subcontractors:</strong> ${fmt.format(subcontractors)}</p>
        <p><strong>Overhead allocation:</strong> ${fmt.format(overhead)}</p>
        <p><strong>Contingency:</strong> ${fmt.format(contingency)} (${Math.round(contingencyPct * 100)}%)</p>
        <p><strong>Profit:</strong> ${fmt.format(profit)} (${Math.round(marginPct * 100)}% target margin)</p>
      </div>
      <p style="margin:10px 0 0;">Taxes, discounts, payment schedules, and contract terms are not included.</p>
    `;

    return { hours, rate, labor, materials, subcontractors, overhead, contingencyPct, contingency, marginPct, profit, clientEstimate };
  };

  CostTools.downloadProjectEstimateCsv = function (blank) {
    const projectNameEl = document.getElementById("peProjectName");
    const data = CostTools.calculateProjectEstimateTemplate();
    if (!blank && !data) return;

    const esc = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
    let rows;
    if (blank) {
      rows = [
        ["Project Estimate Template"],
        ["Project", ""],
        ["Category", "Description", "Quantity", "Unit Rate", "Amount"],
        ["Labor", "", "", "", ""],
        ["Direct expenses", "", "", "", ""],
        ["Subcontractors", "", "", "", ""],
        ["Overhead", "", "", "", ""],
        ["Contingency", "", "", "", ""],
        ["Profit", "", "", "", ""],
        ["Total estimate", "", "", "", ""]
      ];
    } else {
      const projectName = (projectNameEl?.value || "Client project").trim() || "Client project";
      rows = [
        ["Project Estimate"],
        ["Project", projectName],
        ["Category", "Description", "Quantity", "Unit Rate", "Amount"],
        ["Labor", "Estimated labor", data.hours, data.rate.toFixed(2), data.labor.toFixed(2)],
        ["Direct expenses", "Materials / project expenses", "", "", data.materials.toFixed(2)],
        ["Subcontractors", "Outside services", "", "", data.subcontractors.toFixed(2)],
        ["Overhead", "Project overhead allocation", "", "", data.overhead.toFixed(2)],
        ["Contingency", `${Math.round(data.contingencyPct * 100)}% of cost base`, "", "", data.contingency.toFixed(2)],
        ["Profit", `${Math.round(data.marginPct * 100)}% target margin`, "", "", data.profit.toFixed(2)],
        ["Total estimate", "USD", "", "", data.clientEstimate.toFixed(2)]
      ];
    }

    const csv = rows.map((row) => row.map(esc).join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = blank ? "project-estimate-template.csv" : "project-estimate.csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
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
      

      case "website-redesign-cost-calculator": {
        const ids = ["wrDepth", "wrPages", "wrMigration", "wrContent", "wrSeo", "wrIntegrations", "wrUrgency", "wrProvider"];
        const els = ids.map((id) => document.getElementById(id));
        if (els.every(Boolean)) {
          const handler = () => CostTools.calculateWebsiteRedesignCost();
          els.forEach((el) => el.addEventListener("change", handler));
          handler();
        }
        break;
      }

      case "ecommerce-website-cost-calculator": {
        const ids = ["ecPlatform", "ecCatalog", "ecDesign", "ecIntegrations", "ecMigration", "ecInternational", "ecProvider"];
        const els = ids.map((id) => document.getElementById(id));
        if (els.every(Boolean)) {
          const handler = () => CostTools.calculateEcommerceWebsiteCost();
          els.forEach((el) => el.addEventListener("change", handler));
          handler();
        }
        break;
      }

      case "software-development-cost-calculator": {
        const ids = ["swType", "swModules", "swComplexity", "swIntegrations", "swMigration", "swCompliance", "swUrgency", "swProvider"];
        const els = ids.map((id) => document.getElementById(id));
        if (els.every(Boolean)) {
          const handler = () => CostTools.calculateSoftwareDevelopmentCost();
          els.forEach((el) => el.addEventListener("change", handler));
          handler();
        }
        break;
      }

      case "project-estimate-template": {
        const ids = ["peHours", "peRate", "peMaterials", "peSubcontractors", "peOverhead", "peContingency", "peMargin"];
        const els = ids.map((id) => document.getElementById(id));
        if (els.every(Boolean)) {
          const handler = () => CostTools.calculateProjectEstimateTemplate();
          els.forEach((el) => {
            el.addEventListener("change", handler);
            el.addEventListener("input", handler);
          });
          const filledBtn = document.getElementById("peDownloadFilled");
          const blankBtn = document.getElementById("peDownloadBlank");
          if (filledBtn) filledBtn.addEventListener("click", () => CostTools.downloadProjectEstimateCsv(false));
          if (blankBtn) blankBtn.addEventListener("click", () => CostTools.downloadProjectEstimateCsv(true));
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