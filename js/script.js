/**
 * js/script.js
 * Neel & Hema — Wedding Website
 *
 * Modules:
 * 1. Sticky Navigation (scroll state + hamburger menu)
 * 2. Smooth Scrolling (offset for fixed header)
 * 3. Scroll-in Animations (Intersection Observer)
 * 4. Countdown Timer
 * 5. Gallery Lightbox
 */

/* =============================================
   UTILITY HELPERS
============================================== */

/**
 * Shorthand for document.querySelector
 * @param {string} selector
 * @param {Element} [ctx=document]
 * @returns {Element|null}
 */
const $ = (selector, ctx = document) => ctx.querySelector(selector);

/**
 * Shorthand for document.querySelectorAll → Array
 * @param {string} selector
 * @param {Element} [ctx=document]
 * @returns {Element[]}
 */
const $$ = (selector, ctx = document) => Array.from(ctx.querySelectorAll(selector));

/* Language state is shared by the modal and navbar switcher. */
let currentLanguage = 'en';
const isKhushiSide = new URLSearchParams(window.location.search).get('side') === 'khushi';

function updateSidePresentation(translations) {
  const coupleNames = document.getElementById('couple-names');
  const namesKey = isKhushiSide ? 'hero.namesCoupleKhushi' : 'hero.namesCouple';
  const names = getNestedValue(translations, namesKey);
  if (coupleNames && typeof names === 'string') coupleNames.textContent = names;

  const video = document.getElementById('bg-video');
  const videoSource = document.getElementById('bg-video-source');
  if (videoSource) {
    const source = isKhushiSide ? './video2.mp4' : './assets/videos/invitation.mp4';
    if (videoSource.getAttribute('src') !== source) {
      videoSource.setAttribute('src', source);
      video?.load();
      video?.play().catch(() => {});
    }
  }
}


/* =============================================
   1. STICKY NAVIGATION
============================================== */
function initStickyNav() {
  const header    = $('#site-header');
  const navToggle = $('#nav-toggle');
  const navRight  = $('.nav-right');   // mobile drawer is now .nav-right

  if (!header) return;

  const SCROLL_THRESHOLD = 60;

  function updateHeaderState() {
    // Keep the navbar transparent while it overlays the hero.  Apply its
    // solid background only after the hero has been fully scrolled past.
    const hero = document.getElementById('hero-section');
    const threshold = hero ? hero.offsetHeight : SCROLL_THRESHOLD;

    if (window.scrollY > threshold) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }

  window.addEventListener('scroll', updateHeaderState, { passive: true });
  updateHeaderState();

  // Hamburger toggle (mobile)
  if (navToggle && navRight) {
    navToggle.addEventListener('click', () => {
      const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
      navToggle.setAttribute('aria-expanded', String(!isOpen));
      navRight.classList.toggle('open', !isOpen);
    });

    // Close menu when a nav link is clicked
    $$('.nav-link', navRight).forEach(link => {
      link.addEventListener('click', () => {
        navToggle.setAttribute('aria-expanded', 'false');
        navRight.classList.remove('open');
      });
    });

    // Close menu on Escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && navRight.classList.contains('open')) {
        navToggle.setAttribute('aria-expanded', 'false');
        navRight.classList.remove('open');
        navToggle.focus();
      }
    });
  }
}


/* =============================================
   2. SMOOTH SCROLLING (with fixed-header offset)
============================================== */
function initSmoothScroll() {
  /**
   * All anchor links pointing to an on-page # target.
   * The CSS scroll-padding-top handles most cases, but we
   * add a JS fallback for older browsers.
   */
  $$('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const targetId = link.getAttribute('href');
      if (!targetId || targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();

      const navHeight = parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-height'),
        10
      ) || 72;

      const targetTop =
        target.getBoundingClientRect().top + window.scrollY - navHeight;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });
}


/* =============================================
   3. SCROLL-IN ANIMATIONS (Intersection Observer)
============================================== */
function initScrollAnimations() {
  // Story cards already have the CSS classes (.story-card, .visible)
  const cards = $$('.story-card');
  if (!cards.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target); // animate once
        }
      });
    },
    {
      threshold: 0.15,      // trigger when 15% of card is visible
      rootMargin: '0px 0px -40px 0px',
    }
  );

  cards.forEach(card => observer.observe(card));
}


