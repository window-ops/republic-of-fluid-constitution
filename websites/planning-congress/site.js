/* National Planning Congress - site behaviour.
   Draws the composition bar from the delegate counts written beside it,
   and filters the register of decisions. */

(function () {
  "use strict";

  function byId(id) { return document.getElementById(id); }

  /* Each entry in the key carries its share of the delegates. */
  function compose() {
    var root = byId('compose');
    if (!root) { return; }
    var bar = root.querySelector('.bar');
    var keys = root.querySelectorAll('.key span[data-share]');
    var total = 0;
    var parts = [];

    Array.prototype.forEach.call(keys, function (key) {
      var share = parseFloat(key.getAttribute('data-share')) || 0;
      total += share;
      parts.push([share, key.getAttribute('data-colour') || '#8a6a3a']);
    });

    if (bar && total) {
      bar.innerHTML = parts.map(function (part) {
        return '<span style="width:' + ((part[0] / total) * 100) +
          '%;background:' + part[1] + '"></span>';
      }).join('');
    }
  }

  /* Register of decisions, with dissent recorded. */
  function decisions() {
    var list = byId('dec-list');
    if (!list) { return; }
    var controls = document.querySelectorAll('#dec-controls [data-filter]');
    var apply = Frame.filter({
      items: list.querySelectorAll('article'),
      controls: controls,
      count: byId('dec-count'),
      empty: byId('dec-empty'),
      noun: 'decisions'
    });
    Frame.resetOn(byId('dec-reset'), controls, apply);
  }

  document.addEventListener('DOMContentLoaded', function () {
    compose();
    decisions();
    Frame.sortable(byId('apportion-table'));
  });
})();
