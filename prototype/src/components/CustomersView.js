// ===================================================================
// CUSTOMERS VIEW & 360° CUSTOMER PROFILE DRAWER
// Comprehensive client directory, multi-factor filtering, 360 drawer
// ===================================================================

import { store } from '../state/store.js';
import { aiAgent } from '../services/aiAgent.js';
import { formatCurrency, formatDate, timeAgo, getInitials, icons } from '../utils/helpers.js';
import { Toast } from './Toast.js';

export class CustomersView {
  static currentFilter = {
    search: '',
    tier: 'all',
    risk: 'all',
    health: 'all'
  };

  static render(container) {
    const customers = store.getCustomers();
    const filtered = this.getFilteredCustomers(customers);

    container.innerHTML = `
      <div class="customers-page animate-fade-in">
        <!-- Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
          <div>
            <h1 style="font-size: 1.7rem; font-weight: 800;">Customer Accounts & Directory</h1>
            <p style="color: var(--text-secondary); font-size: 0.88rem; margin-top: 4px;">
              Manage customer relationships, health scores, and 360° interaction timelines.
            </p>
          </div>
          <button class="btn btn-primary" id="btn-add-customer-view">
            ${icons.plus}
            <span>Add New Customer</span>
          </button>
        </div>

        <!-- Filter & Search Toolbar -->
        <div class="card" style="padding: 16px; margin-bottom: 20px;">
          <div style="display: flex; gap: 14px; flex-wrap: wrap; align-items: center;">
            <div style="flex: 1; min-width: 220px; position: relative;">
              <input type="text" id="customer-search-input" class="form-input" placeholder="Search by name, company, email..." value="${this.currentFilter.search}">
            </div>

            <!-- Tier Filter -->
            <div style="min-width: 150px;">
              <select id="customer-filter-tier" class="form-select">
                <option value="all" ${this.currentFilter.tier === 'all' ? 'selected' : ''}>All Tiers</option>
                <option value="Enterprise" ${this.currentFilter.tier === 'Enterprise' ? 'selected' : ''}>Enterprise</option>
                <option value="Mid-Market" ${this.currentFilter.tier === 'Mid-Market' ? 'selected' : ''}>Mid-Market</option>
                <option value="SMB" ${this.currentFilter.tier === 'SMB' ? 'selected' : ''}>SMB</option>
              </select>
            </div>

            <!-- Churn Risk Filter -->
            <div style="min-width: 150px;">
              <select id="customer-filter-risk" class="form-select">
                <option value="all" ${this.currentFilter.risk === 'all' ? 'selected' : ''}>All Churn Risks</option>
                <option value="High" ${this.currentFilter.risk === 'High' ? 'selected' : ''}>High Risk</option>
                <option value="Medium" ${this.currentFilter.risk === 'Medium' ? 'selected' : ''}>Medium Risk</option>
                <option value="Low" ${this.currentFilter.risk === 'Low' ? 'selected' : ''}>Low Risk</option>
              </select>
            </div>

            <!-- Health Filter -->
            <div style="min-width: 150px;">
              <select id="customer-filter-health" class="form-select">
                <option value="all" ${this.currentFilter.health === 'all' ? 'selected' : ''}>All Health Scores</option>
                <option value="good" ${this.currentFilter.health === 'good' ? 'selected' : ''}>Healthy (>=80)</option>
                <option value="warning" ${this.currentFilter.health === 'warning' ? 'selected' : ''}>Warning (50-79)</option>
                <option value="critical" ${this.currentFilter.health === 'critical' ? 'selected' : ''}>Critical (<50)</option>
              </select>
            </div>

            ${(this.currentFilter.search || this.currentFilter.tier !== 'all' || this.currentFilter.risk !== 'all' || this.currentFilter.health !== 'all') ? `
              <button class="btn btn-ghost btn-sm" id="btn-clear-customer-filters">Clear Filters</button>
            ` : ''}
          </div>
        </div>

        <!-- Customer Table -->
        <div class="table-container">
          <table class="crm-table">
            <thead>
              <tr>
                <th>Customer & Company</th>
                <th>Primary Contact</th>
                <th>Industry & Tier</th>
                <th>MRR / ARR</th>
                <th>AI Health Score</th>
                <th>Churn Risk</th>
                <th>Last Contact</th>
                <th style="text-align: right;">Actions</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length > 0 ? filtered.map(c => this.renderCustomerRow(c)).join('') : `
                <tr>
                  <td colspan="8" style="text-align: center; padding: 40px; color: var(--text-muted);">
                    No customers match the current filter criteria.
                  </td>
                </tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    `;

    this.bindEvents(container);
  }

  static getFilteredCustomers(customers) {
    return customers.filter(c => {
      // Search
      if (this.currentFilter.search) {
        const q = this.currentFilter.search.toLowerCase();
        const matches = (c.name && c.name.toLowerCase().includes(q)) ||
          (c.company && c.company.toLowerCase().includes(q)) ||
          (c.contactPerson && c.contactPerson.toLowerCase().includes(q)) ||
          (c.email && c.email.toLowerCase().includes(q));
        if (!matches) return false;
      }
      // Tier
      if (this.currentFilter.tier !== 'all' && c.tier !== this.currentFilter.tier) {
        return false;
      }
      // Risk
      if (this.currentFilter.risk !== 'all' && c.churnRisk !== this.currentFilter.risk) {
        return false;
      }
      // Health
      if (this.currentFilter.health === 'good' && c.healthScore < 80) return false;
      if (this.currentFilter.health === 'warning' && (c.healthScore < 50 || c.healthScore >= 80)) return false;
      if (this.currentFilter.health === 'critical' && c.healthScore >= 50) return false;

      return true;
    });
  }

  static renderCustomerRow(c) {
    let healthClass = 'health-high';
    if (c.healthScore < 50) healthClass = 'health-low';
    else if (c.healthScore < 80) healthClass = 'health-med';

    let riskBadge = 'badge-success';
    if (c.churnRisk === 'High') riskBadge = 'badge-danger';
    else if (c.churnRisk === 'Medium') riskBadge = 'badge-warning';

    return `
      <tr class="clickable row-customer-item" data-customer-id="${c.id}">
        <td>
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 36px; height: 36px; border-radius: var(--radius-md); background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(139,92,246,0.2)); border: 1px solid rgba(99,102,241,0.3); display: flex; align-items: center; justify-content: center; font-weight: 700; color: #c7d2fe; font-size: 0.8rem;">
              ${getInitials(c.name)}
            </div>
            <div>
              <div style="font-weight: 700; color: #fff;">${c.name}</div>
              <div style="font-size: 0.74rem; color: var(--text-muted);">${c.company || c.name}</div>
            </div>
          </div>
        </td>
        <td>
          <div style="font-weight: 600; color: var(--text-primary);">${c.contactPerson}</div>
          <div style="font-size: 0.74rem; color: var(--text-muted);">${c.email}</div>
        </td>
        <td>
          <div>${c.industry || 'Technology'}</div>
          <span class="badge badge-neutral" style="font-size: 0.68rem; margin-top: 2px;">${c.tier || 'Enterprise'}</span>
        </td>
        <td>
          <div style="font-weight: 700; font-family: var(--font-mono);">${formatCurrency(c.mrr)}<span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 400;">/mo</span></div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">ARR: ${formatCurrency(c.mrr * 12)}</div>
        </td>
        <td>
          <span class="health-score-pill ${healthClass}">
            ${c.healthScore}/100
          </span>
        </td>
        <td>
          <span class="badge ${riskBadge}">
            <span class="badge-dot"></span>
            ${c.churnRisk}
          </span>
        </td>
        <td>
          <div style="font-size: 0.82rem; color: var(--text-secondary);">${timeAgo(c.lastContact)}</div>
          <div style="font-size: 0.72rem; color: var(--text-muted);">${formatDate(c.lastContact)}</div>
        </td>
        <td style="text-align: right;" onclick="event.stopPropagation();">
          <div style="display: inline-flex; gap: 6px;">
            <button class="btn btn-secondary btn-sm btn-open-profile" data-customer-id="${c.id}" title="View 360° Profile">
              <span>Profile</span>
              ${icons.arrowRight}
            </button>
            <button class="btn btn-ghost btn-sm btn-delete-customer" data-customer-id="${c.id}" title="Delete Customer">
              ${icons.trash}
            </button>
          </div>
        </td>
      </tr>
    `;
  }

  static bindEvents(container) {
    // Add customer button
    const btnAdd = document.getElementById('btn-add-customer-view');
    if (btnAdd) {
      btnAdd.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('smartcrm:open-modal', { detail: { type: 'customer' } }));
      });
    }

    // Search input
    const searchInput = document.getElementById('customer-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.currentFilter.search = e.target.value;
        this.render(container);
      });
    }

    // Tier Filter
    const tierFilter = document.getElementById('customer-filter-tier');
    if (tierFilter) {
      tierFilter.addEventListener('change', (e) => {
        this.currentFilter.tier = e.target.value;
        this.render(container);
      });
    }

    // Risk Filter
    const riskFilter = document.getElementById('customer-filter-risk');
    if (riskFilter) {
      riskFilter.addEventListener('change', (e) => {
        this.currentFilter.risk = e.target.value;
        this.render(container);
      });
    }

    // Health Filter
    const healthFilter = document.getElementById('customer-filter-health');
    if (healthFilter) {
      healthFilter.addEventListener('change', (e) => {
        this.currentFilter.health = e.target.value;
        this.render(container);
      });
    }

    // Clear filters
    const btnClear = document.getElementById('btn-clear-customer-filters');
    if (btnClear) {
      btnClear.addEventListener('click', () => {
        this.currentFilter = { search: '', tier: 'all', risk: 'all', health: 'all' };
        this.render(container);
      });
    }

    // Open Profile Click (Row or Button)
    container.querySelectorAll('.row-customer-item, .btn-open-profile').forEach(el => {
      el.addEventListener('click', (e) => {
        const id = el.dataset.customerId;
        if (id) CustomersView.openCustomerDrawer(id);
      });
    });

    // Delete Customer
    container.querySelectorAll('.btn-delete-customer').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.customerId;
        const cust = store.getCustomerById(id);
        if (confirm(`Are you sure you want to remove ${cust ? cust.name : 'this customer'}?`)) {
          store.deleteCustomer(id);
          Toast.warning('Customer removed from CRM.');
        }
      });
    });
  }

  // ===================== 360° DRAWER =====================
  static openCustomerDrawer(customerId) {
    const customer = store.getCustomerById(customerId);
    if (!customer) return;

    const drawer = document.getElementById('customer-drawer');
    const backdrop = document.getElementById('customer-drawer-backdrop');
    if (!drawer || !backdrop) return;

    const deals = store.getDeals().filter(d => d.customerId === customerId);
    const activities = store.getActivities().filter(a => a.customerId === customerId);

    let healthColor = '#10b981';
    if (customer.healthScore < 50) healthColor = '#ef4444';
    else if (customer.healthScore < 80) healthColor = '#f59e0b';

    drawer.innerHTML = `
      <div class="drawer-header">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div style="width: 44px; height: 44px; border-radius: var(--radius-md); background: linear-gradient(135deg, #4f46e5, #06b6d4); display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1rem; color: #fff;">
            ${getInitials(customer.name)}
          </div>
          <div>
            <h2 style="font-size: 1.15rem; font-weight: 800; color: #fff;">${customer.name}</h2>
            <div style="font-size: 0.78rem; color: var(--text-secondary);">${customer.company} &bull; ${customer.tier}</div>
          </div>
        </div>
        <button class="btn-icon" id="btn-close-customer-drawer">
          ${icons.close}
        </button>
      </div>

