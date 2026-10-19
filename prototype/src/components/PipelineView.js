// ===================================================================
// PIPELINE KANBAN VIEW
// Drag-and-drop visual pipeline, stage transitions, deal forecasts
// ===================================================================

import { store } from '../state/store.js';
import { formatCurrency, formatDate, icons } from '../utils/helpers.js';
import { Toast } from './Toast.js';

export class PipelineView {
  static STAGES = [
    { id: 'lead', title: 'Lead In', color: '#38bdf8', class: 'indicator-lead' },
    { id: 'qualified', title: 'Qualified', color: '#818cf8', class: 'indicator-qualified' },
    { id: 'proposal', title: 'Proposal / Demo', color: '#c084fc', class: 'indicator-proposal' },
    { id: 'negotiation', title: 'Negotiation', color: '#f59e0b', class: 'indicator-negotiation' },
    { id: 'won', title: 'Closed Won', color: '#10b981', class: 'indicator-won' },
    { id: 'lost', title: 'Closed Lost', color: '#ef4444', class: 'indicator-lost' }
  ];

  static render(container) {
    const deals = store.getDeals();
    const activeDeals = deals.filter(d => d.stage !== 'lost');
    const totalPipelineVal = activeDeals.reduce((sum, d) => sum + (d.value || 0), 0);
    const weightedForecast = activeDeals.reduce((sum, d) => sum + ((d.value || 0) * (d.winProbability || 50) / 100), 0);
    const wonVal = deals.filter(d => d.stage === 'won').reduce((sum, d) => sum + (d.value || 0), 0);

    container.innerHTML = `
      <div class="pipeline-page animate-fade-in">
        <!-- Pipeline Top Header -->
        <div class="pipeline-header">
          <div>
            <h1 style="font-size: 1.7rem; font-weight: 800;">Visual Sales Pipeline</h1>
            <p style="color: var(--text-secondary); font-size: 0.88rem; margin-top: 4px;">
              Kanban stage progression, win probability forecasting, and AI deal health flags.
            </p>
          </div>

          <div style="display: flex; align-items: center; gap: 12px;">
            <button class="btn btn-primary" id="btn-add-deal-view">
              ${icons.plus}
              <span>Add New Deal</span>
            </button>
          </div>
        </div>

        <!-- Pipeline Summary Stats Bar -->
        <div class="pipeline-summary-bar" style="margin-bottom: 24px;">
          <div class="pipeline-stat-item">
            <span class="pipeline-stat-label">Total Pipeline</span>
            <span class="pipeline-stat-val">${formatCurrency(totalPipelineVal)}</span>
          </div>
          <div style="width: 1px; height: 32px; background: var(--border-medium);"></div>
          <div class="pipeline-stat-item">
            <span class="pipeline-stat-label">Weighted Forecast</span>
            <span class="pipeline-stat-val" style="color: #818cf8;">${formatCurrency(weightedForecast)}</span>
          </div>
          <div style="width: 1px; height: 32px; background: var(--border-medium);"></div>
          <div class="pipeline-stat-item">
            <span class="pipeline-stat-label">Closed Won</span>
            <span class="pipeline-stat-val" style="color: #10b981;">${formatCurrency(wonVal)}</span>
          </div>
          <div style="width: 1px; height: 32px; background: var(--border-medium);"></div>
          <div class="pipeline-stat-item">
            <span class="pipeline-stat-label">Active Opportunities</span>
            <span class="pipeline-stat-val">${activeDeals.length} Deals</span>
          </div>
        </div>

        <!-- Kanban Board Columns -->
        <div class="kanban-board" id="kanban-board-container">
          ${this.STAGES.map(stage => this.renderColumn(stage, deals)).join('')}
        </div>
      </div>
    `;

    this.bindEvents(container);
  }

  static renderColumn(stage, deals) {
    const stageDeals = deals.filter(d => d.stage === stage.id);
    const stageSum = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);

