/* Public Register of the Republic of Fluid - shared behaviour.
   No dependencies. Nothing is loaded from outside the Republic. */
(function () {
  "use strict";

  const root = (() => {
    const pathname = window.location.pathname;
    return pathname.substring(0, pathname.lastIndexOf('/') + 1);
  })();

  /* ---------- Search: overlay over the constitution, summary and history ---------- */

  function buildFinder() {
    var S = window.FluidSearch;
    if (!S) return null;
    var wrap = document.createElement('div');
    wrap.className = 'finderlay';
    wrap.hidden = true;
    wrap.innerHTML =
      '<div class="fl-box" role="dialog" aria-modal="true" aria-label="Search the register">' +
        '<input class="fl-in" type="search" autocomplete="off" spellcheck="false" ' +
          'placeholder="A word, a phrase in quotes, or an article number">' +
        '<p class="fl-hint">Enter opens the full results or selected result. A number opens that article. Esc closes.</p>' +
        '<ul class="fl-res"></ul>' +
      '</div>';
    document.body.appendChild(wrap);

    var input = wrap.querySelector('.fl-in'),
        res = wrap.querySelector('.fl-res'),
        hint = wrap.querySelector('.fl-hint'),
        sel = -1, rows = [], jump = null;

    var LABEL = {};
    S.docs.forEach(function (d) { LABEL[d.key] = d.label; });
    var LIMIT = 12;

    function full() {
      try { sessionStorage.setItem(S.key, input.value); } catch (e) {}
      window.location.href = root + 'search/index.html';
    }

    function render(list, terms) {
      rows = list;
      sel = -1;
      res.innerHTML = list.map(function (r) {
        var n = S.number(r.doc, r.rec);
        return '<li><a href="' + S.href(r.doc, r.rec) + '">' +
          '<span class="n">' + (n || '&middot;') + '</span>' +
          '<span class="h">' + S.marks(S.heading(r.doc, r.rec), terms) + '</span>' +
          '<span class="src">' + LABEL[r.doc] + '</span>' +
          '<span class="g">' + S.snippet(S.body(r.doc, r.rec), terms, 110) + '</span></a></li>';
      }).join('');
    }

    function search() {
      var v = input.value.trim();
      jump = null;
      if (!v) {
        res.innerHTML = ''; rows = []; sel = -1;
        hint.textContent = 'Enter opens the full results or selected result. A number opens that article. Esc closes.';
        return;
      }
      var out = window.FluidSearch.run(v);
      if (out.q.num && v === String(out.q.num)) jump = S.articleHref(out.q.num);
      var flat = [];
      out.groups.forEach(function (g) {
        g.hits.forEach(function (h) { flat.push(h); });
      });
      var list = flat.slice(0, LIMIT);
      if (jump) {
        hint.textContent = 'Enter opens Article ' + out.q.num +
          (out.total ? '. Arrows move through the list.' : '.');
      } else if (!out.total) {
        hint.textContent = 'Nothing matches that.';
      } else {
        hint.textContent = out.total + ' found' +
          (out.total > list.length ? ', ' + list.length + ' shown' : '') +
          (out.widened ? ', matched in any order' : '') +
          '. Enter opens the full results or selected result.';
      }
      render(list, out.terms);
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
      else if (e.key === 'Enter') {
        e.preventDefault();
        if (sel > -1 && rows[sel]) {
          window.location.href = S.href(rows[sel].doc, rows[sel].rec);
        } else if (jump) {
          window.location.href = jump;
        } else if (input.value.trim()) {
          full();
        }
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
  if (btn && finder) {
    btn.innerHTML = 'Search <kbd>/</kbd>';
    btn.addEventListener('click', finder.open);
  }

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
  /* ---------- infobox: hide and show the whole column ---------- */

  Array.prototype.forEach.call(document.querySelectorAll('aside.infobox'), function (box, i) {
    var layout = box.closest ? box.closest('.artlayout') : box.parentNode;
    if (!layout) return;
    var body = layout.querySelector('.artbody');
    if (!body) return;

    box.id = box.id || 'infobox-' + (i + 1);

    var control = document.createElement('p');
    control.className = 'ib-control';

    var btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'ib-toggle';
    btn.setAttribute('aria-controls', box.id);
    control.appendChild(btn);
    body.insertBefore(control, body.firstChild);

    var key = 'fluid.infobox.' + location.pathname.replace(/[^a-z0-9]+/gi, '-') + '.' + i;

    function apply(hidden, remember) {
      box.hidden = hidden;
      layout.classList.toggle('nobox', hidden);
      btn.setAttribute('aria-expanded', String(!hidden));
      btn.textContent = hidden ? 'Show the details panel' : 'Hide the details panel';
      if (remember) { try { localStorage.setItem(key, hidden ? '1' : '0'); } catch (e) {} }
    }

    var stored = null;
    try { stored = localStorage.getItem(key); } catch (e) {}
    apply(stored === '1', false);

    btn.addEventListener('click', function () { apply(!box.hidden, true); });
  });
})();