      <div class="drawer-body">
        <!-- Quick KPI Snapshot -->
        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; margin-bottom: 20px;">
          <div style="background: var(--bg-surface); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); text-align: center;">
            <div style="font-size: 0.7rem; color: var(--text-muted); font-weight: 600;">MONTHLY MRR</div>
            <div style="font-size: 1.15rem; font-weight: 800; font-family: var(--font-mono); color: #fff; margin-top: 2px;">
              ${formatCurrency(customer.mrr)}
            </div>
          </div>
          <div style="background: var(--bg-surface); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); text-align: center;">
            <div style="font-size: 0.7rem; color: var(--text-muted); font-weight: 600;">HEALTH SCORE</div>
            <div style="font-size: 1.15rem; font-weight: 800; font-family: var(--font-mono); color: ${healthColor}; margin-top: 2px;">
              ${customer.healthScore}/100
            </div>
          </div>
          <div style="background: var(--bg-surface); padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); text-align: center;">
            <div style="font-size: 0.7rem; color: var(--text-muted); font-weight: 600;">CHURN RISK</div>
            <div style="font-size: 1.05rem; font-weight: 700; color: ${customer.churnRisk === 'High' ? 'var(--danger)' : customer.churnRisk === 'Medium' ? 'var(--warning)' : 'var(--success)'}; margin-top: 2px;">
              ${customer.churnRisk}
            </div>
          </div>
        </div>

