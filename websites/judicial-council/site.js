/* Judicial Council - site behaviour.
   Draws the composition of the twenty-one seats from the figures in the
   markup, and filters the published record of sittings. */

(function () {
  "use strict";

  function byId(id) { return document.getElementById(id); }

  /* Thirteen seats drawn by lot, eight elected. */
  function seats() {
    var node = byId('seats');
    if (!node) { return; }
    var row = node.querySelector('.rowline');
    if (!row) { return; }
    var lot = parseInt(node.getAttribute('data-lot'), 10) || 0;
    var elected = parseInt(node.getAttribute('data-elected'), 10) || 0;
    var out = '';
    var i;
    for (i = 0; i < lot; i++) { out += '<span class="s lot"></span>'; }
    for (i = 0; i < elected; i++) { out += '<span class="s el"></span>'; }
    row.innerHTML = out;
  }

  /* Record of sittings, published within seven days. */
  function record() {
    var body = byId('rec-rows');
    if (!body) { return; }
    var controls = document.querySelectorAll('#rec-controls [data-filter]');
    var apply = Frame.filter({
      items: body.querySelectorAll('tr'),
      controls: controls,
      count: byId('rec-count'),
      empty: byId('rec-empty'),
      noun: 'sittings'
    });
    Frame.resetOn(byId('rec-reset'), controls, apply);
    Frame.sortable(byId('rec-table'));
  }

  document.addEventListener('DOMContentLoaded', function () {
    seats();
    record();
  });
})();
