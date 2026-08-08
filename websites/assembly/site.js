/* Assembly of the Republic - site behaviour.
   Draws the seat chart from the figures in the key, and filters the
   register of bills. Seat totals are written in the markup. */

(function () {
  "use strict";

  function byId(id) { return document.getElementById(id); }

  /* Two hundred seats, coloured from the key beside the chart. */
  function chamber() {
    var root = byId('chamber');
    if (!root) { return; }
    var grid = root.querySelector('.grid');
    if (!grid) { return; }
    var keys = root.querySelectorAll('.key span[data-seats]');
    var out = '';
    Array.prototype.forEach.call(keys, function (key) {
      var seats = parseInt(key.getAttribute('data-seats'), 10) || 0;
      var colour = key.getAttribute('data-colour') || '#2f5680';
      for (var i = 0; i < seats; i++) {
        out += '<span class="s" style="background:' + colour + '"></span>';
      }
    });
    grid.innerHTML = out;
  }

  /* Register of bills before the Assembly. */
  function bills() {
    var list = byId('bill-list');
    if (!list) { return; }
    var controls = document.querySelectorAll('#bill-controls [data-filter]');
    var apply = Frame.filter({
      items: list.querySelectorAll('article'),
      controls: controls,
      count: byId('bill-count'),
      empty: byId('bill-empty'),
      noun: 'bills'
    });
    Frame.resetOn(byId('bill-reset'), controls, apply);
  }

  document.addEventListener('DOMContentLoaded', function () {
    chamber();
    bills();
    Frame.sortable(byId('recall-table'));
  });
})();
