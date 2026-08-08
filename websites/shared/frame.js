/* Republic of Fluid - shared frame behaviour.
   Loaded by every organ site before that site's own script.
   Nothing here is required to read a page: each site works with
   scripting switched off, and this file only adds filtering and
   navigation aids on top of markup already present. */

(function () {
  "use strict";

  var Frame = {};

  /* ---------- navigation ---------- */

  /* Mark the navigation entry matching the current document. */
  Frame.markNav = function () {
    var here = location.pathname.replace(/index\.html$/, '');
    var links = document.querySelectorAll('.orgnav a');
    for (var i = 0; i < links.length; i++) {
      var path = links[i].pathname.replace(/index\.html$/, '');
      if (path === here) { links[i].setAttribute('aria-current', 'page'); }
    }
  };

  /* ---------- text folding ---------- */

  /* Normalise a string for accent-tolerant, case-tolerant matching. */
  Frame.fold = function (s) {
    return (s || '').toString().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ').trim();
  };

  /* ---------- filtering ---------- */

  /* Filter rows of a table or cards in a list.
     opts: { root, items, controls, count, empty, noun }
     Each item carries data-* attributes; each control names the
     attribute it filters through data-filter. A control whose value
     is empty imposes no restriction. A control of type text or search
     matches through substring against data-search. */
  Frame.filter = function (opts) {
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
            var hay = Frame.fold(item.getAttribute('data-search') || item.textContent);
            keep = hay.indexOf(Frame.fold(value)) !== -1;
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

  /* Reset every control inside a container and re-run its filter. */
  Frame.resetOn = function (button, controls, apply) {
    if (!button) { return; }
    button.addEventListener('click', function () {
      Array.prototype.forEach.call(controls, function (c) { c.value = ''; });
      apply();
    });
  };

  /* ---------- sorting ---------- */

  /* Sort a table by clicking its column headers. Headers opting in
     carry data-sort with the value 'text' or 'number'. */
  Frame.sortable = function (table) {
    if (!table) { return; }
    var body = table.tBodies[0];
    if (!body) { return; }
    var heads = table.querySelectorAll('thead th[data-sort]');

    Array.prototype.forEach.call(heads, function (th) {
      var index = Array.prototype.indexOf.call(th.parentNode.children, th);
      th.tabIndex = 0;
      th.setAttribute('role', 'button');

      function run() {
        var descending = th.getAttribute('aria-sort') === 'ascending';
        var numeric = th.getAttribute('data-sort') === 'number';
        var rows = Array.prototype.slice.call(body.rows);
        rows.sort(function (a, b) {
          var x = a.cells[index] ? a.cells[index].textContent.trim() : '';
          var y = b.cells[index] ? b.cells[index].textContent.trim() : '';
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

  document.addEventListener('DOMContentLoaded', Frame.markNav);
  window.Frame = Frame;
})();