        <!-- Contact info card -->
        <div class="card" style="padding: 16px; margin-bottom: 20px;">
          <h4 style="font-size: 0.85rem; font-weight: 700; margin-bottom: 12px; color: var(--text-secondary); text-transform: uppercase;">Primary Contact & Account</h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 0.84rem;">
            <div><span style="color: var(--text-muted);">Contact:</span> <strong style="color: #fff;">${customer.contactPerson}</strong></div>
            <div><span style="color: var(--text-muted);">Role:</span> <span>${customer.role || 'Executive'}</span></div>
            <div><span style="color: var(--text-muted);">Email:</span> <a href="mailto:${customer.email}">${customer.email}</a></div>
            <div><span style="color: var(--text-muted);">Phone:</span> <span>${customer.phone || 'N/A'}</span></div>
            <div><span style="color: var(--text-muted);">Owner:</span> <span>${customer.assignedTo || 'Alex Rivera'}</span></div>
            <div><span style="color: var(--text-muted);">Last Active:</span> <span>${timeAgo(customer.lastContact)}</span></div>
          </div>
        </div>

        <!-- AI Agent Insights & Recommendation Trigger -->
        <div class="card" style="border: 1px solid rgba(139, 92, 246, 0.4); background: rgba(30, 41, 59, 0.7); margin-bottom: 20px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
            <div style="display: flex; align-items: center; gap: 8px;">
              <span class="ai-sparkle-dot"></span>
              <strong style="color: #e0e7ff; font-size: 0.9rem;">SmartAgent Strategic Analysis</strong>
            </div>
            <button class="btn btn-ai btn-sm" id="btn-drawer-ai-draft" data-customer-id="${customer.id}">
              ${icons.sparkle}
              <span>Draft Outreach Email</span>
            </button>
          </div>
          <p style="font-size: 0.82rem; color: var(--text-secondary); line-height: 1.45;">
            ${customer.notes || 'Account tracking active. Regular cadence recommended to maintain renewal health.'}
          </p>
        </div>

