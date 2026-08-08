/* Live filtering for the long article lists. */
(function () {
  "use strict";
  var q = document.getElementById('q'),
      list = document.getElementById('list'),
      count = document.getElementById('count');
  if (!q || !list || !count) return;
  var items = Array.prototype.slice.call(list.children),
      total = items.length,
      noun = list.classList.contains('sum') ? 'summaries' : 'articles';

  function run() {
    var v = q.value.trim().toLowerCase(), shown = 0;
    items.forEach(function (li) {
      var hit = !v || li.dataset.n === v || li.dataset.n.indexOf(v) === 0 ||
                li.textContent.toLowerCase().indexOf(v) > -1;
      li.hidden = !hit;
      if (hit) shown++;
    });
    count.textContent = v
      ? (shown === 1 ? '1 match.' : shown + ' matches.')
      : 'Showing all ' + total + ' ' + noun + '.';
  }
  q.addEventListener('input', run);
  q.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      var first = items.find(function (li) { return !li.hidden; });
      if (first) first.querySelector('a').click();
    }
  });
})();
