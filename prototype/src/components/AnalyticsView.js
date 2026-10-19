// ===================================================================
// CUSTOMER ANALYTICS & PREDICTIVE TRENDS VIEW
// Funnel conversion, cohort health matrix, AI strategic summary
// ===================================================================

import { store } from '../state/store.js';
import { ChartService } from '../services/chartService.js';
import { formatCurrency, icons } from '../utils/helpers.js';

export class AnalyticsView {
  static render(container) {
    const customers = store.getCustomers();
    const deals = store.getDeals();
    const metrics = store.getMetrics();

    const healthyCount = customers.filter(c => c.healthScore >= 75).length;
    const warningCount = customers.filter(c => c.healthScore >= 50 && c.healthScore < 75).length;
    const criticalCount = customers.filter(c => c.healthScore < 50).length;

    // Cohorts
    const topChampions = [...customers]
      .filter(c => c.healthScore >= 80)
      .sort((a, b) => (b.ltv || 0) - (a.ltv || 0))
      .slice(0, 4);

    const atRiskCohort = [...customers]
      .filter(c => c.healthScore < 60 || c.churnRisk === 'High')
      .sort((a, b) => (b.mrr || 0) - (a.mrr || 0));

    container.innerHTML = `
      <div class="analytics-page animate-fade-in">
        <!-- Top Title -->
        <div style="margin-bottom: 24px;">
          <h1 style="font-size: 1.7rem; font-weight: 800; display: flex; align-items: center; gap: 10px;">
            Customer Intelligence & Analytics
            <span class="badge badge-ai">Predictive AI Engine</span>
          </h1>
          <p style="color: var(--text-secondary); font-size: 0.88rem; margin-top: 4px;">
            Multi-dimensional cohort retention, deal conversion velocity, and AI trend synthesis.
          </p>
        </div>

        <!-- Metric Summary Tiles -->
        <div class="metrics-grid">
          <div class="metric-card">
            <div class="metric-card-top">
              <span class="metric-title">NET RETENTION RATE (NRR)</span>
              <div class="metric-icon-wrap" style="color: #10b981;">
                ${icons.trendingUp}
              </div>
            </div>
            <div class="metric-val">118.2%</div>
            <div class="metric-delta positive">
              <span>+4.2% expansion vs baseline target</span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-card-top">
              <span class="metric-title">AVERAGE CUSTOMER LTV</span>
              <div class="metric-icon-wrap" style="color: #818cf8;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 6v2m0 8v2"/></svg>
              </div>
            </div>
            <div class="metric-val">${formatCurrency(Math.round(customers.reduce((s, c) => s + (c.ltv || 0), 0) / Math.max(1, customers.length)))}</div>
            <div class="metric-delta positive">
              <span>Healthy B2B enterprise distribution</span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-card-top">
              <span class="metric-title">AVG SALES CYCLE</span>
              <div class="metric-icon-wrap" style="color: #38bdf8;">
                ${icons.clock}
              </div>
            </div>
            <div class="metric-val">34 Days</div>
            <div class="metric-delta positive">
              <span>8 days faster than industry median</span>
            </div>
          </div>

          <div class="metric-card">
            <div class="metric-card-top">
              <span class="metric-title">PREDICTED CHURN RISK</span>
              <div class="metric-icon-wrap" style="color: var(--danger);">
                ${icons.alertTriangle}
              </div>
            </div>
            <div class="metric-val" style="color: #f87171;">4.8%</div>
            <div class="metric-delta negative">
              <span>${criticalCount} account(s) in critical watchband</span>
            </div>
          </div>
        </div>

        <!-- Charts Split: Funnel & Health Donut -->
        <div class="analytics-charts-grid">
          <!-- Funnel -->
          <div class="chart-card">
            <div class="chart-header">
              <div>
                <h3 class="card-title">Pipeline Stage Conversion Funnel</h3>
                <p class="card-desc">Volume and dollar value conversion from Lead to Won</p>
              </div>
              <span class="badge badge-info">75% Conversion Rate</span>
            </div>
            <div id="analytics-chart-funnel" style="padding: 10px 0; min-height: 220px;"></div>
          </div>

          <!-- Health Donut -->
          <div class="chart-card">
            <div class="chart-header">
              <div>
                <h3 class="card-title">Account Health Distribution</h3>
                <p class="card-desc">AI health tier segments</p>
              </div>
            </div>
            <div id="analytics-chart-health" style="min-height: 220px; display: flex; align-items: center; justify-content: center;"></div>
          </div>
        </div>

        <!-- AI Executive Trend Insights -->
        <div class="card" style="margin-bottom: 24px; border: 1px solid rgba(139, 92, 246, 0.35); background: linear-gradient(135deg, rgba(30, 41, 59, 0.8), rgba(23, 32, 51, 0.9));">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 12px;">
            <div style="width: 32px; height: 32px; border-radius: var(--radius-sm); background: var(--ai-gradient); display: flex; align-items: center; justify-content: center; color: #fff;">
              ${icons.sparkle}
            </div>
            <div>
              <h3 style="font-size: 1rem; font-weight: 700; color: #fff;">SmartAgent Autonomous Trend Report</h3>
              <span style="font-size: 0.72rem; color: var(--ai-cyan);">Synthesized across ${customers.length} customer records & ${deals.length} active opportunities</span>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 16px; font-size: 0.84rem; line-height: 1.5; color: var(--text-secondary);">
            <div style="background: rgba(15, 23, 42, 0.6); padding: 14px; border-radius: var(--radius-md); border-left: 3px solid #10b981;">
              <strong style="color: #6ee7b7; display: block; margin-bottom: 4px;">🚀 Expansion Velocity in FinTech & CleanTech</strong>
              Accounts in FinTech (FinEdge) and CleanTech (Hyperion) show 2.4x higher platform engagement and 100% renewal likelihood. Recommend packaging automated expansion proposals.
            </div>

            <div style="background: rgba(15, 23, 42, 0.6); padding: 14px; border-radius: var(--radius-md); border-left: 3px solid #ef4444;">
              <strong style="color: #f87171; display: block; margin-bottom: 4px;">⚠️ High Inactivity Hazard on Retail Deals</strong>
              Omnichannel retail accounts (Nexus Retail) experience a 45% decline in win probability when touchpoint gaps exceed 10 business days. Priority follow-up required.
            </div>

            <div style="background: rgba(15, 23, 42, 0.6); padding: 14px; border-radius: var(--radius-md); border-left: 3px solid #f59e0b;">
              <strong style="color: #fbbf24; display: block; margin-bottom: 4px;">🔄 Sponsor Turnover Churn Factor</strong>
              Vanguard Cyber Defense suffered key sponsor departure. Data shows 68% of enterprise churn occurs within 90 days of executive changes without proactive stakeholder reset.
            </div>
          </div>
        </div>

        <!-- Cohort Comparison: Champions vs At-Risk Accounts -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <!-- Champions -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title" style="color: #34d399;">
                ${icons.shieldCheck}
                <span>Top Expansion Champions</span>
              </h3>
              <span class="badge badge-success">Health >= 80</span>
            </div>

            <div style="display: flex; flex-direction: column; gap: 10px;">
              ${topChampions.map(c => `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: var(--bg-surface); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
                  <div>
                    <div style="font-weight: 700; color: #fff; font-size: 0.88rem;">${c.name}</div>
                    <div style="font-size: 0.74rem; color: var(--text-muted);">${c.contactPerson} &bull; ${c.industry}</div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-family: var(--font-mono); font-weight: 700; color: #34d399;">${c.healthScore}/100</div>
                    <div style="font-size: 0.72rem; color: var(--text-muted);">${formatCurrency(c.mrr)}/mo</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>

          <!-- At-Risk Accounts -->
          <div class="card">
            <div class="card-header">
              <h3 class="card-title" style="color: #f87171;">
                ${icons.alertTriangle}
                <span>At-Risk Vulnerability Cohort</span>
              </h3>
              <span class="badge badge-danger">Immediate Action</span>
            </div>

            <div style="display: flex; flex-direction: column; gap: 10px;">
              ${atRiskCohort.map(c => `
                <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: var(--bg-surface); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
                  <div>
                    <div style="font-weight: 700; color: #fff; font-size: 0.88rem;">${c.name}</div>
                    <div style="font-size: 0.74rem; color: #f87171;">Risk: ${c.churnRisk} &bull; Sentiment: ${c.sentiment}</div>
                  </div>
                  <div style="text-align: right;">
                    <div style="font-family: var(--font-mono); font-weight: 700; color: #f87171;">${c.healthScore}/100</div>
                    <div style="font-size: 0.72rem; color: var(--text-muted);">${formatCurrency(c.mrr * 12)} ARR</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;

    // Render Charts
    const funnelContainer = document.getElementById('analytics-chart-funnel');
    if (funnelContainer) ChartService.renderPipelineFunnel(funnelContainer, deals);

    const healthContainer = document.getElementById('analytics-chart-health');
    if (healthContainer) ChartService.renderCustomerHealthDonut(healthContainer, healthyCount, warningCount, criticalCount);
  }
}
