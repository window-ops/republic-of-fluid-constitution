/* Sub-regional map: selection, keyboard access, and the detail panel. */
(function () {
  "use strict";
  var data = window.FLUID_REGIONS;
  if (!data) return;
  var byslug = {};
  data.subregions.forEach(function (s) { byslug[s.slug] = s; });

  var svg = document.getElementById('fluid-map'),
      panel = document.getElementById('mappanel'),
      hint = document.querySelector('.maphint'),
      rows = Array.prototype.slice.call(document.querySelectorAll('.srrow')),
      paths = svg ? Array.prototype.slice.call(svg.querySelectorAll('.sr')) : [];

  var REGION = { west: 'Western Region', east: 'Eastern Region' };

  function render(s) {
    var towns = '<p class="mp-row"><span class="k">Towns</span><span class="v">' +
      s.towns.map(function (t) {
        return '<a href="towns/' + t.slug + '.html">' + t.name + '</a> (' +
               t.pop.toLocaleString('en') + ')';
      }).join('<br>') + '</span></p>';
    panel.innerHTML =
      '<p class="mp-eyebrow">Sub-region ' + s.no + ' of 20</p>' +
      '<h2 class="mp-name">' + s.name + '</h2>' +
      '<p class="mp-blurb">' + s.blurb + '</p>' +
      '<div class="mp-facts">' +
        '<p class="mp-row"><span class="k">Region</span><span class="v">' + REGION[s.region] + '</span></p>' +
        towns +
        '<p class="mp-row"><span class="k">Residents</span><span class="v">' +
          s.population.toLocaleString('en') + '</span></p>' +
        '<p class="mp-row"><span class="k">Area</span><span class="v">about ' +
          s.km2.toLocaleString('en') + ' km²</span></p>' +
        '<p class="mp-row"><span class="k">Seats</span><span class="v">' + s.seats +
          ' of 200 in the Assembly</span></p>' +
      '</div>' +
      '<p class="mp-links">' +
        '<a href="../constitution/title-7.html#a173">Sub-regional council</a>' +
        '<a href="../constitution/title-7.html#a174">Its competences</a>' +
        '<a href="../constitution/title-5.html#a121">As a district</a>' +
        '<a href="../assembly/">Apportionment</a>' +
      '</p>';
  }

  function select(slug) {
    var s = byslug[slug];
    if (!s) return;
    paths.forEach(function (p) { p.classList.toggle('on', p.dataset.sr === slug); });
    rows.forEach(function (r) { r.classList.toggle('on', r.dataset.sr === slug); });
    render(s);
    if (hint) hint.textContent = s.name + ' selected. Arrow keys move between sub-regions.';
  }

  paths.forEach(function (p, i) {
    p.addEventListener('click', function () { select(p.dataset.sr); });
    p.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(p.dataset.sr); }
      else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault(); paths[(i + 1) % paths.length].focus();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault(); paths[(i - 1 + paths.length) % paths.length].focus();
      }
    });
    p.addEventListener('focus', function () { select(p.dataset.sr); });
  });

  rows.forEach(function (r) {
    r.addEventListener('click', function () {
      select(r.dataset.sr);
      var p = svg && svg.querySelector('[data-sr="' + r.dataset.sr + '"]');
      if (p) p.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    });
  });
})();
