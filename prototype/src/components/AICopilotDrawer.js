// ===================================================================
// AGENTIC AI COPILOT DRAWER COMPONENT
// Conversational CRM Assistant with Agentic Reasoning, Streaming, & Tool Execution
// ===================================================================

import { aiAgent } from '../services/aiAgent.js';
import { Modals } from './Modals.js';
import { icons } from '../utils/helpers.js';
import { Toast } from './Toast.js';

export class AICopilotDrawer {
  static messages = [
    {
      sender: 'ai',
      text: `Hello Alex! I am **SmartAgent**, your agentic sales and CRM copilot.\n\nI continuously monitor your customer health scores, sales pipeline stages, and follow-up activities. How can I assist you today?`,
      thoughts: ['Connected to live SmartCRM state store.', 'Initialized predictive models and active recommendations.']
    }
  ];

  static init() {
    const drawer = document.getElementById('copilot-drawer');
    const backdrop = document.getElementById('copilot-drawer-backdrop');
    if (!drawer || !backdrop) return;

    this.renderDrawer(drawer);
    this.bindEvents(drawer, backdrop);

    window.addEventListener('smartcrm:ai-config-changed', () => {
      this.renderDrawer(drawer);
      this.bindEvents(drawer, backdrop);
    });
  }

  static renderDrawer(drawer) {
    const isLive = aiAgent.isLiveLLMEnabled();
    const model = aiAgent.getModel();

    drawer.innerHTML = `
      <div class="copilot-container">
        <!-- Copilot Header -->
        <div class="copilot-header">
          <div class="copilot-brand">
            <div class="copilot-icon">
              ${icons.sparkle}
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="copilot-title">SmartAgent Copilot</span>
                <span class="badge ${isLive ? 'badge-success' : 'badge-ai'}" style="font-size: 0.65rem; padding: 1px 7px;">
                  ${isLive ? 'Live ' + model : 'Built-in Engine'}
                </span>
              </div>
              <div class="copilot-subtitle">
                <span class="online-indicator" style="position: static; display: inline-block; background: ${isLive ? '#10b981' : '#818cf8'};"></span>
                <span>${isLive ? 'Google Gemini Reasoning & Tools' : 'Offline Semantic Entity Intelligence'}</span>
              </div>
            </div>
          </div>
          <div style="display: flex; gap: 6px;">
            <button class="btn-icon" id="btn-copilot-settings" title="Configure AI Key & Model">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </button>
            <button class="btn-icon" id="btn-clear-copilot" title="Clear Chat History">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
            </button>
            <button class="btn-icon" id="btn-close-copilot">
              ${icons.close}
            </button>
          </div>
        </div>

        <!-- Chat Stream Body -->
        <div class="copilot-chat-body" id="copilot-chat-body">
          ${this.messages.map(m => this.renderMessage(m)).join('')}
        </div>

        <!-- Quick Prompt Suggestion Chips -->
        <div class="prompt-chips-tray">
          <button class="prompt-chip" data-prompt="Why is Apex Cloud Systems at risk?">🚨 Why is Apex at risk?</button>
          <button class="prompt-chip" data-prompt="Draft a proposal email for Marcus at FinEdge">✉️ Draft proposal for Marcus</button>
          <button class="prompt-chip" data-prompt="Move FinEdge European deal to Negotiation">💼 Move deal to Negotiation</button>
          <button class="prompt-chip" data-prompt="Schedule a call with Elena tomorrow about latency">📅 Schedule call for Elena</button>
          <button class="prompt-chip" data-prompt="Who are our top 5 revenue clients?">🏆 Top 5 clients</button>
        </div>

        <!-- Footer Input Row -->
        <div class="copilot-footer">
          <form id="copilot-chat-form" class="copilot-input-row">
            <input type="text" id="copilot-input" class="copilot-input" placeholder="Ask questions, give CRM commands, or draft emails..." autocomplete="off">
            <button type="submit" class="btn btn-ai btn-icon" id="btn-send-copilot" style="border-radius: 50%; width: 42px; height: 42px; flex-shrink: 0;">
              ${icons.send}
            </button>
          </form>
        </div>
      </div>
    `;
  }

  static renderMessage(msg) {
    if (msg.sender === 'user') {
      return `
        <div class="chat-bubble user">
          ${this.escapeHtml(msg.text)}
        </div>
      `;
    }

    let thoughtsHtml = '';
    if (msg.thoughts && msg.thoughts.length > 0) {
      thoughtsHtml = `
        <div class="ai-thought-box">
          <div class="ai-thought-header">
            <span class="ai-sparkle-dot"></span>
            <span>Agentic Reasoning Trace</span>
          </div>
          ${msg.thoughts.map(t => `<div style="margin-top: 2px;">&bull; ${t}</div>`).join('')}
        </div>
      `;
    }

    let toolHtml = '';
    if (msg.executedTool) {
      toolHtml = `
        <div class="ai-tool-call-box">
          <div class="ai-tool-call-info">
            <span style="color: #10b981;">${icons.check}</span>
            <span>${msg.executedTool.label || 'Tool Executed'}</span>
          </div>
          <span class="badge badge-success" style="font-size: 0.68rem;">MUTATION EXECUTED</span>
        </div>
      `;
    }

    return `
      <div class="chat-bubble ai">
        ${thoughtsHtml}
        <div style="line-height: 1.5; white-space: pre-wrap;">${this.formatMarkdown(msg.text)}</div>
        ${toolHtml}
      </div>
    `;
  }

