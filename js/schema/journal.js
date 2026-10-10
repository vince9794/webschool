/* ============================================================
   GREENHILL CMS — Schema: Journal page (journal.html)
   ============================================================ */

import { register, esc } from './core.js';

register('journal.html', {
  title: 'Journal',
  description: 'Page hero, filter tabs, featured story, news cards, events table, subscribe band and CTA.',
  fields: [
    /* --- Page hero --- */
    { id: 'hero.bg', section: 'Page Hero', label: 'Background image', selector: '.page-hero-bg', type: 'bg' },
    { id: 'hero.kicker', section: 'Page Hero', label: 'Kicker', selector: '.page-hero-kicker', type: 'text' },
    { id: 'hero.heading', section: 'Page Hero', label: 'Heading', selector: '.page-hero-content h1', type: 'html', hint: 'Supports <em> and <strong>.' },
    { id: 'hero.text', section: 'Page Hero', label: 'Intro paragraph', selector: '.page-hero-content > p', type: 'text', multiline: true },

    /* --- Featured story --- */
    { id: 'featured.image', section: 'Featured Story', label: 'Image', selector: '.featured-image img', type: 'image' },
    { id: 'featured.badge', section: 'Featured Story', label: 'Image badge', selector: '.featured-category', type: 'text' },
    { id: 'featured.date', section: 'Featured Story', label: 'Date', selector: '.featured-meta .date', type: 'text' },
    { id: 'featured.topic', section: 'Featured Story', label: 'Topic (after date)', selector: '.featured-meta > span:nth-of-type(3)', type: 'text' },
    { id: 'featured.title', section: 'Featured Story', label: 'Title', selector: '.featured-content h2', type: 'text' },
    { id: 'featured.excerpt', section: 'Featured Story', label: 'Excerpt', selector: '.featured-content p', type: 'text', multiline: true },
    { id: 'featured.linkLabel', section: 'Featured Story', label: 'Read-more label', selector: '.featured-content .link-arrow', type: 'text' },
    { id: 'featured.linkHref', section: 'Featured Story', label: 'Read-more link', selector: '.featured-content .link-arrow', type: 'attr', attr: 'href' },

    /* --- Events table --- */
    { id: 'events.title', section: 'Upcoming Events', label: 'Table title', selector: '.events-header h3', type: 'text' },
    { id: 'events.term', section: 'Upcoming Events', label: 'Term label', selector: '.events-header span', type: 'text', hint: 'The calendar icon is added automatically.' },
    { id: 'events.th1', section: 'Upcoming Events', label: 'Column: Date', selector: '.events-table thead th:nth-child(1)', type: 'text' },
    { id: 'events.th2', section: 'Upcoming Events', label: 'Column: Event', selector: '.events-table thead th:nth-child(2)', type: 'text' },
    { id: 'events.th3', section: 'Upcoming Events', label: 'Column: Location', selector: '.events-table thead th:nth-child(3)', type: 'text' },
    { id: 'events.th4', section: 'Upcoming Events', label: 'Column: RSVP', selector: '.events-table thead th:nth-child(4)', type: 'text' },

    /* --- Subscribe band --- */
    { id: 'subscribe.kicker', section: 'Subscribe Band', label: 'Kicker', selector: '.subscribe-band .kicker', type: 'text' },
    { id: 'subscribe.heading', section: 'Subscribe Band', label: 'Heading', selector: '.subscribe-band h2', type: 'html', hint: 'Supports <em> and <strong>.' },
    { id: 'subscribe.text', section: 'Subscribe Band', label: 'Paragraph', selector: '.subscribe-band .container > p:not(.subscribe-note)', type: 'text', multiline: true },
    { id: 'subscribe.note', section: 'Subscribe Band', label: 'Form note', selector: '.subscribe-note', type: 'text' },

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
      id: 'filters.tabs',
      section: 'Filter Tabs',
      label: 'Filter buttons',
      container: '.filter-tabs',
      item: '.filter-btn',
      addLabel: 'Add filter',
      fields: [
        { id: 'label', label: 'Button label', selector: '.filter-btn', type: 'text' },
        { id: 'filter', label: 'Filter key', selector: '.filter-btn', type: 'attr', attr: 'data-filter', hint: 'Must match the Category key used on news cards (e.g. academics, campus, community, alumni, events).' }
      ],
      template: (it) => `<button class="filter-btn" data-filter="${esc(it.filter || 'all')}">${esc(it.label || '')}</button>`
    },
    {
      id: 'news.cards',
      section: 'News Cards',
      label: 'News cards',
      container: '.news-grid',
      item: '.news-card',
      addLabel: 'Add story',
      fields: [
        { id: 'category', label: 'Category key', selector: '.news-card', type: 'attr', attr: 'data-category', hint: 'Used by the filter tabs (academics, campus, community, alumni, events).' },
        { id: 'image', label: 'Image', selector: 'img', type: 'image' },
        { id: 'categoryLabel', label: 'Category badge', selector: '.news-category', type: 'text' },
        { id: 'date', label: 'Date', selector: '.news-date', type: 'text' },
        { id: 'title', label: 'Title', selector: 'h3', type: 'text' },
        { id: 'text', label: 'Excerpt', selector: '.news-body p', type: 'text', multiline: true },
        { id: 'readMore', label: 'Read-more label', selector: '.news-read-more', type: 'text' },
        { id: 'href', label: 'Read-more link', selector: '.news-read-more', type: 'attr', attr: 'href' }
      ],
      template: (it) => `<article class="news-card reveal" data-category="${esc(it.category || 'all')}">
            <div class="news-image">
              <img src="${esc(it.image || '')}" alt="${esc(it.title || '')}">
              <span class="news-category">${esc(it.categoryLabel || '')}</span>
            </div>
            <div class="news-body">
              <div class="news-date">${esc(it.date || '')}</div>
              <h3>${esc(it.title || '')}</h3>
              <p>${esc(it.text || '')}</p>
              <a href="${esc(it.href || '#')}" class="news-read-more">${esc(it.readMore || 'Read more')}</a>
            </div>
          </article>`
    },
    {
      id: 'events.rows',
      section: 'Upcoming Events',
      label: 'Event rows',
      container: '.events-table tbody',
      item: 'tr',
      addLabel: 'Add event',
      fields: [
        { id: 'month', label: 'Month', selector: '.month', type: 'text' },
        { id: 'day', label: 'Day', selector: '.day', type: 'text' },
        { id: 'title', label: 'Event title', selector: '.event-title', type: 'text' },
        { id: 'desc', label: 'Event description', selector: '.event-desc', type: 'text', multiline: true },
        { id: 'location', label: 'Location', selector: '.event-location', type: 'text', hint: 'The pin icon is added automatically.' },
        { id: 'rsvp', label: 'RSVP label', selector: '.event-rsvp', type: 'text' },
        { id: 'href', label: 'RSVP link', selector: '.event-rsvp', type: 'attr', attr: 'href' }
      ],
      template: (it) => `<tr>
                <td>
                  <div class="event-date-box">
                    <span class="month">${esc(it.month || '')}</span>
                    <span class="day">${esc(it.day || '')}</span>
                  </div>
                </td>
                <td>
                  <div class="event-title">${esc(it.title || '')}</div>
                  <div class="event-desc">${esc(it.desc || '')}</div>
                </td>
                <td>
                  <div class="event-location"><i class="fas fa-map-marker-alt"></i> ${esc(it.location || '')}</div>
                </td>
                <td><a href="${esc(it.href || '#')}" class="event-rsvp">${esc(it.rsvp || 'RSVP')}</a></td>
              </tr>`
    }
  ]
});
