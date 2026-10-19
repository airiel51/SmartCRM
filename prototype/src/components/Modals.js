// ===================================================================
// MODAL DIALOGS COMPONENT
// New Customer, New Deal, and New Activity creation forms with validation
// ===================================================================

import { store } from '../state/store.js';
import { aiAgent } from '../services/aiAgent.js';
import { icons } from '../utils/helpers.js';
import { Toast } from './Toast.js';

export class Modals {
  static open(type, options = {}) {
    const backdrop = document.getElementById('modal-container');
    const content = document.getElementById('modal-content');
    if (!backdrop || !content) return;

    if (type === 'customer') {
      this.renderCustomerModal(content);
    } else if (type === 'deal') {
      this.renderDealModal(content, options);
    } else if (type === 'activity') {
      this.renderActivityModal(content, options);
    } else if (type === 'ai-settings') {
      this.renderAISettingsModal(content);
    }

    backdrop.classList.remove('hidden');

    // Close on click outside backdrop
    const handleOutsideClick = (e) => {
      if (e.target === backdrop) {
        this.close();
        backdrop.removeEventListener('click', handleOutsideClick);
      }
    };
    backdrop.addEventListener('click', handleOutsideClick);
  }

  static close() {
    const backdrop = document.getElementById('modal-container');
    if (backdrop) backdrop.classList.add('hidden');
  }

