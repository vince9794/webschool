/* ============================================================
   GREENHILL CMS — Schema: Home page (index.html) + Global
   Reference schema. Other pages follow this exact pattern.
   ============================================================ */

import { register, esc } from './core.js';

/* ------------------------------------------------------------
   GLOBAL — header strip, logo, footer. Applied to every page.
   Defaults are read from index.html.
   ------------------------------------------------------------ */
register('global', {
  title: 'Site-wide',
  description: 'Top strip, school name and footer — shown on every page.',
  defaultPage: 'index.html',
  fields: [
    { id: 'strip.location', section: 'Top strip', label: 'Location text', selector: '.top-strip-left span:nth-child(1)', type: 'text' },
    { id: 'strip.phone', section: 'Top strip', label: 'Phone text', selector: '.top-strip-left span:nth-child(2)', type: 'text' },
    { id: 'strip.email', section: 'Top strip', label: 'Email address', selector: '.top-strip-right a:nth-child(1)', type: 'text' },
    { id: 'strip.emailHref', section: 'Top strip', label: 'Email link (mailto:)', selector: '.top-strip-right a:nth-child(1)', type: 'attr', attr: 'href' },
    { id: 'logo.name', section: 'School name', label: 'School name', selector: '.header .logo-name', type: 'text' },
    { id: 'logo.tagline', section: 'School name', label: 'Motto / tagline', selector: '.header .logo-tagline', type: 'text' },
    { id: 'footer.about', section: 'Footer', label: 'Footer description', selector: '.footer-brand > p', type: 'text', multiline: true },
    { id: 'footer.campus', section: 'Footer', label: 'Campus address (footer)', selector: '.footer-contact li:nth-child(1) div', type: 'html', hint: 'The bold word is the label, the text after it is the value.' },
    { id: 'footer.phone', section: 'Footer', label: 'Phone (footer)', selector: '.footer-contact li:nth-child(2) div', type: 'html' },
    { id: 'footer.email', section: 'Footer', label: 'Email (footer)', selector: '.footer-contact li:nth-child(3) div', type: 'html' },
    { id: 'footer.hours', section: 'Footer', label: 'Office hours (footer)', selector: '.footer-contact li:nth-child(4) div', type: 'html' },
    { id: 'footer.copyright', section: 'Footer', label: 'Copyright line', selector: '.footer-bottom p', type: 'html' }
  ],
  lists: [
    {
      id: 'footer.social',
      section: 'Footer',
      label: 'Social media links',
      container: '.footer-social',
      item: 'a',
      addLabel: 'Add social link',
      fields: [
        { id: 'label', label: 'Network name', selector: 'a', type: 'attr', attr: 'aria-label' },
        { id: 'icon', label: 'Icon class', selector: 'i', type: 'attr', attr: 'class', hint: 'Font Awesome class, e.g. fab fa-facebook-f' },
        { id: 'href', label: 'Profile URL', selector: 'a', type: 'attr', attr: 'href' }
      ],
      template: (it) => `<a href="${esc(it.href || '#')}" aria-label="${esc(it.label || '')}"><i class="${esc(it.icon || '')}"></i></a>`
    }
  ]
});

/* ------------------------------------------------------------
   INDEX.HTML
   ------------------------------------------------------------ */
