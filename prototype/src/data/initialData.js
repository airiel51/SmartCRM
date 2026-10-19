// ===================================================================
// INITIAL REALISTIC B2B DEMO DATASET
// Pre-populated with realistic accounts, deals, tasks & AI signals
// ===================================================================

export const initialCustomers = [
  {
    id: "cust_1",
    name: "Apex Cloud Systems",
    company: "Apex Cloud Systems Inc.",
    contactPerson: "Elena Rostova",
    role: "Chief Technology Officer",
    email: "elena@apexcloud.io",
    phone: "+1 (415) 890-2134",
    industry: "Enterprise SaaS",
    tier: "Enterprise",
    mrr: 12500,
    ltv: 150000,
    healthScore: 42, // Critical / At-Risk
    churnRisk: "High",
    sentiment: "At-Risk",
    tags: ["High-Value", "API Integration", "Renewal in 30d"],
    lastContact: "2026-09-18",
    assignedTo: "Alex Rivera",
    notes: "Client reported performance latency with the data sync pipeline. CTO requested an escalation call before reviewing renewal.",
    timeline: [
      {
        id: "tl_1",
        type: "email",
        title: "Renewal concern regarding latency",
        content: "Elena sent feedback indicating concerns about API throughput during peak hours.",
        date: "2026-09-18",
        author: "Elena Rostova"
      },
      {
        id: "tl_2",
        type: "meeting",
        title: "Quarterly Executive Review",
        content: "Reviewed roadmap features. Contract ends next month.",
        date: "2026-08-20",
        author: "Alex Rivera"
      }
    ]
  },
  {
    id: "cust_2",
    name: "FinEdge Technologies",
    company: "FinEdge Global Ltd.",
    contactPerson: "Marcus Vance",
    role: "VP of Operations",
    email: "m.vance@finedge.com",
    phone: "+1 (212) 555-0199",
    industry: "Fintech",
    tier: "Enterprise",
    mrr: 28000,
    ltv: 336000,
    healthScore: 94, // Champion
    churnRisk: "Low",
    sentiment: "Positive",
    tags: ["Champion", "SOC2 Compliant", "Upsell Candidate"],
    lastContact: "2026-10-04",
    assignedTo: "Alex Rivera",
    notes: "Highly satisfied with SmartCRM workflows. Explored expanding seats to European regional team (+45 seats).",
    timeline: [
      {
        id: "tl_3",
        type: "call",
        title: "Expansion Alignment Call",
        content: "Discussed multi-region compliance and seat licensing for London team.",
        date: "2026-10-04",
        author: "Alex Rivera"
      },
      {
        id: "tl_4",
        type: "email",
        title: "Security Assessment Approved",
        content: "Legal and IT security cleared new workspace module.",
        date: "2026-09-29",
        author: "Marcus Vance"
      }
    ]
  },
  {
    id: "cust_3",
    name: "BioNova Therapeutics",
    company: "BioNova Health Labs",
    contactPerson: "Dr. Sarah Chen",
    role: "Director of Research Informatics",
    email: "s.chen@bionova.org",
    phone: "+1 (617) 492-7100",
    industry: "Healthcare & Life Sciences",
    tier: "Mid-Market",
    mrr: 9200,
    ltv: 110400,
    healthScore: 81,
    churnRisk: "Low",
    sentiment: "Positive",
    tags: ["HIPAA", "Research", "Active User"],
    lastContact: "2026-10-02",
    assignedTo: "Sarah Jenkins",
    notes: "Adoption rate hit 89% across medical science liaisons. Smooth onboarding.",
    timeline: [
      {
        id: "tl_5",
        type: "note",
        title: "Feature Request Logged",
        content: "Requested custom export for clinical trial interaction metrics.",
        date: "2026-10-02",
        author: "Sarah Jenkins"
      }
    ]
  },
  {
    id: "cust_4",
    name: "Nexus Retail Omni",
    company: "Nexus Brands Corporation",
    contactPerson: "Derrick Hayes",
    role: "Head of Omnichannel Sales",
    email: "dhayes@nexusretail.com",
    phone: "+1 (312) 438-8921",
    industry: "E-Commerce & Retail",
    tier: "Enterprise",
    mrr: 18500,
    ltv: 222000,
    healthScore: 63, // Warning
    churnRisk: "Medium",
    sentiment: "Neutral",
    tags: ["Stalled Activity", "Retail", "Holiday Prep"],
    lastContact: "2026-09-24",
    assignedTo: "Alex Rivera",
    notes: "Holiday campaign prep in progress. No platform login in 12 days.",
    timeline: [
      {
        id: "tl_6",
        type: "email",
        title: "Follow-up on holiday campaign integration",
        content: "Sent checklist for POS sync. Awaiting Derrick's confirmation.",
        date: "2026-09-24",
        author: "Alex Rivera"
      }
    ]
  },
  {
    id: "cust_5",
    name: "Quantum Logistics",
    company: "Quantum Freight AI",
    contactPerson: "Ananya Patel",
    role: "VP Supply Chain Tech",
    email: "apatel@quantumlogistics.net",
    phone: "+1 (206) 774-9012",
    industry: "Logistics & Transport",
    tier: "Mid-Market",
    mrr: 7500,
    ltv: 90000,
    healthScore: 88,
    churnRisk: "Low",
    sentiment: "Positive",
    tags: ["Fast Growth", "Fleet Tracking"],
    lastContact: "2026-10-05",
    assignedTo: "Sarah Jenkins",
    notes: "Rapid rollout across 4 logistics hubs completed ahead of schedule.",
    timeline: [
      {
        id: "tl_7",
        type: "call",
        title: "Weekly Check-in",
        content: "Everything on track. Requested dashboard training for dispatchers.",
        date: "2026-10-05",
        author: "Sarah Jenkins"
      }
    ]
  },
  {
    id: "cust_6",
    name: "Vanguard Cyber Defense",
    company: "Vanguard Security Group",
    contactPerson: "Victor Thorne",
    role: "Chief Information Security Officer",
    email: "vthorne@vanguardsec.io",
    phone: "+1 (703) 621-3344",
    industry: "Cybersecurity",
    tier: "Enterprise",
    mrr: 21000,
    ltv: 252000,
    healthScore: 54, // Warning
    churnRisk: "Medium",
    sentiment: "At-Risk",
    tags: ["Security", "Executive Sponsor Left"],
    lastContact: "2026-09-15",
    assignedTo: "Alex Rivera",
    notes: "Previous champion moved to another company. Need to establish relationship with new director of IT.",
    timeline: [
      {
        id: "tl_8",
        type: "note",
        title: "Sponsor Transition Alert",
        content: "Victor joined as CISO. Needs executive introduction and value review.",
        date: "2026-09-15",
        author: "Alex Rivera"
      }
    ]
  },
  {
    id: "cust_7",
    name: "Strata Industrial AI",
    company: "Strata Manufacturing Corp.",
    contactPerson: "Liam O'Connor",
    role: "COO",
    email: "loconnor@strata-ai.com",
    phone: "+1 (313) 880-9922",
    industry: "Manufacturing",
    tier: "Mid-Market",
    mrr: 6400,
    ltv: 76800,
    healthScore: 79,
    churnRisk: "Low",
    sentiment: "Positive",
    tags: ["IoT", "Mid-West"],
    lastContact: "2026-09-30",
    assignedTo: "Sarah Jenkins",
    notes: "Implemented factory telemetry feeds directly to CRM customer ticket views.",
    timeline: [
      {
        id: "tl_9",
        type: "meeting",
        title: "Telemetry Integration Demo",
        content: "Factory line supervisor showed live alerts syncing smoothly.",
        date: "2026-09-30",
        author: "Sarah Jenkins"
      }
    ]
  },
  {
    id: "cust_8",
    name: "Krona Media Labs",
    company: "Krona Digital Network",
    contactPerson: "Chantal Monet",
    role: "VP Audience Growth",
    email: "cmonet@kronamedia.fr",
    phone: "+33 1 42 68 55 00",
    industry: "Digital Media",
    tier: "SMB",
    mrr: 3800,
    ltv: 45600,
    healthScore: 48,
    churnRisk: "High",
    sentiment: "At-Risk",
    tags: ["SMB", "Payment Delay", "Low Usage"],
    lastContact: "2026-09-12",
    assignedTo: "Alex Rivera",
    notes: "Failed payment retry on Sept 28. Usage decreased 40% in past month.",
    timeline: [
      {
        id: "tl_10",
        type: "email",
        title: "Billing Notification",
        content: "Sent notice regarding credit card update.",
        date: "2026-09-28",
        author: "Billing Bot"
      }
    ]
  },
  {
    id: "cust_9",
    name: "Hyperion Solar Energy",
    company: "Hyperion Renewables",
    contactPerson: "Julian Vega",
    role: "VP Commercial Development",
    email: "jvega@hyperionsolar.com",
    phone: "+1 (480) 619-3388",
    industry: "CleanTech & Energy",
    tier: "Mid-Market",
    mrr: 11200,
    ltv: 134400,
    healthScore: 91,
    churnRisk: "Low",
    sentiment: "Positive",
    tags: ["CleanTech", "Expanding", "Quarterly Top Performer"],
    lastContact: "2026-10-06",
    assignedTo: "Sarah Jenkins",
    notes: "Closed 3 industrial microgrid projects this month using CRM pipeline automation.",
    timeline: [
      {
        id: "tl_11",
        type: "call",
        title: "Success Story Interview",
        content: "Julian agreed to be featured in our upcoming CleanTech case study.",
        date: "2026-10-06",
        author: "Sarah Jenkins"
      }
    ]
  },
  {
    id: "cust_10",
    name: "Symphony HR Suites",
    company: "Symphony Talent Inc.",
    contactPerson: "Chloe Bennett",
    role: "Head of People Operations",
    email: "chloe@symphonyhr.co",
    phone: "+1 (512) 904-2211",
    industry: "HR Tech",
    tier: "Mid-Market",
    mrr: 8400,
    ltv: 100800,
    healthScore: 85,
    churnRisk: "Low",
    sentiment: "Positive",
    tags: ["HR Tech", "Fast Onboarding"],
    lastContact: "2026-10-01",
    assignedTo: "Alex Rivera",
    notes: "Considering integrating our ATS connector next sprint.",
    timeline: [
      {
        id: "tl_12",
        type: "meeting",
        title: "ATS Connector Architecture",
        content: "Technical demo of webhook integration with Greenhouse and Lever.",
        date: "2026-10-01",
        author: "Alex Rivera"
      }
    ]
  },
  {
    id: "cust_11",
    name: "PulseHealth Medical",
    company: "PulseHealth Telemedicine",
    contactPerson: "Dr. Arthur Bell",
    role: "Chief Medical Officer",
    email: "abell@pulsehealth.med",
    phone: "+1 (305) 782-9011",
    industry: "Healthcare & Life Sciences",
    tier: "Enterprise",
    mrr: 19500,
    ltv: 234000,
    healthScore: 72,
    churnRisk: "Medium",
    sentiment: "Neutral",
    tags: ["Healthcare", "HIPAA", "Review Due"],
    lastContact: "2026-09-22",
    assignedTo: "Sarah Jenkins",
    notes: "Requires dedicated CSM check-in for upcoming regional telehealth launch.",
    timeline: [
      {
        id: "tl_13",
        type: "email",
        title: "Telehealth SLA Inquiries",
        content: "Arthur inquired about 99.99% uptime guarantees for clinic hours.",
        date: "2026-09-22",
        author: "Dr. Arthur Bell"
      }
    ]
  },
  {
    id: "cust_12",
    name: "AeroDynamics Tech",
    company: "AeroDynamics Avionics",
    contactPerson: "Siddharth Rao",
    role: "VP Engineering",
    email: "s.rao@aerodynamics.aero",
    phone: "+1 (310) 991-4455",
    industry: "Aerospace & Defense",
    tier: "Enterprise",
    mrr: 24000,
    ltv: 288000,
    healthScore: 89,
    churnRisk: "Low",
    sentiment: "Positive",
    tags: ["Defense", "High LTV", "Annual Contract"],
    lastContact: "2026-10-03",
    assignedTo: "Alex Rivera",
    notes: "Contract signed for multi-year enterprise license with dedicated support.",
    timeline: [
      {
        id: "tl_14",
        type: "note",
        title: "Annual Billing Finalized",
        content: "PO received and verified for fiscal year 2027.",
        date: "2026-10-03",
        author: "Alex Rivera"
      }
    ]
  }
];