  // ===================== NEW CUSTOMER MODAL =====================
  static renderCustomerModal(container) {
    container.innerHTML = `
      <div class="modal-header">
        <h3 class="modal-title">Register New Customer Account</h3>
        <button class="btn-icon" id="btn-modal-close">${icons.close}</button>
      </div>

      <form id="form-new-customer">
        <div class="modal-body">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Customer / Brand Name *</label>
              <input type="text" id="cust-input-name" class="form-input" placeholder="e.g. Acme Cloud Corp" required>
            </div>
            <div class="form-group">
              <label class="form-label">Legal Company Name</label>
              <input type="text" id="cust-input-company" class="form-input" placeholder="e.g. Acme Technologies Inc.">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Primary Contact Person *</label>
              <input type="text" id="cust-input-contact" class="form-input" placeholder="e.g. Jordan Smith" required>
            </div>
            <div class="form-group">
              <label class="form-label">Role / Job Title</label>
              <input type="text" id="cust-input-role" class="form-input" placeholder="e.g. VP Engineering">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Email Address *</label>
              <input type="email" id="cust-input-email" class="form-input" placeholder="jordan@acme.com" required>
            </div>
            <div class="form-group">
              <label class="form-label">Phone Number</label>
              <input type="tel" id="cust-input-phone" class="form-input" placeholder="+1 (555) 019-2834">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Industry</label>
              <select id="cust-input-industry" class="form-select">
                <option value="Enterprise SaaS">Enterprise SaaS</option>
                <option value="Fintech">Fintech</option>
                <option value="Healthcare & Life Sciences">Healthcare & Life Sciences</option>
                <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                <option value="Logistics & Transport">Logistics & Transport</option>
                <option value="Cybersecurity">Cybersecurity</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Customer Tier</label>
              <select id="cust-input-tier" class="form-select">
                <option value="Enterprise">Enterprise</option>
                <option value="Mid-Market">Mid-Market</option>
                <option value="SMB">SMB</option>
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Initial MRR ($ USD)</label>
              <input type="number" id="cust-input-mrr" class="form-input" placeholder="5000" min="0" value="5000">
            </div>
            <div class="form-group">
              <label class="form-label">Account Owner</label>
              <input type="text" id="cust-input-owner" class="form-input" value="Alex Rivera">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Initial Account Notes</label>
            <textarea id="cust-input-notes" class="form-textarea" placeholder="Key goals, tech stack, pain points..."></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="btn-modal-cancel">Cancel</button>
          <button type="submit" class="btn btn-primary">Create Customer Record</button>
        </div>
      </form>
    `;

    document.getElementById('btn-modal-close')?.addEventListener('click', () => this.close());
    document.getElementById('btn-modal-cancel')?.addEventListener('click', () => this.close());

    document.getElementById('form-new-customer')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('cust-input-name').value.trim();
      const company = document.getElementById('cust-input-company').value.trim() || name;
      const contactPerson = document.getElementById('cust-input-contact').value.trim();
      const role = document.getElementById('cust-input-role').value.trim();
      const email = document.getElementById('cust-input-email').value.trim();
      const phone = document.getElementById('cust-input-phone').value.trim();
      const industry = document.getElementById('cust-input-industry').value;
      const tier = document.getElementById('cust-input-tier').value;
      const mrr = parseFloat(document.getElementById('cust-input-mrr').value) || 0;
      const assignedTo = document.getElementById('cust-input-owner').value.trim();
      const notes = document.getElementById('cust-input-notes').value.trim();

      const newCust = store.addCustomer({
        name,
        company,
        contactPerson,
        role,
        email,
        phone,
        industry,
        tier,
        mrr,
        ltv: mrr * 12,
        assignedTo,
        notes
      });

      Toast.success(`Customer "${newCust.name}" added successfully.`);
      this.close();
    });
  }

  // ===================== NEW DEAL MODAL =====================
  static renderDealModal(container, options = {}) {
    const customers = store.getCustomers();

    container.innerHTML = `
      <div class="modal-header">
        <h3 class="modal-title">Create Sales Opportunity / Deal</h3>
        <button class="btn-icon" id="btn-modal-close">${icons.close}</button>
      </div>

      <form id="form-new-deal">
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Deal Opportunity Name *</label>
            <input type="text" id="deal-input-title" class="form-input" placeholder="e.g. Enterprise License Expansion" required>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Associated Customer Account *</label>
              <select id="deal-input-cust" class="form-select" required>
                ${customers.map(c => `
                  <option value="${c.id}" ${options.customerId === c.id ? 'selected' : ''}>${c.name}</option>
                `).join('')}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Deal Value ($ USD) *</label>
              <input type="number" id="deal-input-val" class="form-input" placeholder="50000" min="0" required>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Initial Stage</label>
              <select id="deal-input-stage" class="form-select">
                <option value="lead">Lead</option>
                <option value="qualified">Qualified</option>
                <option value="proposal">Proposal / Demo</option>
                <option value="negotiation">Negotiation</option>
                <option value="won">Closed Won</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Win Probability (%)</label>
              <input type="number" id="deal-input-prob" class="form-input" placeholder="50" min="0" max="100" value="50">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Target Close Date</label>
              <input type="date" id="deal-input-date" class="form-input" value="${new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]}">
            </div>
            <div class="form-group">
              <label class="form-label">Opportunity Owner</label>
              <input type="text" id="deal-input-owner" class="form-input" value="Alex Rivera">
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Deal Notes & Scope</label>
            <textarea id="deal-input-notes" class="form-textarea" placeholder="Key deliverables, decision makers..."></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="btn-modal-cancel">Cancel</button>
          <button type="submit" class="btn btn-primary">Add Opportunity to Pipeline</button>
        </div>
      </form>
    `;

    document.getElementById('btn-modal-close')?.addEventListener('click', () => this.close());
    document.getElementById('btn-modal-cancel')?.addEventListener('click', () => this.close());

    document.getElementById('form-new-deal')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('deal-input-title').value.trim();
      const customerId = document.getElementById('deal-input-cust').value;
      const cust = store.getCustomerById(customerId);
      const value = parseFloat(document.getElementById('deal-input-val').value) || 0;
      const stage = document.getElementById('deal-input-stage').value;
      const winProbability = parseInt(document.getElementById('deal-input-prob').value) || 50;
      const expectedClose = document.getElementById('deal-input-date').value;
      const assignedTo = document.getElementById('deal-input-owner').value.trim();

      const newDeal = store.addDeal({
        title,
        customerId,
        customerName: cust ? cust.name : 'Unknown',
        value,
        stage,
        winProbability,
        expectedClose,
        assignedTo,
        aiInsight: 'New deal initialized. AI tracking velocity.'
      });

      Toast.success(`Deal "${newDeal.title}" created!`);
      this.close();
    });
  }

  // ===================== NEW ACTIVITY MODAL =====================
  static renderActivityModal(container, options = {}) {
    const customers = store.getCustomers();

    container.innerHTML = `
      <div class="modal-header">
        <h3 class="modal-title">Schedule Customer Follow-up / Activity</h3>
        <button class="btn-icon" id="btn-modal-close">${icons.close}</button>
      </div>

      <form id="form-new-activity">
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label">Activity Subject *</label>
            <input type="text" id="act-input-title" class="form-input" placeholder="e.g. Technical Deep Dive on API Latency" required>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Activity Type</label>
              <select id="act-input-type" class="form-select">
                <option value="meeting">Meeting</option>
                <option value="call">Call</option>
                <option value="email">Email Follow-up</option>
                <option value="task">Task / Action Item</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Associated Customer</label>
              <select id="act-input-cust" class="form-select">
                ${customers.map(c => `
                  <option value="${c.id}" ${options.customerId === c.id ? 'selected' : ''}>${c.name}</option>
                `).join('')}
              </select>
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="form-label">Due Date *</label>
              <input type="date" id="act-input-date" class="form-input" value="${new Date().toISOString().split('T')[0]}" required>
            </div>
            <div class="form-group">
              <label class="form-label">Priority</label>
              <select id="act-input-priority" class="form-select">
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Agenda / Action Notes</label>
            <textarea id="act-input-notes" class="form-textarea" placeholder="Key objectives, talking points, attendees..."></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="btn-modal-cancel">Cancel</button>
          <button type="submit" class="btn btn-primary">Save to Schedule</button>
        </div>
      </form>
    `;

    document.getElementById('btn-modal-close')?.addEventListener('click', () => this.close());
    document.getElementById('btn-modal-cancel')?.addEventListener('click', () => this.close());

    document.getElementById('form-new-activity')?.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('act-input-title').value.trim();
      const type = document.getElementById('act-input-type').value;
      const customerId = document.getElementById('act-input-cust').value;
      const cust = store.getCustomerById(customerId);
      const dueDate = document.getElementById('act-input-date').value;
      const priority = document.getElementById('act-input-priority').value;
      const notes = document.getElementById('act-input-notes').value.trim();

      const newAct = store.addActivity({
        title,
        type,
        customerId,
        customerName: cust ? cust.name : 'Unknown',
        dueDate,
        priority,
        notes
      });

      Toast.success(`Activity "${newAct.title}" scheduled for ${dueDate}.`);
      this.close();
    });
  }

  // ===================== AI SETTINGS & LLM PROVIDER MODAL =====================
  static renderAISettingsModal(container) {
    const currentKey = aiAgent.getApiKey();
    const currentModel = aiAgent.getModel();
    const isLive = aiAgent.isLiveLLMEnabled();

    container.innerHTML = `
      <form id="form-ai-settings">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 32px; height: 32px; border-radius: var(--radius-sm); background: var(--ai-gradient); display: flex; align-items: center; justify-content: center; color: #fff;">
              ${icons.sparkle}
            </div>
            <div>
              <h3 class="modal-title">AI Engine & Model Configuration</h3>
              <div style="font-size: 0.72rem; color: var(--text-secondary);">Power SmartCRM with live Gemini LLM or Built-in Semantic Engine</div>
            </div>
          </div>
          <button type="button" class="btn-icon" id="btn-modal-close">${icons.close}</button>
        </div>

        <div class="modal-body">
          <!-- Status Banner -->
          <div style="padding: 14px; border-radius: var(--radius-md); background: ${isLive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(99, 102, 241, 0.12)'}; border: 1px solid ${isLive ? 'rgba(16, 185, 129, 0.3)' : 'rgba(99, 102, 241, 0.3)'}; margin-bottom: 20px;">
            <div style="display: flex; align-items: center; justify-content: space-between;">
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="online-indicator" style="position: static; background: ${isLive ? '#10b981' : '#818cf8'};"></span>
                <strong style="color: #fff; font-size: 0.88rem;">Active Engine: ${isLive ? 'Google Gemini Live LLM' : 'Built-in High Precision Semantic Engine'}</strong>
              </div>
              <span class="badge ${isLive ? 'badge-success' : 'badge-neutral'}">${isLive ? 'API ACTIVE' : 'ZERO SETUP'}</span>
            </div>
            <p style="font-size: 0.78rem; color: var(--text-secondary); margin-top: 6px; line-height: 1.4;">
              ${isLive 
                ? 'Your copilot uses live Google Gemini generative intelligence with direct function calling tools executed against your CRM database.' 
                : 'Running locally with offline entity extraction, multi-dimensional cohort analytics, and smart automated action handlers.'}
            </p>
          </div>

          <div class="form-group">
            <label class="form-label">Google Gemini API Key</label>
            <div style="display: flex; gap: 8px;">
              <input type="password" id="input-gemini-key" class="form-input" placeholder="Paste your API key here (AIzaSy...)" value="${currentKey}" autocomplete="off" style="font-family: var(--font-mono);">
              <button type="button" class="btn btn-secondary btn-sm" id="btn-toggle-key-visibility" title="Show / Hide Key">
                Show
              </button>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 6px;">
              <span style="font-size: 0.72rem; color: var(--text-muted);">Stored locally in your browser's localStorage.</span>
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" style="font-size: 0.74rem; color: var(--primary-light); font-weight: 600;">
                Get Free API Key from Google AI Studio &rarr;
              </a>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">Model Selection</label>
            <select id="select-gemini-model" class="form-select">
              <option value="gemini-3.8-flash" ${currentModel === 'gemini-3.8-flash' ? 'selected' : ''}>gemini-3.8-flash (Recommended &bull; Fastest, latest reasoning)</option>
              <option value="gemini-3.8-pro" ${currentModel === 'gemini-3.8-pro' ? 'selected' : ''}>gemini-3.8-pro (Deep analytical complex reasoning)</option>
              <option value="gemini-1.5-flash" ${currentModel === 'gemini-1.5-flash' ? 'selected' : ''}>gemini-1.5-flash (Standard lightweight)</option>
              <option value="gemini-1.5-pro" ${currentModel === 'gemini-1.5-pro' ? 'selected' : ''}>gemini-1.5-pro (Standard pro model)</option>
            </select>
          </div>

          <!-- Connection Status Feedback -->
          <div id="ai-test-status" class="hidden" style="margin-top: 14px; padding: 10px 14px; border-radius: var(--radius-sm); font-size: 0.8rem;"></div>

          <div style="display: flex; gap: 10px; margin-top: 20px;">
            <button type="button" class="btn btn-secondary btn-sm" id="btn-test-ai-key" style="flex: 1;">
              ${icons.sparkle}
              <span>Test API Connection</span>
            </button>
            ${currentKey ? `
              <button type="button" class="btn btn-danger btn-sm" id="btn-clear-ai-key">
                Disconnect Key
              </button>
            ` : ''}
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" id="btn-modal-cancel">Cancel</button>
          <button type="button" class="btn btn-primary" id="btn-save-ai-settings">Save Configuration</button>
        </div>
      </form>
    `;

    document.getElementById('btn-modal-close')?.addEventListener('click', () => this.close());
    document.getElementById('btn-modal-cancel')?.addEventListener('click', () => this.close());

    // Toggle password visibility
    const keyInput = document.getElementById('input-gemini-key');
    const toggleBtn = document.getElementById('btn-toggle-key-visibility');
    if (keyInput && toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        if (keyInput.type === 'password') {
          keyInput.type = 'text';
          toggleBtn.textContent = 'Hide';
        } else {
          keyInput.type = 'password';
          toggleBtn.textContent = 'Show';
        }
      });
    }

    // Save helper
    const handleSave = () => {
      const inputEl = document.getElementById('input-gemini-key');
      const selectEl = document.getElementById('select-gemini-model');
      const key = inputEl ? inputEl.value.trim() : '';
      const model = selectEl ? selectEl.value : 'gemini-3.8-flash';

      aiAgent.setApiKey(key);
      aiAgent.setModel(model);

      if (key) {
        Toast.ai(`API Key saved! Connected to Google Gemini (${model}).`);
      } else {
        Toast.success('Configuration saved: Using Built-in Semantic Engine.');
      }

      this.close();
      window.dispatchEvent(new CustomEvent('smartcrm:ai-config-changed'));
    };

    // Bind save button AND form submit
    document.getElementById('btn-save-ai-settings')?.addEventListener('click', (e) => {
      e.preventDefault();
      handleSave();
    });

    document.getElementById('form-ai-settings')?.addEventListener('submit', (e) => {
      e.preventDefault();
      handleSave();
    });

    // Test API key button
    const btnTest = document.getElementById('btn-test-ai-key');
    const statusBox = document.getElementById('ai-test-status');

    if (btnTest && statusBox) {
      btnTest.addEventListener('click', async () => {
        const inputEl = document.getElementById('input-gemini-key');
        const selectEl = document.getElementById('select-gemini-model');
        const key = inputEl ? inputEl.value.trim() : '';
        const model = selectEl ? selectEl.value : 'gemini-3.8-flash';

        if (!key) {
          statusBox.className = 'badge-warning';
          statusBox.style.display = 'block';
          statusBox.textContent = 'Please enter an API key to test.';
          return;
        }

        btnTest.disabled = true;
        btnTest.innerHTML = `<span style="display: inline-block; animation: spin 1s infinite linear;">${icons.clock}</span> Testing API...`;
        statusBox.style.display = 'none';

        try {
          const res = await aiAgent.testConnection(key, model);
          // Auto-save verified working key!
          aiAgent.setApiKey(key);
          aiAgent.setModel(model);

          statusBox.className = 'badge-success';
          statusBox.style.display = 'block';
          statusBox.style.padding = '10px 14px';
          statusBox.innerHTML = `<strong>Success!</strong> ${res}<div style="margin-top: 4px; font-weight: 700; color: #10b981;">✓ Key verified & auto-saved to CRM!</div>`;
          Toast.success('Gemini API verified and saved!');
          window.dispatchEvent(new CustomEvent('smartcrm:ai-config-changed'));
        } catch (err) {
          statusBox.className = 'badge-danger';
          statusBox.style.display = 'block';
          statusBox.style.padding = '10px 14px';
          statusBox.innerHTML = `<strong>Connection failed:</strong> ${err.message}`;
          Toast.danger('Could not connect to Gemini API.');
        } finally {
          btnTest.disabled = false;
          btnTest.innerHTML = `${icons.sparkle} <span>Test API Connection</span>`;
        }
      });
    }

    // Clear key button
    document.getElementById('btn-clear-ai-key')?.addEventListener('click', () => {
      aiAgent.setApiKey('');
      Toast.warning('Gemini API key removed. Switched to Built-in Semantic Engine.');
      this.close();
      window.dispatchEvent(new CustomEvent('smartcrm:ai-config-changed'));
    });
  }
}

