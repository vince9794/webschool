/* ============================================================
   GREENHILL CMS — Schema: About page (about.html)
   ============================================================ */

import { register, esc } from './core.js';

register('about.html', {
  title: 'About',
  description: 'Page hero, our story, mission, values, leadership, faculty, governance table, crest and CTA.',
  fields: [
    /* --- Page hero --- */
    { id: 'hero.bg', section: 'Page Hero', label: 'Background image', selector: '.page-hero-bg', type: 'bg' },
    { id: 'hero.kicker', section: 'Page Hero', label: 'Kicker', selector: '.page-hero-kicker', type: 'text' },
    { id: 'hero.heading', section: 'Page Hero', label: 'Heading', selector: '.page-hero-content h1', type: 'html', hint: 'Supports <em> and <strong>.' },
    { id: 'hero.text', section: 'Page Hero', label: 'Intro paragraph', selector: '.page-hero-content > p', type: 'text', multiline: true },

    /* --- Our Story --- */
    { id: 'story.kicker', section: 'Our Story', label: 'Kicker', selector: '.story-content .kicker', type: 'text' },
    { id: 'story.heading', section: 'Our Story', label: 'Heading', selector: '.story-content h2', type: 'text' },
    { id: 'story.p1', section: 'Our Story', label: 'Paragraph 1', selector: '.story-content p:nth-of-type(1)', type: 'html', multiline: true },
    { id: 'story.p2', section: 'Our Story', label: 'Paragraph 2', selector: '.story-content p:nth-of-type(2)', type: 'html', multiline: true },
    { id: 'story.p3', section: 'Our Story', label: 'Paragraph 3', selector: '.story-content p:nth-of-type(3)', type: 'html', multiline: true },
    { id: 'story.image', section: 'Our Story', label: 'Story photo', selector: '.story-image img', type: 'image' },
    { id: 'story.caption', section: 'Our Story', label: 'Photo caption', selector: '.story-image-caption', type: 'html', hint: 'The <strong> part is the bold lead-in.' },

    /* --- Mission --- */
    { id: 'mission.label', section: 'Mission', label: 'Label', selector: '.mission-label', type: 'text' },
    { id: 'mission.quote', section: 'Mission', label: 'Mission statement', selector: '.mission-section blockquote', type: 'html', hint: 'Supports <em> and <strong>.' },
    { id: 'mission.attribution', section: 'Mission', label: 'Attribution', selector: '.mission-attribution', type: 'text' },

    /* --- Values --- */
    { id: 'values.kicker', section: 'Values', label: 'Section kicker', selector: 'section:has(.values-grid) .section-header .kicker', type: 'text' },
    { id: 'values.heading', section: 'Values', label: 'Section heading', selector: 'section:has(.values-grid) .section-header h2', type: 'text' },
    { id: 'values.intro', section: 'Values', label: 'Section intro', selector: 'section:has(.values-grid) .section-header p', type: 'text', multiline: true },

    /* --- Leadership --- */
    { id: 'leaders.kicker', section: 'Leadership', label: 'Section kicker', selector: 'section:has(.leadership-grid) .section-header .kicker', type: 'text' },
    { id: 'leaders.heading', section: 'Leadership', label: 'Section heading', selector: 'section:has(.leadership-grid) .section-header h2', type: 'text' },
    { id: 'leaders.intro', section: 'Leadership', label: 'Section intro', selector: 'section:has(.leadership-grid) .section-header p', type: 'text', multiline: true },

    /* --- Faculty --- */
    { id: 'faculty.kicker', section: 'Faculty', label: 'Section kicker', selector: 'section:has(.faculty-grid) .section-header .kicker', type: 'text' },
    { id: 'faculty.heading', section: 'Faculty', label: 'Section heading', selector: 'section:has(.faculty-grid) .section-header h2', type: 'text' },
    { id: 'faculty.intro', section: 'Faculty', label: 'Section intro', selector: 'section:has(.faculty-grid) .section-header p', type: 'text', multiline: true },

    /* --- Governance --- */
    { id: 'gov.kicker', section: 'Governance', label: 'Kicker', selector: '.governance-intro .kicker', type: 'text' },
    { id: 'gov.heading', section: 'Governance', label: 'Heading', selector: '.governance-intro h2', type: 'text' },
    { id: 'gov.p1', section: 'Governance', label: 'Paragraph 1', selector: '.governance-intro p:nth-of-type(1)', type: 'html', multiline: true },
    { id: 'gov.p2', section: 'Governance', label: 'Paragraph 2', selector: '.governance-intro p:nth-of-type(2)', type: 'html', multiline: true },
    { id: 'gov.p3', section: 'Governance', label: 'Paragraph 3', selector: '.governance-intro p:nth-of-type(3)', type: 'html', multiline: true },
    { id: 'gov.th1', section: 'Governance', label: 'Table column 1 header', selector: '.governance-table thead th:nth-child(1)', type: 'text' },
    { id: 'gov.th2', section: 'Governance', label: 'Table column 2 header', selector: '.governance-table thead th:nth-child(2)', type: 'text' },
    { id: 'gov.th3', section: 'Governance', label: 'Table column 3 header', selector: '.governance-table thead th:nth-child(3)', type: 'text' },

    /* --- Crest --- */
    { id: 'crest.kicker', section: 'Our Crest', label: 'Kicker', selector: '.crest-content .kicker', type: 'text' },
    { id: 'crest.heading', section: 'Our Crest', label: 'Heading', selector: '.crest-content h2', type: 'text' },
    { id: 'crest.text', section: 'Our Crest', label: 'Paragraph', selector: '.crest-content > p', type: 'html', multiline: true },

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
      id: 'story.milestones',
      section: 'Our Story',
      label: 'Milestones',
      container: '.milestones',
      item: '.milestone',
      addLabel: 'Add milestone',
      fields: [
        { id: 'year', label: 'Year', selector: '.milestone-year', type: 'text' },
        { id: 'label', label: 'Label', selector: '.milestone-label', type: 'text' }
      ],
      template: (it) => `<div class="milestone">
                <div class="milestone-year">${esc(it.year || '')}</div>
                <div class="milestone-label">${esc(it.label || '')}</div>
              </div>`
    },
    {
      id: 'values.cards',
      section: 'Values',
      label: 'Value cards',
      container: '.values-grid',
      item: '.value-card',
      addLabel: 'Add value',
      fields: [
        { id: 'number', label: 'Roman numeral', selector: '.value-number', type: 'text' },
        { id: 'icon', label: 'Icon class', selector: '.value-icon i', type: 'attr', attr: 'class', hint: 'e.g. fas fa-seedling' },
        { id: 'title', label: 'Title', selector: 'h3', type: 'text' },
        { id: 'text', label: 'Text', selector: 'p', type: 'text', multiline: true }
      ],
      template: (it) => `<div class="value-card reveal">
            <span class="value-number">${esc(it.number || '')}</span>
            <div class="value-icon"><i class="${esc(it.icon || 'fas fa-seedling')}"></i></div>
            <h3>${esc(it.title || '')}</h3>
            <p>${esc(it.text || '')}</p>
          </div>`
    },
    {
      id: 'leaders.cards',
      section: 'Leadership',
      label: 'Leadership cards',
      container: '.leadership-grid',
      item: '.leader-card',
      addLabel: 'Add leader',
      fields: [
        { id: 'image', label: 'Photo', selector: 'img', type: 'image' },
        { id: 'name', label: 'Name', selector: 'h3', type: 'text' },
        { id: 'role', label: 'Role', selector: '.leader-role', type: 'text' },
        { id: 'bio', label: 'Bio', selector: '.leader-bio', type: 'text', multiline: true }
      ],
      template: (it) => `<div class="leader-card reveal">
            <div class="leader-photo">
              <img src="${esc(it.image || '')}" alt="${esc(it.name || '')}">
            </div>
            <div class="leader-body">
              <h3>${esc(it.name || '')}</h3>
              <div class="leader-role">${esc(it.role || '')}</div>
              <p class="leader-bio">${esc(it.bio || '')}</p>
            </div>
          </div>`
    },
    {
      id: 'faculty.cards',
      section: 'Faculty',
      label: 'Teacher cards',
      container: '.faculty-grid',
      item: '.faculty-card',
      addLabel: 'Add teacher',
      fields: [
        { id: 'image', label: 'Photo', selector: 'img', type: 'image' },
        { id: 'name', label: 'Name', selector: 'h4', type: 'text' },
        { id: 'role', label: 'Subject / grade', selector: '.faculty-role', type: 'text' }
      ],
      template: (it) => `<div class="faculty-card reveal">
            <div class="faculty-photo">
              <img src="${esc(it.image || '')}" alt="Teacher">
            </div>
            <h4>${esc(it.name || '')}</h4>
            <div class="faculty-role">${esc(it.role || '')}</div>
          </div>`
    },
    {
      id: 'gov.board',
      section: 'Governance',
      label: 'Board of Governors (table rows)',
      container: '.governance-table tbody',
      item: 'tr',
      addLabel: 'Add board member',
      fields: [
        { id: 'name', label: 'Name', selector: 'td:nth-child(1)', type: 'text' },
        { id: 'role', label: 'Role', selector: 'td:nth-child(2)', type: 'text' },
        { id: 'background', label: 'Background', selector: 'td:nth-child(3)', type: 'text' }
      ],
      template: (it) => `<tr>
                  <td>${esc(it.name || '')}</td>
                  <td>${esc(it.role || '')}</td>
                  <td>${esc(it.background || '')}</td>
                </tr>`
    },
    {
      id: 'crest.elements',
      section: 'Our Crest',
      label: 'Crest symbols',
      container: '.crest-elements',
      item: '.crest-element',
      addLabel: 'Add symbol',
      fields: [
        { id: 'icon', label: 'Icon class', selector: '.crest-element-icon i', type: 'attr', attr: 'class', hint: 'e.g. fas fa-mountain' },
        { id: 'title', label: 'Title', selector: 'h4', type: 'text' },
        { id: 'text', label: 'Text', selector: 'p', type: 'text', multiline: true }
      ],
      template: (it) => `<div class="crest-element">
                <div class="crest-element-icon"><i class="${esc(it.icon || 'fas fa-star')}"></i></div>
                <div>
                  <h4>${esc(it.title || '')}</h4>
                  <p>${esc(it.text || '')}</p>
                </div>
              </div>`
    }
  ]
});
