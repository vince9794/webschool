/* ============================================================
   GREENHILL CMS — Schema: Admissions page (admissions.html)
   ============================================================ */

import { register, esc } from './core.js';

register('admissions.html', {
  title: 'Admissions',
  description: 'Page hero, welcome letter, application steps, requirements, fee table, scholarships, visit section, FAQ and CTA.',
  fields: [
    /* --- Page hero --- */
    { id: 'hero.bg', section: 'Page Hero', label: 'Background image', selector: '.page-hero-bg', type: 'bg' },
    { id: 'hero.kicker', section: 'Page Hero', label: 'Kicker', selector: '.page-hero-kicker', type: 'text' },
    { id: 'hero.heading', section: 'Page Hero', label: 'Heading', selector: '.page-hero-content h1', type: 'html', hint: 'Supports <em> and <strong>.' },
    { id: 'hero.text', section: 'Page Hero', label: 'Intro paragraph', selector: '.page-hero-content > p', type: 'text', multiline: true },

    /* --- Welcome letter --- */
    { id: 'welcome.kicker', section: 'Welcome Letter', label: 'Kicker', selector: '.welcome-content .kicker', type: 'text' },
    { id: 'welcome.heading', section: 'Welcome Letter', label: 'Heading', selector: '.welcome-content h2', type: 'text' },
    { id: 'welcome.p1', section: 'Welcome Letter', label: 'Paragraph 1', selector: '.welcome-content p:nth-of-type(1)', type: 'html', multiline: true },
    { id: 'welcome.p2', section: 'Welcome Letter', label: 'Paragraph 2', selector: '.welcome-content p:nth-of-type(2)', type: 'html', multiline: true },
    { id: 'welcome.p3', section: 'Welcome Letter', label: 'Paragraph 3', selector: '.welcome-content p:nth-of-type(3)', type: 'html', multiline: true },
    { id: 'welcome.portrait', section: 'Welcome Letter', label: 'Portrait photo', selector: '.welcome-portrait img', type: 'image' },
    { id: 'welcome.signatureName', section: 'Welcome Letter', label: 'Signature name', selector: '.signature-name', type: 'text' },
    { id: 'welcome.signatureTitle', section: 'Welcome Letter', label: 'Signature title', selector: '.signature-title', type: 'text' },

    /* --- Application process --- */
    { id: 'process.kicker', section: 'Application Process', label: 'Section kicker', selector: 'section:has(.process-steps) .section-header .kicker', type: 'text' },
    { id: 'process.heading', section: 'Application Process', label: 'Section heading', selector: 'section:has(.process-steps) .section-header h2', type: 'text' },
    { id: 'process.intro', section: 'Application Process', label: 'Section intro', selector: 'section:has(.process-steps) .section-header p', type: 'text', multiline: true },

    /* --- Requirements --- */
    { id: 'req.kicker', section: 'Requirements', label: 'Section kicker', selector: 'section:has(.requirements-grid) .section-header .kicker', type: 'text' },
    { id: 'req.heading', section: 'Requirements', label: 'Section heading', selector: 'section:has(.requirements-grid) .section-header h2', type: 'text' },
    { id: 'req.intro', section: 'Requirements', label: 'Section intro', selector: 'section:has(.requirements-grid) .section-header p', type: 'text', multiline: true },

    /* --- Fee structure --- */
    { id: 'fees.kicker', section: 'Fee Structure', label: 'Section kicker', selector: 'section:has(.fee-wrapper) .section-header .kicker', type: 'text' },
    { id: 'fees.heading', section: 'Fee Structure', label: 'Section heading', selector: 'section:has(.fee-wrapper) .section-header h2', type: 'text' },
    { id: 'fees.intro', section: 'Fee Structure', label: 'Section intro', selector: 'section:has(.fee-wrapper) .section-header p', type: 'text', multiline: true },
    { id: 'fees.tableTitle', section: 'Fee Structure', label: 'Table title', selector: '.fee-header h3', type: 'text' },
    { id: 'fees.tableNote', section: 'Fee Structure', label: 'Table note (next to title)', selector: '.fee-header span', type: 'text' },
    { id: 'fees.th1', section: 'Fee Structure', label: 'Table column 1 header', selector: '.fee-table thead th:nth-child(1)', type: 'text' },
    { id: 'fees.th2', section: 'Fee Structure', label: 'Table column 2 header', selector: '.fee-table thead th:nth-child(2)', type: 'text' },
    { id: 'fees.th3', section: 'Fee Structure', label: 'Table column 3 header', selector: '.fee-table thead th:nth-child(3)', type: 'text' },
    { id: 'fees.note', section: 'Fee Structure', label: 'Fees note (below table)', selector: '.fee-note p', type: 'html', multiline: true, hint: 'Supports <strong> lead-ins.' },

    /* --- Scholarships --- */
    { id: 'scholar.kicker', section: 'Scholarships', label: 'Section kicker', selector: 'section:has(.scholarships-grid) .section-header .kicker', type: 'text' },
    { id: 'scholar.heading', section: 'Scholarships', label: 'Section heading', selector: 'section:has(.scholarships-grid) .section-header h2', type: 'text' },
    { id: 'scholar.intro', section: 'Scholarships', label: 'Section intro', selector: 'section:has(.scholarships-grid) .section-header p', type: 'text', multiline: true },

    /* --- Visit / booking --- */
    { id: 'visit.kicker', section: 'Book a Visit', label: 'Kicker', selector: '.visit-intro .kicker', type: 'text' },
    { id: 'visit.heading', section: 'Book a Visit', label: 'Heading', selector: '.visit-intro h2', type: 'text' },
    { id: 'visit.p1', section: 'Book a Visit', label: 'Paragraph 1', selector: '.visit-intro > p:nth-of-type(1)', type: 'html', multiline: true },
    { id: 'visit.p2', section: 'Book a Visit', label: 'Paragraph 2 (visit times)', selector: '.visit-intro > p:nth-of-type(2)', type: 'html', multiline: true, hint: 'Supports <strong>.' },
    { id: 'visit.formTitle', section: 'Book a Visit', label: 'Form card title', selector: '.form-card h3', type: 'text' },
    { id: 'visit.formSubtitle', section: 'Book a Visit', label: 'Form card subtitle', selector: '.form-card .form-subtitle', type: 'text' },

    /* --- FAQ --- */
    { id: 'faq.kicker', section: 'FAQ', label: 'Section kicker', selector: 'section:has(.faq-list) .section-header .kicker', type: 'text' },
    { id: 'faq.heading', section: 'FAQ', label: 'Section heading', selector: 'section:has(.faq-list) .section-header h2', type: 'text' },
    { id: 'faq.intro', section: 'FAQ', label: 'Section intro', selector: 'section:has(.faq-list) .section-header p', type: 'text', multiline: true },

    /* --- CTA band --- */
    { id: 'cta.heading', section: 'Call to Action', label: 'Heading', selector: '.cta-band h2', type: 'html' },
    { id: 'cta.text', section: 'Call to Action', label: 'Paragraph', selector: '.cta-band .container > p', type: 'text', multiline: true },
    { id: 'cta.btn1.label', section: 'Call to Action', label: 'Primary button label', selector: '.cta-buttons a:nth-child(1)', type: 'text' },
    { id: 'cta.btn1.href', section: 'Call to Action', label: 'Primary button link', selector: '.cta-buttons a:nth-child(1)', type: 'attr', attr: 'href' },
    { id: 'cta.btn2.label', section: 'Call to Action', label: 'Secondary button label', selector: '.cta-buttons a:nth-child(2)', type: 'text' },
    { id: 'cta.btn2.href', section: 'Call to Action', label: 'Secondary button link', selector: '.cta-buttons a:nth-child(2)', type: 'attr', attr: 'href' }
  ],
  lists: [
    {
      id: 'process.steps',
      section: 'Application Process',
      label: 'Steps',
      container: '.process-steps',
      item: '.process-step',
      addLabel: 'Add step',
      fields: [
        { id: 'number', label: 'Step number', selector: '.process-number', type: 'text' },
        { id: 'title', label: 'Title', selector: 'h3', type: 'text' },
        { id: 'text', label: 'Text', selector: 'p', type: 'text', multiline: true }
      ],
      template: (it) => `<div class="process-step reveal">
            <div class="process-number">${esc(it.number || '')}</div>
            <h3>${esc(it.title || '')}</h3>
            <p>${esc(it.text || '')}</p>
          </div>`
    },
    {
      id: 'req.cards',
      section: 'Requirements',
      label: 'Requirement cards',
      container: '.requirements-grid',
      item: '.requirement-card',
      addLabel: 'Add card',
      fields: [
        { id: 'icon', label: 'Icon class', selector: '.requirement-icon i', type: 'attr', attr: 'class', hint: 'e.g. fas fa-folder-open' },
        { id: 'title', label: 'Title', selector: 'h3', type: 'text' },
        { id: 'text', label: 'Paragraph', selector: '.requirement-card > p', type: 'text', multiline: true },
        { id: 'list', label: 'Checklist (HTML)', selector: 'ul.requirement-list', type: 'html', multiline: true, hint: 'Each item: <li><i class="fas fa-check"></i> <span><strong>Label</strong> — detail.</span></li>' }
      ],
      template: (it) => `<div class="requirement-card reveal">
            <div class="requirement-icon"><i class="${esc(it.icon || 'fas fa-folder-open')}"></i></div>
            <h3>${esc(it.title || '')}</h3>
            <p>${esc(it.text || '')}</p>
            ${it.list || '<ul class="requirement-list"></ul>'}
          </div>`
    },
    {
      id: 'fees.rows',
      section: 'Fee Structure',
      label: 'Fee table rows',
      container: '.fee-table tbody',
      item: 'tr',
      addLabel: 'Add fee row',
      fields: [
        { id: 'programme', label: 'Programme (HTML allowed)', selector: 'td:nth-child(1)', type: 'html', multiline: true, hint: 'Plain text plus an optional <small> line underneath.' },
        { id: 'day', label: 'Day Scholar (KES)', selector: 'td:nth-child(2)', type: 'text' },
        { id: 'annual', label: 'Annual (KES)', selector: 'td:nth-child(3)', type: 'text' }
      ],
      template: (it) => `<tr>
                <td>${it.programme || ''}</td>
                <td>${esc(it.day || '')}</td>
                <td>${esc(it.annual || '')}</td>
              </tr>`
    },
    {
      id: 'scholar.cards',
      section: 'Scholarships',
      label: 'Scholarship cards',
      container: '.scholarships-grid',
      item: '.scholarship-card',
      addLabel: 'Add scholarship',
      fields: [
        { id: 'icon', label: 'Icon class', selector: '.scholarship-icon i', type: 'attr', attr: 'class', hint: 'e.g. fas fa-award' },
        { id: 'title', label: 'Title', selector: 'h3', type: 'text' },
        { id: 'text', label: 'Text', selector: 'p', type: 'text', multiline: true },
        { id: 'value', label: 'Value badge', selector: '.scholarship-value', type: 'text' }
      ],
      template: (it) => `<div class="scholarship-card reveal">
            <div class="scholarship-icon"><i class="${esc(it.icon || 'fas fa-award')}"></i></div>
            <h3>${esc(it.title || '')}</h3>
            <p>${esc(it.text || '')}</p>
            <span class="scholarship-value">${esc(it.value || '')}</span>
          </div>`
    },
    {
      id: 'visit.details',
      section: 'Book a Visit',
      label: 'Visit details',
      container: '.visit-details',
      item: '.visit-detail',
      addLabel: 'Add detail',
      fields: [
        { id: 'icon', label: 'Icon class', selector: '.visit-detail-icon i', type: 'attr', attr: 'class', hint: 'e.g. fas fa-clock' },
        { id: 'title', label: 'Title', selector: 'h4', type: 'text' },
        { id: 'text', label: 'Text', selector: 'p', type: 'text', multiline: true }
      ],
      template: (it) => `<div class="visit-detail">
                <div class="visit-detail-icon"><i class="${esc(it.icon || 'fas fa-map-marker-alt')}"></i></div>
                <div>
                  <h4>${esc(it.title || '')}</h4>
                  <p>${esc(it.text || '')}</p>
                </div>
              </div>`
    },
    {
      id: 'faq.items',
      section: 'FAQ',
      label: 'FAQ items',
      container: '.faq-list',
      item: '.faq-item',
      addLabel: 'Add question',
      fields: [
        { id: 'classes', label: 'Panel classes', selector: '.faq-item', type: 'attr', attr: 'class', hint: "Must keep the word 'faq-item'. Keep 'active' on exactly one item so its answer stays open by default." },
        { id: 'question', label: 'Question', selector: '.faq-question', type: 'text' },
        { id: 'answer', label: 'Answer', selector: '.faq-answer p', type: 'text', multiline: true }
      ],
      template: (it) => `<div class="${esc(it.classes || 'faq-item reveal')}">
            <button class="faq-question">
              ${esc(it.question || '')}
              <i class="fas fa-chevron-down"></i>
            </button>
            <div class="faq-answer">
              <p>${esc(it.answer || '')}</p>
            </div>
          </div>`
    }
  ]
});
