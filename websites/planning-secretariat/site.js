/* Planning Secretariat - site behaviour.
   Filters the published balances and the register of variants. The
   Secretariat holds no power of decision, and neither does this file. */

(function () {
  "use strict";

  function byId(id) { return document.getElementById(id); }

  /* Balance lines: need against offer, in physical units. */
  function balances() {
    var list = byId('bal-list');
    if (!list) { return; }
    var controls = document.querySelectorAll('#bal-controls [data-filter]');
    var apply = Frame.filter({
      items: list.querySelectorAll('.rw'),
      controls: controls,
      count: byId('bal-count'),
      empty: byId('bal-empty'),
      noun: 'balance lines'
    });
    Frame.resetOn(byId('bal-reset'), controls, apply);
  }

  /* Variants prepared for the round now open. */
  function variants() {
    var list = byId('var-list');
    if (!list) { return; }
    var controls = document.querySelectorAll('#var-controls [data-filter]');
    var apply = Frame.filter({
      items: list.querySelectorAll('article'),
      controls: controls,
      count: byId('var-count'),
      empty: byId('var-empty'),
      noun: 'variants'
    });
    Frame.resetOn(byId('var-reset'), controls, apply);
  }

  document.addEventListener('DOMContentLoaded', function () {
    balances();
    variants();
    Frame.sortable(byId('method-table'));
  });
})();
