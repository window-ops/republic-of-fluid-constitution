/* Prosecution service - site behaviour.
   Filters the register of published files and the register of general
   instructions. Both registers are complete in the markup. */

(function () {
  "use strict";

  function byId(id) { return document.getElementById(id); }

  /* Files on which a decision has been published. */
  function files() {
    var list = byId('fl-list');
    if (!list) { return; }
    var controls = document.querySelectorAll('#fl-controls [data-filter]');
    var apply = Frame.filter({
      items: list.querySelectorAll('article'),
      controls: controls,
      count: byId('fl-count'),
      empty: byId('fl-empty'),
      noun: 'files'
    });
    Frame.resetOn(byId('fl-reset'), controls, apply);
  }

  document.addEventListener('DOMContentLoaded', function () {
    files();
    Frame.sortable(byId('ag-table'));
  });
})();