        <!-- Active Deals for this customer -->
        <div style="margin-bottom: 20px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10px;">
            <h4 style="font-size: 0.88rem; font-weight: 700; text-transform: uppercase; color: var(--text-secondary);">Associated Deals (${deals.length})</h4>
          </div>
          ${deals.length > 0 ? deals.map(d => `
            <div style="padding: 12px; background: var(--bg-surface); border: 1px solid var(--border-medium); border-radius: var(--radius-md); margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
              <div>
                <div style="font-weight: 700; color: #fff; font-size: 0.88rem;">${d.title}</div>
                <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 2px;">
                  Stage: <span style="text-transform: capitalize; color: var(--primary-light); font-weight: 600;">${d.stage}</span> &bull; Win Prob: ${d.winProbability}%
                </div>
              </div>
              <div style="font-family: var(--font-heading); font-weight: 800; font-size: 1.05rem; color: #fff;">
                ${formatCurrency(d.value)}
              </div>
            </div>
          `).join('') : `
            <div style="font-size: 0.8rem; color: var(--text-muted); padding: 12px; background: var(--bg-surface); border-radius: var(--radius-md); text-align: center;">No open deals for this account.</div>
          `}
        </div>

        <!-- 360° Interaction Timeline & Log interaction form -->
        <div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px;">
            <h4 style="font-size: 0.88rem; font-weight: 700; text-transform: uppercase; color: var(--text-secondary);">Interaction History & Notes</h4>
          </div>

