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
let activeTranslations = null;
let refreshMusicPlayerLanguage = null;
const isKhushiSide = new URLSearchParams(window.location.search).get('side') === 'khushi';

function setHeroImage() {
  const image = document.getElementById('hero-background-image');
  if (!image) return;

  const prefix = isKhushiSide ? 'hero-bride' : 'hero-groom';
  const candidates = [640, 1280, 1980]
    .map((width) => `./assets/optimized/${prefix}-${width}.webp ${width}w`)
    .join(', ');
  image.sizes = '100vw';
  image.srcset = candidates;
  image.src = `./assets/optimized/${prefix}-1980.webp`;
}

// The HTML leaves the hero image URL unset so only the requested side is fetched.
setHeroImage();

function updateSidePresentation(translations) {
  const coupleNames = document.getElementById('couple-names');
  const namesKey = isKhushiSide ? 'hero.namesCoupleKhushi' : 'hero.namesCouple';
  const names = getNestedValue(translations, namesKey);
  if (coupleNames && typeof names === 'string') coupleNames.textContent = names;
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
// Staged wedding countdown. URL test values: ?countdownTest=stage1, stage2,
// stage3, stage4start, stage4complete, or stage5. Remove the query to use real time.
function initCountdown() {
  const originalCountdownTarget = new Date('2026-12-05T09:30:00+05:30');
  const start = new Date('2026-12-05T14:00:00+05:30');
  const celebration = new Date('2026-12-04T00:00:00+05:30');
  const dayTwo = new Date('2026-12-05T00:00:00+05:30');
  const end = new Date('2026-12-05T18:00:00+05:30');
  const nextDay = new Date('2026-12-06T00:00:00+05:30');
  const testDates = {
    stage1: '2026-12-03T12:00:00+05:30', stage2: '2026-12-04T12:00:00+05:30',
    stage3: '2026-12-05T13:00:00+05:30', stage4start: '2026-12-05T15:00:00+05:30',
    stage4complete: '2026-12-05T19:00:00+05:30', stage5: '2026-12-06T12:00:00+05:30'
  };
  const test = new URLSearchParams(location.search).get('countdownTest');
  const message = $('#countdown-stage-message');
  const defaultTitle = $('.hcb-title');
  const defaultSubtitle = $('.hcb-subtitle');
  const stage2Kicker = $('#countdown-stage2-kicker');
  const stage2Title = $('#countdown-stage2-title');
  const stage2Subtitle = $('#countdown-stage2-subtitle');
  const stage2Description = $('#countdown-stage2-description');
  const stage3Kicker = $('#countdown-stage3-kicker');
  const stage3Title = $('#countdown-stage3-title');
  const stage3Subtitle = $('#countdown-stage3-subtitle');
  const stage3Description = $('#countdown-stage3-description');
  const completeKicker = $('#countdown-complete-kicker');
  const completeTitle = $('#countdown-complete-title');
  const completeSubtitle = $('#countdown-complete-subtitle');
  const completeDescription = $('#countdown-complete-description');
  const stage5Kicker = $('#countdown-stage5-kicker');
  const stage5Title = $('#countdown-stage5-title');
  const stage5Subtitle = $('#countdown-stage5-subtitle');
  const stage5Description = $('#countdown-stage5-description');
  const timer = $('#hero-countdown');
  const stage2TimerCaption = $('#countdown-stage2-timer-caption');
  const stage3TimerCaption = $('#countdown-stage3-timer-caption');
  const married = $('#hcb-married-card');
  const nav = ['nav-cd-days', 'nav-cd-hrs', 'nav-cd-mins', 'nav-cd-secs'].map(id => document.getElementById(id));
  const banner = ['cbt-days', 'cbt-hours', 'cbt-mins', 'cbt-secs'].map(id => document.getElementById(id));
  const hero = ['cd-days', 'cd-hours', 'cd-mins', 'cd-secs'].map(id => document.getElementById(id));
  const heroText = (key, fallback) => {
    const value = activeTranslations && activeTranslations.hero && activeTranslations.hero[key];
    return typeof value === 'string' ? value : fallback;
  };
  const pad = value => String(value).padStart(2, '0');
  const update = () => {
    // Test dates are opt-in; all normal and unrecognized URLs use the live clock.
    const isTestMode = Object.prototype.hasOwnProperty.call(testDates, test);
    const now = isTestMode ? new Date(testDates[test]) : new Date();
    let stage = now < celebration ? 1 : now < dayTwo ? 2 : now < start ? 3 : now < end ? 4 : now < nextDay ? 'completed' : 5;
    const labels = {
      3: 'The auspicious moment is near! Our forever begins today.',
      4: 'Hastamelap started',
      completed: 'Hastamelap completed — We’re married!',
      5: 'Our forever has begun — a new chapter, a lifetime of love.'
    };
    const isStage2 = stage === 2;
    const isStage3 = stage === 3;
    const isStarted = stage === 4;
    const isComplete = stage === 'completed';
    const isStage5 = stage === 5;
    const isMessageStage = isStage2 || isStage3 || isStarted || isComplete || isStage5;
    if (defaultTitle) defaultTitle.hidden = isMessageStage;
    if (defaultSubtitle) defaultSubtitle.hidden = isMessageStage;
    if (stage2Kicker) { stage2Kicker.hidden = !isStage2; stage2Kicker.textContent = heroText('stage2Kicker', 'Day 1 celebrations in progress'); }
    if (stage2Title) { stage2Title.hidden = !isStage2; stage2Title.textContent = heroText('stage2Title', 'The celebrations have begun!'); }
    if (stage2Subtitle) { stage2Subtitle.hidden = !isStage2; stage2Subtitle.textContent = heroText('stage2Subtitle', 'A beautiful beginning to our forever.'); }
    if (stage2Description) {
      stage2Description.hidden = !isStage2;
      stage2Description.textContent = heroText('stage2Description', 'The festivities are here, hearts are full, and beautiful memories are being made. Tomorrow, we unite in the sacred Hastamelap ceremony as we begin our forever together.');
    }
    if (stage3Kicker) { stage3Kicker.hidden = !isStage3; stage3Kicker.textContent = heroText('stage3Kicker', 'Sacred wedding day · 5 December 2026'); }
    if (stage3Title) { stage3Title.hidden = !isStage3; stage3Title.textContent = heroText('stage3Title', 'The auspicious moment is near!'); }
    if (stage3Subtitle) { stage3Subtitle.hidden = !isStage3; stage3Subtitle.textContent = heroText('stage3Subtitle', 'Our forever begins today'); }
    if (stage3Description) {
      stage3Description.hidden = !isStage3;
      stage3Description.textContent = heroText('stage3Description', 'Two hearts, two families, and one beautiful journey. The wait is almost over as we prepare to unite in the sacred Hastamelap ceremony.');
    }
    if (completeKicker) {
      completeKicker.hidden = !isStarted && !isComplete;
      completeKicker.textContent = isStarted
        ? heroText('stage4StartedKicker', 'Shubha Vivaha · Hastamelap started')
        : heroText('stage4CompleteKicker', 'Shubha Vivaha · Hastamelap complete');
    }
    if (completeTitle) {
      completeTitle.hidden = !isStarted && !isComplete;
      completeTitle.textContent = isStarted
        ? heroText('stage4StartedTitle', 'We’re getting married!')
        : heroText('stage4CompleteTitle', 'We’re married!');
    }
    if (completeSubtitle) { completeSubtitle.hidden = !isStarted && !isComplete; completeSubtitle.textContent = heroText('stage4Subtitle', 'Today, two hearts become one'); }
    if (completeDescription) {
      completeDescription.hidden = !isStarted && !isComplete;
      completeDescription.textContent = heroText('stage4Description', 'Our forever has officially begun. With hearts full of love and gratitude, we begin this beautiful new chapter together. Thank you for being part of our journey and showering us with your love and blessings.');
    }
    if (stage5Kicker) { stage5Kicker.hidden = !isStage5; stage5Kicker.textContent = heroText('stage5Kicker', 'Gratitude & forever memories'); }
    if (stage5Title) { stage5Title.hidden = !isStage5; stage5Title.textContent = heroText('stage5Title', 'Our forever has begun'); }
    if (stage5Subtitle) { stage5Subtitle.hidden = !isStage5; stage5Subtitle.textContent = heroText('stage5Subtitle', 'A new chapter, a lifetime of love'); }
    if (stage5Description) {
      stage5Description.hidden = !isStage5;
      stage5Description.textContent = heroText('stage5Description', 'The celebrations may be over, but our story is only just beginning. Thank you for being part of our special journey. Your love, blessings, and good wishes will always hold a special place in our hearts.');
    }
    if (timer) timer.classList.toggle('hcb-stage2-timer', isMessageStage);
    const messageIsCentered = isStarted;
    const leftContent = $('.hcb-left');
    if (leftContent) leftContent.classList.toggle('hcb-started-message', messageIsCentered);
    if (stage2TimerCaption) { stage2TimerCaption.hidden = !isStage2; stage2TimerCaption.textContent = heroText('stage2TimerCaption', 'Hastamelap countdown'); }
    if (stage3TimerCaption) { stage3TimerCaption.hidden = !isStage3; stage3TimerCaption.textContent = heroText('stage3TimerCaption', 'Counting down to 2:00 PM Muhurat'); }
    if (message) { message.hidden = stage === 1 || isMessageStage; message.textContent = labels[stage] || ''; }
    if (timer) timer.hidden = stage === 4 || stage === 'completed' || stage === 5;
    if (married) married.hidden = stage !== 'completed' && stage !== 5;

    const target = stage === 1 ? originalCountdownTarget : start;
    const diff = Math.max(0, target - now);
    const values = [Math.floor(diff / 86400000), pad(Math.floor(diff / 3600000) % 24), pad(Math.floor(diff / 60000) % 60), pad(Math.floor(diff / 1000) % 60)];
    [hero, banner, nav].forEach(group => group.forEach((el, i) => { if (el) el.textContent = values[i]; }));
  };
  update();
  setInterval(update, 1000);
}


/* =============================================
   WEDDING MUSIC PLAYER
============================================== */
function initMusicPlayer() {
  // Keep this path relative so the player works from the project root.
  const MUSIC_AUDIO_SOURCE = './assets/audio/Kudmayi.mp3';
  const MUSIC_VOLUME = 0.5; // Set between 0 (silent) and 1 (full volume).
  const audio = $('#wedding-audio');
  const button = $('#music-toggle');
  const tooltip = $('#music-tooltip');
  const status = $('#music-status');
  if (!audio || !button) return;

  // The player needs the source assigned before play() can load the track.
  audio.src = MUSIC_AUDIO_SOURCE;
  audio.volume = MUSIC_VOLUME;

  let hintKey = null;
  let statusKey = 'paused';
  let resumeOnReturn = false;
  let manuallyPaused = false;
  const text = (key, fallback) => {
    const value = activeTranslations && activeTranslations.music && activeTranslations.music[key];
    return typeof value === 'string' ? value : fallback;
  };

  function render() {
    const playing = !audio.paused && !audio.ended;
    button.classList.toggle('is-playing', playing);
    button.classList.toggle('is-muted', audio.volume === 0);
    button.classList.toggle('needs-activation', Boolean(hintKey));
    button.setAttribute('aria-pressed', String(playing));
    button.setAttribute('aria-label', playing
      ? text('pauseLabel', 'Pause wedding music')
      : text('playLabel', 'Play wedding music'));
    if (tooltip) {
      tooltip.hidden = !hintKey;
      tooltip.textContent = hintKey === 'unavailable'
        ? text('unavailable', 'The wedding music file is not available yet.')
        : text('tapPrompt', 'Tap the music button to enable wedding music.');
    }
    if (status) {
      status.textContent = hintKey
        ? (hintKey === 'unavailable'
          ? text('unavailable', 'The wedding music file is not available yet.')
          : text('tapPrompt', 'Tap the music button to enable wedding music.'))
        : playing
          ? text('playing', 'Wedding music is playing.')
          : text(statusKey, 'Wedding music is paused.');
    }
  }

  async function tryPlay() {
    if (document.hidden) return;
    if (!MUSIC_AUDIO_SOURCE) {
      hintKey = 'unavailable';
      render();
      return;
    }
    try {
      await audio.play();
      hintKey = null;
      statusKey = 'playing';
      render();
    } catch (error) {
      hintKey = error && error.name === 'NotAllowedError' ? 'tapPrompt' : 'unavailable';
      render();
    }
  }

  button.addEventListener('click', () => {
    if (!audio.paused && !audio.ended) {
      manuallyPaused = true;
      resumeOnReturn = false;
      audio.pause();
      hintKey = null;
      statusKey = 'paused';
      render();
    } else {
      manuallyPaused = false;
      void tryPlay();
    }
  });
  function pausePlayback() {
    if (!audio.paused) audio.pause();
    hintKey = null;
    statusKey = 'paused';
    render();
  }
  function pauseForPageHide() {
    if (!audio.paused && !audio.ended && !manuallyPaused) resumeOnReturn = true;
    pausePlayback();
  }
  function resumeIfNeeded() {
    if (!document.hidden && resumeOnReturn && !manuallyPaused) {
      resumeOnReturn = false;
      void tryPlay();
    }
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pauseForPageHide();
    else resumeIfNeeded();
  });
  window.addEventListener('pagehide', pauseForPageHide);
  window.addEventListener('pageshow', resumeIfNeeded);
  audio.addEventListener('play', () => {
    if (document.hidden) {
      if (!manuallyPaused) resumeOnReturn = true;
      audio.pause();
      return;
    }
    manuallyPaused = false;
    hintKey = null;
    statusKey = 'playing';
    render();
  });
  audio.addEventListener('pause', () => {
    if (document.hidden && !manuallyPaused && statusKey === 'playing') resumeOnReturn = true;
    render();
  });
  audio.addEventListener('error', () => { hintKey = 'unavailable'; render(); });
  refreshMusicPlayerLanguage = render;

  // Try audible autoplay on every visit. Browsers that block it leave the button highlighted.
  void tryPlay();
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
  // This carousel is optional on pages/variants that do not include it.
  // Guard before using viewport as the context for querySelectorAll.
  if (!viewport) return;

  const previous = $('.moments-prev');
  const next = $('.moments-next');
  const cards = $$('.moment-card', viewport);
  const dots = $$('.moments-dots button');

  if (!previous || !next || !cards.length || !dots.length) return;

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
  initMusicPlayer();
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
    activeTranslations = translations;

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
    refreshMusicPlayerLanguage?.();

    // Apply the selected side after translations so language changes keep the
    // correct name order and invitation image.
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