export const initialDeals = [
  {
    id: "deal_1",
    title: "Apex Cloud Enterprise Renewal & Dedicated Cluster",
    customerId: "cust_1",
    customerName: "Apex Cloud Systems",
    stage: "negotiation", // lead, qualified, proposal, negotiation, won, lost
    value: 165000,
    winProbability: 45,
    expectedClose: "2026-10-31",
    assignedTo: "Alex Rivera",
    aiInsight: "Risk flagged: High latency friction. Win probability drops 15% if tech sync is not scheduled within 48h.",
    createdAt: "2026-08-15"
  },
  {
    id: "deal_2",
    title: "FinEdge European Team Expansion (45 Seats)",
    customerId: "cust_2",
    customerName: "FinEdge Technologies",
    stage: "proposal",
    value: 95000,
    winProbability: 85,
    expectedClose: "2026-11-15",
    assignedTo: "Alex Rivera",
    aiInsight: "High intent signal: Compliance cleared. Deal velocity 40% above baseline.",
    createdAt: "2026-09-20"
  },
  {
    id: "deal_3",
    title: "BioNova Clinical Trial Workflow Module",
    customerId: "cust_3",
    customerName: "BioNova Therapeutics",
    stage: "qualified",
    value: 52000,
    winProbability: 70,
    expectedClose: "2026-12-05",
    assignedTo: "Sarah Jenkins",
    aiInsight: "Strong product-usage correlation. Recommend sharing BioTech whitepaper.",
    createdAt: "2026-09-28"
  },
  {
    id: "deal_4",
    title: "Nexus Omni POS Synchronizer Add-On",
    customerId: "cust_4",
    customerName: "Nexus Retail Omni",
    stage: "lead",
    value: 48000,
    winProbability: 35,
    expectedClose: "2026-11-30",
    assignedTo: "Alex Rivera",
    aiInsight: "Deal stalled for 12 days without customer response. Recommend executive outreach.",
    createdAt: "2026-09-10"
  },
  {
    id: "deal_5",
    title: "Quantum Fleet Telematics Integration Tier",
    customerId: "cust_5",
    customerName: "Quantum Logistics",
    stage: "proposal",
    value: 64000,
    winProbability: 78,
    expectedClose: "2026-11-20",
    assignedTo: "Sarah Jenkins",
    aiInsight: "Onboarding completed fast. Ready for commercial contract sign-off.",
    createdAt: "2026-09-18"
  },
  {
    id: "deal_6",
    title: "Vanguard SIEM Security Connector Upgrade",
    customerId: "cust_6",
    customerName: "Vanguard Cyber Defense",
    stage: "qualified",
    value: 88000,
    winProbability: 50,
    expectedClose: "2026-12-15",
    assignedTo: "Alex Rivera",
    aiInsight: "New CISO appointed. High probability if scheduled for security architecture briefing.",
    createdAt: "2026-09-05"
  },
  {
    id: "deal_7",
    title: "Hyperion Multi-State Grid Rollout",
    customerId: "cust_9",
    customerName: "Hyperion Solar Energy",
    stage: "won",
    value: 140000,
    winProbability: 100,
    expectedClose: "2026-10-01",
    assignedTo: "Sarah Jenkins",
    aiInsight: "Won! Customer expressed interest in referral program.",
    createdAt: "2026-07-20"
  },
  {
    id: "deal_8",
    title: "AeroDynamics Flight Control Analytics Package",
    customerId: "cust_12",
    customerName: "AeroDynamics Tech",
    stage: "won",
    value: 210000,
    winProbability: 100,
    expectedClose: "2026-09-28",
    assignedTo: "Alex Rivera",
    aiInsight: "Closed successfully. Multi-year enterprise license locked.",
    createdAt: "2026-06-12"
  }
];

