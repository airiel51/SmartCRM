// ===================================================================
// APPLICATION ENTRY POINT & ROUTER
// Bootstraps navigation, views, global search, and AI copilot integration
// ===================================================================

import { store } from './state/store.js';
import { aiAgent } from './services/aiAgent.js';
import { DashboardView } from './components/DashboardView.js';
import { CustomersView } from './components/CustomersView.js';
import { PipelineView } from './components/PipelineView.js';
import { ActivitiesView } from './components/ActivitiesView.js';
import { AnalyticsView } from './components/AnalyticsView.js';
import { AICopilotDrawer } from './components/AICopilotDrawer.js';
import { Modals } from './components/Modals.js';
import { Toast } from './components/Toast.js';
import { icons } from './utils/helpers.js';

class App {
  constructor() {
    this.currentView = 'dashboard';
    this.mainContainer = document.getElementById('main-content');
  }

  init() {
    // Initialize AI Copilot Drawer
    AICopilotDrawer.init();

    // Bind Navigation & UI Controls
    this.bindNavigation();
    this.bindGlobalSearch();
    this.bindHeaderMenus();
    this.bindGlobalEvents();

    // Subscribe to store updates
    store.subscribe(() => {
      this.updateBadges();
      this.renderCurrentView();
    });

    // Initial render
    this.updateBadges();
    this.navigateTo('dashboard');
  }

  navigateTo(viewName) {
    this.currentView = viewName;

    // Update sidebar navigation active state
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(btn => {
      if (btn.dataset.view === viewName) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    this.renderCurrentView();
  }

  renderCurrentView() {
    if (!this.mainContainer) return;

    switch (this.currentView) {
      case 'dashboard':
        DashboardView.render(this.mainContainer);
        break;
      case 'customers':
        CustomersView.render(this.mainContainer);
        break;
      case 'pipeline':
        PipelineView.render(this.mainContainer);
        break;
      case 'activities':
        ActivitiesView.render(this.mainContainer);
        break;
      case 'analytics':
        AnalyticsView.render(this.mainContainer);
        break;
      default:
        DashboardView.render(this.mainContainer);
    }
  }

  updateBadges() {
    const customersBadge = document.getElementById('customers-count-badge');
    const pipelineBadge = document.getElementById('pipeline-count-badge');
    const tasksBadge = document.getElementById('tasks-overdue-badge');

    const metrics = store.getMetrics();

    if (customersBadge) customersBadge.textContent = metrics.customerCount;
    if (pipelineBadge) pipelineBadge.textContent = metrics.dealsCount;
    if (tasksBadge) {
      tasksBadge.textContent = metrics.overdueTasksCount;
      tasksBadge.style.display = metrics.overdueTasksCount > 0 ? 'inline-block' : 'none';
    }
  }

  bindNavigation() {
    // Nav Items
    document.querySelectorAll('.sidebar-nav .nav-item[data-view]').forEach(item => {
      item.addEventListener('click', () => {
        const view = item.dataset.view;
        this.navigateTo(view);
      });
    });

    // Mobile Sidebar Toggle
    const mobileBtn = document.getElementById('btn-toggle-sidebar');
    const sidebar = document.getElementById('app-sidebar');
    if (mobileBtn && sidebar) {
      mobileBtn.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
      });
    }

    // AI Copilot triggers
    const openCopilot = () => AICopilotDrawer.open();
    document.getElementById('btn-open-copilot-nav')?.addEventListener('click', openCopilot);
    document.getElementById('btn-topbar-copilot')?.addEventListener('click', openCopilot);
    document.getElementById('btn-floating-copilot')?.addEventListener('click', openCopilot);

    // AI Engine & Key Settings trigger
    document.getElementById('btn-topbar-ai-settings')?.addEventListener('click', () => {
      Modals.open('ai-settings');
    });

    // Sidebar AI Audit button
    document.getElementById('btn-trigger-ai-audit')?.addEventListener('click', async () => {
      const res = await aiAgent.runHealthAudit();
      Toast.ai(`SmartAgent audit completed for ${res.auditedCount} accounts!`);
    });
  }

  bindGlobalSearch() {
    const searchInput = document.getElementById('global-search-input');
    const searchDropdown = document.getElementById('search-dropdown');
    if (!searchInput || !searchDropdown) return;

    // Shortcut '/'
    window.addEventListener('keydown', (e) => {
      if (e.key === '/' && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput.focus();
      }
      if (e.key === 'Escape' && !searchDropdown.classList.contains('hidden')) {
        searchDropdown.classList.add('hidden');
      }
    });

    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      if (!q) {
        searchDropdown.classList.add('hidden');
        return;
      }

      const customers = store.getCustomers().filter(c =>
        c.name.toLowerCase().includes(q) ||
        (c.company && c.company.toLowerCase().includes(q)) ||
        (c.contactPerson && c.contactPerson.toLowerCase().includes(q))
      ).slice(0, 4);

      const deals = store.getDeals().filter(d =>
        d.title.toLowerCase().includes(q) ||
        d.customerName.toLowerCase().includes(q)
      ).slice(0, 4);

      const activities = store.getActivities().filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.customerName.toLowerCase().includes(q)
      ).slice(0, 3);

      if (customers.length === 0 && deals.length === 0 && activities.length === 0) {
        searchDropdown.innerHTML = `<div style="padding: 12px; font-size: 0.8rem; color: var(--text-muted); text-align: center;">No matching records found.</div>`;
        searchDropdown.classList.remove('hidden');
        return;
      }

