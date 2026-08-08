/* External Currency Translation Cooperative - site behaviour.
   Marks the navigation, filters the catalogue, and computes the worked
   example on the translation slip. Every page reads without scripting. */

(function () {
  "use strict";

  function byId(id) { return document.getElementById(id); }

  function fold(s) {
    return (s || '').toString().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ').trim();
  }

  /* ---------- navigation ---------- */

  function markNav() {
    var here = location.pathname.replace(/index\.html$/, '');
    var links = document.querySelectorAll('.nav a');
    for (var i = 0; i < links.length; i++) {
      if (links[i].pathname.replace(/index\.html$/, '') === here) {
        links[i].setAttribute('aria-current', 'page');
      }
    }
  }

  /* ---------- catalogue ---------- */

  /* Rows carry data-zone, data-kind and data-search. */
  function catalogue() {
    var body = byId('cat-rows');
    if (!body) { return; }
    var rows = Array.prototype.slice.call(body.querySelectorAll('tr'));
    var controls = Array.prototype.slice.call(document.querySelectorAll('#cat-controls [data-filter]'));
    var count = byId('cat-count');
    var empty = byId('cat-empty');

    function apply() {
      var shown = 0;
      rows.forEach(function (row) {
        var keep = true;
        controls.forEach(function (c) {
          if (!keep || !c.value) { return; }
          var key = c.getAttribute('data-filter');
          if (key === 'search') {
            keep = fold(row.getAttribute('data-search') || row.textContent).indexOf(fold(c.value)) !== -1;
          } else {
            keep = (row.getAttribute('data-' + key) || '') === c.value;
          }
        });
        row.hidden = !keep;
        if (keep) { shown++; }
      });
      if (count) {
        count.textContent = shown === rows.length
          ? String(rows.length) + ' items'
          : String(shown) + ' of ' + String(rows.length) + ' items';
      }
      if (empty) { empty.hidden = shown !== 0; }
    }

    controls.forEach(function (c) {
      c.addEventListener('input', apply);
      c.addEventListener('change', apply);
    });
    var reset = byId('cat-reset');
    if (reset) {
      reset.addEventListener('click', function () {
        controls.forEach(function (c) { c.value = ''; });
        apply();
      });
    }
    apply();
  }

  /* ---------- worked example ---------- */

  /* The slip shows what a member gives up on one side and what the
     cooperative pays on the other. The handling fee is flat and the
     reference rate carries no margin, so the sum is plain addition. */
  function example() {
    var root = byId('example');
    if (!root) { return; }
    var price = byId('ex-price');
    var fee = parseFloat(root.getAttribute('data-fee')) || 0;
    var ship = parseFloat(root.getAttribute('data-ship')) || 0;
    var out = {
      goods: byId('ex-goods'),
      total: byId('ex-total'),
      units: byId('ex-units'),
      units2: byId('ex-units-2'),
      rate: parseFloat(root.getAttribute('data-units-per-euro')) || 0
    };

    function run() {
      var goods = Math.max(0, parseFloat(price.value) || 0);
      var total = goods + fee + ship;
      if (out.goods) { out.goods.textContent = goods.toFixed(2) + ' EUR'; }
      if (out.total) { out.total.textContent = total.toFixed(2) + ' EUR'; }
      var units = Math.ceil(total * out.rate);
      if (out.units) { out.units.textContent = units + ' units'; }
      if (out.units2) { out.units2.textContent = String(units); }
    }

    price.addEventListener('input', run);
    run();
  }

  document.addEventListener('DOMContentLoaded', function () {
    markNav();
    catalogue();
    example();
  });
})();
