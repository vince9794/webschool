/* ============================================================
   GREENHILL CMS — Schema: Parent Portal landing (portal.html)
   Only the login/landing screen is editable — the demo
   dashboard behind it is out of scope.
   ============================================================ */

import { register, esc } from './core.js';

register('portal.html', {
  title: 'Parent Portal',
  description: 'Portal landing screen: brand panel, welcome message, feature list and support contacts.',
  fields: [
    /* --- Brand panel --- */
    { id: 'brand.name', section: 'Brand', label: 'School name', selector: '#loginPage .login-brand-name', type: 'text' },
    { id: 'brand.tagline', section: 'Brand', label: 'Tagline', selector: '#loginPage .login-brand-tagline', type: 'text' },
    { id: 'welcome.kicker', section: 'Welcome Panel', label: 'Kicker', selector: '#loginPage .login-brand-kicker', type: 'text' },
    { id: 'welcome.heading', section: 'Welcome Panel', label: 'Heading', selector: '#loginPage .login-brand-message h1', type: 'html', hint: 'Supports <em> and <strong>.' },
    { id: 'welcome.text', section: 'Welcome Panel', label: 'Paragraph', selector: '#loginPage .login-brand-message > p', type: 'text', multiline: true },
    { id: 'brand.footerLabel', section: 'Brand', label: 'Footer label', selector: '#loginPage .login-brand-footer span', type: 'text', hint: 'The lock icon is added automatically.' },
    { id: 'brand.footerLink', section: 'Brand', label: 'Footer link label', selector: '#loginPage .login-brand-footer a', type: 'text' },
    { id: 'brand.footerHref', section: 'Brand', label: 'Footer link URL', selector: '#loginPage .login-brand-footer a', type: 'attr', attr: 'href' },

    /* --- Sign-in panel --- */
    { id: 'signin.backLink', section: 'Sign In Panel', label: 'Back link label', selector: '#loginPage .back-link', type: 'text', hint: 'The arrow icon is added automatically.' },
    { id: 'signin.kicker', section: 'Sign In Panel', label: 'Kicker', selector: '#loginPage .login-kicker', type: 'text' },
    { id: 'signin.heading', section: 'Sign In Panel', label: 'Heading', selector: '#loginPage .login-header h2', type: 'text' },
    { id: 'signin.text', section: 'Sign In Panel', label: 'Paragraph', selector: '#loginPage .login-header p', type: 'text', multiline: true },

    /* --- Support --- */
    { id: 'support.text', section: 'Support', label: 'Help text', selector: '#loginPage .login-support > p', type: 'html', multiline: true, hint: 'Supports <br> line breaks.' },
    { id: 'support.notice', section: 'Support', label: 'Demo notice (HTML)', selector: '#loginPage .demo-notice', type: 'html', multiline: true, hint: 'Keeps the info icon + text inside a bordered box.' }
  ],
  lists: [
    {
      id: 'welcome.features',
      section: 'Welcome Panel',
      label: 'Feature list',
      container: '#loginPage .login-features',
      item: '.login-feature',
      addLabel: 'Add feature',
      fields: [
        { id: 'icon', label: 'Icon class', selector: '.login-feature-icon i', type: 'attr', attr: 'class', hint: 'e.g. fas fa-chart-line' },
        { id: 'title', label: 'Title', selector: 'h4', type: 'text' },
        { id: 'text', label: 'Text', selector: 'p', type: 'text', multiline: true }
      ],
      template: (it) => `<div class="login-feature">
            <div class="login-feature-icon"><i class="${esc(it.icon || 'fas fa-chart-line')}"></i></div>
            <div>
              <h4>${esc(it.title || '')}</h4>
              <p>${esc(it.text || '')}</p>
            </div>
          </div>`
    },
    {
      id: 'support.contacts',
      section: 'Support',
      label: 'Support buttons',
      container: '#loginPage .support-contacts',
      item: '.support-btn',
      addLabel: 'Add contact',
      fields: [
        { id: 'icon', label: 'Icon class', selector: '.support-btn i', type: 'attr', attr: 'class', hint: 'e.g. fas fa-phone' },
        { id: 'label', label: 'Label', selector: '.support-btn', type: 'text' },
        { id: 'href', label: 'Link', selector: '.support-btn', type: 'attr', attr: 'href' }
      ],
      template: (it) => `<a href="${esc(it.href || '#')}" class="support-btn">
              <i class="${esc(it.icon || 'fas fa-phone')}"></i> ${esc(it.label || '')}
            </a>`
    }
  ]
});
