/* ==========================================================================
   Northlight Painting Co. — interactions
   Author: Rajdeep Sah
   --------------------------------------------------------------------------
   - Hero: pinned scene where a paint roller rises, then rolls down painting
     a ragged green stripe while the headline changes (scroll-driven).
   - Header state, mobile menu, active nav link
   - Scroll reveals, stat counters, testimonial band paint-in + carousel
   - Gallery lightbox
   - Quote form validation + submit
   No libraries, no build step.
   ========================================================================== */
(function () {
  'use strict';

  /* ---------- helpers ---------- */
  var $ = function (sel, ctx) { return (ctx || document).querySelector(sel); };
  var $$ = function (sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); };
  var clamp = function (v, a, b) { return Math.min(b === undefined ? 1 : b, Math.max(a === undefined ? 0 : a, v)); };
  var lerp = function (a, b, t) { return a + (b - a) * t; };
  var range = function (v, a, b) { return clamp((v - a) / (b - a)); }; // map v in [a,b] → [0,1]
  var easeInOutCubic = function (t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  var easeInOutSine = function (t) { return -(Math.cos(Math.PI * t) - 1) / 2; };
  var easeOutCubic = function (t) { return 1 - Math.pow(1 - t, 3); };

  var root = document.documentElement;
  var motionQuery = window.matchMedia ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false };
  var reduced = function () { return root.classList.contains('reduced-motion'); };

  /* Paint colours (keep in sync with --green in styles.css) */
  var PAINT_TOP = '#4b7643';
  var PAINT_MID = '#5b8c51';
  var PAINT_BOTTOM = '#71a364';

  /* ======================================================================
     HERO — paint roller scene
     ====================================================================== */
  var Hero = (function () {
    var hero = $('[data-hero]');
    if (!hero) return { update: function () {}, progress: function () { return 0; } };

    var sticky = $('.hero__sticky', hero);
    var paint = $('[data-paint]', hero);
    var paintInner = $('[data-paint-inner]', hero);
    var roller = $('[data-roller]', hero);
    var rollerBody = $('[data-roller-body]', hero);
    var nap = $('[data-roller-nap]', hero);
    var slides = $$('[data-slide]', hero);

    // Scroll timeline (fractions of the pinned scroll distance)
    var RISE = [0.03, 0.19];   // roller lifts to the top of the screen
    var ROLL = [0.23, 0.84];   // roller rolls down and paints
    // Each slide: [fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd]
    var SLIDE_TIMES = [
      [-1, -1, 0.05, 0.12],
      [0.12, 0.19, 0.40, 0.46],
      [0.46, 0.53, 0.66, 0.72],
      [0.75, 0.86, 9, 9]
    ];

    var W = 0, H = 0, coverW = 0, unit = 0, coverH = 0, rollerH = 0;
    var yRest = 0, yTop = 0, yEnd = 0, paintW = 0, paintPad = 24;
    var svgKey = '';
    var target = 0, current = 0, lastY = null, sway = 0, napShift = 0, lastTime = 0;
    var raf = 0;

    function buildPaintSVG(w, h) {
      // A vertical stripe with ragged dry-brush edges and faint roller streaks.
      var x = paintPad, sw = w - paintPad * 2;
      var svg =
        '<svg xmlns="http://www.w3.org/2000/svg" width="' + w + '" height="' + h + '" viewBox="0 0 ' + w + ' ' + h + '">' +
        '<defs>' +
        '<linearGradient id="g" x1="0" y1="0" x2="0" y2="1">' +
        '<stop offset="0" stop-color="' + PAINT_TOP + '"/><stop offset=".55" stop-color="' + PAINT_MID + '"/><stop offset="1" stop-color="' + PAINT_BOTTOM + '"/>' +
        '</linearGradient>' +
        '<linearGradient id="e" x1="0" y1="0" x2="1" y2="0">' +
        '<stop offset="0" stop-color="#000" stop-opacity=".2"/><stop offset=".1" stop-color="#000" stop-opacity="0"/>' +
        '<stop offset=".5" stop-color="#fff" stop-opacity=".05"/>' +
        '<stop offset=".9" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".2"/>' +
        '</linearGradient>' +
        '<filter id="r" x="-15%" y="-1%" width="130%" height="102%" color-interpolation-filters="sRGB">' +
        // coarse wobble of the edges
        '<feTurbulence type="fractalNoise" baseFrequency="0.035 0.006" numOctaves="3" seed="7" result="n1"/>' +
        '<feDisplacementMap in="SourceGraphic" in2="n1" scale="16" xChannelSelector="R" yChannelSelector="G" result="d1"/>' +
        // fine bristle raggedness
        '<feTurbulence type="fractalNoise" baseFrequency="0.55 0.045" numOctaves="2" seed="3" result="n2"/>' +
        '<feDisplacementMap in="d1" in2="n2" scale="9" xChannelSelector="R" yChannelSelector="G" result="shape"/>' +
        // vertical roller streaks
        '<feTurbulence type="fractalNoise" baseFrequency="0.16 0.004" numOctaves="3" seed="21" result="n3"/>' +
        '<feColorMatrix in="n3" type="luminanceToAlpha" result="la"/>' +
        '<feComponentTransfer in="la" result="la2"><feFuncA type="linear" slope="0.32" intercept="-0.1"/></feComponentTransfer>' +
        '<feComposite in="la2" in2="shape" operator="in" result="streaks"/>' +
        '<feMerge><feMergeNode in="shape"/><feMergeNode in="streaks"/></feMerge>' +
        '</filter>' +
        '</defs>' +
        '<g filter="url(#r)">' +
        '<rect x="' + x + '" y="-30" width="' + sw + '" height="' + (h + 60) + '" fill="url(#g)"/>' +
        '<rect x="' + x + '" y="-30" width="' + sw + '" height="' + (h + 60) + '" fill="url(#e)"/>' +
        '</g>' +
        '</svg>';
      return 'url("data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg) + '")';
    }

    function layout() {
      W = sticky.clientWidth;
      H = sticky.clientHeight;
      coverW = W < 700 ? clamp(W * 0.36, 118, 190) : clamp(W * 0.17, 160, 270);
      coverW = Math.round(coverW);
      unit = coverW / 100;           // roller SVG: the cover is 100 units wide
      coverH = 30 * unit;
      rollerH = 196 * unit;
      yRest = H * (W < 700 ? 0.58 : 0.53);   // cover centre while idle
      yTop = coverH / 2 + 2;                  // cover touching the top edge
      yEnd = H + coverH / 2 + 12;             // cover fully below the screen

      hero.style.setProperty('--cover-w', coverW + 'px');
      paint.style.setProperty('--cover-w', coverW + 'px');
      hero.style.setProperty('--rest-top', (yRest - coverH / 2) + 'px');

      // Regenerate the stripe only when its size really changes (mobile URL bars resize often).
      paintW = coverW + paintPad * 2;
      var paintH = Math.max(H, (window.screen && window.screen.height) || 0) + 80;
      var key = paintW + 'x' + Math.ceil(paintH / 200);
      if (key !== svgKey) {
        svgKey = key;
        paintInner.style.backgroundImage = buildPaintSVG(paintW, Math.ceil(paintH / 200) * 200);
        paintInner.style.backgroundSize = paintW + 'px auto';
        paintInner.style.backgroundPosition = 'top center';
        paintInner.classList.add('has-svg');
      }
    }

    function readScroll() {
      var rect = hero.getBoundingClientRect();
      var distance = hero.offsetHeight - H;
      target = distance > 0 ? clamp(-rect.top / distance) : 1;
    }

    function rollerY(p) {
      if (p <= RISE[1]) return lerp(yRest, yTop, easeInOutCubic(range(p, RISE[0], RISE[1])));
      if (p < ROLL[0]) return yTop;
      return lerp(yTop, yEnd, easeInOutSine(range(p, ROLL[0], ROLL[1])));
    }

    function render(p, dt) {
      var y = rollerY(p);
      var painting = p >= ROLL[0];
      var painted = painting ? clamp(y, 0, H) : 0;

      // Reveal the stripe from the top down to the roller (compositor-only transforms).
      var hidden = H - painted;
      paint.style.transform = 'translate3d(0,' + (-hidden) + 'px,0)';
      paintInner.style.transform = 'translate3d(0,' + hidden + 'px,0)';

      // Roller position, lift while rising, sway with speed, nap rolling.
      var velocity = lastY === null ? 0 : (y - lastY) / Math.max(dt, 1) * 16.7;
      lastY = y;
      var riseT = range(p, RISE[0], RISE[1]);
      var lift = p < ROLL[0] ? Math.sin(Math.PI * riseT) : 0;
      sway = lerp(sway, clamp(-velocity * 0.12, -2.4, 2.4), 0.12);
      roller.style.transform = 'translate3d(0,' + (y - 17 * unit) + 'px,0)';
      rollerBody.style.transform = 'rotate(' + sway.toFixed(3) + 'deg) scale(' + (1 + lift * 0.035).toFixed(4) + ')';
      if (painting && nap) {
        napShift = (napShift + velocity * 0.35) % 5;
        nap.setAttribute('patternTransform', 'translate(0 ' + napShift.toFixed(2) + ')');
      }

      // Headlines: crossfade with blur and a small vertical drift.
      for (var i = 0; i < slides.length; i++) {
        var t = SLIDE_TIMES[i] || [9, 9, 9, 9];
        var inT = t[0] < 0 ? 1 : range(p, t[0], t[1]);
        var outT = range(p, t[2], t[3]);
        var o = inT * (1 - outT);
        var s = slides[i];
        if (i === 0) {
          // Slide 0 is positioned from its bottom edge — no extra centring.
          s.style.transform = 'translate3d(0,' + (-outT * 40) + 'px,0)';
        } else {
          s.style.transform = 'translate3d(0,calc(-50% + ' + ((1 - inT) * 36 - outT * 36).toFixed(1) + 'px),0)';
        }
        s.style.opacity = o.toFixed(3);
        var blur = (1 - inT) * 10 + outT * 10;
        s.style.filter = blur > 0.05 ? 'blur(' + blur.toFixed(2) + 'px)' : 'none';
        s.style.visibility = o < 0.01 ? 'hidden' : 'visible';
      }

      // Hint for CSS / tests
      hero.style.setProperty('--progress', p.toFixed(4));
      hero.dataset.phase = p < RISE[0] ? 'idle' : p < ROLL[0] ? 'rise' : p < ROLL[1] ? 'paint' : 'done';
    }

    function tick(time) {
      raf = 0;
      var dt = lastTime ? Math.min(time - lastTime, 64) : 16.7;
      lastTime = time;
      // Frame-rate independent easing toward the scroll position
      var k = 1 - Math.pow(1 - 0.16, dt / 16.7);
      current += (target - current) * k;
      if (Math.abs(target - current) < 0.00015) current = target;
      render(current, dt);
      if (current !== target || Math.abs(sway) > 0.02) {
        raf = requestAnimationFrame(tick);
      } else {
        lastTime = 0;
      }
    }

    function kick() { if (!raf) raf = requestAnimationFrame(tick); }

    function update() {
      if (reduced()) return;
      readScroll();
      kick();
    }

    function resize() {
      if (reduced()) return;
      layout();
      readScroll();
      current = target;
      render(current, 16.7);
    }

    if (!reduced()) {
      layout();
      readScroll();
      current = target;
      render(current, 16.7);
    }

    return {
      update: update,
      resize: resize,
      progress: function () { return current; },
      get element() { return hero; }
    };
  })();

  /* ======================================================================
     HEADER — transparent over the hero, solid after it; mobile menu
     ====================================================================== */
  var header = $('[data-header]');
  var heroEl = $('[data-hero]');
  var menuToggle = $('[data-menu-toggle]');
  var mobileMenu = $('[data-mobile-menu]');

  function updateHeader() {
    if (!header) return;
    var over = false;
    if (heroEl) {
      var r = heroEl.getBoundingClientRect();
      over = r.bottom > header.offsetHeight + 1;
    }
    header.classList.toggle('is-over-hero', over);
  }

  function setMenu(open) {
    if (!header || !menuToggle) return;
    header.classList.toggle('menu-open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    $('.sr-only', menuToggle).textContent = open ? 'Close menu' : 'Open menu';
  }
  if (menuToggle) {
    menuToggle.addEventListener('click', function () {
      setMenu(!header.classList.contains('menu-open'));
    });
    $$('a', mobileMenu).forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    document.addEventListener('click', function (e) {
      if (header.classList.contains('menu-open') && !header.contains(e.target)) setMenu(false);
    });
  }

  // Active nav link
  var navLinks = $$('.nav__link');
  if ('IntersectionObserver' in window && navLinks.length) {
    var byId = {};
    navLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var link = byId[entry.target.id];
        if (!link) return;
        if (entry.isIntersecting) {
          navLinks.forEach(function (l) { l.classList.remove('is-active'); });
          link.classList.add('is-active');
        } else {
          link.classList.remove('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(byId).forEach(function (id) { var el = document.getElementById(id); if (el) navObserver.observe(el); });
  }

  /* ======================================================================
     REVEALS + COUNTERS
     ====================================================================== */
  var counters = $$('[data-count]');

  function runCounter(el) {
    if (el.dataset.counted) return;
    el.dataset.counted = '1';
    var end = parseFloat(el.dataset.count);
    var decimals = parseInt(el.dataset.decimals || '0', 10);
    if (reduced()) { el.textContent = end.toFixed(decimals); return; }
    var start = null, dur = 1600;
    function step(ts) {
      if (start === null) start = ts;
      var t = clamp((ts - start) / dur);
      el.textContent = (end * easeOutCubic(t)).toFixed(decimals);
      if (t < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var revealEls = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduced()) {
    counters.forEach(function (el) { el.textContent = (0).toFixed(parseInt(el.dataset.decimals || '0', 10)); });
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add('is-in');
        $$('[data-count]', el).forEach(function (c) {
          setTimeout(function () { runCounter(c); }, 250);
        });
        revealObserver.unobserve(el);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ======================================================================
     TESTIMONIALS — band paints in from the bottom; quote carousel
     ====================================================================== */
  var band = $('[data-testimonials]');

  function updateBand() {
    if (!band || reduced()) return;
    var r = band.getBoundingClientRect();
    var vh = window.innerHeight;
    // 0 when the band's top enters the bottom of the screen, 1 when it reaches 45% from the top
    var fill = clamp((vh - r.top) / (vh * 0.55));
    band.style.setProperty('--fill', fill.toFixed(4));
  }

  (function initQuotes() {
    var wrap = $('[data-quotes]');
    var dotsWrap = $('[data-quote-dots]');
    if (!wrap || !dotsWrap) return;
    var quotes = $$('.quote', wrap);
    if (quotes.length < 2) return;
    var index = 0, timer = null, paused = false;

    quotes.forEach(function (q, i) {
      q.id = q.id || 'quote-' + (i + 1);
      q.setAttribute('role', 'tabpanel');
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'quotes__dot';
      dot.setAttribute('role', 'tab');
      dot.setAttribute('aria-controls', q.id);
      dot.setAttribute('aria-label', 'Testimonial ' + (i + 1) + ' of ' + quotes.length);
      dot.addEventListener('click', function () { show(i, true); });
      dotsWrap.appendChild(dot);
    });
    var dots = $$('.quotes__dot', dotsWrap);

    function show(i, user) {
      index = (i + quotes.length) % quotes.length;
      quotes.forEach(function (q, n) {
        var on = n === index;
        q.classList.toggle('is-active', on);
        q.setAttribute('aria-hidden', String(!on));
      });
      dots.forEach(function (d, n) {
        d.setAttribute('aria-selected', String(n === index));
        d.tabIndex = n === index ? 0 : -1;
      });
      if (user) restart();
    }
    function restart() {
      clearInterval(timer);
      if (reduced()) return;
      timer = setInterval(function () { if (!paused && !document.hidden) show(index + 1); }, 7000);
    }
    dotsWrap.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        e.preventDefault();
        show(index + (e.key === 'ArrowRight' ? 1 : -1), true);
        dots[index].focus();
      }
    });
    band.addEventListener('mouseenter', function () { paused = true; });
    band.addEventListener('mouseleave', function () { paused = false; });
    band.addEventListener('focusin', function () { paused = true; });
    band.addEventListener('focusout', function () { paused = false; });
    show(0);
    restart();
  })();

  /* ======================================================================
     GALLERY LIGHTBOX
     ====================================================================== */
  (function initLightbox() {
    var box = $('[data-lightbox]');
    var buttons = $$('[data-gallery] .gallery__btn');
    if (!box || !buttons.length || typeof box.showModal !== 'function') return;
    var img = $('[data-lightbox-img]', box);
    var cap = $('[data-lightbox-caption]', box);
    var index = 0, opener = null;

    function load(i) {
      index = (i + buttons.length) % buttons.length;
      var b = buttons[index];
      var thumb = $('img', b);
      img.src = b.dataset.full;
      img.alt = thumb ? thumb.alt : '';
      cap.textContent = b.dataset.caption || '';
    }
    function open(i) {
      opener = document.activeElement;
      load(i);
      box.showModal();
      root.style.overflow = 'hidden';
    }
    function close() { if (box.open) box.close(); }

    buttons.forEach(function (b, i) { b.addEventListener('click', function () { open(i); }); });
    $('[data-lightbox-close]', box).addEventListener('click', close);
    $('[data-lightbox-prev]', box).addEventListener('click', function () { load(index - 1); });
    $('[data-lightbox-next]', box).addEventListener('click', function () { load(index + 1); });
    box.addEventListener('click', function (e) { if (e.target === box) close(); });
    box.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') load(index + 1);
      if (e.key === 'ArrowLeft') load(index - 1);
    });
    box.addEventListener('close', function () {
      root.style.overflow = '';
      if (opener && opener.focus) opener.focus();
    });
  })();

  /* ======================================================================
     QUOTE FORM — validation + submit
     ====================================================================== */
  (function initForm() {
    var form = $('[data-quote-form]');
    if (!form) return;
    var card = form.parentElement;
    var success = $('[data-form-success]', card);
    var status = $('[data-form-status]', form);
    var submit = $('[data-submit]', form);
    var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

    var rules = {
      name: function (v) { return v.trim().length >= 2 ? '' : 'Please tell us your name.'; },
      email: function (v) {
        if (!v.trim()) return 'We need an email to send your quote.';
        return EMAIL.test(v.trim()) ? '' : 'That email doesn’t look quite right.';
      },
      phone: function (v) {
        if (!v.trim()) return '';
        return v.replace(/\D/g, '').length >= 7 ? '' : 'Please enter a valid phone number (or leave it blank).';
      }
    };

    function setError(field, msg) {
      var input = form.elements[field];
      var wrap = input.closest('.field');
      var err = $('#' + input.id + '-error', form);
      wrap.classList.toggle('has-error', !!msg);
      input.setAttribute('aria-invalid', msg ? 'true' : 'false');
      if (msg) input.setAttribute('aria-describedby', err.id); else input.removeAttribute('aria-describedby');
      err.textContent = msg;
    }

    function validate() {
      var firstBad = null;
      Object.keys(rules).forEach(function (name) {
        var msg = rules[name](form.elements[name].value);
        setError(name, msg);
        if (msg && !firstBad) firstBad = form.elements[name];
      });
      return firstBad;
    }

    // Re-check a field as soon as the visitor fixes it
    Object.keys(rules).forEach(function (name) {
      var input = form.elements[name];
      input.addEventListener('input', function () {
        if (input.closest('.field').classList.contains('has-error')) setError(name, rules[name](input.value));
      });
      input.addEventListener('blur', function () {
        if (input.value) setError(name, rules[name](input.value));
      });
    });

    function done() {
      var first = form.elements.name.value.trim().split(/\s+/)[0];
      $('[data-success-name]', success).textContent = first ? ', ' + first : '';
      form.hidden = true;
      success.hidden = false;
      success.focus({ preventScroll: true });
    }

    function setLoading(on) {
      submit.disabled = on;
      submit.classList.toggle('is-loading', on);
      $('.btn__label', submit).textContent = on ? 'Sending' : 'Request my estimate';
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      status.textContent = '';
      var bad = validate();
      if (bad) { bad.focus(); return; }
      if (form.elements.company && form.elements.company.value) { done(); return; } // bot

      var endpoint = form.dataset.endpoint;
      setLoading(true);
      if (!endpoint) {
        // Demo mode: no endpoint configured yet (see README → Quote form).
        setTimeout(function () { setLoading(false); done(); }, 900);
        return;
      }
      fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (res) {
          setLoading(false);
          if (!res.ok) throw new Error('Request failed');
          done();
        })
        .catch(function () {
          setLoading(false);
          status.textContent = 'Sorry — that didn’t send. Please try again or call us at (402) 555-0148.';
        });
    });

    $('[data-form-reset]', card).addEventListener('click', function () {
      form.reset();
      Object.keys(rules).forEach(function (n) { setError(n, ''); });
      success.hidden = true;
      form.hidden = false;
      form.elements.name.focus();
    });
  })();

  /* ======================================================================
     GLOBAL LISTENERS
     ====================================================================== */
  var ticking = false;
  function onScroll() {
    Hero.update();
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      updateHeader();
      updateBand();
    });
  }

  var resizeTimer = 0;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () {
      if (Hero.resize) Hero.resize();
      updateHeader();
      updateBand();
    }, 120);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onResize);
  window.addEventListener('orientationchange', onResize);

  // React if the visitor toggles "reduce motion" while the page is open
  if (motionQuery.addEventListener) {
    motionQuery.addEventListener('change', function () { window.location.reload(); });
  }

  var year = $('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  updateHeader();
  updateBand();

  // Start the intro animation once fonts are ready (avoids a jump in the headline)
  function start() { root.classList.add('is-loaded'); }
  if (document.fonts && document.fonts.ready) {
    var started = false;
    var go = function () { if (!started) { started = true; start(); } };
    document.fonts.ready.then(go);
    setTimeout(go, 1200);
  } else {
    start();
  }
})();