          <!-- Log new interaction form -->
          <div style="background: var(--bg-surface); padding: 14px; border-radius: var(--radius-md); border: 1px solid var(--border-medium); margin-bottom: 16px;">
            <div style="font-size: 0.78rem; font-weight: 700; color: #c7d2fe; margin-bottom: 8px;">+ Log New Interaction</div>
            <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 8px; margin-bottom: 8px;">
              <select id="log-type-select" class="form-select" style="font-size: 0.8rem; padding: 6px 10px;">
                <option value="call">Call Log</option>
                <option value="email">Email</option>
                <option value="meeting">Meeting</option>
                <option value="note">Internal Note</option>
              </select>
              <input type="text" id="log-title-input" class="form-input" placeholder="Title (e.g. Q4 Sync Call)" style="font-size: 0.8rem; padding: 6px 10px;">
            </div>
            <textarea id="log-content-input" class="form-textarea" placeholder="Enter meeting notes or feedback..." style="font-size: 0.8rem; min-height: 60px; margin-bottom: 8px;"></textarea>
            <div style="text-align: right;">
              <button class="btn btn-primary btn-sm" id="btn-save-interaction" data-customer-id="${customer.id}">
                Log Touchpoint
              </button>
            </div>
          </div>

          <!-- Timeline items -->
          <div style="display: flex; flex-direction: column; gap: 12px;">
            ${(customer.timeline && customer.timeline.length > 0) ? customer.timeline.map(tl => `
              <div style="padding: 12px; background: var(--bg-surface); border-radius: var(--radius-md); border: 1px solid var(--border-subtle); display: flex; gap: 10px;">
                <div style="width: 28px; height: 28px; border-radius: 50%; background: rgba(99, 102, 241, 0.15); display: flex; align-items: center; justify-content: center; color: var(--primary-light); flex-shrink: 0; margin-top: 2px;">
                  ${tl.type === 'call' ? icons.phone : tl.type === 'meeting' ? icons.calendar : tl.type === 'email' ? icons.mail : icons.edit}
                </div>
                <div style="flex: 1;">
                  <div style="display: flex; align-items: center; justify-content: space-between;">
                    <strong style="font-size: 0.86rem; color: #fff;">${tl.title}</strong>
                    <span style="font-size: 0.72rem; color: var(--text-muted);">${formatDate(tl.date)}</span>
                  </div>
                  <p style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px; line-height: 1.4; white-space: pre-line;">${tl.content}</p>
                  <div style="font-size: 0.7rem; color: var(--text-dim); margin-top: 4px;">By ${tl.author || 'Alex Rivera'}</div>
                </div>
              </div>
            `).join('') : `
              <div style="color: var(--text-muted); font-size: 0.82rem; text-align: center; padding: 16px;">No previous interactions recorded.</div>
            `}
          </div>
        </div>
      </div>
    `;

    drawer.classList.remove('hidden');
    backdrop.classList.remove('hidden');

    // Drawer Event Listeners
    const btnClose = document.getElementById('btn-close-customer-drawer');
    const closeDrawer = () => {
      drawer.classList.add('hidden');
      backdrop.classList.add('hidden');
    };
    if (btnClose) btnClose.addEventListener('click', closeDrawer);
    backdrop.addEventListener('click', closeDrawer, { once: true });

    // Save Interaction
    const btnSaveInteraction = document.getElementById('btn-save-interaction');
    if (btnSaveInteraction) {
      btnSaveInteraction.addEventListener('click', () => {
        const type = document.getElementById('log-type-select').value;
        const title = document.getElementById('log-title-input').value.trim();
        const content = document.getElementById('log-content-input').value.trim();

        if (!title || !content) {
          Toast.warning('Please enter both title and notes for the interaction.');
          return;
        }

        store.addTimelineEntry(customerId, { type, title, content });
        Toast.success('Interaction logged to timeline.');
        CustomersView.openCustomerDrawer(customerId); // Refresh drawer
      });
    }

    // AI Email Draft button in drawer
    const btnDraft = document.getElementById('btn-drawer-ai-draft');
    if (btnDraft) {
      btnDraft.addEventListener('click', () => {
        const draft = aiAgent.generateEmailDraft(customer, 'Strategic Follow-up');
        // Pre-fill interaction input with draft
        const titleInput = document.getElementById('log-title-input');
        const contentInput = document.getElementById('log-content-input');
        const typeSelect = document.getElementById('log-type-select');

        if (titleInput && contentInput && typeSelect) {
          typeSelect.value = 'email';
          titleInput.value = draft.subject;
          contentInput.value = draft.body;
          Toast.ai('AI email draft synthesized! Review and log to timeline.');
        }
      });
    }
  }
}
