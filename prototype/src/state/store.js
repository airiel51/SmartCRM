// ===================================================================
// REACTIVE CENTRAL CRM STORE
// Handles persistence in LocalStorage, pub/sub updates, and mutations
// ===================================================================

import {
  initialCustomers,
  initialDeals,
  initialActivities,
  initialRecommendations
} from '../data/initialData.js';
import { generateId } from '../utils/helpers.js';

const STORAGE_KEY = 'smartcrm_store_data_v1';

class Store {
  constructor() {
    this.subscribers = new Set();
    this.loadState();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.customers = parsed.customers || initialCustomers;
        this.deals = parsed.deals || initialDeals;
        this.activities = parsed.activities || initialActivities;
        this.recommendations = parsed.recommendations || initialRecommendations;
        this.aiAuditLogs = parsed.aiAuditLogs || [];
      } else {
        this.resetToInitial(false);
      }
    } catch (e) {
      console.error('Error loading CRM state, restoring defaults:', e);
      this.resetToInitial(false);
    }
  }

  saveState() {
    try {
      const data = {
        customers: this.customers,
        deals: this.deals,
        activities: this.activities,
        recommendations: this.recommendations,
        aiAuditLogs: this.aiAuditLogs,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      this.notify();
    } catch (e) {
      console.error('Error saving CRM state:', e);
    }
  }

  resetToInitial(shouldNotify = true) {
    this.customers = JSON.parse(JSON.stringify(initialCustomers));
    this.deals = JSON.parse(JSON.stringify(initialDeals));
    this.activities = JSON.parse(JSON.stringify(initialActivities));
    this.recommendations = JSON.parse(JSON.stringify(initialRecommendations));
    this.aiAuditLogs = [];
    localStorage.removeItem(STORAGE_KEY);
    if (shouldNotify) {
      this.saveState();
    }
  }

  subscribe(callback) {
    this.subscribers.add(callback);
    return () => this.subscribers.delete(callback);
  }

  notify() {
    this.subscribers.forEach(cb => {
      try {
        cb(this);
      } catch (err) {
        console.error('Subscriber callback error:', err);
      }
    });
  }

  // ===================== CUSTOMERS =====================
  getCustomers() {
    return this.customers;
  }

  getCustomerById(id) {
    return this.customers.find(c => c.id === id);
  }

  addCustomer(customerData) {
    const newCustomer = {
      id: generateId('cust'),
      healthScore: 75,
      churnRisk: 'Low',
      sentiment: 'Positive',
      tags: [],
      lastContact: new Date().toISOString().split('T')[0],
      assignedTo: 'Alex Rivera',
      timeline: [
        {
          id: generateId('tl'),
          type: 'note',
          title: 'Account created in SmartCRM',
          content: 'Initial customer record registered.',
          date: new Date().toISOString().split('T')[0],
          author: 'System'
        }
      ],
      ...customerData
    };
    this.customers.unshift(newCustomer);
    this.saveState();
    return newCustomer;
  }

  updateCustomer(id, updates) {
    const idx = this.customers.findIndex(c => c.id === id);
    if (idx !== -1) {
      this.customers[idx] = { ...this.customers[idx], ...updates };
      // Also update name in associated deals
      if (updates.name) {
        this.deals.forEach(deal => {
          if (deal.customerId === id) deal.customerName = updates.name;
        });
        this.activities.forEach(act => {
          if (act.customerId === id) act.customerName = updates.name;
        });
      }
      this.saveState();
      return this.customers[idx];
    }
    return null;
  }

  deleteCustomer(id) {
    this.customers = this.customers.filter(c => c.id !== id);
    this.deals = this.deals.filter(d => d.customerId !== id);
    this.activities = this.activities.filter(a => a.customerId !== id);
    this.recommendations = this.recommendations.filter(r => r.customerId !== id);
    this.saveState();
  }

  addTimelineEntry(customerId, entry) {
    const cust = this.getCustomerById(customerId);
    if (cust) {
      if (!cust.timeline) cust.timeline = [];
      const newEntry = {
        id: generateId('tl'),
        date: new Date().toISOString().split('T')[0],
        author: 'Alex Rivera',
        ...entry
      };
      cust.timeline.unshift(newEntry);
      cust.lastContact = newEntry.date;
      this.saveState();
      return newEntry;
    }
    return null;
  }

  // ===================== DEALS =====================
  getDeals() {
    return this.deals;
  }

  getDealById(id) {
    return this.deals.find(d => d.id === id);
  }

  addDeal(dealData) {
    const newDeal = {
      id: generateId('deal'),
      winProbability: 50,
      stage: 'lead',
      createdAt: new Date().toISOString().split('T')[0],
      assignedTo: 'Alex Rivera',
      ...dealData
    };
    this.deals.unshift(newDeal);
    this.saveState();
    return newDeal;
  }

  updateDeal(id, updates) {
    const idx = this.deals.findIndex(d => d.id === id);
    if (idx !== -1) {
      this.deals[idx] = { ...this.deals[idx], ...updates };
      this.saveState();
      return this.deals[idx];
    }
    return null;
  }

  updateDealStage(dealId, newStage) {
    const deal = this.getDealById(dealId);
    if (deal) {
      deal.stage = newStage;
      if (newStage === 'won') deal.winProbability = 100;
      else if (newStage === 'lost') deal.winProbability = 0;
      else if (newStage === 'proposal') deal.winProbability = 60;
      else if (newStage === 'negotiation') deal.winProbability = 80;
      this.saveState();
      return deal;
    }
    return null;
  }

  deleteDeal(id) {
    this.deals = this.deals.filter(d => d.id !== id);
    this.saveState();
  }

  // ===================== ACTIVITIES =====================
  getActivities() {
    return this.activities;
  }

  addActivity(actData) {
    const newAct = {
      id: generateId('act'),
      completed: false,
      priority: 'normal',
      assignedTo: 'Alex Rivera',
      dueDate: new Date().toISOString().split('T')[0],
      ...actData
    };
    this.activities.unshift(newAct);
    this.saveState();
    return newAct;
  }

  toggleActivityComplete(id) {
    const act = this.activities.find(a => a.id === id);
    if (act) {
      act.completed = !act.completed;
      this.saveState();
      return act;
    }
    return null;
  }

  deleteActivity(id) {
    this.activities = this.activities.filter(a => a.id !== id);
    this.saveState();
  }

  // ===================== RECOMMENDATIONS =====================
  getRecommendations() {
    return this.recommendations;
  }

  dismissRecommendation(id) {
    this.recommendations = this.recommendations.filter(r => r.id !== id);
    this.saveState();
  }

  addRecommendation(rec) {
    const newRec = {
      id: generateId('rec'),
      priority: 'medium',
      createdAt: new Date().toISOString(),
      ...rec
    };
    this.recommendations.unshift(newRec);
    this.saveState();
    return newRec;
  }

  // ===================== METRICS CALCULATION =====================
  getMetrics() {
    const activeDeals = this.deals.filter(d => d.stage !== 'lost');
    const totalPipeline = activeDeals.reduce((sum, d) => sum + (d.value || 0), 0);
    const wonDeals = this.deals.filter(d => d.stage === 'won');
    const totalWon = wonDeals.reduce((sum, d) => sum + (d.value || 0), 0);
    const closedCount = this.deals.filter(d => d.stage === 'won' || d.stage === 'lost').length;
    const winRate = closedCount > 0 ? Math.round((wonDeals.length / closedCount) * 100) : 75;

    const totalMRR = this.customers.reduce((sum, c) => sum + (c.mrr || 0), 0);
    const totalARR = totalMRR * 12;

    const highRiskCustomers = this.customers.filter(c => c.churnRisk === 'High' || c.healthScore < 50);
    const atRiskARR = highRiskCustomers.reduce((sum, c) => sum + ((c.mrr || 0) * 12), 0);

    const pendingTasks = this.activities.filter(a => !a.completed);
    const today = new Date().toISOString().split('T')[0];
    const overdueTasks = pendingTasks.filter(a => a.dueDate < today);

    return {
      totalPipeline,
      totalWon,
      winRate,
      totalMRR,
      totalARR,
      atRiskARR,
      customerCount: this.customers.length,
      highRiskCount: highRiskCustomers.length,
      dealsCount: this.deals.length,
      pendingTasksCount: pendingTasks.length,
      overdueTasksCount: overdueTasks.length,
      activeRecommendationsCount: this.recommendations.length
    };
  }

  exportDataJson() {
    return JSON.stringify({
      customers: this.customers,
      deals: this.deals,
      activities: this.activities,
      recommendations: this.recommendations
    }, null, 2);
  }
}

export const store = new Store();