/* =============================================
   4. COUNTDOWN TIMER
============================================== */
function initCountdown() {
  const container = $('#hero-countdown');

  // Wedding date — update to match the actual date/time (IST = UTC+5:30)
  const WEDDING_DATE = new Date('2026-12-05T09:30:00+05:30');

  // Banner timer elements
  const cbtDays  = $('#cbt-days');
  const cbtHours = $('#cbt-hours');
  const cbtMins  = $('#cbt-mins');
  const cbtSecs  = $('#cbt-secs');

  // Nav mini-countdown elements
  const navDays  = $('#nav-cd-days');
  const navHrs   = $('#nav-cd-hrs');
  const navMins  = $('#nav-cd-mins');
  const navSecs  = $('#nav-cd-secs');

  function pad(n) { return String(n).padStart(2, '0'); }

  function render() {
    const now  = new Date();
    const diff = WEDDING_DATE - now;

    if (diff <= 0) {
      // Hero countdown bar
      const dEl = $('#cd-days');
      const hEl = $('#cd-hours');
      const mEl = $('#cd-mins');
      const sEl = $('#cd-secs');
      if (dEl) dEl.textContent = '00';
      if (hEl) hEl.textContent = '00';
      if (mEl) mEl.textContent = '00';
      if (sEl) sEl.textContent = '00';
      // Banner countdown
      if (cbtDays)  cbtDays.textContent  = '00';
      if (cbtHours) cbtHours.textContent = '00';
      if (cbtMins)  cbtMins.textContent  = '00';
      if (cbtSecs)  cbtSecs.textContent  = '00';
      // Nav countdown
      if (navDays)  navDays.textContent  = '00';
      if (navHrs)   navHrs.textContent   = '00';
      if (navMins)  navMins.textContent  = '00';
      if (navSecs)  navSecs.textContent  = '00';
      return;
    }

    const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours   = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    // ── Hero/bar countdown (pre-built elements in HTML) ──
    if (container) {
      const dEl = $('#cd-days');
      const hEl = $('#cd-hours');
      const mEl = $('#cd-mins');
      const sEl = $('#cd-secs');
      if (dEl) dEl.textContent = days;
      if (hEl) hEl.textContent = pad(hours);
      if (mEl) mEl.textContent = pad(minutes);
      if (sEl) sEl.textContent = pad(seconds);
    }

    // ── Banner countdown ──
    if (cbtDays)  cbtDays.textContent  = days;
    if (cbtHours) cbtHours.textContent = pad(hours);
    if (cbtMins)  cbtMins.textContent  = pad(minutes);
    if (cbtSecs)  cbtSecs.textContent  = pad(seconds);

    // ── Nav mini countdown ──
    if (navDays)  navDays.textContent  = days;
    if (navHrs)   navHrs.textContent   = pad(hours);
    if (navMins)  navMins.textContent  = pad(minutes);
    if (navSecs)  navSecs.textContent  = pad(seconds);
  }

  render();
  setInterval(render, 1000);
}


