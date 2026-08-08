/* Office of Democratic Integrity - site behaviour.
   Draws the indicator meters from the published figures in the markup,
   and filters the registers of declarations and referrals. Every figure
   a meter draws is written next to it in the page. */

(function () {
  "use strict";

  function byId(id) { return document.getElementById(id); }

  /* Each indicator carries data-value, data-ceiling and data-scale.
     The bar reports the value against the scale, and the tick marks the
     ceiling or the floor the article fixes. */
  function meters() {
    var nodes = document.querySelectorAll('.ind[data-value]');
    Array.prototype.forEach.call(nodes, function (node) {
      var value = parseFloat(node.getAttribute('data-value'));
      var ceiling = parseFloat(node.getAttribute('data-ceiling'));
      var scale = parseFloat(node.getAttribute('data-scale')) || 100;
      var kind = node.getAttribute('data-kind') || 'ceiling';

      var fill = node.querySelector('.fill');
      var tick = node.querySelector('.ceil');
      if (fill) {
        fill.style.width = Math.max(0, Math.min(100, (value / scale) * 100)) + '%';
        var breached = kind === 'ceiling' ? value > ceiling : value < ceiling;
        fill.className = 'fill ' + (breached ? 'bad' : 'ok');
      }
      if (tick && !isNaN(ceiling)) {
        tick.style.left = Math.max(0, Math.min(100, (ceiling / scale) * 100)) + '%';
      }
    });
  }

  function declarations() {
    var body = byId('decl-rows');
    if (!body) { return; }
    var controls = document.querySelectorAll('#decl-controls [data-filter]');
    var apply = Frame.filter({
      items: body.querySelectorAll('tr'),
      controls: controls,
      count: byId('decl-count'),
      empty: byId('decl-empty'),
      noun: 'declarations'
    });
    Frame.resetOn(byId('decl-reset'), controls, apply);
    Frame.sortable(byId('decl-table'));
  }

  function referrals() {
    var body = byId('ref-rows');
    if (!body) { return; }
    var controls = document.querySelectorAll('#ref-controls [data-filter]');
    var apply = Frame.filter({
      items: body.querySelectorAll('tr'),
      controls: controls,
      count: byId('ref-count'),
      empty: byId('ref-empty'),
      noun: 'referrals'
    });
    Frame.resetOn(byId('ref-reset'), controls, apply);
    Frame.sortable(byId('ref-table'));
  }

  document.addEventListener('DOMContentLoaded', function () {
    meters();
    declarations();
    referrals();
  });
})();
