(function () {
  'use strict';

  var cfg = window.ROCCO_CONFIG || {};
  var root = document.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Pantalla de carga ---------- */

  (function () {
    var loader = document.querySelector('[data-loader]');
    if (!loader) return;
    if (!root.classList.contains('is-loading')) {
      loader.remove();
      return;
    }

    var fill = loader.querySelector('[data-loader-fill]');
    var pct = loader.querySelector('[data-loader-pct]');
    var loaderLogo = loader.querySelector('.loader-logo');
    var heroLogo = document.querySelector('.hero-logo');

    // Tiempo mínimo en pantalla: más corto si ya se ha visto en esta visita.
    var seen = false;
    try {
      seen = sessionStorage.getItem('rocco-loader') === '1';
      sessionStorage.setItem('rocco-loader', '1');
    } catch (e) { /* sin almacenamiento: se usa el tiempo normal */ }
    var MIN_TIME = reduceMotion ? 400 : seen ? 900 : 1800;
    // Límite desde que empezó a cargar la página, pase lo que pase con la red.
    var MAX_TIME = 7500;

    function whenLoaded(img) {
      if (!img) return Promise.resolve();
      return new Promise(function (resolve) {
        if (img.complete) return resolve();
        img.addEventListener('load', resolve, { once: true });
        img.addEventListener('error', resolve, { once: true });
      }).then(function () {
        return img.decode ? img.decode().catch(function () {}) : null;
      });
    }

    var tasks = [
      document.fonts ? document.fonts.ready : Promise.resolve(),
      whenLoaded(document.querySelector('.hero-media')),
      whenLoaded(loaderLogo),
      new Promise(function (resolve) {
        if (document.readyState === 'complete') resolve();
        else window.addEventListener('load', resolve, { once: true });
      }),
    ];
    var done = 0;
    var allDone = false;
    tasks.forEach(function (task) { task.then(function () { done++; }); });
    Promise.all(tasks).then(function () { allDone = true; });

    var start = performance.now();
    var shown = 0;

    function frame(now) {
      if (!root.classList.contains('is-loading')) {
        loader.remove();
        return;
      }
      var t = now - start;
      var paced = Math.min(1, t / MIN_TIME);
      // La barra sigue lo que ya ha cargado, sin correr más que el tiempo mínimo
      // y avanzando poco a poco aunque la red vaya lenta.
      var target = Math.max(0.8 * (1 - Math.exp(-t / 1000)), Math.min(done / tasks.length, paced));
      if ((allDone && paced === 1) || now >= MAX_TIME) target = 1;

      shown += (target - shown) * 0.12;
      if (target === 1 && shown > 0.995) shown = 1;

      fill.style.transform = 'scaleX(' + shown.toFixed(4) + ')';
      pct.textContent = Math.round(shown * 100) + '%';

      if (shown < 1) requestAnimationFrame(frame);
      else setTimeout(leave, 200);
    }
    requestAnimationFrame(frame);

    function finish() {
      if (!loader.isConnected) return;
      if (heroLogo) heroLogo.style.visibility = '';
      root.classList.remove('is-loading', 'is-revealing');
      loader.remove();
    }

    // Se desvanece el fondo y el logo vuela hasta su sitio en la portada.
    function leave() {
      if (!root.classList.contains('is-loading')) return finish();
      root.classList.add('is-revealing');
      loader.classList.add('is-leaving');

      var to = heroLogo && heroLogo.getBoundingClientRect();
      var canFly = !reduceMotion && to && to.width > 0 && to.bottom > 0 && to.top < window.innerHeight;

      if (!canFly) {
        loader.style.transition = 'opacity .6s';
        loader.style.opacity = '0';
        setTimeout(finish, reduceMotion ? 50 : 650);
        return;
      }

      loaderLogo.style.animation = 'none';
      var from = loaderLogo.getBoundingClientRect();
      heroLogo.style.visibility = 'hidden';
      loaderLogo.style.transformOrigin = '0 0';
      loaderLogo.style.transition = 'transform .95s cubic-bezier(.7, 0, .2, 1)';
      loaderLogo.getBoundingClientRect();
      loaderLogo.style.transform =
        'translate(' + (to.left - from.left) + 'px, ' + (to.top - from.top) + 'px) ' +
        'scale(' + (to.width / from.width) + ')';
      loaderLogo.addEventListener('transitionend', finish, { once: true });
      setTimeout(finish, 1400);
    }
  })();

  /* ---------- Vídeo de fondo del hero ---------- */

  (function () {
    var video = document.querySelector('.hero-video');
    if (!video) return;
    // Con "reducir movimiento" o ahorro de datos se queda la imagen fija.
    var saveData = navigator.connection && navigator.connection.saveData;
    if (reduceMotion || saveData) return;

    var toggle = document.querySelector('.video-toggle');
    var portrait = window.matchMedia('(orientation: portrait)');
    var userPaused = false;
    var inView = true;

    video.muted = true;

    function play() {
      if (userPaused || !inView) return;
      var p = video.play();
      // Si el navegador no deja reproducir (p. ej. modo ahorro en iPhone), se queda la imagen.
      if (p && p.catch) p.catch(function () {});
    }

    function pickSource() {
      var src = portrait.matches ? video.dataset.srcPortrait : video.dataset.srcLandscape;
      if (video.getAttribute('src') === src) return;
      video.classList.remove('is-playing');
      video.src = src;
      play();
    }

    video.addEventListener('playing', function () {
      video.classList.add('is-playing');
      if (toggle) toggle.hidden = false;
    });

    if (toggle) {
      toggle.addEventListener('click', function () {
        userPaused = !userPaused;
        if (userPaused) video.pause();
        else play();
        toggle.classList.toggle('is-paused', userPaused);
        toggle.textContent = userPaused ? 'Reproducir vídeo' : 'Pausar vídeo';
      });
    }

    function start() {
      pickSource();
      portrait.addEventListener('change', pickSource);
      // Pausado mientras no se ve, para no gastar batería.
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          inView = entries[0].isIntersecting;
          if (inView) play();
          else video.pause();
        }).observe(video);
      }
    }

    // Empieza a cargar cuando ya está todo lo demás, para no alargar la pantalla de carga.
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
  })();

  /* ---------- Cabecera: fondo al hacer scroll ---------- */

  var header = document.querySelector('[data-header]');
  var hero = document.querySelector('.hero');

  if (header && hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      header.classList.toggle('is-scrolled', !entries[0].isIntersecting);
    }, { rootMargin: '-80px 0px 0px 0px' }).observe(hero);
  }

  /* ---------- Menú móvil ---------- */

  var menuBtn = document.querySelector('.menu-btn');
  var nav = document.getElementById('menu');

  function setMenu(open) {
    if (!header || !menuBtn) return;
    header.toggleAttribute('data-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.querySelector('.menu-btn-label').textContent = open ? 'Cerrar' : 'Menú';
    document.documentElement.style.overflow = open ? 'hidden' : '';
  }

  if (menuBtn && nav) {
    menuBtn.addEventListener('click', function () {
      setMenu(!header.hasAttribute('data-open'));
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && header.hasAttribute('data-open')) {
        setMenu(false);
        menuBtn.focus();
      }
    });
    window.matchMedia('(min-width: 761px)').addEventListener('change', function (mq) {
      if (mq.matches) setMenu(false);
    });
  }

  /* ---------- Año del pie ---------- */

  var year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Formulario de booking → Supabase ---------- */

  var form = document.getElementById('booking-form');
  if (!form) return;

  var statusEl = form.querySelector('.form-status');
  var submitBtn = form.querySelector('button[type="submit"]');
  var openedAt = Date.now();

  function setStatus(state, html) {
    statusEl.dataset.state = state;
    statusEl.innerHTML = html;
  }

  function fallbackHtml() {
    var email = cfg.email || 'djroccolive@gmail.com';
    return 'Escríbeme a <a href="mailto:' + email + '">' + email + '</a> o por Instagram: <a href="' +
      (cfg.instagram || 'https://www.instagram.com/djroccolive/') + '" target="_blank" rel="noopener">@djroccolive</a>.';
  }

  function clean(value) {
    var v = String(value || '').trim();
    return v === '' ? null : v;
  }

  function validate() {
    var ok = true;
    ['f-name', 'f-contact'].forEach(function (id) {
      var input = document.getElementById(id);
      var valid = input.value.trim().length >= Number(input.getAttribute('minlength') || 1);
      input.setAttribute('aria-invalid', String(!valid));
      if (!valid && ok) {
        input.focus();
        ok = false;
      }
    });
    return ok;
  }

  form.addEventListener('input', function (e) {
    if (e.target.getAttribute('aria-invalid') === 'true') e.target.removeAttribute('aria-invalid');
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!validate()) {
      setStatus('error', 'Falta tu nombre o una forma de contactarte (email o teléfono).');
      return;
    }

    var data = new FormData(form);

    // Antispam: campo trampa relleno o envío en menos de 3 segundos.
    if (data.get('website') || Date.now() - openedAt < 3000) {
      setStatus('ok', 'Solicitud enviada. Te contesto lo antes posible.');
      form.reset();
      return;
    }

    if (!cfg.supabaseUrl || !cfg.supabaseKey) {
      setStatus('error', 'El formulario todavía no está conectado. ' + fallbackHtml());
      return;
    }

    var payload = {
      name: clean(data.get('name')),
      contact: clean(data.get('contact')),
      event_type: clean(data.get('event_type')),
      event_date: clean(data.get('event_date')),
      location: clean(data.get('location')),
      message: clean(data.get('message')),
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Enviando…';
    setStatus('', '');

    fetch(cfg.supabaseUrl.replace(/\/$/, '') + '/rest/v1/' + (cfg.bookingTable || 'booking_requests'), {
      method: 'POST',
      headers: {
        apikey: cfg.supabaseKey,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify(payload),
    })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        setStatus('ok', 'Solicitud enviada. Te contesto lo antes posible.');
        form.reset();
      })
      .catch(function () {
        setStatus('error', 'No se ha podido enviar la solicitud. ' + fallbackHtml());
      })
      .finally(function () {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Enviar solicitud';
      });
  });
})();
