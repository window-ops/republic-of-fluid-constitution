/* Office of Constitutional Revision - site behaviour.
   Filters the coherence report and the table of superseded versions. */

(function () {
  "use strict";

  function byId(id) { return document.getElementById(id); }

  /* Defects found in the consolidated text. */
  function defects() {
    var list = byId('def-list');
    if (!list) { return; }
    var controls = document.querySelectorAll('#def-controls [data-filter]');
    var apply = Frame.filter({
      items: list.querySelectorAll('article'),
      controls: controls,
      count: byId('def-count'),
      empty: byId('def-empty'),
      noun: 'findings'
    });
    Frame.resetOn(byId('def-reset'), controls, apply);
  }

  document.addEventListener('DOMContentLoaded', function () {
    defects();
    Frame.sortable(byId('version-table'));
  });
})();
