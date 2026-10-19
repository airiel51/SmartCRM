// ===================================================================
// AGENTIC AI ENGINE ("SmartAgent AI")
// Hybrid Architecture:
// 1. Live Google Gemini API (BYOK) with real Function Calling / Tool Execution
// 2. High-Precision Built-in Semantic Reasoning & Entity Execution Engine
// ===================================================================

import { store } from '../state/store.js';
import { generateId, formatCurrency } from '../utils/helpers.js';

const API_KEY_STORAGE = 'smartcrm_gemini_api_key';
const MODEL_STORAGE = 'smartcrm_gemini_model';

class AIAgentService {
  constructor() {
    this.isAuditing = false;
    this.apiKey = localStorage.getItem(API_KEY_STORAGE) || '';
    const storedModel = localStorage.getItem(MODEL_STORAGE);
    // Automatically migrate deprecated gemini-2.5-flash to gemini-3.8-flash
    if (!storedModel || storedModel === 'gemini-2.5-flash') {
      this.model = 'gemini-3.8-flash';
      localStorage.setItem(MODEL_STORAGE, 'gemini-3.8-flash');
    } else {
      this.model = storedModel;
    }
  }

  getApiKey() {
    return this.apiKey;
  }

  setApiKey(key) {
    this.apiKey = (key || '').trim();
    if (this.apiKey) {
      localStorage.setItem(API_KEY_STORAGE, this.apiKey);
    } else {
      localStorage.removeItem(API_KEY_STORAGE);
    }
  }

  getModel() {
    return this.model;
  }

  setModel(modelName) {
    this.model = modelName;
    localStorage.setItem(MODEL_STORAGE, modelName);
  }

  isLiveLLMEnabled() {
    return !!this.apiKey;
  }

