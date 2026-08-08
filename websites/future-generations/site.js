/* Commissioner for Future Generations - site behaviour.
   The horizon control changes how far forward the page looks. Marks
   falling beyond the chosen horizon are hidden, and the ones lying
   past a human lifetime are marked as such. */

(function () {
  "use strict";

  function byId(id) { return document.getElementById(id); }

  var NOW = 2026;

  function horizon() {
    var root = byId('horizon');
    if (!root) { return; }
    var buttons = root.querySelectorAll('.scale button');
    var marks = root.querySelectorAll('.mark');
    var note = byId('horizon-note');

    function paint(span) {
      var limit = span === 0 ? Infinity : NOW + span;
      var shown = 0;
      Array.prototype.forEach.call(marks, function (mark) {
        var year = parseInt(mark.getAttribute('data-year'), 10);
        var visible = year <= limit;
        mark.hidden = !visible;
        if (visible) { shown++; }
        if (year - NOW > 80) { mark.classList.add('far'); }
      });
      if (note) {
        note.textContent = span === 0
          ? shown + ' obligations on the register, the furthest falling due in 12026.'
          : shown + ' of the obligations on the register fall due within ' + span + ' years.';
      }
      Array.prototype.forEach.call(buttons, function (b) {
        b.setAttribute('aria-pressed', String(parseInt(b.getAttribute('data-span'), 10) === span));
      });
    }

    Array.prototype.forEach.call(buttons, function (b) {
      b.addEventListener('click', function () {
        paint(parseInt(b.getAttribute('data-span'), 10));
      });
    });

    paint(100);
  }

  function statements() {
    var list = byId('stmt-list');
    if (!list) { return; }
    var controls = document.querySelectorAll('#stmt-controls [data-filter]');
    var apply = Frame.filter({
      items: list.querySelectorAll('article'),
      controls: controls,
      count: byId('stmt-count'),
      empty: byId('stmt-empty'),
      noun: 'statements'
    });
    Frame.resetOn(byId('stmt-reset'), controls, apply);
  }

  document.addEventListener('DOMContentLoaded', function () {
    horizon();
    statements();
    Frame.sortable(byId('opinion-table'));
  });
})();
