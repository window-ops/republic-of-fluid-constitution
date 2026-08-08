/* National Court - site behaviour.
   Filters the register of rulings on divergence and the cassation
   register, and sorts the columns of both. */

(function () {
  "use strict";

  function byId(id) { return document.getElementById(id); }

  /* Rulings on divergence, which bind every court. */
  function rulings() {
    var list = byId('rl-list');
    if (!list) { return; }
    var controls = document.querySelectorAll('#rl-controls [data-filter]');
    var apply = Frame.filter({
      items: list.querySelectorAll('article'),
      controls: controls,
      count: byId('rl-count'),
      empty: byId('rl-empty'),
      noun: 'rulings'
    });
    Frame.resetOn(byId('rl-reset'), controls, apply);
  }

  /* Appeals in cassation. */
  function cassation() {
    var body = byId('cs-rows');
    if (!body) { return; }
    var controls = document.querySelectorAll('#cs-controls [data-filter]');
    var apply = Frame.filter({
      items: body.querySelectorAll('tr'),
      controls: controls,
      count: byId('cs-count'),
      empty: byId('cs-empty'),
      noun: 'appeals'
    });
    Frame.resetOn(byId('cs-reset'), controls, apply);
    Frame.sortable(byId('cs-table'));
  }

  document.addEventListener('DOMContentLoaded', function () {
    rulings();
    cassation();
  });
})();