export const initialActivities = [
  {
    id: "act_1",
    type: "meeting",
    title: "Executive Sync with Elena (Latency resolution)",
    customerId: "cust_1",
    customerName: "Apex Cloud Systems",
    dealId: "deal_1",
    dueDate: "2026-10-08",
    priority: "urgent",
    completed: false,
    assignedTo: "Alex Rivera",
    notes: "Review infrastructure mitigation benchmarks before contract renewal discussion."
  },
  {
    id: "act_2",
    type: "call",
    title: "Re-engage Derrick regarding POS sync stall",
    customerId: "cust_4",
    customerName: "Nexus Retail Omni",
    dealId: "deal_4",
    dueDate: "2026-10-05", // Overdue
    priority: "high",
    completed: false,
    assignedTo: "Alex Rivera",
    notes: "Account inactive for 12 days. Call directly on mobile."
  },
  {
    id: "act_3",
    type: "email",
    title: "Send European proposal pricing sheet to Marcus",
    customerId: "cust_2",
    customerName: "FinEdge Technologies",
    dealId: "deal_2",
    dueDate: "2026-10-07",
    priority: "high",
    completed: false,
    assignedTo: "Alex Rivera",
    notes: "Include volume discount for 45 seats."
  },
  {
    id: "act_4",
    type: "meeting",
    title: "Introduction call with new CISO Victor Thorne",
    customerId: "cust_6",
    customerName: "Vanguard Cyber Defense",
    dealId: "deal_6",
    dueDate: "2026-10-04", // Overdue
    priority: "high",
    completed: false,
    assignedTo: "Alex Rivera",
    notes: "Former sponsor left. Crucial relationship rebuild."
  },
  {
    id: "act_5",
    type: "task",
    title: "Finalize CleanTech case study draft with Julian",
    customerId: "cust_9",
    customerName: "Hyperion Solar Energy",
    dealId: "deal_7",
    dueDate: "2026-10-12",
    priority: "normal",
    completed: false,
    assignedTo: "Sarah Jenkins",
    notes: "Marketing wants customer approval on ROI quotes."
  },
  {
    id: "act_6",
    type: "call",
    title: "PulseHealth Q4 SLA review check-in",
    customerId: "cust_11",
    customerName: "PulseHealth Medical",
    dealId: null,
    dueDate: "2026-10-10",
    priority: "normal",
    completed: false,
    assignedTo: "Sarah Jenkins",
    notes: "Verify telemedicine compliance checklist."
  }
];