      let html = '';

      if (customers.length > 0) {
        html += `<div class="search-result-group-title">Customers</div>`;
        customers.forEach(c => {
          html += `
            <div class="search-result-item" data-action="open-customer" data-id="${c.id}">
              <div>
                <strong style="font-size: 0.84rem; color: #fff;">${c.name}</strong>
                <div style="font-size: 0.72rem; color: var(--text-muted);">${c.contactPerson} &bull; ${c.tier}</div>
              </div>
              <span class="badge ${c.healthScore >= 80 ? 'badge-success' : c.healthScore < 50 ? 'badge-danger' : 'badge-warning'}">${c.healthScore}/100</span>
            </div>
          `;
        });
      }

      if (deals.length > 0) {
        html += `<div class="search-result-group-title">Deals</div>`;
        deals.forEach(d => {
          html += `
            <div class="search-result-item" data-action="open-pipeline">
              <div>
                <strong style="font-size: 0.84rem; color: #fff;">${d.title}</strong>
                <div style="font-size: 0.72rem; color: var(--text-muted);">${d.customerName} &bull; $${d.value.toLocaleString()}</div>
              </div>
              <span class="badge badge-neutral" style="text-transform: capitalize;">${d.stage}</span>
            </div>
          `;
        });
      }

      if (activities.length > 0) {
        html += `<div class="search-result-group-title">Activities</div>`;
        activities.forEach(a => {
          html += `
            <div class="search-result-item" data-action="open-activities">
              <div>
                <strong style="font-size: 0.84rem; color: #fff;">${a.title}</strong>
                <div style="font-size: 0.72rem; color: var(--text-muted);">${a.customerName} &bull; ${a.dueDate}</div>
              </div>
              <span class="badge badge-neutral" style="text-transform: capitalize;">${a.type}</span>
            </div>
          `;
        });
      }

      searchDropdown.innerHTML = html;
      searchDropdown.classList.remove('hidden');

      // Bind search clicks
      searchDropdown.querySelectorAll('.search-result-item').forEach(item => {
        item.addEventListener('click', () => {
          const action = item.dataset.action;
          const id = item.dataset.id;
          searchDropdown.classList.add('hidden');
          searchInput.value = '';

          if (action === 'open-customer' && id) {
            this.navigateTo('customers');
            setTimeout(() => CustomersView.openCustomerDrawer(id), 100);
          } else if (action === 'open-pipeline') {
            this.navigateTo('pipeline');
          } else if (action === 'open-activities') {
            this.navigateTo('activities');
          }
        });
      });
    });

    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
        searchDropdown.classList.add('hidden');
      }
    });
  }

  bindHeaderMenus() {
    // Quick Create Dropdown
    const btnQuickCreate = document.getElementById('btn-quick-create');
    const menuQuickCreate = document.getElementById('quick-create-menu');
    if (btnQuickCreate && menuQuickCreate) {
      btnQuickCreate.addEventListener('click', (e) => {
        e.stopPropagation();
        menuQuickCreate.classList.toggle('hidden');
      });
    }

    // Data Menu Dropdown
    const btnData = document.getElementById('btn-data-menu');
    const menuData = document.getElementById('data-dropdown-menu');
    if (btnData && menuData) {
      btnData.addEventListener('click', (e) => {
        e.stopPropagation();
        menuData.classList.toggle('hidden');
      });
    }

    // Close dropdowns on outside click
    document.addEventListener('click', () => {
      menuQuickCreate?.classList.add('hidden');
      menuData?.classList.add('hidden');
    });

    // Create New Customer
    document.getElementById('btn-new-customer')?.addEventListener('click', () => {
      menuQuickCreate?.classList.add('hidden');
      Modals.open('customer');
    });

    // Create New Deal
    document.getElementById('btn-new-deal')?.addEventListener('click', () => {
      menuQuickCreate?.classList.add('hidden');
      Modals.open('deal');
    });

    // Create New Activity
    document.getElementById('btn-new-activity')?.addEventListener('click', () => {
      menuQuickCreate?.classList.add('hidden');
      Modals.open('activity');
    });

    // Export Data JSON
    document.getElementById('btn-export-data')?.addEventListener('click', () => {
      menuData?.classList.add('hidden');
      const json = store.exportDataJson();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `SmartCRM_Export_${new Date().toISOString().split('T')[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      Toast.success('CRM database exported to JSON file.');
    });

    // Reset Demo Data
    document.getElementById('btn-reset-demo-data')?.addEventListener('click', () => {
      menuData?.classList.add('hidden');
      if (confirm('Reset CRM database back to initial demo data? Any custom entries will be restored to defaults.')) {
        store.resetToInitial(true);
        Toast.warning('CRM state reset to default demo dataset.');
      }
    });
  }

  bindGlobalEvents() {
    // Custom navigate event
    window.addEventListener('smartcrm:navigate', (e) => {
      this.navigateTo(e.detail);
    });

    // Custom open modal event
    window.addEventListener('smartcrm:open-modal', (e) => {
      const { type, options } = e.detail;
      Modals.open(type, options);
    });

    // Custom open copilot event
    window.addEventListener('smartcrm:open-copilot', () => {
      AICopilotDrawer.open();
    });
  }
}

// Bootstrap Application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
