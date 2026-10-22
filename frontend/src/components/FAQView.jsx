import React, { useState } from 'react';
import CopyButton from './CopyButton';

const FAQ_DATA = [
  {
    id: 'faq-1',
    category: 'Warranty & Policy',
    question: 'What is the warranty coverage for repairs and spare parts at Apex AutoWorks?',
    answer: 'All mechanical, suspension, and electrical parts supplied and installed by Apex AutoWorks carry a 6-month or 10,000 km warranty (whichever comes first). Workmanship and labor carry an unconditional 30-day workshop guarantee. In the unlikely event of part failure or improper fitment, parts are replaced at zero cost with expedited bay priority.',
    tags: ['Warranty', 'Guarantee', 'Workmanship']
  },
  {
    id: 'faq-2',
    category: 'Warranty & Policy',
    question: 'What if a check engine light or dashboard warning returns after service?',
    answer: 'We provide complimentary OBD-II diagnostic re-scans within 14 days of any completed service. If the code relates to the serviced system, our Master Diagnostic Technicians will inspect and resolve the issue without diagnostic labor charges.',
    tags: ['Diagnostics', 'Check Engine', 'OBD-II']
  },
  {
    id: 'faq-3',
    category: 'Engine Oils & Fluids',
    question: 'Which engine oil grade is best for Malaysian tropical weather and my car model?',
    answer: `• 0W-20 Fully Synthetic (10,000 km / 6 months): Ideal for modern turbocharged & eco engines like Proton X50/X70 TGDi, Perodua Myvi Gen3 / Ativa / Alza 2022+, Honda VTEC Turbo.\n• 5W-30 Fully Synthetic (10,000 km / 6 months): The gold standard for daily Malaysian commutes (Toyota Vios, Honda City, Nissan Almera, Mazda SkyActiv).\n• 5W-40 High-Mileage (7,000–10,000 km): Recommended for vehicles exceeding 150,000 km or continental performance engines (BMW, Mercedes-Benz, Audi) needing higher shear stability at operating temperatures above 90°C.`,
    tags: ['0W-20', '5W-30', '5W-40', 'Engine Oil', 'Synthetic']
  },
  {
    id: 'faq-4',
    category: 'Engine Oils & Fluids',
    question: 'How frequently should automatic transmission fluid (ATF / CVT) and coolant be flushed?',
    answer: 'For Malaysian climate conditions with heavy stop-and-go traffic: CVT Fluid (e.g., Perodua D-CVT, Proton Punch CVT, Honda HCF-2) must be renewed every 20,000 km to 30,000 km. Conventional torque-converter ATF should be flushed every 40,000 km. Long-life radiator coolant flush is recommended every 60,000 km or 24 months to prevent radiator corrosion and head gasket failure.',
    tags: ['CVT', 'ATF', 'Transmission', 'Coolant']
  },
  {
    id: 'faq-5',
    category: 'Parts & Authenticity',
    question: 'Do you supply genuine parts or OEM replacements, and how are they verified?',
    answer: 'We provide transparent 3-tier quoting on every estimate:\n1. Genuine Original: Sourced directly from authorized Malaysian franchise distributors with security hologram seals.\n2. Tier-1 OEM: Identical manufacturing specification from tier-1 suppliers (Denso, Bosch, Aisin, Brembo, NGK, KYB) at 25–40% cost savings.\n3. Certified Aftermarket: Heavy-duty replacement parts tested for road safety.\nEvery itemized work order lists exact part numbers and origins.',
    tags: ['Genuine', 'OEM', 'Authenticity', 'Denso', 'Bosch']
  },
  {
    id: 'faq-6',
    category: 'JPJ & Inspections',
    question: 'Can Apex AutoWorks perform pre-PUSPAKOM inspection for ownership transfer or road tax renewal?',
    answer: 'Yes! We conduct a rigorous 48-point PUSPAKOM & JPJ pre-inspection covering brake roller meter testing, side-slip alignment check, chassis integrity, suspension damping, tinted window VLT light transmittance compliance (JPJ rules), and exhaust emission smoke testing. We guarantee first-time PUSPAKOM pass rates.',
    tags: ['PUSPAKOM', 'JPJ', 'Inspection', 'Road Tax']
  },
  {
    id: 'faq-7',
    category: 'Payment & Towing',
    question: 'What payment options and installment plans are available at the workshop?',
    answer: 'We accept DuitNow QR (instant zero-fee transfer), Touch \'n Go eWallet, Maybank QRPay, GrabPay, Visa/Mastercard credit and debit cards, and FPX Online Banking. For major overhauls or collision repairs above RM 1,000, we provide 0% interest 3-month and 6-month Buy-Now-Pay-Later (BNPL) installment plans via Atome.',
    tags: ['Payment', 'DuitNow', 'Touch n Go', 'Credit Card', '0% Installment']
  },
  {
    id: 'faq-8',
    category: 'Payment & Towing',
    question: 'Do you offer emergency roadside assistance and flatbed towing in Penang?',
    answer: 'Yes, our 24/7 Penang emergency hotline is +60 12-345 6789. We dispatch flatbed car carriers across Bayan Lepas, Gelugor, George Town, Relau, Batu Maung, and mainland Butterworth. Towing fees are 100% reimbursed on approved major service work orders exceeding RM 1,500.',
    tags: ['Towing', 'Emergency', 'Roadside Assistance', 'Penang']
  }
];

