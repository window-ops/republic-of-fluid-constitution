/* Podnik - site behaviour.

   Podnik loads none of the shared state frame, so this file stands alone.
   Nothing here is needed to read a page: the whole register is in the markup
   and every entry is reachable with scripting switched off. This adds the
   filtering, the running count and the mode preselect on top of it. */

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

  /* Each model carries data-mode, data-works, data-origin, data-traction and
     data-search. Each control names the attribute it filters through
     data-filter. An empty control imposes no restriction. A mode section
     whose models are all hidden is hidden with them, so the sticky headings
     never stand over nothing. */
  function catalogue() {
    var form = byId('filters');
    if (!form) { return; }

    var models = Array.prototype.slice.call(document.querySelectorAll('.model'));
    var blocks = Array.prototype.slice.call(document.querySelectorAll('.mode-block'));
    var controls = Array.prototype.slice.call(form.querySelectorAll('[data-filter]'));
    var count = byId('f-count');
    var empty = byId('f-empty');

    form.addEventListener('submit', function (e) { e.preventDefault(); });

    function apply() {
      var shown = 0;

      models.forEach(function (model) {
        var keep = true;
        controls.forEach(function (c) {
          if (!keep || !c.value) { return; }
          var key = c.getAttribute('data-filter');
          if (key === 'search') {
            keep = fold(model.getAttribute('data-search')).indexOf(fold(c.value)) !== -1;
          } else {
            keep = model.getAttribute('data-' + key) === c.value;
          }
        });
        model.hidden = !keep;
        if (keep) { shown++; }
      });

      blocks.forEach(function (block) {
        var live = block.querySelectorAll('.model:not([hidden])').length;
        block.hidden = live === 0;
      });

      if (count) {
        count.textContent = shown === models.length
          ? models.length + ' models shown'
          : shown + ' of ' + models.length + ' models shown';
      }
      if (empty) { empty.hidden = shown !== 0; }
    }

    controls.forEach(function (c) {
      c.addEventListener('input', apply);
      c.addEventListener('change', apply);
    });

    var reset = byId('f-reset');
    if (reset) {
      reset.addEventListener('click', function () {
        controls.forEach(function (c) { c.value = ''; });
        apply();
      });
    }

    /* A link from the front page arrives as catalogue.html#tram. Without
       scripting that is an ordinary anchor. With it, the mode filter is set
       to match, so the reader lands on that mode alone. */
    function fromHash() {
      var mode = byId('f-mode');
      if (!mode) { return; }
      var hash = (location.hash || '').replace('#', '');
      if (!hash) { return; }
      var opts = mode.options;
      for (var i = 0; i < opts.length; i++) {
        if (opts[i].value === hash) {
          mode.value = hash;
          apply();
          return;
        }
      }
    }

    apply();
    fromHash();
    window.addEventListener('hashchange', fromHash);
  }

  document.addEventListener('DOMContentLoaded', function () {
    markNav();
    catalogue();
  });
})();