/* =============================================
   5. GALLERY LIGHTBOX
============================================== */
function initGallery() {
  const galleryGrid = $('#gallery-grid');
  const lightbox    = $('#gallery-lightbox');
  const lightboxContent = $('#lightbox-content');
  const lightboxCaption = $('#lightbox-caption');
  const closeBtn    = $('#lightbox-close');
  const prevBtn     = $('#lightbox-prev');
  const nextBtn     = $('#lightbox-next');

  if (!galleryGrid || !lightbox) return;

  // Collect all gallery items
  const items = $$('.gallery-item', galleryGrid);
  let currentIndex = 0;

  /**
   * Build lightbox content for a given index.
   * When you replace placeholders with real <img> tags, this function
   * will automatically pick up the src and alt from the first <img>
   * inside the .gallery-item, and display it inside the lightbox.
   */
  function openLightbox(index) {
    currentIndex = ((index % items.length) + items.length) % items.length;
    const item   = items[currentIndex];

    // Caption from the .gallery-caption element
    const caption = item.querySelector('.gallery-caption');
    lightboxCaption.textContent = caption ? caption.textContent.trim() : '';

    // Try to find a real image first; fall back to the placeholder div
    const img = item.querySelector('img');

    if (img) {
      // Real image path — clone the image for lightbox display
      lightboxContent.innerHTML = `
        <img
          src="${img.src}"
          alt="${img.alt}"
          style="max-width:80vw; max-height:70vh; border-radius:12px; display:block;"
        />
      `;
    } else {
      // Placeholder — clone the colour div
      const placeholder = item.querySelector('.gallery-placeholder');
      if (placeholder) {
        const clone = placeholder.cloneNode(true);
        lightboxContent.innerHTML = '';
        lightboxContent.appendChild(clone);
      }
    }

    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';   // prevent page scroll while open
    closeBtn.focus();                           // focus close button for accessibility
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    // Return focus to the item that opened the lightbox
    items[currentIndex].focus();
  }

  // Open lightbox when clicking a gallery item
  items.forEach((item, i) => {
    item.addEventListener('click', () => openLightbox(i));
  });

  // Navigation buttons
  prevBtn.addEventListener('click', () => openLightbox(currentIndex - 1));
  nextBtn.addEventListener('click', () => openLightbox(currentIndex + 1));
  closeBtn.addEventListener('click', closeLightbox);

  // Click outside the content to close
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  // Keyboard: Escape to close, arrows to navigate
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;

    switch (e.key) {
      case 'Escape':
        closeLightbox();
        break;
      case 'ArrowLeft':
        openLightbox(currentIndex - 1);
        break;
      case 'ArrowRight':
        openLightbox(currentIndex + 1);
        break;
    }
  });
}


/* =============================================
   6. TIMELINE DAY TABS
============================================== */
function initTimelineTabs() {
  const tabs      = $$('.tab-btn');
  const dayGroups = $$('.day-group');
  const section   = $('.timeline-section');
  if (!tabs.length || !dayGroups.length) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const selected = tab.dataset.tab;   // "all" | "day1" | "day2"

      // Update tab active states
      tabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      // Show / hide day panels
      dayGroups.forEach(group => {
        if (selected === 'all' || group.dataset.day === selected) {
          group.classList.remove('hidden');
        } else {
          group.classList.add('hidden');
        }
      });

      // Toggle day-label visibility:
      // show labels only in "All Celebrations" view
      if (section) {
        if (selected === 'all') {
          section.classList.remove('single-day');
        } else {
          section.classList.add('single-day');
        }
      }
    });
  });
}

/* =============================================
   7. CAPTURED MOMENTS CAROUSEL
============================================== */
function initMomentsCarousel() {
  const viewport = $('#moments-viewport');
  const previous = $('.moments-prev');
  const next = $('.moments-next');
  const cards = $$('.moment-card', viewport);
  const dots = $$('.moments-dots button');

  if (!viewport || !previous || !next || !cards.length || !dots.length) return;

  function cardStep() {
    return cards.length > 1
      ? cards[1].offsetLeft - cards[0].offsetLeft
      : cards[0].getBoundingClientRect().width;
  }

  function setActiveDot() {
    const activeIndex = Math.max(0, Math.min(cards.length - 1, Math.round(viewport.scrollLeft / cardStep())));
    dots.forEach((dot, index) => {
      const active = index === activeIndex;
      dot.classList.toggle('active', active);
      dot.setAttribute('aria-selected', String(active));
    });
  }

  function currentIndex() {
    return Math.max(0, Math.min(cards.length - 1, Math.round(viewport.scrollLeft / cardStep())));
  }

  function showCard(index) {
    // Keep automatic carousel movement inside its horizontal viewport.
    // scrollIntoView can also move the whole page vertically when a card is
    // partially off-screen, which pulled visitors back to this section.
    const cardLeft = cards[index].getBoundingClientRect().left;
    const viewportLeft = viewport.getBoundingClientRect().left;
    viewport.scrollTo({
      left: viewport.scrollLeft + cardLeft - viewportLeft,
      behavior: 'smooth'
    });
  }

  function showNextCard() {
    showCard((currentIndex() + 1) % cards.length);
  }

  let autoScrollTimer;

  function startAutoScroll() {
    window.clearInterval(autoScrollTimer);
    autoScrollTimer = window.setInterval(showNextCard, 5000);
  }

  function pauseAutoScroll() {
    window.clearInterval(autoScrollTimer);
  }

  previous.addEventListener('click', () => {
    showCard((currentIndex() - 1 + cards.length) % cards.length);
    startAutoScroll();
  });
  next.addEventListener('click', () => {
    showNextCard();
    startAutoScroll();
  });
  viewport.addEventListener('scroll', setActiveDot, { passive: true });
  viewport.addEventListener('mouseenter', pauseAutoScroll);
  viewport.addEventListener('mouseleave', startAutoScroll);
  viewport.addEventListener('focusin', pauseAutoScroll);
  viewport.addEventListener('focusout', startAutoScroll);

  dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
      showCard(index);
      startAutoScroll();
    });
  });

  startAutoScroll();
}