const CATEGORIES = ['All', 'Warranty & Policy', 'Engine Oils & Fluids', 'Parts & Authenticity', 'JPJ & Inspections', 'Payment & Towing'];

export default function FAQView() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedIds, setExpandedIds] = useState(new Set(['faq-1', 'faq-3']));

  const toggleExpand = (id) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExpandAll = () => {
    setExpandedIds(new Set(FAQ_DATA.map(item => item.id)));
  };

  const handleCollapseAll = () => {
    setExpandedIds(new Set());
  };

  const filteredFaqs = FAQ_DATA.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch = !q ||
      item.question.toLowerCase().includes(q) ||
      item.answer.toLowerCase().includes(q) ||
      item.tags.some(t => t.toLowerCase().includes(q));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="view-container faq-view-container animate-fade-in">
      {/* Top Banner Header */}
      <div className="view-header-row" style={{ alignItems: 'flex-start' }}>
        <div>
          <div className="view-badge">
            <span>📚 Workshop Knowledge Base</span>
          </div>
          <h2 className="view-title">Workshop Policies, Warranties & Fluid Specifications</h2>
          <p className="view-subtitle">
            Authoritative guidelines for customer intake, Malaysian automotive regulations, warranty claims, and fluid standards.
          </p>
        </div>

        <div className="view-actions-cluster">
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={() => window.print()}
            title="Print FAQ policies (Uses print stylesheet)"
          >
            🖨️ Print Policy Guide
          </button>
          <button
            type="button"
            className="btn btn-secondary btn-sm"
            onClick={expandedIds.size === FAQ_DATA.length ? handleCollapseAll : handleExpandAll}
          >
            {expandedIds.size === FAQ_DATA.length ? 'Collapse All' : 'Expand All'}
          </button>
        </div>
      </div>

      {/* Search and Category Filter Toolbar */}
      <div className="faq-toolbar-card">
        <div className="faq-search-box">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" width="18" height="18">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search questions, oil grades (0W-20, CVT), warranty, PUSPAKOM..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="faq-search-input"
          />
          {searchQuery && (
            <button
              type="button"
              className="clear-search-btn"
              onClick={() => setSearchQuery('')}
              title="Clear search"
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="faq-categories-row">
          {CATEGORIES.map(category => (
            <button
              key={category}
              type="button"
              className={`faq-cat-pill ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Accordion FAQ List */}
      <div className="faq-accordion-list">
        {filteredFaqs.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>🔍</div>
            <h3>No matching workshop policies found</h3>
            <p>Try searching for terms like "warranty", "0W-20", "towing", or reset the category filter.</p>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => { setSearchQuery(''); setSelectedCategory('All'); }}
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredFaqs.map((item, index) => {
            const isExpanded = expandedIds.has(item.id);
            return (
              <div
                key={item.id}
                className={`faq-accordion-item ${isExpanded ? 'open' : ''}`}
              >
                <button
                  type="button"
                  className="faq-question-btn"
                  onClick={() => toggleExpand(item.id)}
                  aria-expanded={isExpanded}
                  aria-controls={`faq-answer-${item.id}`}
                >
                  <div className="faq-q-left">
                    <span className="faq-index-num">#{index + 1}</span>
                    <span className="faq-question-text">{item.question}</span>
                  </div>
                  <div className="faq-q-right">
                    <span className="faq-category-tag">{item.category}</span>
                    <svg
                      className={`faq-chevron ${isExpanded ? 'rotated' : ''}`}
                      viewBox="0 0 24 24"
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </div>
                </button>

                {isExpanded && (
                  <div id={`faq-answer-${item.id}`} className="faq-answer-panel animate-fade-in">
                    <div className="faq-answer-body">
                      {item.answer.split('\n').map((para, pIdx) => (
                        <p key={pIdx} className="faq-answer-paragraph">{para}</p>
                      ))}
                    </div>

                    <div className="faq-footer-meta">
                      <div className="faq-tags-group">
                        {item.tags.map(tag => (
                          <span key={tag} className="faq-tag-pill">#{tag}</span>
                        ))}
                      </div>
                      <div className="faq-actions-group">
                        <CopyButton
                          text={`${item.question}\n\n${item.answer}\n\n— Apex AutoWorks Service Policy`}
                          label="Copy Answer"
                          title="Copy policy to clipboard for customer WhatsApp"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Helpful Quick Hotline Banner */}
      <div className="faq-callout-card">
        <div className="faq-callout-icon">📞</div>
        <div className="faq-callout-content">
          <h4>Have a specific custom request or technical dispute?</h4>
          <p>
            Our Service Advisor Lead and Master Diagnostic PIC are on duty Monday – Saturday, 8:30 AM to 6:30 PM.
            Contact workshop direct line: <a href="tel:+60123456789"><strong>+60 12-345 6789</strong></a> or WhatsApp desk.
          </p>
        </div>
      </div>
    </div>
  );
}
