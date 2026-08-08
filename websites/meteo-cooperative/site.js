/* Meteorological Cooperative of the Republic - site behaviour.
   Every page of this site reads with scripting switched off. This file
   adds three aids on top of markup already present: it marks the
   navigation entry for the open page, it filters the catalogue and
   register tables, and it sorts columns that opt in.
   No external resource is loaded. */

(function () {
  "use strict";

  var Meteo = {};

  /* ---------- navigation ---------- */

  /* Mark the entry for the open page, and the group that holds it, so the
     section is legible before any panel opens. */
  Meteo.markNav = function () {
    var here = location.pathname.replace(/index\.html$/, '');
    var links = document.querySelectorAll('.mainnav a');
    for (var i = 0; i < links.length; i++) {
      var path = links[i].pathname.replace(/index\.html$/, '');
      if (path !== here) { continue; }
      links[i].setAttribute('aria-current', 'page');
      var sub = links[i].closest('details.sub');
      if (sub) {
        var subSum = sub.querySelector('summary > a');
        if (subSum) { subSum.classList.add('on'); }
      }
      var grp = links[i].closest('.grp');
      if (grp) {
        var sum = grp.querySelector('summary');
        if (sum) { sum.classList.add('on'); }
      }
    }
  };

  /* The groups are <details> and already open on a tap without any of
     this. Script keeps one open at a time, opens one on hover where the
     pointer is fine, and shuts them on an outside click or Escape. */
  Meteo.groups = function () {
    var all = Array.prototype.slice.call(document.querySelectorAll('.mainnav .grp'));
    if (!all.length) { return; }
    var hoverable = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var shutTimer = null;

    /* A fixed panel needs its position set, since it no longer sits
       under its summary by layout alone. Placed on open, and again on a
       resize or a sideways scroll of the bar. */
    function place(g) {
      var ul = g.querySelector('ul');
      var sum = g.querySelector('summary');
      if (!ul || !sum) { return; }
      var bar = g.closest('.mainnav').getBoundingClientRect();
      var box = sum.getBoundingClientRect();
      ul.style.top = bar.bottom + 'px';
      var left = Math.max(4, Math.min(box.left, window.innerWidth - ul.offsetWidth - 4));
      ul.style.left = left + 'px';
    }

    function placeOpen() {
      all.forEach(function (g) { if (g.open) { place(g); } });
    }

    window.addEventListener('resize', placeOpen);
    window.addEventListener('scroll', placeOpen, true);

    function closeAll(except) {
      all.forEach(function (g) {
        if (g !== except) { g.removeAttribute('open'); }
      });
    }

    all.forEach(function (g) {
      var sum = g.querySelector('summary');

      sum.addEventListener('click', function () {
        if (!g.open) { closeAll(g); }
        window.setTimeout(function () { if (g.open) { place(g); } }, 0);
      });

      g.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          g.removeAttribute('open');
          sum.focus();
        }
      });

      if (hoverable) {
        g.addEventListener('mouseenter', function () {
          window.clearTimeout(shutTimer);
          closeAll(g);
          g.setAttribute('open', '');
          place(g);
        });
        g.addEventListener('mouseleave', function () {
          shutTimer = window.setTimeout(function () {
            g.removeAttribute('open');
          }, 220);
        });
      }

      g.addEventListener('focusout', function (e) {
        if (!g.contains(e.relatedTarget)) { g.removeAttribute('open'); }
      });
    });

    document.addEventListener('click', function (e) {
      if (!e.target.closest('.mainnav .grp')) { closeAll(null); }
    });

    /* The third level behaves like the second: hidden until opened, open
       on hover where the pointer is fine, and shut when the group above
       it shuts. Its summary holds a link, so a click on the text
       navigates and only the chevron toggles. */
    var subs = Array.prototype.slice.call(document.querySelectorAll('.mainnav details.sub'));
    subs.forEach(function (d) {
      var parent = d.closest('.grp');

      if (hoverable) {
        d.addEventListener('mouseenter', function () {
          d.setAttribute('open', '');
          if (parent) { place(parent); }
        });
        d.addEventListener('mouseleave', function () {
          d.removeAttribute('open');
          if (parent) { place(parent); }
        });
      }

      d.addEventListener('toggle', function () {
        if (parent && parent.open) { place(parent); }
      });

      d.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { d.removeAttribute('open'); }
      });
    });

    all.forEach(function (g) {
      g.addEventListener('toggle', function () {
        if (!g.open) {
          Array.prototype.forEach.call(g.querySelectorAll('details.sub'), function (d) {
            d.removeAttribute('open');
          });
        }
      });
    });
  };

  /* ---------- text folding ---------- */

  /* Normalise a string for accent-tolerant, case-tolerant matching. */
  Meteo.fold = function (s) {
    return (s || '').toString().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ').trim();
  };

  /* ---------- filtering ---------- */

  /* Filter rows of a table. Each row holds data-* attributes; each
     control names the attribute it filters through data-filter. An
     empty control imposes no restriction. A control named search
     matches by substring against data-search, falling back to the
     text content of the row. */
  Meteo.filter = function (opts) {
    var items = Array.prototype.slice.call(opts.items || []);
    var controls = Array.prototype.slice.call(opts.controls || []);
    var counter = opts.count || null;
    var empty = opts.empty || null;
    var noun = opts.noun || 'entries';

    function apply() {
      var shown = 0;
      items.forEach(function (item) {
        var keep = true;
        controls.forEach(function (c) {
          if (!keep) { return; }
          var value = c.value;
          if (!value) { return; }
          var key = c.getAttribute('data-filter');
          if (key === 'search') {
            var hay = Meteo.fold(item.getAttribute('data-search') || item.textContent);
            keep = hay.indexOf(Meteo.fold(value)) !== -1;
          } else {
            keep = (item.getAttribute('data-' + key) || '') === value;
          }
        });
        item.hidden = !keep;
        if (keep) { shown++; }
      });
      if (counter) {
        counter.textContent = shown === items.length
          ? String(items.length) + ' ' + noun
          : String(shown) + ' of ' + String(items.length) + ' ' + noun;
      }
      if (empty) { empty.hidden = shown !== 0; }
    }

    controls.forEach(function (c) {
      c.addEventListener('input', apply);
      c.addEventListener('change', apply);
    });
    apply();
    return apply;
  };

  /* Clear every control and re-run the filter. */
  Meteo.resetOn = function (button, controls, apply) {
    if (!button) { return; }
    button.addEventListener('click', function () {
      Array.prototype.forEach.call(controls, function (c) { c.value = ''; });
      apply();
    });
  };

  /* ---------- sorting ---------- */

  /* Sort a table by its column headers. A header opts in through
     data-sort with the value text or number. A cell may override the
     key it sorts on through data-key. */
  Meteo.sortable = function (table) {
    if (!table) { return; }
    var body = table.tBodies[0];
    if (!body) { return; }
    var heads = table.querySelectorAll('thead th[data-sort]');

    Array.prototype.forEach.call(heads, function (th) {
      var index = Array.prototype.indexOf.call(th.parentNode.children, th);
      th.tabIndex = 0;
      th.setAttribute('role', 'button');

      function key(row) {
        var cell = row.cells[index];
        if (!cell) { return ''; }
        return cell.getAttribute('data-key') || cell.textContent.trim();
      }

      function run() {
        var descending = th.getAttribute('aria-sort') === 'ascending';
        var numeric = th.getAttribute('data-sort') === 'number';
        var rows = Array.prototype.slice.call(body.rows);
        rows.sort(function (a, b) {
          var x = key(a), y = key(b);
          if (numeric) {
            var nx = parseFloat(x.replace(/[^0-9.\-]/g, '')) || 0;
            var ny = parseFloat(y.replace(/[^0-9.\-]/g, '')) || 0;
            return descending ? ny - nx : nx - ny;
          }
          return descending ? y.localeCompare(x) : x.localeCompare(y);
        });
        rows.forEach(function (r) { body.appendChild(r); });
        Array.prototype.forEach.call(heads, function (o) { o.removeAttribute('aria-sort'); });
        th.setAttribute('aria-sort', descending ? 'descending' : 'ascending');
      }

      th.addEventListener('click', run);
      th.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); run(); }
      });
    });
  };

  document.addEventListener('DOMContentLoaded', function () {
    Meteo.markNav();
    Meteo.groups();
  });
  window.Meteo = Meteo;
})();
