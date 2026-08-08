/* Ecological Budget Authority - site behaviour.
   Draws the headroom bars from the figures written beside them, and
   filters the register of budgets and of petitions for revision. */

(function () {
  "use strict";

  function byId(id) { return document.getElementById(id); }

  /* Each line carries data-used, data-ceiling and an optional data-scale.
     The bar reports consumption, and the tick marks the ceiling. */
  function bars() {
    var lines = document.querySelectorAll('.budget .line[data-used]');
    Array.prototype.forEach.call(lines, function (line) {
      var used = parseFloat(line.getAttribute('data-used'));
      var ceiling = parseFloat(line.getAttribute('data-ceiling'));
      var scale = parseFloat(line.getAttribute('data-scale')) || ceiling * 1.25;
      var fill = line.querySelector('.fill');
      var mark = line.querySelector('.mark');
      if (fill) {
        fill.style.width = Math.min(100, (used / scale) * 100) + '%';
        if (used > ceiling) { fill.className = 'fill over'; }
      }
      if (mark) {
        mark.style.left = Math.min(100, (ceiling / scale) * 100) + '%';
      }
    });
  }

  /* Register of budget lines in force. */
  function budgets() {
    var body = byId('bud-rows');
    if (!body) { return; }
    var controls = document.querySelectorAll('#bud-controls [data-filter]');
    var apply = Frame.filter({
      items: body.querySelectorAll('tr'),
      controls: controls,
      count: byId('bud-count'),
      empty: byId('bud-empty'),
      noun: 'budget lines'
    });
    Frame.resetOn(byId('bud-reset'), controls, apply);
    Frame.sortable(byId('bud-table'));
  }

  /* Register of petitions for revision of a ceiling. */
  function petitions() {
    var body = byId('pet-rows');
    if (!body) { return; }
    var controls = document.querySelectorAll('#pet-controls [data-filter]');
    var apply = Frame.filter({
      items: body.querySelectorAll('tr'),
      controls: controls,
      count: byId('pet-count'),
      empty: byId('pet-empty'),
      noun: 'petitions'
    });
    Frame.resetOn(byId('pet-reset'), controls, apply);
  }

  document.addEventListener('DOMContentLoaded', function () {
    bars();
    budgets();
    petitions();
  });
})();
