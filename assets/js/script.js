// assets/js/script.js

document.addEventListener('DOMContentLoaded', function () {
    initCurrentYear();
    initPreloader();
    initHeroSlideshow();
    const photos = initPhotosArray();
    window.__photos = photos; // expose for debugging if needed
    initScrollReveal();
    initLightbox(photos);
    initNavSticky();
    initNavToggle();
    initRightClickProtection();
    initForm();
});

// Set current year in footer
function initCurrentYear() {
    const yearEl = document.getElementById('current-year');
    if (yearEl) {
        yearEl.textContent = new Date().getFullYear();
    }
}

// Preloader: show for ~1–2 seconds, then hide
function initPreloader() {
    const preloader = document.getElementById('preloader');
    if (!preloader) return;

    let done = false;
    const MIN_TIME = 900;
    const start = Date.now();

    function hidePreloader() {
        if (done) return;
        done = true;
        const elapsed = Date.now() - start;
        const delay = Math.max(MIN_TIME - elapsed, 0);

        setTimeout(function () {
            preloader.classList.add('hidden');
        }, delay);
    }

    window.addEventListener('load', hidePreloader);
    // Fallback: ensure it disappears even if load never fires
    setTimeout(hidePreloader, 2000);
}

// Hero background slideshow
function initHeroSlideshow() {
    const slides = document.querySelectorAll('.hero-slide');
    if (!slides.length) return;

    slides.forEach(function (slide) {
        const bg = slide.getAttribute('data-bg');
        if (bg) {
            slide.style.backgroundImage = "url('" + bg + "')";
        }
    });

    let current = 0;
    const delay = 8000;

    function showSlide(index) {
        slides.forEach(function (slide, i) {
            slide.classList.toggle('active', i === index);
        });
    }

    showSlide(current);

    setInterval(function () {
        current = (current + 1) % slides.length;
        showSlide(current);
    }, delay);
}

// Build a photos array from existing gallery DOM
function initPhotosArray() {
    const storyFigures = document.querySelectorAll('.stories-section .story-card figure');
    const photos = [];

    storyFigures.forEach(function (figure, index) {
        const img = figure.querySelector('img');
        const titleEl = figure.querySelector('.story-title');
        const metaEl = figure.querySelector('.story-meta');

        if (!img) return;

        const photo = {
            src: img.getAttribute('src'),
            alt: img.getAttribute('alt') || '',
            title: titleEl ? titleEl.textContent.trim() : '',
            meta: metaEl ? metaEl.textContent.trim() : ''
        };

        img.dataset.index = String(index);
        figure.setAttribute('tabindex', '0');
        photos.push(photo);
    });

    return photos;
}

// Scroll-based reveal animations
function initScrollReveal() {
    const revealEls = document.querySelectorAll('.reveal, .story-card');
    if (!revealEls.length) return;

    if (!('IntersectionObserver' in window)) {
        revealEls.forEach(function (el) {
            el.classList.add('in-view');
        });
        return;
    }

    const observer = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                obs.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.18,
        rootMargin: '0px 0px -10% 0px'
    });

    revealEls.forEach(function (el) {
        observer.observe(el);
    });
}

// Lightbox for gallery images
function initLightbox(photos) {
    const lightbox = document.getElementById('lightbox');
    if (!lightbox || !photos || !photos.length) return;

    const imgEl = lightbox.querySelector('.lightbox-figure img');
    const titleEl = lightbox.querySelector('.lightbox-title');
    const metaEl = lightbox.querySelector('.lightbox-meta');
    const closeBtn = lightbox.querySelector('.lightbox-close');
    const prevBtn = lightbox.querySelector('.lightbox-prev');
    const nextBtn = lightbox.querySelector('.lightbox-next');
    const backdrop = lightbox.querySelector('.lightbox-backdrop');
    const storyFigures = document.querySelectorAll('.stories-section .story-card figure');
    const body = document.body;

    let currentIndex = 0;

    function updateLightbox(index) {
        const photo = photos[index];
        if (!photo) return;

        imgEl.src = photo.src;
        imgEl.alt = photo.alt;
        titleEl.textContent = photo.title || '';
        metaEl.textContent = photo.meta || '';
    }

    function openLightbox(index) {
        currentIndex = index;
        updateLightbox(currentIndex);
        lightbox.classList.add('open');
        body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('open');
        body.style.overflow = '';
    }

    function showNext(delta) {
        const len = photos.length;
        currentIndex = (currentIndex + delta + len) % len;
        updateLightbox(currentIndex);
    }

    storyFigures.forEach(function (figure, index) {
        figure.style.cursor = 'zoom-in';

        figure.addEventListener('click', function () {
            openLightbox(index);
        });

        figure.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(index);
            }
        });
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', closeLightbox);
    }

    if (backdrop) {
        backdrop.addEventListener('click', closeLightbox);
    }

    if (prevBtn) {
        prevBtn.addEventListener('click', function () {
            showNext(-1);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', function () {
            showNext(1);
        });
    }

    document.addEventListener('keydown', function (e) {
        if (!lightbox.classList.contains('open')) return;

        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowRight') {
            showNext(1);
        } else if (e.key === 'ArrowLeft') {
            showNext(-1);
        }
    });
}

// Sticky navigation header
function initNavSticky() {
    const header = document.getElementById('site-header');
    if (!header) return;

    function onScroll() {
        const y = window.scrollY || window.pageYOffset;
        if (y > 24) {
            header.classList.add('sticky');
        } else {
            header.classList.remove('sticky');
        }
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
}

// Mobile nav toggle
function initNavToggle() {
    const toggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (!toggle || !navLinks) return;

    toggle.addEventListener('click', function () {
        const expanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!expanded));
    });

    navLinks.addEventListener('click', function (e) {
        if (e.target.matches('a')) {
            toggle.setAttribute('aria-expanded', 'false');
        }
    });
}

// Disable right-click on images with toast message
function initRightClickProtection() {
    const msgEl = document.getElementById('image-protect-message');
    let timeoutId;

    function showToast() {
        if (!msgEl) return;
        msgEl.classList.add('visible');
        clearTimeout(timeoutId);
        timeoutId = setTimeout(function () {
            msgEl.classList.remove('visible');
        }, 2200);
    }

    document.addEventListener('contextmenu', function (event) {
        const target = event.target;
        if (target && target.tagName && target.tagName.toLowerCase() === 'img') {
            event.preventDefault();
            console.info("Please don’t use images without permission.");
            showToast();
        }
    });
}

// Simulated contact form submission
function initForm() {
    const form = document.getElementById('contact-form');
    if (!form) return;

    const statusEl = form.querySelector('.form-status');

    form.addEventListener('submit', function (e) {
        e.preventDefault();

        const formData = new FormData(form);
        const name = String(formData.get('name') || '').trim();
        const email = String(formData.get('email') || '').trim();
        const message = String(formData.get('message') || '').trim();

        if (!name || !email || !message) {
            if (statusEl) {
                statusEl.textContent = 'Please fill in the required fields.';
                statusEl.style.color = 'var(--danger)';
            }
            return;
        }

        if (statusEl) {
            statusEl.textContent = 'Sending (simulated)...';
            statusEl.style.color = '';
        }

        setTimeout(function () {
            if (statusEl) {
                statusEl.textContent = 'Message sent. I’ll get back to you soon (simulation).';
                statusEl.style.color = 'var(--accent-strong)';
            }
            form.reset();
        }, 800);
    });
}