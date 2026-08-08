/* Executive Council - site behaviour.
   Filters the register of committees and the register of regulations.
   Both registers are complete in the markup. */

(function () {
  "use strict";

  function byId(id) { return document.getElementById(id); }

  /* Committees, set out as fields of execution. */
  function fields() {
    var list = byId('field-list');
    if (!list) { return; }
    var controls = document.querySelectorAll('#field-controls [data-filter]');
    var apply = Frame.filter({
      items: list.querySelectorAll('article'),
      controls: controls,
      count: byId('field-count'),
      empty: byId('field-empty'),
      noun: 'committees'
    });
    Frame.resetOn(byId('field-reset'), controls, apply);
  }

  /* Regulations made and the enabling provision of each. */
  function regulations() {
    var body = byId('reg-rows');
    if (!body) { return; }
    var controls = document.querySelectorAll('#reg-controls [data-filter]');
    var apply = Frame.filter({
      items: body.querySelectorAll('tr'),
      controls: controls,
      count: byId('reg-count'),
      empty: byId('reg-empty'),
      noun: 'regulations'
    });
    Frame.resetOn(byId('reg-reset'), controls, apply);
    Frame.sortable(byId('reg-table'));
  }

  document.addEventListener('DOMContentLoaded', function () {
    fields();
    regulations();
  });
})();
