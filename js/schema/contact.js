/* ============================================================
   GREENHILL CMS — Schema: Contact page (contact.html)
   ============================================================ */

import { register, esc } from './core.js';

register('contact.html', {
  title: 'Contact',
  description: 'Page hero, info cards, form intro, office hours, socials, directions, map, departments and CTA.',
  fields: [
    /* --- Page hero --- */
    { id: 'hero.bg', section: 'Page Hero', label: 'Background image', selector: '.page-hero-bg', type: 'bg' },
    { id: 'hero.kicker', section: 'Page Hero', label: 'Kicker', selector: '.page-hero-kicker', type: 'text' },
    { id: 'hero.heading', section: 'Page Hero', label: 'Heading', selector: '.page-hero-content h1', type: 'html', hint: 'Supports <em> and <strong>.' },
    { id: 'hero.text', section: 'Page Hero', label: 'Intro paragraph', selector: '.page-hero-content > p', type: 'text', multiline: true },

    /* --- Message form card (intro only — the fields are functional) --- */
    { id: 'form.kicker', section: 'Send a Message', label: 'Kicker', selector: '.form-card > .kicker', type: 'text' },
    { id: 'form.heading', section: 'Send a Message', label: 'Heading', selector: '.form-card > h3', type: 'text' },
    { id: 'form.subtitle', section: 'Send a Message', label: 'Subtitle', selector: '.form-card .form-subtitle', type: 'text', multiline: true },
    { id: 'form.success', section: 'Send a Message', label: 'Success message', selector: '#formSuccess span', type: 'text', multiline: true },

    /* --- Sidebar --- */
    { id: 'sidebar.hoursTitle', section: 'Office Hours Card', label: 'Card title', selector: '.contact-sidebar > .sidebar-card:nth-child(1) h3', type: 'text' },
    { id: 'sidebar.socialTitle', section: 'Follow Greenhill Card', label: 'Card title', selector: '.contact-sidebar > .sidebar-card:nth-child(2) h3', type: 'text' },
    { id: 'sidebar.directionsTitle', section: 'Quick Directions Card', label: 'Card title', selector: '.contact-sidebar > .sidebar-card:nth-child(3) h3', type: 'text' },

    /* --- Map --- */
    { id: 'map.kicker', section: 'Find Us', label: 'Section kicker', selector: 'section:has(.map-wrapper) .section-header .kicker', type: 'text' },
    { id: 'map.heading', section: 'Find Us', label: 'Section heading', selector: 'section:has(.map-wrapper) .section-header h2', type: 'text' },
    { id: 'map.intro', section: 'Find Us', label: 'Section intro', selector: 'section:has(.map-wrapper) .section-header p', type: 'text', multiline: true },
    { id: 'map.src', section: 'Find Us', label: 'Map embed URL', selector: '.map-wrapper iframe', type: 'attr', attr: 'src', hint: 'Google Maps embed share URL.' },
    { id: 'map.caption', section: 'Find Us', label: 'Map caption', selector: '.map-caption', type: 'text', hint: 'The pin icon is added automatically.' },

    /* --- Directions (shares the Find Us section header with the map — edited above) --- */

    /* --- Departments --- */
    { id: 'dept.kicker', section: 'Departments', label: 'Section kicker', selector: 'section:has(.departments-grid) .section-header .kicker', type: 'text' },
    { id: 'dept.heading', section: 'Departments', label: 'Section heading', selector: 'section:has(.departments-grid) .section-header h2', type: 'text' },
    { id: 'dept.intro', section: 'Departments', label: 'Section intro', selector: 'section:has(.departments-grid) .section-header p', type: 'text', multiline: true },

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
      id: 'info.cards',
      section: 'Info Cards',
      label: 'Contact info cards',
      container: '.info-cards',
      item: '.info-card',
      addLabel: 'Add card',
      fields: [
        { id: 'icon', label: 'Icon class', selector: '.info-icon i', type: 'attr', attr: 'class', hint: 'e.g. fas fa-map-marker-alt' },
        { id: 'title', label: 'Title', selector: 'h3', type: 'text' },
        { id: 'body', label: 'Body (HTML allowed)', selector: 'p', type: 'html', multiline: true, hint: 'Supports <br> line breaks and <a href="tel:..."> / <a href="mailto:..."> links.' }
      ],
      template: (it) => `<div class="info-card reveal">
            <div class="info-icon"><i class="${esc(it.icon || 'fas fa-map-marker-alt')}"></i></div>
            <h3>${esc(it.title || '')}</h3>
            <p>${it.body || ''}</p>
          </div>`
    },
    {
      id: 'sidebar.hours',
      section: 'Office Hours Card',
      label: 'Opening hours rows',
      container: '.contact-sidebar > .sidebar-card:nth-child(1) .office-hours',
      item: 'li',
      addLabel: 'Add row',
      fields: [
        { id: 'classes', label: 'Row classes', selector: 'li', type: 'attr', attr: 'class', hint: "Use the word 'closed' for closed days." },
        { id: 'day', label: 'Day', selector: 'span:nth-child(1)', type: 'text' },
        { id: 'hours', label: 'Hours', selector: 'span:nth-child(2)', type: 'text' }
      ],
      template: (it) => `<li class="${esc(it.classes || '')}"><span>${esc(it.day || '')}</span><span>${esc(it.hours || '')}</span></li>`
    },
    {
      id: 'sidebar.socials',
      section: 'Follow Greenhill Card',
      label: 'Social links',
      container: '.social-links',
      item: '.social-btn',
      addLabel: 'Add link',
      fields: [
        { id: 'classes', label: 'Button classes', selector: '.social-btn', type: 'attr', attr: 'class', hint: 'Keep "social-btn" plus the network class (facebook, instagram, youtube, linkedin, whatsapp).' },
        { id: 'icon', label: 'Icon class', selector: '.social-btn i', type: 'attr', attr: 'class', hint: 'e.g. fab fa-facebook-f' },
        { id: 'label', label: 'Label', selector: '.social-btn', type: 'text' },
        { id: 'href', label: 'Link', selector: '.social-btn', type: 'attr', attr: 'href' }
      ],
      template: (it) => `<a href="${esc(it.href || '#')}" class="${esc(it.classes || 'social-btn')}"><i class="${esc(it.icon || 'fab fa-facebook-f')}"></i> ${esc(it.label || '')}</a>`
    },
    {
      id: 'sidebar.directions',
      section: 'Quick Directions Card',
      label: 'Direction lines',
      container: '.contact-sidebar > .sidebar-card:nth-child(3)',
      item: '.department-detail',
      addLabel: 'Add direction',
      fields: [
        { id: 'icon', label: 'Icon class', selector: '.department-detail > i', type: 'attr', attr: 'class', hint: 'e.g. fas fa-car' },
        { id: 'text', label: 'Text (HTML allowed)', selector: 'span', type: 'html', multiline: true, hint: 'Starts with a <strong> label, e.g. <strong>From Nairobi CBD:</strong> ~35 min.' }
      ],
      template: (it) => `<div class="department-detail" style="margin-bottom:12px;">
                <i class="${esc(it.icon || 'fas fa-car')}"></i>
                <span>${it.text || ''}</span>
              </div>`
    },
    {
      id: 'directions.cards',
      section: 'Directions',
      label: 'Direction cards',
      container: '.directions-grid',
      item: '.direction-card',
      addLabel: 'Add card',
      fields: [
        { id: 'icon', label: 'Icon class', selector: '.direction-icon i', type: 'attr', attr: 'class', hint: 'e.g. fas fa-car' },
        { id: 'title', label: 'Title', selector: 'h4', type: 'text' },
        { id: 'text', label: 'Text (HTML allowed)', selector: 'p', type: 'html', multiline: true, hint: 'Supports <strong>, <em> and <br>.' }
      ],
      template: (it) => `<div class="direction-card reveal">
            <div class="direction-icon"><i class="${esc(it.icon || 'fas fa-car')}"></i></div>
            <h4>${esc(it.title || '')}</h4>
            <p>${it.text || ''}</p>
          </div>`
    },
    {
      id: 'dept.cards',
      section: 'Departments',
      label: 'Department cards',
      container: '.departments-grid',
      item: '.department-card',
      addLabel: 'Add department',
      fields: [
        { id: 'icon', label: 'Icon class', selector: '.department-icon i', type: 'attr', attr: 'class', hint: 'e.g. fas fa-graduation-cap' },
        { id: 'title', label: 'Department name', selector: 'h3', type: 'text' },
        { id: 'person', label: 'Contact person', selector: '.department-card > .department-detail:nth-child(3) span', type: 'text' },
        { id: 'phone', label: 'Phone', selector: '.department-card > .department-detail:nth-child(4) a', type: 'text' },
        { id: 'phoneHref', label: 'Phone link', selector: '.department-card > .department-detail:nth-child(4) a', type: 'attr', attr: 'href' },
        { id: 'email', label: 'Email', selector: '.department-card > .department-detail:nth-child(5) a', type: 'text' },
        { id: 'emailHref', label: 'Email link', selector: '.department-card > .department-detail:nth-child(5) a', type: 'attr', attr: 'href' }
      ],
      template: (it) => `<div class="department-card reveal">
            <div class="department-icon"><i class="${esc(it.icon || 'fas fa-graduation-cap')}"></i></div>
            <h3>${esc(it.title || '')}</h3>
            <div class="department-detail">
              <i class="fas fa-user"></i>
              <span>${esc(it.person || '')}</span>
            </div>
            <div class="department-detail">
              <i class="fas fa-phone"></i>
              <a href="${esc(it.phoneHref || 'tel:')}">${esc(it.phone || '')}</a>
            </div>
            <div class="department-detail">
              <i class="fas fa-envelope"></i>
              <a href="${esc(it.emailHref || 'mailto:')}">${esc(it.email || '')}</a>
            </div>
          </div>`
    }
  ]
});
