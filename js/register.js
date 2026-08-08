/* Public Register of the Republic of Fluid — shared behaviour.
   No dependencies. Nothing is loaded from outside the Republic. */
(function () {
  "use strict";

  var root = (function () {
    var l = document.querySelector('link[rel=stylesheet]');
    return l ? l.getAttribute('href').replace(/css\/register\.css$/, '') : '';
  })();

  /* ---------- Find an article: overlay search across all 340 ---------- */

  function buildFinder() {
    if (!window.FLUID) return null;
    var wrap = document.createElement('div');
    wrap.className = 'finderlay';
    wrap.hidden = true;
    wrap.innerHTML =
      '<div class="fl-box" role="dialog" aria-modal="true" aria-label="Find an article">' +
        '<input class="fl-in" type="search" autocomplete="off" ' +
          'placeholder="Article number, heading, or a few words">' +
        '<p class="fl-hint">Type a number to jump straight to it. Esc closes.</p>' +
        '<ul class="fl-res"></ul>' +
      '</div>';
    document.body.appendChild(wrap);

    var input = wrap.querySelector('.fl-in'),
        res = wrap.querySelector('.fl-res'),
        hint = wrap.querySelector('.fl-hint'),
        sel = -1, rows = [];

    function href(a) { return root + 'constitution/title-' + a[1] + '.html#a' + a[0]; }

    function esc(s) {
      return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function render(list) {
      rows = list;
      sel = list.length ? 0 : -1;
      res.innerHTML = list.map(function (a, i) {
        return '<li' + (i === 0 ? ' class="on"' : '') + '><a href="' + href(a) + '">' +
          '<span class="n">' + a[0] + '</span>' +
          '<span class="h">' + esc(a[2]) + '</span>' +
          '<span class="g">' + esc(a[3]) + '</span></a></li>';
      }).join('');
    }

    function search() {
      var v = input.value.trim().toLowerCase();
      if (!v) {
        res.innerHTML = ''; rows = []; sel = -1;
        hint.textContent = 'Type a number to jump straight to it. Esc closes.';
        return;
      }
      var exact = [], starts = [], words = [];
      window.FLUID.arts.forEach(function (a) {
        var num = String(a[0]);
        if (num === v) exact.push(a);
        else if (num.indexOf(v) === 0) starts.push(a);
        else if ((a[2] + ' ' + a[3]).toLowerCase().indexOf(v) > -1) words.push(a);
      });
      var list = exact.concat(starts, words).slice(0, 30);
      hint.textContent = list.length
        ? list.length + ' shown. Enter opens the first, arrows move.'
        : 'No article matches.';
      render(list);
    }

    function move(d) {
      var items = res.children;
      if (!items.length) return;
      if (sel > -1) items[sel].classList.remove('on');
      sel = (sel + d + items.length) % items.length;
      items[sel].classList.add('on');
      items[sel].scrollIntoView({ block: 'nearest' });
    }

    input.addEventListener('input', search);
    input.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowDown') { e.preventDefault(); move(1); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); move(-1); }
      else if (e.key === 'Enter' && sel > -1) {
        e.preventDefault();
        window.location.href = href(rows[sel]);
      }
    });
    wrap.addEventListener('click', function (e) { if (e.target === wrap) close(); });

    function open() {
      wrap.hidden = false;
      document.body.classList.add('noscroll');
      input.value = '';
      search();
      input.focus();
    }
    function close() {
      wrap.hidden = true;
      document.body.classList.remove('noscroll');
    }
    return { open: open, close: close, isOpen: function () { return !wrap.hidden; } };
  }

  var finder = buildFinder();
  var btn = document.getElementById('findbtn');
  if (btn && finder) btn.addEventListener('click', finder.open);

  document.addEventListener('keydown', function (e) {
    var tag = (e.target.tagName || '').toLowerCase();
    if (e.key === 'Escape' && finder && finder.isOpen()) { finder.close(); return; }
    if (tag === 'input' || tag === 'textarea' || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === '/') { e.preventDefault(); if (finder) finder.open(); }
  });

  /* ---------- article permalinks ---------- */

  Array.prototype.forEach.call(document.querySelectorAll('.article .self'), function (a) {
    a.title = 'Link to this article';
  });

  /* ---------- on this page ---------- */

  var arts = document.querySelectorAll('main .article');
  if (arts.length > 3) {
    var toc = document.createElement('nav');
    toc.className = 'onthispage';
    toc.setAttribute('aria-label', 'Articles on this page');
    toc.innerHTML = '<button class="otp-btn" type="button" aria-expanded="false">' +
      'On this page <span class="otp-c">' + arts.length + '</span></button>' +
      '<ol class="otp-list" hidden>' +
      Array.prototype.map.call(arts, function (s) {
        var h = s.querySelector('h3');
        return '<li><a href="#' + s.id + '"><b>' + s.querySelector('.num').textContent + '</b> ' +
          (h ? h.textContent : '') + '</a></li>';
      }).join('') + '</ol>';
    document.body.appendChild(toc);
    var ob = toc.querySelector('.otp-btn'), ol = toc.querySelector('.otp-list');
    ob.addEventListener('click', function () {
      var isOpen = ol.hidden;
      ol.hidden = !isOpen;
      ob.setAttribute('aria-expanded', String(isOpen));
    });
    ol.addEventListener('click', function (e) {
      if (e.target.closest('a')) { ol.hidden = true; ob.setAttribute('aria-expanded', 'false'); }
    });
  }
})();
