/* Constitutional Court - site behaviour.
   Filters the register of judgments, draws the bench and the cure
   periods of Article 222. Every figure is written in the markup. */

(function () {
  "use strict";

  function byId(id) { return document.getElementById(id); }

  function judgments() {
    var list = byId('judg-list');
    if (!list) { return; }
    var controls = document.querySelectorAll('#judg-controls [data-filter]');
    var apply = Frame.filter({
      items: list.querySelectorAll('article'),
      controls: controls,
      count: byId('judg-count'),
      empty: byId('judg-empty'),
      noun: 'judgments'
    });
    Frame.resetOn(byId('judg-reset'), controls, apply);
  }

  /* Article 216(1): fifteen justices. Article 217(5): the Court may not
     sit with fewer than eleven for longer than ninety days. */
  function bench() {
    var nodes = document.querySelectorAll('[data-bench]');
    Array.prototype.forEach.call(nodes, function (node) {
      var total = parseInt(node.getAttribute('data-bench'), 10) || 15;
      var sitting = parseInt(node.getAttribute('data-sitting'), 10) || total;
      var seats = node.querySelector('.seats');
      if (!seats) { return; }
      var out = '';
      for (var i = 0; i < total; i++) {
        out += '<span class="seat ' + (i < sitting ? 'on' : 'vac') + '"></span>';
      }
      seats.innerHTML = out;
    });
  }

  /* Article 222(2): twelve months at the most, extensible once by six. */
  function cure() {
    var rows = document.querySelectorAll('.cure .r[data-elapsed]');
    Array.prototype.forEach.call(rows, function (row) {
      var elapsed = parseFloat(row.getAttribute('data-elapsed'));
      var period = parseFloat(row.getAttribute('data-period')) || 12;
      var fill = row.querySelector('.fill');
      if (fill) {
        fill.style.width = Math.min(100, (elapsed / period) * 100) + '%';
      }
      if (elapsed > period) { row.classList.add('over'); }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    judgments();
    bench();
    cure();
    Frame.sortable(byId('conflict-table'));
  });
})();
