/* JS vanilla, sem dependências. */
(function () {
  'use strict';
  var doc = document.documentElement;
  doc.classList.add('js');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* tema */
  var btn = document.querySelector('.theme');
  if (btn) btn.addEventListener('click', function () {
    var next = doc.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    doc.setAttribute('data-theme', next);
    try { localStorage.setItem('tema', next); } catch (e) {}
  });

  /* header */
  var header = document.querySelector('.site-header');
  function onScroll() { header.classList.toggle('scrolled', scrollY > 8); }
  addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* voltar ao topo */
  var top = document.querySelector('.totop');
  if (top) {
    top.addEventListener('click', function () { scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
    addEventListener('scroll', function () { top.hidden = scrollY < 600; }, { passive: true });
  }

  /* reveal */
  var els = document.querySelectorAll('.rv');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    els.forEach(function (el) { io.observe(el); });
  } else { els.forEach(function (el) { el.classList.add('in'); }); }

  /* contador */
  document.querySelectorAll('[data-count]').forEach(function (el) {
    var to = +el.getAttribute('data-count'), suf = el.getAttribute('data-suf') || '';
    if (reduce) { el.textContent = to + suf; return; }
    var t0 = null;
    (function step(t) {
      if (!t0) t0 = t;
      var p = Math.min((t - t0) / 1200, 1);
      el.textContent = Math.round(to * (1 - Math.pow(1 - p, 3))) + suf;
      if (p < 1) requestAnimationFrame(step);
    })(performance.now());
  });

  /* filtro de projetos */
  var chips = document.querySelectorAll('.chip'), cards = document.querySelectorAll('.card[data-cat]');
  chips.forEach(function (c) {
    c.addEventListener('click', function () {
      var f = c.getAttribute('data-f');
      chips.forEach(function (x) { x.setAttribute('aria-pressed', String(x === c)); });
      cards.forEach(function (card) { card.hidden = !(f === 'todos' || card.getAttribute('data-cat') === f); });
    });
  });

  /* terminal digitando */
  var term = document.getElementById('term');
  if (term) {
    var lines = JSON.parse(term.getAttribute('data-lines')), out = '', i = 0;
    var caret = '<span class="caret"></span>';
    if (reduce) { term.innerHTML = lines.join('\n').replace(/\n/g, '<br>'); }
    else (function type() {
      if (i >= lines.length) { term.innerHTML = out + caret; return; }
      var line = lines[i], n = 0;
      (function ch() {
        n += 2;
        term.innerHTML = out + line.slice(0, n) + caret;
        if (n < line.length) setTimeout(ch, 14);
        else { out += line + '<br>'; i++; setTimeout(type, 260); }
      })();
    })();
  }
})();
