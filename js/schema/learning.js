/* ============================================================
   GREENHILL CMS — Schema: Learning page (learning.html)
   ============================================================ */

import { register, esc } from './core.js';

register('learning.html', {
  title: 'Learning',
  description: 'Page hero, approach, curriculum & subjects, ages & stages, highlights, assessment, screens note, beyond the classroom.',
  fields: [
    /* --- Page hero --- */
    { id: 'hero.bg', section: 'Page Hero', label: 'Background image', selector: '.page-hero-bg', type: 'bg' },
    { id: 'hero.kicker', section: 'Page Hero', label: 'Kicker', selector: '.page-hero-kicker', type: 'text' },
    { id: 'hero.heading', section: 'Page Hero', label: 'Heading', selector: '.page-hero-content h1', type: 'html', hint: 'Supports <em> and <strong>.' },
    { id: 'hero.text', section: 'Page Hero', label: 'Intro paragraph', selector: '.page-hero-content > p', type: 'text', multiline: true },

    /* --- Our Approach --- */
    { id: 'approach.kicker', section: 'Our Approach', label: 'Kicker', selector: '.approach-content .kicker', type: 'text' },
    { id: 'approach.heading', section: 'Our Approach', label: 'Heading', selector: '.approach-content h2', type: 'text' },
    { id: 'approach.p1', section: 'Our Approach', label: 'Paragraph 1', selector: '.approach-content > p:nth-of-type(1)', type: 'html', multiline: true },
    { id: 'approach.p2', section: 'Our Approach', label: 'Paragraph 2', selector: '.approach-content > p:nth-of-type(2)', type: 'html', multiline: true },
    { id: 'approach.image', section: 'Our Approach', label: 'Photo', selector: '.approach-image img', type: 'image' },
    { id: 'approach.caption', section: 'Our Approach', label: 'Photo caption', selector: '.approach-image-caption', type: 'html', hint: 'The <strong> part is the bold lead-in.' },

    /* --- Curriculum --- */
    { id: 'curriculum.kicker', section: 'Curriculum', label: 'Kicker', selector: '.curriculum-intro .kicker', type: 'text' },
    { id: 'curriculum.heading', section: 'Curriculum', label: 'Heading', selector: '.curriculum-intro h2', type: 'text' },
    { id: 'curriculum.p1', section: 'Curriculum', label: 'Paragraph 1', selector: '.curriculum-intro p:nth-of-type(1)', type: 'html', multiline: true },
    { id: 'curriculum.p2', section: 'Curriculum', label: 'Paragraph 2', selector: '.curriculum-intro p:nth-of-type(2)', type: 'html', multiline: true },
    { id: 'curriculum.cbcNote', section: 'Curriculum', label: 'CBC note box', selector: '.cbc-note', type: 'html', hint: 'Starts with a <strong> lead-in.' },

    /* --- Ages & Stages --- */
    { id: 'stages.kicker', section: 'Ages & Stages', label: 'Section kicker', selector: 'section:has(.stages-grid) .section-header .kicker', type: 'text' },
    { id: 'stages.heading', section: 'Ages & Stages', label: 'Section heading', selector: 'section:has(.stages-grid) .section-header h2', type: 'text' },
    { id: 'stages.intro', section: 'Ages & Stages', label: 'Section intro', selector: 'section:has(.stages-grid) .section-header p', type: 'text', multiline: true },

    /* --- Assessment --- */
    { id: 'assessment.kicker', section: 'Assessment', label: 'Section kicker', selector: 'section:has(.assessment-grid) .section-header .kicker', type: 'text' },
    { id: 'assessment.heading', section: 'Assessment', label: 'Section heading', selector: 'section:has(.assessment-grid) .section-header h2', type: 'text' },
    { id: 'assessment.intro', section: 'Assessment', label: 'Section intro', selector: 'section:has(.assessment-grid) .section-header p', type: 'text', multiline: true },

    /* --- A Note on Screens --- */
    { id: 'screens.label', section: 'A Note on Screens', label: 'Label', selector: '.screens-label', type: 'text' },
    { id: 'screens.quote', section: 'A Note on Screens', label: 'Quote', selector: '.screens-band blockquote', type: 'html', hint: 'Supports <em> and <strong>.' },
    { id: 'screens.attribution', section: 'A Note on Screens', label: 'Attribution', selector: '.screens-attribution', type: 'text' },

    /* --- Beyond the Classroom --- */
    { id: 'beyond.kicker', section: 'Beyond the Classroom', label: 'Section kicker', selector: 'section:has(.beyond-grid) .section-header .kicker', type: 'text' },
    { id: 'beyond.heading', section: 'Beyond the Classroom', label: 'Section heading', selector: 'section:has(.beyond-grid) .section-header h2', type: 'text' },
    { id: 'beyond.intro', section: 'Beyond the Classroom', label: 'Section intro', selector: 'section:has(.beyond-grid) .section-header p', type: 'text', multiline: true },

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
      id: 'approach.principles',
      section: 'Our Approach',
      label: 'Principles',
      container: '.approach-principles',
      item: '.approach-principle',
      addLabel: 'Add principle',
      fields: [
        { id: 'icon', label: 'Icon class', selector: '.principle-icon i', type: 'attr', attr: 'class', hint: 'e.g. fas fa-seedling' },
        { id: 'title', label: 'Title', selector: 'h4', type: 'text' },
        { id: 'text', label: 'Text', selector: 'p', type: 'text', multiline: true }
      ],
      template: (it) => `<div class="approach-principle">
                <div class="principle-icon"><i class="${esc(it.icon || 'fas fa-seedling')}"></i></div>
                <div>
                  <h4>${esc(it.title || '')}</h4>
                  <p>${esc(it.text || '')}</p>
                </div>
              </div>`
    },
    {
      id: 'subjects',
      section: 'Curriculum',
      label: 'Subjects',
      container: '.subjects-list',
      item: '.subject-item',
      addLabel: 'Add subject',
      fields: [
        { id: 'icon', label: 'Icon class', selector: '.subject-icon i', type: 'attr', attr: 'class', hint: 'e.g. fas fa-leaf' },
        { id: 'title', label: 'Subject name', selector: 'h4', type: 'text' },
        { id: 'text', label: 'Description', selector: 'p', type: 'text', multiline: true }
      ],
      template: (it) => `<div class="subject-item">
                <div class="subject-icon"><i class="${esc(it.icon || 'fas fa-book')}"></i></div>
                <div class="subject-info">
                  <h4>${esc(it.title || '')}</h4>
                  <p>${esc(it.text || '')}</p>
                </div>
              </div>`
    },
    {
      id: 'stages.cards',
      section: 'Ages & Stages',
      label: 'Stage cards',
      container: '.stages-grid',
      item: '.stage-card',
      addLabel: 'Add stage',
      fields: [
        { id: 'image', label: 'Photo', selector: 'img', type: 'image' },
        { id: 'age', label: 'Age / grade label', selector: '.stage-age', type: 'text' },
        { id: 'title', label: 'Title', selector: 'h3', type: 'text' },
        { id: 'text', label: 'Text', selector: '.stage-body p', type: 'text', multiline: true }
      ],
      template: (it) => `<div class="stage-card reveal">
            <div class="stage-image">
              <img src="${esc(it.image || '')}" alt="${esc(it.title || '')}">
            </div>
            <div class="stage-body">
              <div class="stage-age">${esc(it.age || '')}</div>
              <h3>${esc(it.title || '')}</h3>
              <p>${esc(it.text || '')}</p>
            </div>
          </div>`
    },
    {
      id: 'highlights',
      section: 'Academic Highlights',
      label: 'Highlight statistics',
      container: '.highlights-grid',
      item: '.highlight-item',
      addLabel: 'Add highlight',
      fields: [
        { id: 'number', label: 'Value', selector: '.highlight-number', type: 'text' },
        { id: 'label', label: 'Label', selector: '.highlight-label', type: 'text' }
      ],
      template: (it) => `<div class="highlight-item">
            <span class="highlight-number">${esc(it.number || '')}</span>
            <span class="highlight-label">${esc(it.label || '')}</span>
          </div>`
    },
    {
      id: 'assessment.cards',
      section: 'Assessment',
      label: 'Assessment cards',
      container: '.assessment-grid',
      item: '.assessment-card',
      addLabel: 'Add card',
      fields: [
        { id: 'icon', label: 'Icon class', selector: '.assessment-icon i', type: 'attr', attr: 'class', hint: 'e.g. fas fa-clipboard-check' },
        { id: 'title', label: 'Title', selector: 'h3', type: 'text' },
        { id: 'text', label: 'Paragraph', selector: '.assessment-card > p', type: 'text', multiline: true },
        { id: 'list', label: 'Bullet list (HTML)', selector: 'ul.assessment-list', type: 'html', multiline: true, hint: 'Each item: <li><i class="fas fa-check"></i> <span><strong>Label</strong> — text.</span></li>' }
      ],
      template: (it) => `<div class="assessment-card reveal">
            <div class="assessment-icon"><i class="${esc(it.icon || 'fas fa-clipboard-check')}"></i></div>
            <h3>${esc(it.title || '')}</h3>
            <p>${esc(it.text || '')}</p>
            ${it.list || '<ul class="assessment-list"></ul>'}
          </div>`
    },
    {
      id: 'beyond.cards',
      section: 'Beyond the Classroom',
      label: 'Cards',
      container: '.beyond-grid',
      item: '.beyond-card',
      addLabel: 'Add card',
      fields: [
        { id: 'image', label: 'Image', selector: 'img', type: 'image' },
        { id: 'tag', label: 'Tag', selector: '.beyond-card-tag', type: 'text' },
        { id: 'title', label: 'Title', selector: 'h3', type: 'text' },
        { id: 'text', label: 'Text', selector: 'p', type: 'text', multiline: true }
      ],
      template: (it) => `<div class="beyond-card reveal">
            <img src="${esc(it.image || '')}" alt="${esc(it.title || '')}">
            <div class="beyond-card-overlay">
              <span class="beyond-card-tag">${esc(it.tag || '')}</span>
              <h3>${esc(it.title || '')}</h3>
              <p>${esc(it.text || '')}</p>
            </div>
          </div>`
    }
  ]
});