register('index.html', {
  title: 'Home',
  description: 'Hero, statistics, pillars, Head’s welcome, day schedule, campus, testimonials, news and call-to-action.',
  fields: [
    /* --- Hero --- */
    { id: 'hero.kicker', section: 'Hero', label: 'Kicker (small text above heading)', selector: '.hero-kicker', type: 'text' },
    { id: 'hero.heading', section: 'Hero', label: 'Main heading', selector: '.hero-content h1', type: 'html', hint: 'Use <em>...</em> for italic words.' },
    { id: 'hero.lede', section: 'Hero', label: 'Intro paragraph', selector: '.hero-lede', type: 'text', multiline: true },
    { id: 'hero.image', section: 'Hero', label: 'Hero image', selector: '.hero-image img', type: 'image' },
    { id: 'hero.cta1.label', section: 'Hero', label: 'Primary button label', selector: '.hero-ctas a:nth-child(1)', type: 'text' },
    { id: 'hero.cta1.href', section: 'Hero', label: 'Primary button link', selector: '.hero-ctas a:nth-child(1)', type: 'attr', attr: 'href' },
    { id: 'hero.cta2.label', section: 'Hero', label: 'Secondary button label', selector: '.hero-ctas a:nth-child(2)', type: 'text' },
    { id: 'hero.cta2.href', section: 'Hero', label: 'Secondary button link', selector: '.hero-ctas a:nth-child(2)', type: 'attr', attr: 'href' },

    /* --- Why Greenhill --- */
    { id: 'why.kicker', section: 'Why Greenhill', label: 'Section kicker', selector: 'section:has(.pillars-grid) .section-header .kicker', type: 'text' },
    { id: 'why.heading', section: 'Why Greenhill', label: 'Section heading', selector: 'section:has(.pillars-grid) .section-header h2', type: 'text' },
    { id: 'why.intro', section: 'Why Greenhill', label: 'Section intro', selector: 'section:has(.pillars-grid) .section-header p', type: 'text', multiline: true },

    /* --- Head's welcome --- */
    { id: 'welcome.kicker', section: 'Head’s Welcome', label: 'Kicker', selector: '.welcome-content .kicker', type: 'text' },
    { id: 'welcome.heading', section: 'Head’s Welcome', label: 'Heading', selector: '.welcome-content h2', type: 'text' },
    { id: 'welcome.p1', section: 'Head’s Welcome', label: 'Paragraph 1', selector: '.welcome-content p:nth-of-type(1)', type: 'html', multiline: true },
    { id: 'welcome.p2', section: 'Head’s Welcome', label: 'Paragraph 2', selector: '.welcome-content p:nth-of-type(2)', type: 'html', multiline: true },
    { id: 'welcome.p3', section: 'Head’s Welcome', label: 'Paragraph 3', selector: '.welcome-content p:nth-of-type(3)', type: 'html', multiline: true },
    { id: 'welcome.portrait', section: 'Head’s Welcome', label: 'Head of School photo', selector: '.welcome-portrait img', type: 'image' },
    { id: 'welcome.signatureName', section: 'Head’s Welcome', label: 'Signature name', selector: '.signature-name', type: 'text' },
    { id: 'welcome.signatureTitle', section: 'Head’s Welcome', label: 'Signature title', selector: '.signature-title', type: 'text' },

    /* --- A Day at Greenhill --- */
    { id: 'day.heroImage', section: 'A Day at Greenhill', label: 'Section banner image', selector: '.day-hero img', type: 'image' },
    { id: 'day.heading', section: 'A Day at Greenhill', label: 'Card heading', selector: '.day-card h3', type: 'text' },

    /* --- Campus --- */
    { id: 'campus.kicker', section: 'Our Campus', label: 'Section kicker', selector: 'section:has(.campus-grid) .section-header .kicker', type: 'text' },
    { id: 'campus.heading', section: 'Our Campus', label: 'Section heading', selector: 'section:has(.campus-grid) .section-header h2', type: 'text' },
    { id: 'campus.intro', section: 'Our Campus', label: 'Section intro', selector: 'section:has(.campus-grid) .section-header p', type: 'text', multiline: true },

    /* --- Testimonials --- */
    { id: 'testimonials.kicker', section: 'Testimonials', label: 'Section kicker', selector: 'section:has(.testimonials-grid) .section-header .kicker', type: 'text' },
    { id: 'testimonials.heading', section: 'Testimonials', label: 'Section heading', selector: 'section:has(.testimonials-grid) .section-header h2', type: 'text' },

    /* --- News --- */
    { id: 'news.kicker', section: 'News & Happenings', label: 'Section kicker', selector: 'section:has(.news-grid) .section-header .kicker', type: 'text' },
    { id: 'news.heading', section: 'News & Happenings', label: 'Section heading', selector: 'section:has(.news-grid) .section-header h2', type: 'text' },
    { id: 'news.intro', section: 'News & Happenings', label: 'Section intro', selector: 'section:has(.news-grid) .section-header p', type: 'text', multiline: true },

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
      id: 'hero.trust',
      section: 'Hero',
      label: 'Trust badges under the buttons',
      container: '.hero-trust',
      item: '.hero-trust-item',
      addLabel: 'Add badge',
      fields: [
        { id: 'text', label: 'Text', selector: '.hero-trust-item', type: 'text' },
        { id: 'icon', label: 'Icon class', selector: 'i', type: 'attr', attr: 'class', hint: 'e.g. fas fa-check-circle' }
      ],
      template: (it) => `<div class="hero-trust-item"><i class="${esc(it.icon || 'fas fa-check-circle')}"></i> ${esc(it.text || '')}</div>`
    },
    {
      id: 'stats',
      section: 'Statistics band',
      label: 'Statistics',
      container: '.stats-grid',
      item: '.stat-item',
      addLabel: 'Add statistic',
      fields: [
        { id: 'number', label: 'Value', selector: '.stat-number', type: 'text' },
        { id: 'label', label: 'Label', selector: '.stat-label', type: 'text' }
      ],
      template: (it) => `<div class="stat-item">
            <span class="stat-number">${esc(it.number || '')}</span>
            <span class="stat-label">${esc(it.label || '')}</span>
          </div>`
    },
    {
      id: 'pillars',
      section: 'Why Greenhill',
      label: 'Pillar cards',
      container: '.pillars-grid',
      item: '.pillar-card',
      addLabel: 'Add pillar card',
      fields: [
        { id: 'icon', label: 'Icon class', selector: '.pillar-icon i', type: 'attr', attr: 'class', hint: 'e.g. fas fa-seedling' },
        { id: 'title', label: 'Title', selector: 'h3', type: 'text' },
        { id: 'text', label: 'Text', selector: 'p', type: 'text', multiline: true },
        { id: 'linkText', label: 'Link label', selector: 'a', type: 'text' },
        { id: 'linkHref', label: 'Link URL', selector: 'a', type: 'attr', attr: 'href' }
      ],
      template: (it) => `<div class="pillar-card reveal">
            <div class="pillar-icon"><i class="${esc(it.icon || 'fas fa-seedling')}"></i></div>
            <h3>${esc(it.title || '')}</h3>
            <p>${esc(it.text || '')}</p>
            <a href="${esc(it.linkHref || '#')}" class="link-arrow">${esc(it.linkText || '')}</a>
          </div>`
    },
    {
      id: 'day.schedule',
      section: 'A Day at Greenhill',
      label: 'Day schedule',
      container: '.day-schedule',
      item: '.day-item',
      addLabel: 'Add schedule item',
      fields: [
        { id: 'time', label: 'Time', selector: '.day-time', type: 'text' },
        { id: 'title', label: 'Title', selector: '.day-title', type: 'text' },
        { id: 'desc', label: 'Description', selector: '.day-desc', type: 'text', multiline: true }
      ],
      template: (it) => `<div class="day-item">
                <div class="day-time">${esc(it.time || '')}</div>
                <div class="day-title">${esc(it.title || '')}</div>
                <div class="day-desc">${esc(it.desc || '')}</div>
              </div>`
    },
    {
      id: 'campus.cards',
      section: 'Our Campus',
      label: 'Campus cards',
      container: '.campus-grid',
      item: '.campus-card',
      addLabel: 'Add campus card',
      fields: [
        { id: 'image', label: 'Image', selector: 'img', type: 'image' },
        { id: 'tag', label: 'Tag', selector: '.campus-card-tag', type: 'text' },
        { id: 'title', label: 'Title', selector: 'h3', type: 'text' },
        { id: 'text', label: 'Text', selector: 'p', type: 'text', multiline: true }
      ],
      template: (it) => `<div class="campus-card reveal">
            <img src="${esc(it.image || '')}" alt="${esc(it.title || '')}">
            <div class="campus-card-overlay">
              <span class="campus-card-tag">${esc(it.tag || '')}</span>
              <h3>${esc(it.title || '')}</h3>
              <p>${esc(it.text || '')}</p>
            </div>
          </div>`
    },
    {
      id: 'testimonials',
      section: 'Testimonials',
      label: 'Testimonial cards',
      container: '.testimonials-grid',
      item: '.testimonial-card',
      addLabel: 'Add testimonial',
      fields: [
        { id: 'quote', label: 'Quote', selector: '.testimonial-quote', type: 'text', multiline: true },
        { id: 'initials', label: 'Avatar initials', selector: '.testimonial-avatar', type: 'text', hint: 'e.g. AW' },
        { id: 'name', label: 'Name', selector: '.testimonial-name', type: 'text' },
        { id: 'role', label: 'Role', selector: '.testimonial-role', type: 'text' }
      ],
      template: (it) => `<div class="testimonial-card reveal">
            <p class="testimonial-quote">${esc(it.quote || '')}</p>
            <div class="testimonial-author">
              <div class="testimonial-avatar">${esc(it.initials || '')}</div>
              <div>
                <div class="testimonial-name">${esc(it.name || '')}</div>
                <div class="testimonial-role">${esc(it.role || '')}</div>
              </div>
            </div>
          </div>`
    },
    {
      id: 'news.cards',
      section: 'News & Happenings',
      label: 'News cards',
      container: 'section:has(.news-grid) .news-grid',
      item: '.news-card',
      addLabel: 'Add news card',
      fields: [
        { id: 'image', label: 'Image', selector: 'img', type: 'image' },
        { id: 'category', label: 'Category tag', selector: '.news-category', type: 'text' },
        { id: 'date', label: 'Date', selector: '.news-date', type: 'text' },
        { id: 'title', label: 'Title', selector: 'h3', type: 'text' },
        { id: 'text', label: 'Excerpt', selector: '.news-body p', type: 'text', multiline: true },
        { id: 'linkText', label: 'Link label', selector: 'a', type: 'text' },
        { id: 'linkHref', label: 'Link URL', selector: 'a', type: 'attr', attr: 'href' }
      ],
      template: (it) => `<article class="news-card reveal">
            <div class="news-image">
              <img src="${esc(it.image || '')}" alt="${esc(it.title || '')}">
              <span class="news-category">${esc(it.category || '')}</span>
            </div>
            <div class="news-body">
              <div class="news-date">${esc(it.date || '')}</div>
              <h3>${esc(it.title || '')}</h3>
              <p>${esc(it.text || '')}</p>
              <a href="${esc(it.linkHref || '#')}" class="link-arrow">${esc(it.linkText || '')}</a>
            </div>
          </article>`
    }
  ]
});
