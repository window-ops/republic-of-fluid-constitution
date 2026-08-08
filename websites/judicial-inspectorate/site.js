/* Judicial Inspectorate - site behaviour.
   Filters the register of inspections and of proceedings opened. */

(function () {
  "use strict";

  function byId(id) { return document.getElementById(id); }

  /* Inspections carried out. */
  function inspections() {
    var list = byId('in-list');
    if (!list) { return; }
    var controls = document.querySelectorAll('#in-controls [data-filter]');
    var apply = Frame.filter({
      items: list.querySelectorAll('.row'),
      controls: controls,
      count: byId('in-count'),
      empty: byId('in-empty'),
      noun: 'inspections'
    });
    Frame.resetOn(byId('in-reset'), controls, apply);
  }

  /* Proceedings opened, and their outcome. */
  function proceedings() {
    var body = byId('pr-rows');
    if (!body) { return; }
    var controls = document.querySelectorAll('#pr-controls [data-filter]');
    var apply = Frame.filter({
      items: body.querySelectorAll('tr'),
      controls: controls,
      count: byId('pr-count'),
      empty: byId('pr-empty'),
      noun: 'proceedings'
    });
    Frame.resetOn(byId('pr-reset'), controls, apply);
    Frame.sortable(byId('pr-table'));
  }

  document.addEventListener('DOMContentLoaded', function () {
    inspections();
    proceedings();
  });
})();
