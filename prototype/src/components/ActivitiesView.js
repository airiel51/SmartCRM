// ===================================================================
// ACTIVITIES & SMART FOLLOW-UPS VIEW
// Meeting tracking, call logs, task scheduling, overdue mitigation
// ===================================================================

import { store } from '../state/store.js';
import { formatDate, timeAgo, icons } from '../utils/helpers.js';
import { Toast } from './Toast.js';

export class ActivitiesView {
  static currentFilter = {
    type: 'all',
    status: 'all' // all, pending, overdue, completed
  };

  static render(container) {
    const activities = store.getActivities();
    const todayStr = new Date().toISOString().split('T')[0];

    const filtered = activities.filter(act => {
      // Type filter
      if (this.currentFilter.type !== 'all' && act.type !== this.currentFilter.type) {
        return false;
      }
      // Status filter
      if (this.currentFilter.status === 'completed' && !act.completed) return false;
      if (this.currentFilter.status === 'pending' && act.completed) return false;
      if (this.currentFilter.status === 'overdue' && (act.completed || act.dueDate >= todayStr)) return false;

      return true;
    });

    const overdueCount = activities.filter(a => !a.completed && a.dueDate < todayStr).length;
    const pendingCount = activities.filter(a => !a.completed).length;

    container.innerHTML = `
      <div class="activities-page animate-fade-in">
        <!-- Top Header -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; flex-wrap: wrap; gap: 16px;">
          <div>
            <h1 style="font-size: 1.7rem; font-weight: 800;">Customer Activities & Follow-ups</h1>
            <p style="color: var(--text-secondary); font-size: 0.88rem; margin-top: 4px;">
              Manage scheduled calls, executive syncs, client emails, and urgent cadences.
            </p>
          </div>

          <div style="display: flex; gap: 12px;">
            <button class="btn btn-primary" id="btn-add-activity-view">
              ${icons.plus}
              <span>Schedule Activity</span>
            </button>
          </div>
        </div>

        <!-- Filter Bar -->
        <div class="card" style="padding: 16px; margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 14px;">
            <!-- Type Tabs -->
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button class="btn btn-sm ${this.currentFilter.type === 'all' ? 'btn-secondary' : 'btn-ghost'} btn-filter-type" data-type="all">All Types</button>
              <button class="btn btn-sm ${this.currentFilter.type === 'call' ? 'btn-secondary' : 'btn-ghost'} btn-filter-type" data-type="call">Calls</button>
              <button class="btn btn-sm ${this.currentFilter.type === 'meeting' ? 'btn-secondary' : 'btn-ghost'} btn-filter-type" data-type="meeting">Meetings</button>
              <button class="btn btn-sm ${this.currentFilter.type === 'email' ? 'btn-secondary' : 'btn-ghost'} btn-filter-type" data-type="email">Emails</button>
              <button class="btn btn-sm ${this.currentFilter.type === 'task' ? 'btn-secondary' : 'btn-ghost'} btn-filter-type" data-type="task">Tasks</button>
            </div>

            <!-- Status Tabs -->
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <button class="btn btn-sm ${this.currentFilter.status === 'all' ? 'btn-secondary' : 'btn-ghost'} btn-filter-status" data-status="all">
                All (${activities.length})
              </button>
              <button class="btn btn-sm ${this.currentFilter.status === 'pending' ? 'btn-secondary' : 'btn-ghost'} btn-filter-status" data-status="pending">
                Pending (${pendingCount})
              </button>
              <button class="btn btn-sm ${this.currentFilter.status === 'overdue' ? 'btn-danger' : 'btn-ghost'} btn-filter-status" data-status="overdue">
                Overdue (${overdueCount})
              </button>
              <button class="btn btn-sm ${this.currentFilter.status === 'completed' ? 'btn-secondary' : 'btn-ghost'} btn-filter-status" data-status="completed">
                Completed
              </button>
            </div>
          </div>
        </div>

        <!-- Activities List -->
        <div style="display: flex; flex-direction: column; gap: 12px;">
          ${filtered.length > 0 ? filtered.map(act => this.renderActivityCard(act, todayStr)).join('') : `
            <div class="card" style="text-align: center; padding: 48px; color: var(--text-muted);">
              ${icons.calendar}
              <div style="margin-top: 10px; font-weight: 600;">No activities match this filter.</div>
            </div>
          `}
        </div>
      </div>
    `;

    this.bindEvents(container);
  }