export const initialRecommendations = [
  {
    id: "rec_1",
    customerId: "cust_1",
    customerName: "Apex Cloud Systems",
    priority: "high",
    title: "Urgent: Executive Intervention Required on Apex Cloud",
    description: "Health score dropped to 42. Contract renewal in 30 days ($165k value). Friction logged regarding API throughput.",
    impact: "+$165k ARR Protection",
    actionType: "schedule_meeting",
    actionPayload: {
      title: "VP Escalation & Architecture Resolution Sync",
      target: "Elena Rostova (CTO)"
    }
  },
  {
    id: "rec_2",
    customerId: "cust_2",
    customerName: "FinEdge Technologies",
    priority: "medium",
    title: "Upsell Catalyst: Fast-Track European Team Add-On",
    description: "Marcus cleared IT security. Deal velocity is 40% above baseline. High probability to close before quarter end.",
    impact: "+$95k Pipeline Conversion",
    actionType: "draft_email",
    actionPayload: {
      recipient: "Marcus Vance",
      subject: "FinEdge Europe - Custom Multi-Region License Proposal"
    }
  },
  {
    id: "rec_3",
    customerId: "cust_4",
    customerName: "Nexus Retail Omni",
    priority: "high",
    title: "Deal Stall Alert: Re-engage Derrick Hayes",
    description: "Nexus POS deal has zero customer interactions in 12 days. Probability decreased from 60% to 35%.",
    impact: "+$48k Deal Recovery",
    actionType: "create_task",
    actionPayload: {
      title: "Executive Re-engagement Call with Derrick",
      priority: "high"
    }
  },
  {
    id: "rec_4",
    customerId: "cust_9",
    customerName: "Hyperion Solar Energy",
    priority: "low",
    title: "Advocate Signal: Invite Julian to Customer Advisory Board",
    description: "Health score 91 with 3 consecutive closed deals this month. Optimal moment to request formal referral & case study.",
    impact: "High Referral Likelihood",
    actionType: "draft_email",
    actionPayload: {
      recipient: "Julian Vega",
      subject: "Invitation: SmartCRM CleanTech Executive Advisory Council"
    }
  }
];
