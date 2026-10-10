/* ============================================================
   THE GREENHILL SCHOOL — Shared Scripts (main.js)
   Header scroll state, mobile menu (hamburger drawer), and
   scroll-reveal animations. Used by every public page.
   ============================================================ */

// ============================================================
// HEADER SCROLL STATE
// ============================================================
const header = document.getElementById('header');
if (header) {
  window.addEventListener('scroll', () => {
    header.classList.toggle('scrolled', window.scrollY > 20);
  });
}

// ============================================================
// MOBILE MENU
// ============================================================
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');
const overlay = document.getElementById('overlay');

if (hamburger && nav && overlay) {
  function toggleMenu() {
    hamburger.classList.toggle('active');
    nav.classList.toggle('open');
    overlay.classList.toggle('active');
    document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
  }

  hamburger.addEventListener('click', toggleMenu);
  overlay.addEventListener('click', toggleMenu);

  // Close the drawer when any nav link is tapped
  nav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      if (nav.classList.contains('open')) toggleMenu();
    });
  });

  // Close with the Escape key too (nice for keyboard users)
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && nav.classList.contains('open')) toggleMenu();
  });

  // Close when the viewport grows back past the mobile breakpoint
  window.addEventListener('resize', () => {
    if (window.innerWidth > 1024 && nav.classList.contains('open')) toggleMenu();
  });
}

// ============================================================
// SCROLL REVEAL
// ============================================================
const reveals = document.querySelectorAll('.reveal');
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

reveals.forEach(el => observer.observe(el));