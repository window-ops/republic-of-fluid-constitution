/* Maasdelta Concentrates B.V. - site behaviour.
   Marks the navigation and filters the shipment register. The register is
   published under the disclosure condition attached to the licence, and it
   is complete in the markup, so it reads without scripting. */

(function () {
  "use strict";

  function byId(id) { return document.getElementById(id); }

  function fold(s) {
    return (s || '').toString().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, ' ').trim();
  }

  function markNav() {
    var here = location.pathname.replace(/index\.html$/, '');
    var links = document.querySelectorAll('.nav a');
    for (var i = 0; i < links.length; i++) {
      if (links[i].pathname.replace(/index\.html$/, '') === here) {
        links[i].setAttribute('aria-current', 'page');
      }
    }
  }

  /* Rows carry data-year, data-dest, data-status and data-search. */
  function shipments() {
    var body = byId('sh-rows');
    if (!body) { return; }
    var rows = Array.prototype.slice.call(body.querySelectorAll('tr'));
    var controls = Array.prototype.slice.call(document.querySelectorAll('#sh-controls [data-filter]'));
    var count = byId('sh-count');
    var empty = byId('sh-empty');
    var mass = byId('sh-mass');

    function apply() {
      var shown = 0, tonnes = 0;
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
        if (keep) {
          shown++;
          tonnes += parseFloat(row.getAttribute('data-mass')) || 0;
        }
      });
      if (count) {
        count.textContent = shown === rows.length
          ? String(rows.length) + ' consignments'
          : String(shown) + ' of ' + String(rows.length) + ' consignments';
      }
      if (mass) { mass.textContent = tonnes.toFixed(1) + ' t U3O8'; }
      if (empty) { empty.hidden = shown !== 0; }
    }

    controls.forEach(function (c) {
      c.addEventListener('input', apply);
      c.addEventListener('change', apply);
    });
    var reset = byId('sh-reset');
    if (reset) {
      reset.addEventListener('click', function () {
        controls.forEach(function (c) { c.value = ''; });
        apply();
      });
    }
    apply();
  }

  document.addEventListener('DOMContentLoaded', function () {
    markNav();
    shipments();
  });
})();