  static renderActivityCard(act, todayStr) {
    const isOverdue = !act.completed && act.dueDate < todayStr;
    const isToday = !act.completed && act.dueDate === todayStr;

    let icon = icons.clock;
    if (act.type === 'call') icon = icons.phone;
    if (act.type === 'meeting') icon = icons.calendar;
    if (act.type === 'email') icon = icons.mail;

    let priorityBadge = 'badge-neutral';
    if (act.priority === 'urgent') priorityBadge = 'badge-danger';
    else if (act.priority === 'high') priorityBadge = 'badge-warning';

    return `
      <div class="card" style="padding: 16px; border-left: 4px solid ${act.completed ? 'var(--success)' : isOverdue ? 'var(--danger)' : isToday ? 'var(--warning)' : 'var(--primary)'}; opacity: ${act.completed ? '0.65' : '1'};">
        <div style="display: flex; align-items: flex-start; justify-content: space-between; gap: 16px;">
          <!-- Checkbox & details -->
          <div style="display: flex; align-items: flex-start; gap: 14px; flex: 1;">
            <input type="checkbox" class="act-checkbox" data-act-id="${act.id}" ${act.completed ? 'checked' : ''} style="width: 18px; height: 18px; margin-top: 3px; cursor: pointer; accent-color: var(--primary);">
            
            <div style="flex: 1;">
              <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                <span style="font-size: 0.95rem; font-weight: 700; color: #fff; text-decoration: ${act.completed ? 'line-through' : 'none'};">
                  ${act.title}
                </span>
                <span class="badge ${priorityBadge}" style="text-transform: uppercase;">${act.priority || 'Normal'}</span>
                <span class="badge badge-neutral" style="text-transform: capitalize;">${act.type}</span>
              </div>

              <div style="font-size: 0.8rem; color: var(--text-secondary); margin-top: 4px;">
                Customer: <strong style="color: #fff;">${act.customerName}</strong> &bull; Assigned to: ${act.assignedTo || 'Alex Rivera'}
              </div>

              ${act.notes ? `
                <p style="font-size: 0.8rem; color: var(--text-muted); margin-top: 6px; line-height: 1.4;">${act.notes}</p>
              ` : ''}
            </div>
          </div>

          <!-- Date badge & delete -->
          <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 10px;">
            <span class="badge ${act.completed ? 'badge-success' : isOverdue ? 'badge-danger' : isToday ? 'badge-warning' : 'badge-neutral'}">
              ${act.completed ? 'Done' : isOverdue ? 'Overdue: ' + formatDate(act.dueDate) : isToday ? 'Today' : 'Due ' + formatDate(act.dueDate)}
            </span>
            <button class="btn btn-ghost btn-sm btn-delete-act" data-act-id="${act.id}" title="Delete Activity">
              ${icons.trash}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  static bindEvents(container) {
    // Add Activity
    const btnAdd = document.getElementById('btn-add-activity-view');
    if (btnAdd) {
      btnAdd.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('smartcrm:open-modal', { detail: { type: 'activity' } }));
      });
    }

    // Toggle Complete
    container.querySelectorAll('.act-checkbox').forEach(box => {
      box.addEventListener('change', () => {
        const id = box.dataset.actId;
        const act = store.toggleActivityComplete(id);
        if (act) {
          Toast.success(act.completed ? 'Activity marked completed.' : 'Activity reopened.');
          ActivitiesView.render(container);
        }
      });
    });

    // Delete Activity
    container.querySelectorAll('.btn-delete-act').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.actId;
        if (confirm('Delete this scheduled activity?')) {
          store.deleteActivity(id);
          Toast.warning('Activity deleted.');
          ActivitiesView.render(container);
        }
      });
    });

    // Filter type
    container.querySelectorAll('.btn-filter-type').forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentFilter.type = btn.dataset.type;
        ActivitiesView.render(container);
      });
    });

    // Filter status
    container.querySelectorAll('.btn-filter-status').forEach(btn => {
      btn.addEventListener('click', () => {
        this.currentFilter.status = btn.dataset.status;
        ActivitiesView.render(container);
      });
    });
  }
}
