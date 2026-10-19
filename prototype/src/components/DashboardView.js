// ===================================================================
// DASHBOARD VIEW
// Executive KPIs, AI Recommended Actions Stream, Visual Analytics
// ===================================================================

import { store } from '../state/store.js';
import { aiAgent } from '../services/aiAgent.js';
import { ChartService } from '../services/chartService.js';
import { formatCurrency, formatDate, timeAgo, icons } from '../utils/helpers.js';
import { Toast } from './Toast.js';

export class DashboardView {
  static render(container) {
    const metrics = store.getMetrics();
    const recommendations = store.getRecommendations();
    const customers = store.getCustomers();
    const activities = store.getActivities();

    const healthyCount = customers.filter(c => c.healthScore >= 75).length;
    const warningCount = customers.filter(c => c.healthScore >= 50 && c.healthScore < 75).length;
    const criticalCount = customers.filter(c => c.healthScore < 50).length;

    container.innerHTML = `
      <div class="dashboard-page animate-fade-in">
        <!-- Dashboard Top Hero -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
          <div>
            <h1 style="font-size: 1.7rem; font-weight: 800; display: flex; align-items: center; gap: 10px;">
              Executive CRM & Intelligence Hub
              <span class="badge badge-ai">
                <span class="badge-dot" style="background: var(--ai-cyan)"></span>
                AI Active
              </span>
            </h1>
            <p style="color: var(--text-secondary); font-size: 0.88rem; margin-top: 4px;">
              Live pipeline velocity, account health diagnostics, and agentic sales automations.
            </p>
          </div>

          <div style="display: flex; align-items: center; gap: 12px;">
            <button class="btn btn-secondary btn-sm" id="dash-btn-open-copilot">
              ${icons.sparkle}
              <span>Ask Copilot</span>
            </button>
            <button class="btn btn-ai btn-sm" id="dash-btn-audit">
              <span id="audit-icon">${icons.shieldCheck}</span>
              <span id="audit-text">Run Autonomous Audit</span>
            </button>
          </div>
        </div>

        <!-- Executive Metrics KPI Grid -->
        <div class="metrics-grid">
          <!-- Total ARR -->
          <div class="metric-card">
            <div class="metric-card-top">
              <span class="metric-title">ANNUAL RUN RATE (ARR)</span>
              <div class="metric-icon-wrap" style="color: #818cf8;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 6v2m0 8v2"/></svg>
              </div>
            </div>
            <div class="metric-val">${formatCurrency(metrics.totalARR)}</div>
            <div class="metric-delta positive">
              ${icons.trendingUp}
              <span>+18.4% vs last quarter (MRR: ${formatCurrency(metrics.totalMRR)})</span>
            </div>
          </div>

          <!-- Active Pipeline -->
          <div class="metric-card">
            <div class="metric-card-top">
              <span class="metric-title">ACTIVE SALES PIPELINE</span>
              <div class="metric-icon-wrap" style="color: #38bdf8;">
                ${icons.pipeline}
              </div>
            </div>
            <div class="metric-val">${formatCurrency(metrics.totalPipeline)}</div>
            <div class="metric-delta positive">
              ${icons.trendingUp}
              <span>${metrics.dealsCount} active qualified deals</span>
            </div>
          </div>

          <!-- Win Rate -->
          <div class="metric-card">
            <div class="metric-card-top">
              <span class="metric-title">STAGE WIN RATE</span>
              <div class="metric-icon-wrap" style="color: #10b981;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg>
              </div>
            </div>
            <div class="metric-val">${metrics.winRate}%</div>
            <div class="metric-delta positive">
              ${icons.trendingUp}
              <span>${formatCurrency(metrics.totalWon)} won deals closed</span>
            </div>
          </div>

          <!-- At-Risk ARR -->
          <div class="metric-card" style="border-left: 3px solid ${metrics.atRiskARR > 0 ? 'var(--danger)' : 'var(--success)'};">
            <div class="metric-card-top">
              <span class="metric-title">AT-RISK VULNERABLE ARR</span>
              <div class="metric-icon-wrap" style="color: var(--danger);">
                ${icons.alertTriangle}
              </div>
            </div>
            <div class="metric-val" style="color: ${metrics.atRiskARR > 0 ? '#f87171' : 'var(--success)'};">
              ${formatCurrency(metrics.atRiskARR)}
            </div>
            <div class="metric-delta ${metrics.atRiskARR > 0 ? 'negative' : 'positive'}">
              ${metrics.atRiskARR > 0 ? icons.trendingDown : icons.shieldCheck}
              <span>${metrics.highRiskCount} account(s) flagged for churn risk</span>
            </div>
          </div>
        </div>

        <!-- Main Dashboard Split Layout -->
        <div class="analytics-charts-grid">
          <!-- Left Main Column (Growth & Activity) -->
          <div style="display: flex; flex-direction: column; gap: 20px;">
            <!-- Revenue Trend Chart -->
            <div class="chart-card">
              <div class="chart-header">
                <div>
                  <h3 class="card-title">
                    <span>Revenue Velocity & ARR Trajectory</span>
                  </h3>
                  <p class="card-desc">6-month expansion trajectory with compounding renewals</p>
                </div>
                <span class="badge badge-success">On Track +24%</span>
              </div>
              <div id="dash-chart-revenue" class="chart-canvas-wrap"></div>
            </div>

            <!-- Recent Customer Interactions Timeline -->
            <div class="card">
              <div class="card-header">
                <div>
                  <h3 class="card-title">Recent Touchpoints & Interactions</h3>
                  <p class="card-desc">Latest meetings, calls, and agentic workflows</p>
                </div>
                <button class="btn btn-ghost btn-sm" id="btn-view-all-activities">View All Activities</button>
              </div>

              <div style="display: flex; flex-direction: column; gap: 12px;">
                ${this.renderRecentActivities(activities)}
              </div>
            </div>
          </div>

          <!-- Right Column: AI Recommendations & Health Donut -->
          <div style="display: flex; flex-direction: column; gap: 20px;">
            <!-- AI Recommended Actions Card -->
            <div class="card" style="border: 1px solid rgba(139, 92, 246, 0.3); background: rgba(30, 41, 59, 0.85);">
              <div class="card-header">
                <div>
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="ai-sparkle-dot"></span>
                    <h3 class="card-title" style="color: #e0e7ff;">Agentic Next-Best Actions</h3>
                  </div>
                  <p class="card-desc">AI recommendations ready for 1-click execution</p>
                </div>
                <span class="badge badge-ai">${recommendations.length} Actionable</span>
              </div>

              <div class="recommendations-feed" id="recommendations-feed-container">
                ${this.renderRecommendations(recommendations)}
              </div>
            </div>

            <!-- Customer Health Donut -->
            <div class="chart-card">
              <div class="chart-header">
                <div>
                  <h3 class="card-title">Account Health Distribution</h3>
                  <p class="card-desc">Calculated by engagement, sentiment, and ARR stability</p>
                </div>
              </div>
              <div id="dash-chart-health" style="height: 180px; display: flex; align-items: center; justify-content: center;"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Render interactive SVG Charts
    const revContainer = document.getElementById('dash-chart-revenue');
    if (revContainer) ChartService.renderRevenueTrendChart(revContainer);

    const healthContainer = document.getElementById('dash-chart-health');
    if (healthContainer) ChartService.renderCustomerHealthDonut(healthContainer, healthyCount, warningCount, criticalCount);

    // Event Bindings
    this.bindEvents(container);
  }

  static renderRecommendations(recommendations) {
    if (!recommendations || recommendations.length === 0) {
      return `
        <div style="text-align: center; padding: 24px; color: var(--text-muted); font-size: 0.85rem;">
          <div style="margin-bottom: 8px; color: #10b981;">${icons.shieldCheck}</div>
          All accounts in optimal cadence. No immediate hazards detected!
        </div>
      `;
    }

    return recommendations.map(rec => `
      <div class="recommendation-card priority-${rec.priority}">
        <div class="rec-header">
          <span class="rec-account">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
            ${rec.customerName}
          </span>
          <span class="badge ${rec.priority === 'high' ? 'badge-danger' : rec.priority === 'medium' ? 'badge-warning' : 'badge-info'}">
            ${rec.priority.toUpperCase()}
          </span>
        </div>
        <div class="rec-title">${rec.title}</div>
        <div class="rec-desc">${rec.description}</div>
        <div class="rec-actions">
          <span class="rec-impact">${rec.impact}</span>
          <div style="display: flex; gap: 8px;">
            <button class="btn btn-ghost btn-sm btn-dismiss-rec" data-rec-id="${rec.id}" title="Dismiss">
              Dismiss
            </button>
            <button class="btn btn-ai btn-sm btn-execute-rec" data-rec-id="${rec.id}">
              ${icons.sparkle}
              <span>Execute</span>
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  static renderRecentActivities(activities) {
    const list = activities.slice(0, 4);
    if (list.length === 0) {
      return `<div style="color: var(--text-muted); font-size: 0.85rem; padding: 12px 0;">No recent activities logged.</div>`;
    }

    return list.map(act => {
      let icon = icons.clock;
      if (act.type === 'call') icon = icons.phone;
      if (act.type === 'meeting') icon = icons.calendar;
      if (act.type === 'email') icon = icons.mail;

      return `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: var(--bg-surface); border-radius: var(--radius-md); border: 1px solid var(--border-subtle);">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 32px; height: 32px; border-radius: var(--radius-sm); background: rgba(99, 102, 241, 0.12); display: flex; align-items: center; justify-content: center; color: var(--primary-light);">
              ${icon}
            </div>
            <div>
              <div style="font-weight: 600; font-size: 0.86rem; color: var(--text-primary);">${act.title}</div>
              <div style="font-size: 0.74rem; color: var(--text-muted);">${act.customerName} &bull; Assigned to ${act.assignedTo || 'Alex Rivera'}</div>
            </div>
          </div>
          <div style="text-align: right;">
            <span class="badge ${act.completed ? 'badge-success' : (act.dueDate < new Date().toISOString().split('T')[0] ? 'badge-danger' : 'badge-neutral')}">
              ${act.completed ? 'Completed' : (act.dueDate < new Date().toISOString().split('T')[0] ? 'Overdue' : 'Due ' + formatDate(act.dueDate))}
            </span>
          </div>
        </div>
      `;
    }).join('');
  }

  static bindEvents(container) {
    // Autonomous Audit Button
    const btnAudit = document.getElementById('dash-btn-audit');
    if (btnAudit) {
      btnAudit.addEventListener('click', async () => {
        const icon = document.getElementById('audit-icon');
        const text = document.getElementById('audit-text');
        if (icon) icon.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="animation: spin 1s infinite linear;"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>`;
        if (text) text.textContent = 'Auditing Accounts...';
        btnAudit.disabled = true;

        setTimeout(async () => {
          const res = await aiAgent.runHealthAudit();
          Toast.ai(`SmartAgent audit complete! Processed ${res.auditedCount} accounts, updated ${res.updatedScores} health scores, generated ${res.generatedRecommendations} recommendations.`);
          if (icon) icon.innerHTML = icons.shieldCheck;
          if (text) text.textContent = 'Run Autonomous Audit';
          btnAudit.disabled = false;
        }, 800);
      });
    }

    // Open Copilot from Dashboard
    const btnOpenCopilot = document.getElementById('dash-btn-open-copilot');
    if (btnOpenCopilot) {
      btnOpenCopilot.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('smartcrm:open-copilot'));
      });
    }

    // View All Activities
    const btnViewActivities = document.getElementById('btn-view-all-activities');
    if (btnViewActivities) {
      btnViewActivities.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('smartcrm:navigate', { detail: 'activities' }));
      });
    }

    // Execute Recommendation
    container.querySelectorAll('.btn-execute-rec').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const recId = btn.dataset.recId;
        const res = await aiAgent.executeRecommendation(recId);
        if (res.success) {
          Toast.ai(`Executed: ${res.message}`);
        } else {
          Toast.danger(res.message);
        }
      });
    });

    // Dismiss Recommendation
    container.querySelectorAll('.btn-dismiss-rec').forEach(btn => {
      btn.addEventListener('click', () => {
        const recId = btn.dataset.recId;
        store.dismissRecommendation(recId);
        Toast.warning('Recommendation dismissed.');
      });
    });
  }
}
