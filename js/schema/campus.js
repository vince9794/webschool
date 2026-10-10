/* ============================================================
   GREENHILL CMS — Schema: Campus page (campus.html)
   ============================================================ */

import { register, esc } from './core.js';

register('campus.html', {
  title: 'Campus',
  description: 'Page hero, campus intro, facilities, a day in the life, clubs, athletics, arts, excursions and CTA.',
  fields: [
    /* --- Page hero --- */
    { id: 'hero.bg', section: 'Page Hero', label: 'Background image', selector: '.page-hero-bg', type: 'bg' },
    { id: 'hero.kicker', section: 'Page Hero', label: 'Kicker', selector: '.page-hero-kicker', type: 'text' },
    { id: 'hero.heading', section: 'Page Hero', label: 'Heading', selector: '.page-hero-content h1', type: 'html', hint: 'Supports <em> and <strong>.' },
    { id: 'hero.text', section: 'Page Hero', label: 'Intro paragraph', selector: '.page-hero-content > p', type: 'text', multiline: true },

    /* --- Land that teaches (intro) --- */
    { id: 'intro.kicker', section: 'Our Campus', label: 'Kicker', selector: '.intro-content > .kicker', type: 'text' },
    { id: 'intro.heading', section: 'Our Campus', label: 'Heading', selector: '.intro-content > h2', type: 'text' },
    { id: 'intro.p1', section: 'Our Campus', label: 'Paragraph 1', selector: '.intro-content > p:nth-of-type(1)', type: 'html', multiline: true },
    { id: 'intro.p2', section: 'Our Campus', label: 'Paragraph 2', selector: '.intro-content > p:nth-of-type(2)', type: 'html', multiline: true },
    { id: 'intro.p3', section: 'Our Campus', label: 'Paragraph 3', selector: '.intro-content > p:nth-of-type(3)', type: 'html', multiline: true },
    { id: 'intro.image', section: 'Our Campus', label: 'Photo', selector: '.intro-image img', type: 'image' },
    { id: 'intro.caption', section: 'Our Campus', label: 'Photo caption', selector: '.intro-image-caption', type: 'html', hint: 'The <strong> part is the bold lead-in.' },

    /* --- Facilities --- */
    { id: 'facilities.kicker', section: 'Facilities', label: 'Section kicker', selector: 'section:has(.facilities-grid) .section-header .kicker', type: 'text' },
    { id: 'facilities.heading', section: 'Facilities', label: 'Section heading', selector: 'section:has(.facilities-grid) .section-header h2', type: 'text' },
    { id: 'facilities.intro', section: 'Facilities', label: 'Section intro', selector: 'section:has(.facilities-grid) .section-header p', type: 'text', multiline: true },

    /* --- A Day in the Life --- */
    { id: 'day.banner', section: 'A Day in the Life', label: 'Banner image', selector: '.day-hero img', type: 'image' },
    { id: 'day.title', section: 'A Day in the Life', label: 'Card title', selector: '.day-card-header h3', type: 'text' },
    { id: 'day.subtitle', section: 'A Day in the Life', label: 'Card subtitle', selector: '.day-card-header p', type: 'text', multiline: true },

    /* --- Clubs --- */
    { id: 'clubs.kicker', section: 'Clubs & Activities', label: 'Section kicker', selector: 'section:has(.clubs-grid) .section-header .kicker', type: 'text' },
    { id: 'clubs.heading', section: 'Clubs & Activities', label: 'Section heading', selector: 'section:has(.clubs-grid) .section-header h2', type: 'text' },
    { id: 'clubs.intro', section: 'Clubs & Activities', label: 'Section intro', selector: 'section:has(.clubs-grid) .section-header p', type: 'text', multiline: true },

    /* --- Athletics --- */
    { id: 'athletics.kicker', section: 'Athletics & Movement', label: 'Kicker', selector: '.athletics-content > .kicker', type: 'text' },
    { id: 'athletics.heading', section: 'Athletics & Movement', label: 'Heading', selector: '.athletics-content > h2', type: 'html', hint: 'Supports <em> and <strong>.' },
    { id: 'athletics.text', section: 'Athletics & Movement', label: 'Paragraph', selector: '.athletics-content > p', type: 'text', multiline: true },
    { id: 'athletics.image', section: 'Athletics & Movement', label: 'Photo', selector: '.athletics-image img', type: 'image' },
    { id: 'athletics.badge', section: 'Athletics & Movement', label: 'Event badge', selector: '.athletics-badge', type: 'html', hint: 'Keeps the <span> label above the event name.' },

    /* --- Arts & Music --- */
    { id: 'arts.kicker', section: 'Arts & Music', label: 'Section kicker', selector: 'section:has(.arts-grid) .section-header .kicker', type: 'text' },
    { id: 'arts.heading', section: 'Arts & Music', label: 'Section heading', selector: 'section:has(.arts-grid) .section-header h2', type: 'text' },
    { id: 'arts.intro', section: 'Arts & Music', label: 'Section intro', selector: 'section:has(.arts-grid) .section-header p', type: 'text', multiline: true },

    /* --- Beyond Campus --- */
    { id: 'beyond.kicker', section: 'Beyond Campus', label: 'Kicker', selector: '.beyond-content > .kicker', type: 'text' },
    { id: 'beyond.heading', section: 'Beyond Campus', label: 'Heading', selector: '.beyond-content > h2', type: 'text' },
    { id: 'beyond.text', section: 'Beyond Campus', label: 'Paragraph', selector: '.beyond-content > p', type: 'html', multiline: true },
    { id: 'beyond.image', section: 'Beyond Campus', label: 'Photo', selector: '.beyond-image img', type: 'image' },

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
      id: 'intro.features',
      section: 'Our Campus',
      label: 'Feature bullets',
      container: '.intro-features',
      item: '.intro-feature',
      addLabel: 'Add feature',
      fields: [
        { id: 'icon', label: 'Icon class', selector: '.intro-feature-icon i', type: 'attr', attr: 'class', hint: 'e.g. fas fa-tree' },
        { id: 'title', label: 'Title', selector: 'h4', type: 'text' },
        { id: 'text', label: 'Text', selector: 'p', type: 'text', multiline: true }
      ],
      template: (it) => `<div class="intro-feature">
                <div class="intro-feature-icon"><i class="${esc(it.icon || 'fas fa-tree')}"></i></div>
                <div>
                  <h4>${esc(it.title || '')}</h4>
                  <p>${esc(it.text || '')}</p>
                </div>
              </div>`
    },
    {
      id: 'facilities.cards',
      section: 'Facilities',
      label: 'Facility cards',
      container: '.facilities-grid',
      item: '.facility-card',
      addLabel: 'Add facility',
      fields: [
        { id: 'image', label: 'Image', selector: 'img', type: 'image' },
        { id: 'tag', label: 'Image tag', selector: '.facility-tag', type: 'text' },
        { id: 'title', label: 'Title', selector: 'h3', type: 'text' },
        { id: 'text', label: 'Text', selector: '.facility-body p', type: 'text', multiline: true }
      ],
      template: (it) => `<div class="facility-card reveal">
            <div class="facility-image">
              <img src="${esc(it.image || '')}" alt="${esc(it.title || '')}">
              <span class="facility-tag">${esc(it.tag || '')}</span>
            </div>
            <div class="facility-body">
              <h3>${esc(it.title || '')}</h3>
              <p>${esc(it.text || '')}</p>
            </div>
          </div>`
    },
    {
      id: 'day.items',
      section: 'A Day in the Life',
      label: 'Timeline entries',
      container: '.day-timeline',
      item: '.day-item',
      addLabel: 'Add time slot',
      fields: [
        { id: 'time', label: 'Time', selector: '.day-time', type: 'text' },
        { id: 'title', label: 'Title', selector: '.day-title', type: 'text' },
        { id: 'desc', label: 'Description', selector: '.day-desc', type: 'text', multiline: true }
      ],
      template: (it) => `<div class="day-item">
              <div class="day-time">${esc(it.time || '')}</div>
              <div class="day-content">
                <span class="day-dot"></span>
                <div class="day-title">${esc(it.title || '')}</div>
                <div class="day-desc">${esc(it.desc || '')}</div>
              </div>
            </div>`
    },
    {
      id: 'clubs.cards',
      section: 'Clubs & Activities',
      label: 'Club cards',
      container: '.clubs-grid',
      item: '.club-card',
      addLabel: 'Add club',
      fields: [
        { id: 'icon', label: 'Icon class', selector: '.club-icon i', type: 'attr', attr: 'class', hint: 'e.g. fas fa-leaf' },
        { id: 'title', label: 'Title', selector: 'h3', type: 'text' },
        { id: 'text', label: 'Text', selector: '.club-card > p', type: 'text', multiline: true },
        { id: 'meta', label: 'Schedule line', selector: '.club-meta', type: 'text', hint: 'The clock icon is added automatically.' }
      ],
      template: (it) => `<div class="club-card reveal">
            <div class="club-icon"><i class="${esc(it.icon || 'fas fa-leaf')}"></i></div>
            <h3>${esc(it.title || '')}</h3>
            <p>${esc(it.text || '')}</p>
            <div class="club-meta"><i class="fas fa-clock"></i> ${esc(it.meta || '')}</div>
          </div>`
    },
    {
      id: 'athletics.sports',
      section: 'Athletics & Movement',
      label: 'Sports list',
      container: '.sports-list',
      item: '.sport-item',
      addLabel: 'Add sport',
      fields: [
        { id: 'icon', label: 'Icon class', selector: 'i', type: 'attr', attr: 'class', hint: 'e.g. fas fa-futbol' },
        { id: 'text', label: 'Sport name', selector: '.sport-item', type: 'text' }
      ],
      template: (it) => `<div class="sport-item"><i class="${esc(it.icon || 'fas fa-futbol')}"></i> ${esc(it.text || '')}</div>`
    },
    {
      id: 'arts.cards',
      section: 'Arts & Music',
      label: 'Art cards',
      container: '.arts-grid',
      item: '.art-card',
      addLabel: 'Add art card',
      fields: [
        { id: 'image', label: 'Image', selector: 'img', type: 'image' },
        { id: 'title', label: 'Title', selector: 'h3', type: 'text' },
        { id: 'text', label: 'Text', selector: '.art-overlay p', type: 'text', multiline: true }
      ],
      template: (it) => `<div class="art-card reveal">
            <img src="${esc(it.image || '')}" alt="${esc(it.title || '')}">
            <div class="art-overlay">
              <h3>${esc(it.title || '')}</h3>
              <p>${esc(it.text || '')}</p>
            </div>
          </div>`
    },
    {
      id: 'beyond.excursions',
      section: 'Beyond Campus',
      label: 'Excursions',
      container: '.excursion-list',
      item: '.excursion-item',
      addLabel: 'Add excursion',
      fields: [
        { id: 'icon', label: 'Icon class', selector: '.excursion-icon i', type: 'attr', attr: 'class', hint: 'e.g. fas fa-hiking' },
        { id: 'title', label: 'Title', selector: 'h4', type: 'text' },
        { id: 'text', label: 'Text', selector: 'p', type: 'text', multiline: true }
      ],
      template: (it) => `<div class="excursion-item">
                <div class="excursion-icon"><i class="${esc(it.icon || 'fas fa-hiking')}"></i></div>
                <div>
                  <h4>${esc(it.title || '')}</h4>
                  <p>${esc(it.text || '')}</p>
                </div>
              </div>`
    }
  ]
});
