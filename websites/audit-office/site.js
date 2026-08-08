/* Audit Office - site behaviour.
   Filtering of the register of audits, and the petition gauge of
   Article 250(2). Every figure on these pages is readable without it. */

(function () {
  "use strict";

  function byId(id) { return document.getElementById(id); }

  /* Register of audits opened, published and answered. */
  function audits() {
    var list = byId('audit-list');
    if (!list) { return; }
    var controls = document.querySelectorAll('#audit-controls [data-filter]');
    var apply = Frame.filter({
      items: list.querySelectorAll('details'),
      controls: controls,
      count: byId('audit-count'),
      empty: byId('audit-empty'),
      noun: 'audits'
    });
    Frame.resetOn(byId('audit-reset'), controls, apply);

    var expand = byId('audit-expand');
    if (expand) {
      expand.addEventListener('click', function () {
        var open = expand.getAttribute('data-state') !== 'open';
        Array.prototype.forEach.call(list.querySelectorAll('details'), function (d) {
          if (!d.hidden) { d.open = open; }
        });
        expand.setAttribute('data-state', open ? 'open' : 'shut');
        expand.textContent = open ? 'Collapse all' : 'Expand all';
      });
    }
  }

  /* Register of departures from a ceiling of Article 100. */
  function ceilings() {
    var table = byId('ceiling-table');
    if (!table) { return; }
    Frame.sortable(table);
    var controls = document.querySelectorAll('#ceiling-controls [data-filter]');
    var body = byId('ceiling-rows');
    var apply = Frame.filter({
      items: body.querySelectorAll('tr'),
      controls: controls,
      count: byId('ceiling-count'),
      empty: byId('ceiling-empty'),
      noun: 'lines'
    });
    Frame.resetOn(byId('ceiling-reset'), controls, apply);
  }

  /* Article 250(2): an audit opens on the petition of ten thousand
     residents. The gauge reports the signatures standing today. */
  function gauge() {
    var nodes = document.querySelectorAll('[data-gauge]');
    Array.prototype.forEach.call(nodes, function (node) {
      var have = parseInt(node.getAttribute('data-have'), 10) || 0;
      var need = parseInt(node.getAttribute('data-need'), 10) || 10000;
      var fill = node.querySelector('.fill');
      var pct = Math.min(100, Math.round((have / need) * 100));
      if (fill) { fill.style.width = pct + '%'; }
      var state = node.querySelector('[data-gauge-state]');
      if (state) {
        state.textContent = have >= need
          ? 'Threshold reached. The audit opens by operation of Article 250(2).'
          : (need - have).toLocaleString('en') + ' signatures short of the threshold.';
      }
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    audits();
    ceilings();
    gauge();
  });
})();