/* =============================================
   8. VENUE — COPY ADDRESS
============================================== */
function initVenueCopyAddress() {
  const btn = $('#copy-address-btn');
  if (!btn) return;

  const FULL_ADDRESS =
    'Seasons 24 Banquets, Hall No: 3, 4th Floor, Nagar Road, Wagholi, Pune, Maharashtra – 412207';

  btn.addEventListener('click', () => {
    navigator.clipboard.writeText(FULL_ADDRESS).then(() => {
      const original = btn.innerHTML;
      btn.innerHTML = '<i class="fa-solid fa-check"></i> Address Copied!';
      btn.style.borderColor = '#22c55e';
      btn.style.color = '#22c55e';
      setTimeout(() => {
        btn.innerHTML = original;
        btn.style.borderColor = '';
        btn.style.color = '';
      }, 2500);
    });
  });
}


/* =============================================
   INITIALISE ALL MODULES on DOMContentLoaded
============================================== */
document.addEventListener('DOMContentLoaded', () => {
  initStickyNav();
  initSmoothScroll();
  initScrollAnimations();
  initCountdown();
  initGallery();
  initTimelineTabs();
  initMomentsCarousel();
  initVenueCopyAddress();
});

/* =============================================
   Language variables loader
============================================== */
// Function to load the selected JSON file


// Helper function to safely read nested keys like "hero.blessing"
function getNestedValue(obj, path) {
  return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}

// Function to fetch JSON and update all data-i18n elements
async function setLanguage(lang) {
  try {
    const response = await fetch(`./lang/${lang}.json`);
    if (!response.ok) throw new Error(`Could not load lang/${lang}.json (${response.status})`);
    const translations = await response.json();

    // Update <html lang="..."> attribute (triggers correct CSS fonts)
    currentLanguage = lang;
    document.documentElement.lang = lang;
    localStorage.setItem('preferredLang', lang);

    // Translate all elements with data-i18n attributes
    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const value = getNestedValue(translations, key);
      if (typeof value === 'string') el.textContent = value;
    });

    // Apply the selected side after translations so language changes keep the
    // correct name order and video.
    updateSidePresentation(translations);

    // Update the main navigation switcher button text dynamically
    const langBtn = document.getElementById('language-switcher');
    if (langBtn) {
      langBtn.textContent = lang === 'hi' ? 'English' : 'हिंदी';
    }
    return true;
  } catch (err) {
    console.error(`Failed to load lang/${lang}.json translation file:`, err);
    return false;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('language-modal');
  const langBtn = document.getElementById('language-switcher');
  const pageContent = Array.from(document.body.children).filter((element) => element !== modal);
  const savedLanguage = localStorage.getItem('preferredLang');

  const showModal = () => {
    if (!modal) return;
    modal.hidden = false;
    document.body.classList.add('language-modal-open');
    pageContent.forEach((element) => { element.inert = true; });
  };

  const hideModal = () => {
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove('language-modal-open');
    pageContent.forEach((element) => { element.inert = false; });
  };

  setLanguage(savedLanguage === 'hi' ? 'hi' : 'en');
  if (savedLanguage === 'en' || savedLanguage === 'hi') hideModal();
  else showModal();

  modal?.querySelectorAll('[data-language-choice]').forEach((button) => {
    button.addEventListener('click', async () => {
      if (await setLanguage(button.dataset.languageChoice)) {
        hideModal();
        langBtn?.focus();
      }
    });
  });

  if (langBtn) {
    langBtn.addEventListener('click', async () => {
      const targetLang = currentLanguage === 'hi' ? 'en' : 'hi';
      await setLanguage(targetLang);
    });
  }
});