  static formatMarkdown(text) {
    if (!text) return '';
    let html = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    html = html.replace(/### (.*?)\n/g, '<h4 style="font-size: 0.95rem; font-weight: 700; color: #e0e7ff; margin: 8px 0 4px 0;">$1</h4>');
    html = html.replace(/```text\n([\s\S]*?)```/g, '<pre style="background: rgba(15, 23, 42, 0.9); padding: 12px; border-radius: 8px; font-family: var(--font-mono); font-size: 0.78rem; overflow-x: auto; margin: 8px 0; border: 1px solid var(--border-medium); color: #cbd5e1;">$1</pre>');
    html = html.replace(/`([^`]+)`/g, '<code style="background: rgba(99, 102, 241, 0.15); color: #c7d2fe; padding: 2px 5px; border-radius: 4px; font-family: var(--font-mono); font-size: 0.8em;">$1</code>');
    return html;
  }

  static escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  static open() {
    const drawer = document.getElementById('copilot-drawer');
    const backdrop = document.getElementById('copilot-drawer-backdrop');
    if (drawer && backdrop) {
      drawer.classList.remove('hidden');
      backdrop.classList.remove('hidden');
      const input = document.getElementById('copilot-input');
      if (input) setTimeout(() => input.focus(), 150);
    }
  }

  static close() {
    const drawer = document.getElementById('copilot-drawer');
    const backdrop = document.getElementById('copilot-drawer-backdrop');
    if (drawer && backdrop) {
      drawer.classList.add('hidden');
      backdrop.classList.add('hidden');
    }
  }

  static bindEvents(drawer, backdrop) {
    const btnClose = document.getElementById('btn-close-copilot');
    if (btnClose) btnClose.addEventListener('click', () => this.close());
    backdrop.addEventListener('click', () => this.close());

    // AI Settings button
    const btnSettings = document.getElementById('btn-copilot-settings');
    if (btnSettings) {
      btnSettings.addEventListener('click', () => {
        Modals.open('ai-settings');
      });
    }

    // Clear chat
    const btnClear = document.getElementById('btn-clear-copilot');
    if (btnClear) {
      btnClear.addEventListener('click', () => {
        this.messages = [
          {
            sender: 'ai',
            text: 'Context memory reset. How can I assist you with your customer accounts and sales activities?',
            thoughts: ['Context memory reinitialized.']
          }
        ];
        this.renderDrawer(drawer);
        this.bindEvents(drawer, backdrop);
      });
    }

    // Submit form
    const form = document.getElementById('copilot-chat-form');
    const input = document.getElementById('copilot-input');
    if (form && input) {
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const text = input.value.trim();
        if (!text) return;
        input.value = '';
        await this.handleUserMessage(text, drawer);
      });
    }

    // Prompt chips
    drawer.querySelectorAll('.prompt-chip').forEach(chip => {
      chip.addEventListener('click', async () => {
        const prompt = chip.dataset.prompt;
        if (prompt) {
          await this.handleUserMessage(prompt, drawer);
        }
      });
    });
  }

  static async handleUserMessage(userText, drawer) {
    // Append user message
    this.messages.push({ sender: 'user', text: userText });
    const chatBody = document.getElementById('copilot-chat-body');
    if (chatBody) {
      chatBody.innerHTML = this.messages.map(m => this.renderMessage(m)).join('');
      chatBody.scrollTop = chatBody.scrollHeight;
    }

    // Append temporary thinking indicator
    const thinkingEl = document.createElement('div');
    thinkingEl.className = 'chat-bubble ai';
    const isLive = aiAgent.isLiveLLMEnabled();
    const model = aiAgent.getModel();
    thinkingEl.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px; color: var(--ai-cyan); font-size: 0.82rem;">
        <span class="ai-sparkle-dot" style="animation: pulseSubtle 1s infinite;"></span>
        <span>${isLive ? (model + ' is analyzing your CRM data...') : 'SmartAgent is analyzing customer history & evaluating tools...'}</span>
      </div>
    `;
    chatBody.appendChild(thinkingEl);
    chatBody.scrollTop = chatBody.scrollHeight;

    // Process query via AIAgentService
    try {
      const result = await aiAgent.processCopilotQuery(userText, this.messages);
      thinkingEl.remove();

      // Progressive typewriter effect for responsive, living AI feel
      const msgObj = {
        sender: 'ai',
        text: '',
        thoughts: result.thoughts,
        executedTool: result.executedTool
      };
      this.messages.push(msgObj);

      const targetText = result.response;
      let currentIndex = 0;
      const stepSize = Math.max(2, Math.floor(targetText.length / 30));

      const streamInterval = setInterval(() => {
        currentIndex = Math.min(targetText.length, currentIndex + stepSize);
        msgObj.text = targetText.slice(0, currentIndex);

        if (chatBody) {
          chatBody.innerHTML = this.messages.map(m => this.renderMessage(m)).join('');
          chatBody.scrollTop = chatBody.scrollHeight;
        }

        if (currentIndex >= targetText.length) {
          clearInterval(streamInterval);
          if (result.executedTool) {
            Toast.ai(`SmartAgent executed: ${result.executedTool.label}`);
          }
        }
      }, 20);
    } catch (err) {
      thinkingEl.remove();
      this.messages.push({
        sender: 'ai',
        text: `### ⚠️ Agent Execution Error\n\n${err.message}`,
        thoughts: ['Encountered runtime exception during execution.']
      });
      if (chatBody) {
        chatBody.innerHTML = this.messages.map(m => this.renderMessage(m)).join('');
        chatBody.scrollTop = chatBody.scrollHeight;
      }
    }
  }
}
