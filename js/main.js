(function () {
  'use strict';

  var cfg = window.ROCCO_CONFIG || {};

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

  /* ---------- Contactos opcionales (email / WhatsApp) ---------- */

  function showContact(kind, href, label) {
    var item = document.querySelector('[data-contact="' + kind + '"]');
    if (!item) return;
    item.querySelector('[data-contact-link]').href = href;
    item.querySelector('[data-contact-value]').textContent = label;
    item.hidden = false;
  }

  if (cfg.email) showContact('email', 'mailto:' + cfg.email, cfg.email);
  if (cfg.whatsapp) {
    var digits = String(cfg.whatsapp).replace(/\D/g, '');
    showContact('whatsapp', 'https://wa.me/' + digits, '+' + digits);
  }

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
    return 'Escríbeme por Instagram: <a href="' + (cfg.instagram || 'https://www.instagram.com/djroccolive/') +
      '" target="_blank" rel="noopener">@djroccolive</a>.';
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