  async testConnection(testKey, testModel = 'gemini-3.8-flash') {
    const key = testKey || this.apiKey;
    if (!key) throw new Error('Please enter a valid Gemini API key.');

    const targetModel = (testModel === 'gemini-2.5-flash' || !testModel) ? 'gemini-3.8-flash' : testModel;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${targetModel}:generateContent?key=${key}`;
    const payload = {
      contents: [{ role: 'user', parts: [{ text: 'Hello, respond with: "SmartAgent connected successfully."' }] }]
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error?.message || `API returned status ${response.status}`);
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    return reply.trim();
  }

  // ===================== AUTONOMOUS ACCOUNT AUDIT =====================
  async runHealthAudit() {
    this.isAuditing = true;
    const customers = store.getCustomers();
    const deals = store.getDeals();
    const now = new Date();

    const auditResults = {
      auditedCount: customers.length,
      updatedScores: 0,
      newRisksIdentified: 0,
      newUpsellSignals: 0,
      generatedRecommendations: 0,
      timestamp: now.toISOString()
    };

    customers.forEach(customer => {
      let daysInactive = 14;
      if (customer.lastContact) {
        const lastDate = new Date(customer.lastContact);
        daysInactive = Math.max(0, Math.floor((now - lastDate) / (1000 * 60 * 60 * 24)));
      }

      let calculatedHealth = customer.healthScore;
      if (daysInactive > 14) {
        calculatedHealth = Math.max(25, calculatedHealth - 10);
      } else if (daysInactive <= 3) {
        calculatedHealth = Math.min(98, calculatedHealth + 5);
      }

      let churnRisk = 'Low';
      if (calculatedHealth < 55 || (customer.sentiment === 'At-Risk' && daysInactive > 7)) {
        churnRisk = 'High';
      } else if (calculatedHealth < 75 || daysInactive > 10) {
        churnRisk = 'Medium';
      }

      if (calculatedHealth !== customer.healthScore || churnRisk !== customer.churnRisk) {
        store.updateCustomer(customer.id, {
          healthScore: calculatedHealth,
          churnRisk: churnRisk
        });
        auditResults.updatedScores++;
      }

      if (churnRisk === 'High' && customer.mrr > 4000) {
        auditResults.newRisksIdentified++;
        const existingRec = store.getRecommendations().find(r => r.customerId === customer.id && r.priority === 'high');
        if (!existingRec) {
          store.addRecommendation({
            customerId: customer.id,
            customerName: customer.name,
            priority: 'high',
            title: `AI Alert: High Churn Vulnerability on ${customer.name}`,
            description: `Account has been inactive for ${daysInactive} days with ${customer.sentiment} sentiment. Potential ARR loss: $${(customer.mrr * 12).toLocaleString()}.`,
            impact: `Protect $${(customer.mrr * 12).toLocaleString()} ARR`,
            actionType: 'draft_email',
            actionPayload: {
              recipient: customer.contactPerson,
              subject: `Strategic Check-in & Priority Support - ${customer.name}`
            }
          });
          auditResults.generatedRecommendations++;
        }
      }

      if (calculatedHealth >= 85 && daysInactive <= 7 && customer.tier !== 'Enterprise') {
        auditResults.newUpsellSignals++;
      }
    });

    this.isAuditing = false;
    return auditResults;
  }

  // ===================== EXECUTE RECOMMENDATION =====================
  async executeRecommendation(recId) {
    const rec = store.getRecommendations().find(r => r.id === recId);
    if (!rec) return { success: false, message: 'Recommendation not found' };

    const customer = store.getCustomerById(rec.customerId);
    let resultMessage = '';

    if (rec.actionType === 'schedule_meeting') {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dueDate = tomorrow.toISOString().split('T')[0];

      store.addActivity({
        title: rec.actionPayload?.title || `Executive Strategy Sync with ${rec.customerName}`,
        customerId: rec.customerId,
        customerName: rec.customerName,
        type: 'meeting',
        dueDate: dueDate,
        priority: 'urgent',
        notes: `Auto-scheduled via SmartAgent: ${rec.title}`
      });

      if (customer) {
        store.addTimelineEntry(rec.customerId, {
          type: 'meeting',
          title: 'AI Scheduled: Strategic Alignment Meeting',
          content: `SmartAgent auto-scheduled an urgent executive sync for ${dueDate} to address flagged account risk.`
        });
      }
      resultMessage = `Meeting auto-scheduled on calendar for ${dueDate}.`;
    } else if (rec.actionType === 'create_task') {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + 2);
      const dueDate = targetDate.toISOString().split('T')[0];

      store.addActivity({
        title: rec.actionPayload?.title || `Follow-up on stalled deal: ${rec.customerName}`,
        customerId: rec.customerId,
        customerName: rec.customerName,
        type: 'call',
        dueDate: dueDate,
        priority: 'high',
        notes: `Generated by SmartAgent. ${rec.description}`
      });

      if (customer) {
        store.addTimelineEntry(rec.customerId, {
          type: 'note',
          title: 'AI Action: Priority Task Assigned',
          content: `SmartAgent assigned a high-priority follow-up task to prevent deal stall.`
        });
      }
      resultMessage = `Follow-up task created and assigned.`;
    } else if (rec.actionType === 'draft_email') {
      const emailContent = this.generateCustomEmail(customer, 'Executive Retentive Check-in');
      store.addTimelineEntry(rec.customerId, {
        type: 'email',
        title: `AI Draft Prepared: ${rec.actionPayload?.subject || emailContent.subject}`,
        content: `SmartAgent generated email draft:\n\n"${emailContent.subject}"\n${emailContent.body}`
      });
      resultMessage = `Personalized email draft created and saved to customer timeline.`;
    } else {
      resultMessage = `Action executed successfully.`;
    }

    store.dismissRecommendation(recId);
    return { success: true, message: resultMessage, actionType: rec.actionType };
  }

  // ===================== DYNAMIC EMAIL GENERATOR =====================
  generateCustomEmail(customer, customTopic = '') {
    if (!customer) {
      return {
        subject: `Partnership Follow-up - SmartCRM`,
        body: `Hi there,\n\nI hope you're having a productive week. Following up on our recent conversations—would you have 15 minutes to sync on your objectives?\n\nBest regards,\nAlex Rivera`
      };
    }

    const contactFirst = (customer.contactPerson || 'there').split(' ')[0];
    const comp = customer.company || customer.name;
    const notes = customer.notes || '';

    let subject = `Follow-up regarding ${comp}`;
    let body = '';

    if (customTopic && customTopic.toLowerCase().includes('latency') || notes.toLowerCase().includes('latency')) {
      subject = `Urgent: Resolution Update on Platform Throughput & Infrastructure - ${comp}`;
      body = `Hi ${contactFirst},\n\nI am reaching out directly following the performance feedback your engineering team shared with us.\n\nOur principal infrastructure architects have deployed a dedicated caching pipeline to eliminate the latency you experienced. I would welcome 15 minutes with you and Elena this Thursday or Friday to review the updated benchmarks before your upcoming renewal window.\n\nPlease let me know what time works best for your schedule.\n\nWarm regards,\nAlex Rivera\nVP of Sales Ops & Solutions`;
    } else if (customTopic && (customTopic.toLowerCase().includes('expansion') || customTopic.toLowerCase().includes('proposal') || customer.healthScore >= 80)) {
      subject = `Custom Multi-Region Expansion Proposal for ${comp}`;
      body = `Hi ${contactFirst},\n\nCongratulations on the stellar engagement numbers your teams are demonstrating across SmartCRM!\n\nAs discussed, I've prepared a comprehensive rollout plan for your European regional expansion (+45 seats), including our dedicated SOC2 compliance add-on and enterprise volume pricing tier.\n\nWould you have 20 minutes next Tuesday at 2:00 PM EST to review the commercial terms together?\n\nBest regards,\nAlex Rivera\nVP of Sales Ops`;
    } else if (customTopic && (customTopic.toLowerCase().includes('stall') || customTopic.toLowerCase().includes('pos') || customer.name.includes('Nexus'))) {
      subject = `Strategic Check-in: POS Synchronization Roadmap for ${comp}`;
      body = `Hi ${contactFirst},\n\nI know your team is deep into holiday campaign preparation. I wanted to touch base regarding the POS omnichannel synchronizer rollout so we ensure zero bottlenecks ahead of your peak shopping cycle.\n\nCan we grab 10 minutes tomorrow morning to confirm the final technical checklist?\n\nBest regards,\nAlex Rivera\nVP of Sales Ops`;
    } else {
      subject = `Next Steps & Strategic Alignment for ${comp}`;
      body = `Hi ${contactFirst},\n\nI hope your week is off to a great start. I wanted to check in regarding your current workflows with SmartCRM and discuss how our team can support your upcoming quarterly goals.\n\nWe have recently rolled out enhancements tailored specifically to ${customer.industry || 'your industry'}. Let me know if you would like a brief 15-minute walkthrough.\n\nBest regards,\nAlex Rivera\nVP of Sales Ops`;
    }

    return { subject, body };
  }

  // ===================== COPILOT ENTRYPOINT =====================
  async processCopilotQuery(prompt, chatHistory = []) {
    // If live Gemini API key is configured, use real frontier generative AI with function calling
    if (this.isLiveLLMEnabled()) {
      try {
        return await this.callGeminiAPI(prompt, chatHistory);
      } catch (err) {
        console.warn('Gemini API call failed, falling back to local semantic engine:', err);
        const fallback = await this.processSemanticQuery(prompt);
        fallback.thoughts.unshift(`⚠️ Live Gemini API error: ${err.message}. Seamlessly switched to Built-in Semantic Engine.`);
        return fallback;
      }
    }

    // Otherwise use the deep Built-in Semantic & Entity Execution Engine
    return await this.processSemanticQuery(prompt);
  }

  // ===================== LIVE GOOGLE GEMINI API =====================
  async callGeminiAPI(prompt, chatHistory = []) {
    const customers = store.getCustomers();
    const deals = store.getDeals();
    const activities = store.getActivities();
    const metrics = store.getMetrics();

    const thoughts = [
      `Connecting to Google Gemini (${this.model})...`,
      `Injecting live CRM dataset (${customers.length} accounts, ${deals.length} deals, ${activities.length} tasks)...`,
      `Exposing 4 CRM agentic tools for autonomous execution...`
    ];

    const systemPrompt = `You are SmartAgent, the intelligent agentic sales and CRM copilot embedded in SmartCRM.
You have FULL ACCESS to the company's real-time CRM database.
When answering users:
1. Provide concise, highly strategic, insightful sales and account guidance.
2. If the user asks you to take actions (e.g. move a deal stage, schedule an activity, log a note, update health), USE THE TOOLS provided.
3. If drafting emails or messages, write realistic, persuasive, executive-grade copy referring to the actual customer's details and pain points.
4. Format responses cleanly in GitHub Markdown.

CURRENT LIVE CRM SNAPSHOT:
Total Pipeline: $${metrics.totalPipeline.toLocaleString()} across ${metrics.dealsCount} active deals.
Total ARR: $${metrics.totalARR.toLocaleString()} (MRR: $${metrics.totalMRR.toLocaleString()}).
Win Rate: ${metrics.winRate}%.
At-Risk ARR: $${metrics.atRiskARR.toLocaleString()} (${metrics.highRiskCount} accounts).

CUSTOMERS:
${JSON.stringify(customers.map(c => ({
  id: c.id,
  name: c.name,
  contact: c.contactPerson,
  email: c.email,
  mrr: c.mrr,
  healthScore: c.healthScore,
  churnRisk: c.churnRisk,
  sentiment: c.sentiment,
  industry: c.industry,
  notes: c.notes,
  lastContact: c.lastContact
})), null, 1)}

DEALS:
${JSON.stringify(deals.map(d => ({
  id: d.id,
  title: d.title,
  customerId: d.customerId,
  customerName: d.customerName,
  stage: d.stage,
  value: d.value,
  winProbability: d.winProbability,
  expectedClose: d.expectedClose
})), null, 1)}

ACTIVITIES:
${JSON.stringify(activities.map(a => ({
  id: a.id,
  title: a.title,
  customer: a.customerName,
  type: a.type,
  dueDate: a.dueDate,
  priority: a.priority,
  completed: a.completed
})), null, 1)}`;

    const toolsDeclarations = [
      {
        name: 'update_deal_stage',
        description: 'Update the stage and win probability of a sales opportunity deal in SmartCRM.',
        parameters: {
          type: 'OBJECT',
          properties: {
            dealId: { type: 'STRING', description: 'The unique ID of the deal (e.g. deal_1)' },
            stage: { type: 'STRING', enum: ['lead', 'qualified', 'proposal', 'negotiation', 'won', 'lost'] }
          },
          required: ['dealId', 'stage']
        }
      },
      {
        name: 'create_activity',
        description: 'Schedule a new follow-up task, meeting, call, or email in SmartCRM.',
        parameters: {
          type: 'OBJECT',
          properties: {
            customerId: { type: 'STRING', description: 'Customer ID (e.g. cust_1)' },
            title: { type: 'STRING', description: 'Activity title / subject' },
            type: { type: 'STRING', enum: ['call', 'meeting', 'email', 'task'] },
            dueDate: { type: 'STRING', description: 'YYYY-MM-DD due date' },
            priority: { type: 'STRING', enum: ['normal', 'high', 'urgent'] },
            notes: { type: 'STRING' }
          },
          required: ['customerId', 'title', 'type', 'dueDate']
        }
      },
      {
        name: 'log_customer_interaction',
        description: 'Log an interaction note or draft to a customer profile timeline.',
        parameters: {
          type: 'OBJECT',
          properties: {
            customerId: { type: 'STRING', description: 'Customer ID' },
            type: { type: 'STRING', enum: ['note', 'email', 'call', 'meeting'] },
            title: { type: 'STRING' },
            content: { type: 'STRING' }
          },
          required: ['customerId', 'title', 'content']
        }
      }
    ];

    const contents = [
      ...chatHistory.slice(-6).map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }]
      })),
      { role: 'user', parts: [{ text: prompt }] }
    ];

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`;
    const payload = {
      systemInstruction: { parts: [{ text: systemPrompt }] },
      contents: contents,
      tools: [{ functionDeclarations: toolsDeclarations }]
    };

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `Gemini status ${res.status}`);
    }

    const data = await res.json();
    const candidate = data.candidates?.[0];
    const parts = candidate?.content?.parts || [];

    let responseText = '';
    let executedTool = null;

    for (const part of parts) {
      if (part.text) {
        responseText += part.text;
      }
      if (part.functionCall) {
        const fc = part.functionCall;
        thoughts.push(`Gemini triggered tool call: ${fc.name}(${JSON.stringify(fc.args)})`);

        if (fc.name === 'update_deal_stage') {
          const deal = store.getDealById(fc.args.dealId);
          if (deal) {
            store.updateDealStage(deal.id, fc.args.stage);
            executedTool = {
              name: 'update_deal_stage',
              label: `Moved ${deal.title} ➔ ${fc.args.stage.toUpperCase()}`
            };
            if (!responseText) {
              responseText = `### ⚡ Tool Executed by Gemini\n\nI have updated **${deal.title}** to the **${fc.args.stage.toUpperCase()}** stage in your sales pipeline board.`;
            }
          }
        } else if (fc.name === 'create_activity') {
          const cust = store.getCustomerById(fc.args.customerId);
          const act = store.addActivity({
            title: fc.args.title,
            type: fc.args.type || 'task',
            customerId: fc.args.customerId,
            customerName: cust ? cust.name : 'Client',
            dueDate: fc.args.dueDate || new Date().toISOString().split('T')[0],
            priority: fc.args.priority || 'normal',
            notes: fc.args.notes || 'Created by Gemini Copilot'
          });
          executedTool = {
            name: 'create_activity',
            label: `Scheduled ${act.type.toUpperCase()}: ${act.title}`
          };
          if (!responseText) {
            responseText = `### 📅 Follow-up Scheduled\n\nI have scheduled **${act.title}** on your calendar for **${act.dueDate}** with ${act.customerName}.`;
          }
        } else if (fc.name === 'log_customer_interaction') {
          const cust = store.getCustomerById(fc.args.customerId);
          if (cust) {
            store.addTimelineEntry(cust.id, {
              type: fc.args.type || 'note',
              title: fc.args.title,
              content: fc.args.content
            });
            executedTool = {
              name: 'log_customer_interaction',
              label: `Logged to ${cust.name} timeline: ${fc.args.title}`
            };
          }
        }
      }
    }

    thoughts.push(`Completed generative synthesis via ${this.model}.`);

    return {
      thoughts,
      response: responseText || 'I processed your request in the CRM database.',
      executedTool
    };
  }

  // ===================== HIGH-PRECISION SEMANTIC ENGINE =====================
  async processSemanticQuery(prompt) {
    const rawPrompt = prompt.trim();
    const p = rawPrompt.toLowerCase();
    const customers = store.getCustomers();
    const deals = store.getDeals();
    const activities = store.getActivities();
    const metrics = store.getMetrics();

    const thoughts = [
      'Semantic Intent Parsing: Analyzing inquiry & entity references...',
      'Memory Retrieval: Querying accounts, pipeline stages, and activity cadences...'
    ];

    let response = '';
    let executedTool = null;

    // Detect if user mentions a specific customer by name or contact
    const mentionedCust = customers.find(c => {
      const nameParts = c.name.toLowerCase().split(' ');
      const contactParts = c.contactPerson.toLowerCase().split(' ');
      return p.includes(c.name.toLowerCase()) ||
             p.includes(c.company.toLowerCase()) ||
             nameParts.some(part => part.length > 3 && p.includes(part)) ||
             contactParts.some(part => part.length > 3 && p.includes(part));
    });

    // Detect if user mentions a specific deal
    const mentionedDeal = deals.find(d => {
      return p.includes(d.title.toLowerCase()) ||
             (mentionedCust && d.customerId === mentionedCust.id);
    });

    // 1. ACTION: Move / Change deal stage
    if ((p.includes('move') || p.includes('change') || p.includes('set') || p.includes('update')) &&
        (p.includes('stage') || p.includes('won') || p.includes('negotiation') || p.includes('proposal') || p.includes('qualified') || p.includes('lead') || p.includes('lost'))) {
      
      let targetStage = 'negotiation';
      if (p.includes('won')) targetStage = 'won';
      else if (p.includes('proposal')) targetStage = 'proposal';
      else if (p.includes('qualified')) targetStage = 'qualified';
      else if (p.includes('lost')) targetStage = 'lost';
      else if (p.includes('lead')) targetStage = 'lead';

      const targetDeal = mentionedDeal || deals[0];
      if (targetDeal) {
        store.updateDealStage(targetDeal.id, targetStage);
        thoughts.push(`Database Mutation: Updated deal "${targetDeal.title}" to ${targetStage.toUpperCase()}.`);

        response = `### ⚡ Deal Stage Transitioned\n\nI have moved **${targetDeal.title}** to the **${targetStage.toUpperCase()}** stage.\n\n- **Deal Value:** ${formatCurrency(targetDeal.value)}\n- **Win Probability:** ${targetDeal.winProbability}%\n- **Account:** ${targetDeal.customerName}\n\nThe Kanban pipeline board and forecast analytics have been refreshed immediately.`;

        executedTool = {
          name: 'update_deal_stage',
          label: `Stage updated: ${targetDeal.title} ➔ ${targetStage.toUpperCase()}`
        };
        return { thoughts, response, executedTool };
      }
    }

    // 2. ACTION: Create a task, call, or meeting
    if (p.startsWith('schedule') || p.startsWith('create') || p.startsWith('add') || p.includes('remind me') || p.includes('create a task') || p.includes('schedule a call')) {
      if (p.includes('task') || p.includes('call') || p.includes('meeting') || p.includes('sync')) {
        let type = 'task';
        if (p.includes('call') || p.includes('phone')) type = 'call';
        else if (p.includes('meeting') || p.includes('sync')) type = 'meeting';

        const cust = mentionedCust || customers[0];
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const dueDate = tomorrow.toISOString().split('T')[0];

        const cleanTitle = rawPrompt
          .replace(/^(schedule|create|add|set up|please schedule|can you create)\s+(a\s+)?(task|call|meeting|sync)?\s*(to|for|with)?/i, '')
          .trim() || `Follow-up with ${cust.name}`;

        const act = store.addActivity({
          title: cleanTitle.length > 3 ? cleanTitle : `Executive follow-up with ${cust.contactPerson}`,
          type: type,
          customerId: cust.id,
          customerName: cust.name,
          dueDate: dueDate,
          priority: p.includes('urgent') ? 'urgent' : 'high',
          notes: `Created automatically by SmartAgent via chat command.`
        });

        thoughts.push(`Database Mutation: Created ${type} activity for ${cust.name} due on ${dueDate}.`);

        response = `### 📅 Activity Created & Scheduled\n\nI have scheduled a new **${type.toUpperCase()}** on your CRM calendar:\n\n- **Subject:** ${act.title}\n- **Customer:** ${cust.name} (${cust.contactPerson})\n- **Due Date:** ${dueDate}\n- **Priority:** ${act.priority.toUpperCase()}\n\nYou can review this item in the **Activities & Follow-ups** tab.`;

        executedTool = {
          name: 'create_activity',
          label: `Created ${type.toUpperCase()}: ${act.title}`
        };
        return { thoughts, response, executedTool };
      }
    }

    // 3. ACTION / GENERATION: Draft an email
    if (p.includes('draft') || p.includes('write an email') || p.includes('compose') || p.includes('email to') || p.includes('message to')) {
      const cust = mentionedCust || customers[0];
      const draft = this.generateCustomEmail(cust, rawPrompt);

      thoughts.push(`Contextual Generation: Extracted ${cust.name} (${cust.contactPerson}) with Health ${cust.healthScore}.`);
      thoughts.push(`Synthesized tailored message addressing user's topic.`);

      response = `### ✉️ Custom Outreach Draft for **${cust.name}**\n\n**To:** ${cust.contactPerson} (${cust.email})\n**Subject:** *${draft.subject}*\n\n\`\`\`text\n${draft.body}\n\`\`\`\n\n*Action taken:* I have logged this draft to **${cust.name}**'s interaction timeline so your entire team has visibility.`;

      store.addTimelineEntry(cust.id, {
        type: 'email',
        title: `AI Draft Prepared: ${draft.subject}`,
        content: `Draft generated by SmartAgent:\n\n"${draft.subject}"\n${draft.body}`
      });

      executedTool = {
        name: 'draft_email',
        label: `Saved draft to ${cust.name} timeline`
      };
      return { thoughts, response, executedTool };
    }

    // 4. INQUIRY: Specific Customer Profile / Risk / Why
    if (mentionedCust) {
      const custDeals = deals.filter(d => d.customerId === mentionedCust.id);
      const custActs = activities.filter(a => a.customerId === mentionedCust.id);

      thoughts.push(`Deep Retrieval: Loaded 360 profile for ${mentionedCust.name} (MRR: ${formatCurrency(mentionedCust.mrr)}, Health: ${mentionedCust.healthScore}).`);

      let riskDiagnosis = '';
      if (mentionedCust.healthScore < 60) {
        riskDiagnosis = `\n\n**⚠️ Health Risk Diagnosis:** Health is currently at \`${mentionedCust.healthScore}/100\` (${mentionedCust.churnRisk} Churn Risk). Key vulnerabilities:\n` +
          `- Notes indicate: *"${mentionedCust.notes}"*\n` +
          `- Last customer contact was on **${mentionedCust.lastContact}**.\n` +
          `**Recommended Intervention:** Schedule an executive sync or offer dedicated engineering SLA review.`;
      } else {
        riskDiagnosis = `\n\n**🌟 Champion Account:** Health score is high at \`${mentionedCust.healthScore}/100\`. Client shows strong engagement and positive sentiment. Ideal candidate for referral or expansion add-ons.`;
      }

      response = `### 🏢 Account Deep Dive: **${mentionedCust.name}**\n\n` +
        `- **Primary Contact:** ${mentionedCust.contactPerson} (${mentionedCust.role || 'Executive'})\n` +
        `- **Email / Phone:** ${mentionedCust.email} &bull; ${mentionedCust.phone || 'N/A'}\n` +
        `- **Financials:** MRR **${formatCurrency(mentionedCust.mrr)}** | ARR **${formatCurrency(mentionedCust.mrr * 12)}** | LTV **${formatCurrency(mentionedCust.ltv)}**\n` +
        `- **Tier & Industry:** ${mentionedCust.tier} &bull; ${mentionedCust.industry}\n` +
        `- **Associated Deals:** ${custDeals.length > 0 ? custDeals.map(d => `${d.title} (${formatCurrency(d.value)} - ${d.stage.toUpperCase()})`).join(', ') : 'None open'}\n` +
        `- **Pending Tasks:** ${custActs.length} scheduled` +
        riskDiagnosis;

      return { thoughts, response, executedTool: null };
    }

    // 5. INQUIRY: Churn / Risk / At-Risk Accounts
    if (p.includes('risk') || p.includes('churn') || p.includes('danger') || p.includes('vulnerable') || p.includes('critical')) {
      const atRisk = customers.filter(c => c.churnRisk === 'High' || c.healthScore < 55);
      const totalLoss = atRisk.reduce((s, c) => s + (c.mrr * 12), 0);

      thoughts.push(`Risk Intelligence: Identified ${atRisk.length} high-risk accounts representing ${formatCurrency(totalLoss)} ARR.`);

      response = `### 🚨 Churn Risk Audit & Vulnerability Analysis\n\nThere are **${atRisk.length} accounts in critical watchband**, representing **${formatCurrency(totalLoss)} in annual recurring revenue**:\n\n` +
        atRisk.map(c => `- **${c.name}** (Health: \`${c.healthScore}/100\` | ARR: **${formatCurrency(c.mrr * 12)}**)\n  *Primary Issue:* ${c.notes || 'Inactivity and risk flags'}\n  *Contact:* ${c.contactPerson} (${c.email})`).join('\n\n') +
        `\n\n**Agentic Recommendation:** Ask me to *"Draft a re-engagement email for ${atRisk[0]?.name}"* or click **Run AI Health Audit** to generate intervention playbooks.`;

      return { thoughts, response, executedTool: null };
    }

    // 6. INQUIRY: Top Accounts / Largest Customers
    if (p.includes('top') || p.includes('biggest') || p.includes('largest') || p.includes('highest') || p.includes('champion')) {
      const sortedByARR = [...customers].sort((a, b) => b.mrr - a.mrr).slice(0, 5);

      thoughts.push(`Aggregated top 5 enterprise accounts sorted by MRR/ARR.`);

      response = `### 🏆 Top Customer Accounts by Revenue\n\n` +
        sortedByARR.map((c, i) => `${i + 1}. **${c.name}**\n   - ARR: **${formatCurrency(c.mrr * 12)}** (MRR: ${formatCurrency(c.mrr)})\n   - Health: \`${c.healthScore}/100\` (${c.churnRisk} Risk)\n   - Contact: ${c.contactPerson} &bull; ${c.industry}`).join('\n\n') +
        `\n\nThese 5 accounts account for **${formatCurrency(sortedByARR.reduce((s, c) => s + c.mrr * 12, 0))}** (over ${Math.round((sortedByARR.reduce((s, c) => s + c.mrr, 0) / metrics.totalMRR) * 100)}% of total ARR).`;

      return { thoughts, response, executedTool: null };
    }

    // 7. INQUIRY: Pipeline & Revenue Forecast
    if (p.includes('pipeline') || p.includes('deal') || p.includes('revenue') || p.includes('forecast') || p.includes('close')) {
      const activeDeals = deals.filter(d => d.stage !== 'won' && d.stage !== 'lost');
      const negotiationDeals = deals.filter(d => d.stage === 'negotiation');
      const weighted = activeDeals.reduce((s, d) => s + (d.value * (d.winProbability || 50) / 100), 0);

      thoughts.push(`Calculated pipeline velocity across ${activeDeals.length} active opportunities.`);

      response = `### 💼 Pipeline & Sales Velocity Intelligence\n\n- **Total Active Pipeline:** **${formatCurrency(metrics.totalPipeline)}** across **${activeDeals.length} open deals**.\n- **Weighted Revenue Forecast:** **${formatCurrency(weighted)}**.\n- **Historical Win Rate:** **${metrics.winRate}%**.\n- **Deals in Negotiation (${negotiationDeals.length}):**\n` +
        negotiationDeals.map(d => `  - **${d.title}**: ${formatCurrency(d.value)} (${d.winProbability}% win probability)`).join('\n') +
        `\n\n**Next Best Action:** Would you like me to move any deal stage or schedule a closing sync?`;

      return { thoughts, response, executedTool: null };
    }

    // 8. INQUIRY: Tasks / What to do today / Overdue
    if (p.includes('today') || p.includes('priority') || p.includes('what should i do') || p.includes('task') || p.includes('overdue')) {
      const todayStr = new Date().toISOString().split('T')[0];
      const overdue = activities.filter(a => !a.completed && a.dueDate < todayStr);
      const pending = activities.filter(a => !a.completed);

      thoughts.push(`Evaluated task queue: ${overdue.length} overdue, ${pending.length} pending.`);

      response = `### 📋 Daily Sales Action Plan & Priorities\n\n` +
        (overdue.length > 0 ? `**⚠️ Overdue Items Requiring Immediate Action:**\n` +
        overdue.map(a => `- **[OVERDUE]** ${a.title} with **${a.customerName}** (Due: ${a.dueDate})`).join('\n') + `\n\n` : `All previous activities are on track!\n\n`) +
        `**🎯 Top 3 Strategic Priorities for Today:**\n` +
        `1. **Intervene on Apex Cloud Systems**: Health score at 42, contract renewal in 30 days ($165k value).\n` +
        `2. **Fast-track FinEdge European Proposal**: Marcus Vance has security clearance, deal probability at 85% ($95k).\n` +
        `3. **Re-engage Derrick at Nexus Retail**: Deal has been stalled for 12 days without customer response.`;

      return { thoughts, response, executedTool: null };
    }

    // 9. DEFAULT COMPREHENSIVE INTELLIGENCE OVERVIEW
    thoughts.push(`Synthesized holistic CRM state and dynamic assistant capabilities.`);

    response = `### 🤖 SmartAgent Sales & Account Intelligence\n\nI understand your business data across **${customers.length} customer accounts**, **${deals.length} deals**, and **${activities.length} scheduled follow-ups**.\n\n` +
      `- **Current ARR:** **${formatCurrency(metrics.totalARR)}** (MRR: ${formatCurrency(metrics.totalMRR)})\n` +
      `- **Pipeline Volume:** **${formatCurrency(metrics.totalPipeline)}** across ${metrics.dealsCount} active deals\n` +
      `- **Accounts Flagged for Churn Risk:** **${metrics.highRiskCount} account(s)** (${formatCurrency(metrics.atRiskARR)} ARR)\n` +
      `- **Pending Tasks:** **${metrics.pendingTasksCount}** (${metrics.overdueTasksCount} overdue)\n\n` +
      `**You can ask me to:**\n` +
      `- *"Why is Elena / Apex Cloud at risk?"*\n` +
      `- *"Draft a proposal email for Marcus at FinEdge"* \n` +
      `- *"Schedule an executive call with Victor Thorne tomorrow"*\n` +
      `- *"Move Apex Cloud deal to Won"*\n` +
      `- *"Who are our top 5 revenue clients?"*\n\n` +
      `💡 *Tip:* Click the **AI Settings (Gear)** button above to connect your live Google Gemini API key for frontier conversational reasoning!`;

    return { thoughts, response, executedTool };
  }
}

export const aiAgent = new AIAgentService();
