// ===================================================================
// INTERACTIVE SVG CHART SERVICE
// High-performance, crisp, responsive SVG data visualizations
// ===================================================================

export class ChartService {
  /**
   * Render Pipeline Conversion Funnel
   */
  static renderPipelineFunnel(container, deals) {
    if (!container) return;
    
    const stages = [
      { key: 'lead', label: 'Lead', color: '#38bdf8' },
      { key: 'qualified', label: 'Qualified', color: '#818cf8' },
      { key: 'proposal', label: 'Proposal', color: '#c084fc' },
      { key: 'negotiation', label: 'Negotiation', color: '#f59e0b' },
      { key: 'won', label: 'Closed Won', color: '#10b981' }
    ];

    const maxVal = Math.max(1, deals.length);

    let html = `<div class="funnel-container">`;
    stages.forEach(st => {
      const stageDeals = deals.filter(d => d.stage === st.key);
      const totalAmount = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);
      const pct = Math.max(15, Math.round((stageDeals.length / maxVal) * 100));

      html += `
        <div class="funnel-row">
          <div class="funnel-label">${st.label} (${stageDeals.length})</div>
          <div class="funnel-bar-bg">
            <div class="funnel-bar-fill" style="width: ${pct}%; background: ${st.color};">
              <span class="funnel-val">$${(totalAmount / 1000).toFixed(0)}k</span>
            </div>
          </div>
        </div>
      `;
    });
    html += `</div>`;
    container.innerHTML = html;
  }

  /**
   * Render Customer Health Donut Chart using SVG
   */
  static renderCustomerHealthDonut(container, healthyCount, warningCount, criticalCount) {
    if (!container) return;

    const total = Math.max(1, healthyCount + warningCount + criticalCount);
    const pHealthy = (healthyCount / total) * 100;
    const pWarning = (warningCount / total) * 100;
    const pCritical = (criticalCount / total) * 100;

    // SVG donut calculations
    const radius = 55;
    const circumference = 2 * Math.PI * radius; // ~345.57

    const offsetHealthy = 0;
    const strokeHealthy = (pHealthy / 100) * circumference;

    const offsetWarning = -strokeHealthy;
    const strokeWarning = (pWarning / 100) * circumference;

    const offsetCritical = -(strokeHealthy + strokeWarning);
    const strokeCritical = (pCritical / 100) * circumference;

    const svg = `
      <div style="display: flex; align-items: center; justify-content: space-around; width: 100%; height: 100%; gap: 16px;">
        <div style="position: relative; width: 150px; height: 150px;">
          <svg width="150" height="150" viewBox="0 0 150 150" class="chart-svg" style="transform: rotate(-90deg);">
            <!-- Background ring -->
            <circle cx="75" cy="75" r="${radius}" fill="transparent" stroke="rgba(255,255,255,0.06)" stroke-width="18" />
            
            <!-- Healthy Arc -->
            <circle cx="75" cy="75" r="${radius}" fill="transparent" stroke="#10b981" stroke-width="18"
              stroke-dasharray="${strokeHealthy} ${circumference}"
              stroke-dashoffset="${offsetHealthy}"
              stroke-linecap="round" />

            <!-- Warning Arc -->
            <circle cx="75" cy="75" r="${radius}" fill="transparent" stroke="#f59e0b" stroke-width="18"
              stroke-dasharray="${strokeWarning} ${circumference}"
              stroke-dashoffset="${offsetWarning}" />

            <!-- Critical Arc -->
            <circle cx="75" cy="75" r="${radius}" fill="transparent" stroke="#ef4444" stroke-width="18"
              stroke-dasharray="${strokeCritical} ${circumference}"
              stroke-dashoffset="${offsetCritical}" />
          </svg>
          <div style="position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; pointer-events: none;">
            <span style="font-family: var(--font-heading); font-size: 1.4rem; font-weight: 800; color: #fff;">${total}</span>
            <span style="font-size: 0.68rem; color: var(--text-muted); text-transform: uppercase;">Accounts</span>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 8px;">
          <div style="display: flex; align-items: center; gap: 8px; font-size: 0.8rem;">
            <span style="width: 10px; height: 10px; border-radius: 50%; background: #10b981;"></span>
            <span style="color: var(--text-secondary); width: 70px;">Healthy:</span>
            <span style="font-weight: 700; color: #fff;">${healthyCount} (${pHealthy.toFixed(0)}%)</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px; font-size: 0.8rem;">
            <span style="width: 10px; height: 10px; border-radius: 50%; background: #f59e0b;"></span>
            <span style="color: var(--text-secondary); width: 70px;">Attention:</span>
            <span style="font-weight: 700; color: #fff;">${warningCount} (${pWarning.toFixed(0)}%)</span>
          </div>
          <div style="display: flex; align-items: center; gap: 8px; font-size: 0.8rem;">
            <span style="width: 10px; height: 10px; border-radius: 50%; background: #ef4444;"></span>
            <span style="color: var(--text-secondary); width: 70px;">Critical:</span>
            <span style="font-weight: 700; color: #fff;">${criticalCount} (${pCritical.toFixed(0)}%)</span>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = svg;
  }

  /**
   * Render ARR Trend Area Chart using SVG
   */
  static renderRevenueTrendChart(container) {
    if (!container) return;

    const dataPoints = [
      { month: 'May', arr: 920 },
      { month: 'Jun', arr: 1040 },
      { month: 'Jul', arr: 1180 },
      { month: 'Aug', arr: 1320 },
      { month: 'Sep', arr: 1490 },
      { month: 'Oct', arr: 1680 }
    ];

    const width = 450;
    const height = 180;
    const padding = { top: 20, right: 20, bottom: 30, left: 45 };

    const minArr = 800;
    const maxArr = 1800;

    const getX = i => padding.left + (i / (dataPoints.length - 1)) * (width - padding.left - padding.right);
    const getY = val => height - padding.bottom - ((val - minArr) / (maxArr - minArr)) * (height - padding.top - padding.bottom);

    let pathD = '';
    let areaD = '';

    dataPoints.forEach((pt, i) => {
      const x = getX(i);
      const y = getY(pt.arr);
      if (i === 0) {
        pathD += `M ${x} ${y}`;
        areaD += `M ${x} ${height - padding.bottom} L ${x} ${y}`;
      } else {
        pathD += ` L ${x} ${y}`;
        areaD += ` L ${x} ${y}`;
      }
    });

    const lastX = getX(dataPoints.length - 1);
    areaD += ` L ${lastX} ${height - padding.bottom} Z`;

    const svg = `
      <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" class="chart-svg">
        <defs>
          <linearGradient id="area-gradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#6366f1" stop-opacity="0.45" />
            <stop offset="100%" stop-color="#6366f1" stop-opacity="0.0" />
          </linearGradient>
        </defs>

        <!-- Horizontal grid lines -->
        <line x1="${padding.left}" y1="${getY(1000)}" x2="${width - padding.right}" y2="${getY(1000)}" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3 3" />
        <line x1="${padding.left}" y1="${getY(1400)}" x2="${width - padding.right}" y2="${getY(1400)}" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3 3" />

        <!-- Area fill -->
        <path d="${areaD}" fill="url(#area-gradient)" />

        <!-- Line stroke -->
        <path d="${pathD}" fill="none" stroke="#6366f1" stroke-width="3" stroke-linecap="round" />

        <!-- Data circles -->
        ${dataPoints.map((pt, i) => `
          <circle cx="${getX(i)}" cy="${getY(pt.arr)}" r="4" fill="#818cf8" stroke="#0f172a" stroke-width="2" />
        `).join('')}

        <!-- X Axis labels -->
        ${dataPoints.map((pt, i) => `
          <text x="${getX(i)}" y="${height - 8}" text-anchor="middle" fill="#64748b" font-size="10" font-family="var(--font-main)">${pt.month}</text>
        `).join('')}

        <!-- Y Axis labels -->
        <text x="${padding.left - 8}" y="${getY(1000) + 3}" text-anchor="end" fill="#64748b" font-size="9">$1.0M</text>
        <text x="${padding.left - 8}" y="${getY(1400) + 3}" text-anchor="end" fill="#64748b" font-size="9">$1.4M</text>
      </svg>
    `;

    container.innerHTML = svg;
  }
}