    return `
      <div class="kanban-column" data-stage="${stage.id}">
        <div class="column-header">
          <div class="column-title-group">
            <div class="column-indicator ${stage.class}"></div>
            <span class="column-title">${stage.title}</span>
            <span class="column-count">${stageDeals.length}</span>
          </div>
          <span class="column-total">${formatCurrency(stageSum)}</span>
        </div>

        <div class="column-cards" data-stage="${stage.id}">
          ${stageDeals.length > 0 ? stageDeals.map(deal => this.renderDealCard(deal)).join('') : `
            <div style="text-align: center; padding: 24px 10px; color: var(--text-dim); font-size: 0.78rem;">
              No deals in ${stage.title}
            </div>
          `}
        </div>
      </div>
    `;
  }

  static renderDealCard(deal) {
    return `
      <div class="deal-card" draggable="true" data-deal-id="${deal.id}">
        <div class="deal-card-header">
          <div class="deal-title">${deal.title}</div>
          <div class="dropdown-wrapper" onclick="event.stopPropagation();">
            <select class="form-select select-stage-quick" data-deal-id="${deal.id}" style="padding: 2px 6px; font-size: 0.7rem; background: var(--bg-surface-elevated); border-radius: var(--radius-sm); border: 1px solid var(--border-subtle); color: var(--text-secondary);">
              <option value="lead" ${deal.stage === 'lead' ? 'selected' : ''}>Lead</option>
              <option value="qualified" ${deal.stage === 'qualified' ? 'selected' : ''}>Qualified</option>
              <option value="proposal" ${deal.stage === 'proposal' ? 'selected' : ''}>Proposal</option>
              <option value="negotiation" ${deal.stage === 'negotiation' ? 'selected' : ''}>Negotiation</option>
              <option value="won" ${deal.stage === 'won' ? 'selected' : ''}>Won</option>
              <option value="lost" ${deal.stage === 'lost' ? 'selected' : ''}>Lost</option>
            </select>
          </div>
        </div>

        <div class="deal-customer">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
          <span>${deal.customerName}</span>
        </div>

        <div class="deal-value">${formatCurrency(deal.value)}</div>

        <!-- Win Probability -->
        <div style="margin-top: 10px;">
          <div style="display: flex; justify-content: space-between; font-size: 0.72rem; color: var(--text-muted);">
            <span>Win Probability</span>
            <span style="font-weight: 700; color: #fff;">${deal.winProbability}%</span>
          </div>
          <div class="deal-probability-bar">
            <div class="deal-probability-fill" style="width: ${deal.winProbability}%;"></div>
          </div>
        </div>

        ${deal.aiInsight ? `
          <div class="deal-ai-flag">
            <span class="ai-sparkle-dot"></span>
            <span>${deal.aiInsight}</span>
          </div>
        ` : ''}

        <div class="deal-meta-footer">
          <span>Close: ${formatDate(deal.expectedClose)}</span>
          <button class="deal-actions-btn btn-delete-deal" data-deal-id="${deal.id}" title="Delete Deal">
            ${icons.trash}
          </button>
        </div>
      </div>
    `;
  }

  static bindEvents(container) {
    // Add Deal
    const btnAdd = document.getElementById('btn-add-deal-view');
    if (btnAdd) {
      btnAdd.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('smartcrm:open-modal', { detail: { type: 'deal' } }));
      });
    }

    // Quick Stage Switch
    container.querySelectorAll('.select-stage-quick').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const dealId = sel.dataset.dealId;
        const newStage = sel.value;
        store.updateDealStage(dealId, newStage);
        Toast.success(`Deal moved to ${newStage.toUpperCase()}`);
        PipelineView.render(container);
      });
    });

    // Delete Deal
    container.querySelectorAll('.btn-delete-deal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const dealId = btn.dataset.dealId;
        const d = store.getDealById(dealId);
        if (confirm(`Remove deal "${d ? d.title : 'this deal'}"?`)) {
          store.deleteDeal(dealId);
          Toast.warning('Deal removed from pipeline.');
          PipelineView.render(container);
        }
      });
    });

    // Drag and Drop implementation
    let draggedDealId = null;

    container.querySelectorAll('.deal-card').forEach(card => {
      card.addEventListener('dragstart', (e) => {
        draggedDealId = card.dataset.dealId;
        card.classList.add('dragging');
        e.dataTransfer.setData('text/plain', draggedDealId);
        e.dataTransfer.effectAllowed = 'move';
      });

      card.addEventListener('dragend', () => {
        card.classList.remove('dragging');
      });
    });

    container.querySelectorAll('.kanban-column').forEach(col => {
      col.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        col.classList.add('drag-over');
      });

      col.addEventListener('dragleave', () => {
        col.classList.remove('drag-over');
      });

      col.addEventListener('drop', (e) => {
        e.preventDefault();
        col.classList.remove('drag-over');
        const stage = col.dataset.stage;
        if (draggedDealId && stage) {
          store.updateDealStage(draggedDealId, stage);
          Toast.success(`Deal stage changed to ${stage.toUpperCase()}`);
          PipelineView.render(container);
        }
      });
    });
  }
}
