/* Full-text search over the constitution, the official summary and the history.
   Reads window.FLUID_SEARCH from js/search-data.js.
   Part one is the engine, shared with the overlay in js/register.js.
   Part two runs the search page and does nothing on any other page. */
(function () {
  "use strict";

  var D = window.FLUID_SEARCH;
  if (!D) return;

  const ROOT = (() => {
    const pathname = window.location.pathname;
    return pathname.substring(0, pathname.lastIndexOf('/') + 1);
  })();

  var DOCS = [
    { key: 'con', label: 'Constitution' },
    { key: 'sum', label: 'Official summary' },
    { key: 'his', label: 'History' }
  ];

  var PAGE = {}, LABEL = {};
  DOCS.forEach(function (d) { LABEL[d.key] = d.label; });
  (D.secs || []).forEach(function (s) {
    DOCS.push({ key: s[0], label: s[1] });
    PAGE[s[0]] = true;
    LABEL[s[0]] = s[1];
  });

  var PERIOD = {};
  D.periods.forEach(function (p) { PERIOD[p[0]] = p[1]; });

  var HIS_ORDER = {};
  D.his.forEach(function (h, i) { HIS_ORDER[i] = i; });

  /* ---------- records ---------- */

  function href(doc, rec) {
    if (PAGE[doc]) return ROOT + rec[0] + (rec[1] ? '#' + rec[1] : '');
    if (doc === 'con') return ROOT + 'constitution/title-' + rec[1] + '.html#a' + rec[0];
    if (doc === 'sum') return ROOT + 'summary/title-' + rec[1] + '.html#a' + rec[0];
    return ROOT + 'history/index.html#' + rec[0];
  }

  function context(doc, rec) {
    var t;
    if (PAGE[doc]) return rec[3] === rec[2] ? LABEL[doc] : rec[2];
    if (doc === 'con') {
      t = 'Title ' + rec[1] + ', ' + (D.titles[rec[1]] || '');
      if (rec[2] && D.chapters[rec[1]] && D.chapters[rec[1]][rec[2]]) {
        t += ' - Chapter ' + rec[2] + ', ' + D.chapters[rec[1]][rec[2]];
      }
      return t;
    }
    if (doc === 'sum') return 'Title ' + rec[1] + ', ' + (D.titles[rec[1]] || '');
    return PERIOD[rec[1]] || '';
  }

  function heading(doc, rec) {
    if (PAGE[doc]) return rec[3];
    if (doc === 'his') return rec[3];
    return rec[2 + (doc === 'con' ? 1 : 0)];
  }

  function body(doc, rec) {
    if (PAGE[doc]) return rec[4];
    if (doc === 'con') return rec[4];
    if (doc === 'sum') return rec[3];
    return rec[4];
  }

  function number(doc, rec) { return (doc === 'his' || PAGE[doc]) ? 0 : rec[0]; }

  /* ---------- query ---------- */

  var FILTERS = { 'in': 'src', 'title': 'title', 'chapter': 'chapter', 'art': 'art', 'period': 'period' };
  var SRCNAME = {
    constitution: 'con', con: 'con', c: 'con',
    summary: 'sum', sum: 'sum', s: 'sum',
    history: 'his', his: 'his', h: 'his'
  };
  (D.secs || []).forEach(function (s) { SRCNAME[s[0]] = s[0]; });

  function parse(raw) {
    var q = {
      src: [], title: [], chapter: [], art: [], period: [],
      phrase: '', quoted: false, num: 0, raw: raw || ''
    };
    var rest = [];
    var parts = (raw || '').match(/"[^"]*"|\S+/g) || [];
    parts.forEach(function (p) {
      var m = /^([a-z]+):(.+)$/i.exec(p);
      if (m && FILTERS[m[1].toLowerCase()]) {
        var key = FILTERS[m[1].toLowerCase()], v = m[2].toLowerCase();
        if (key === 'src') {
          if (SRCNAME[v]) q.src.push(SRCNAME[v]);
        } else if (key === 'art') {
          var r = /^(\d+)(?:-(\d+))?$/.exec(v);
          if (r) q.art.push([+r[1], r[2] ? +r[2] : +r[1]]);
        } else if (key === 'period') {
          q.period.push(v);
        } else {
          var n = parseInt(v, 10);
          if (n) q[key].push(n);
        }
        return;
      }
      if (p.charAt(0) === '"' && p.charAt(p.length - 1) === '"' && p.length > 1) {
        q.quoted = true;
        rest.push(p.slice(1, -1));
        return;
      }
      rest.push(p);
    });
    q.phrase = rest.join(' ').trim();
    q.terms = q.phrase.toLowerCase().split(/\s+/).filter(Boolean);
    if (/^\d{1,3}$/.test(q.phrase)) {
      var a = parseInt(q.phrase, 10);
      if (a >= 1 && a <= 340) q.num = a;
    }
    return q;
  }

  function passes(q, doc, rec) {
    if (q.src.length && q.src.indexOf(doc) < 0) return false;
    if (PAGE[doc]) {
      return !(q.title.length || q.chapter.length || q.art.length || q.period.length);
    }
    if (doc === 'his') {
      if (q.title.length || q.chapter.length || q.art.length) return false;
      if (q.period.length && q.period.indexOf(rec[1]) < 0) return false;
      return true;
    }
    if (q.period.length) return false;
    if (q.title.length && q.title.indexOf(rec[1]) < 0) return false;
    if (q.chapter.length) {
      if (doc === 'sum') return false;
      if (q.chapter.indexOf(rec[2]) < 0) return false;
    }
    if (q.art.length) {
      var n = rec[0], ok = false;
      q.art.forEach(function (r) { if (n >= r[0] && n <= r[1]) ok = true; });
      if (!ok) return false;
    }
    return true;
  }

  /* ---------- matching ---------- */

  function scan(q, needleList, all) {
    var groups = [];
    DOCS.forEach(function (d) {
      var hits = [];
      (D[d.key] || []).forEach(function (rec, i) {
        if (!passes(q, d.key, rec)) return;
        var h = heading(d.key, rec).toLowerCase(), b = body(d.key, rec).toLowerCase();
        var inHead = true, inBody = true;
        needleList.forEach(function (n) {
          if (h.indexOf(n) < 0) inHead = false;
          if (b.indexOf(n) < 0 && h.indexOf(n) < 0) inBody = false;
        });
        if (all ? inBody : (inHead || inBody)) {
          hits.push({ doc: d.key, rec: rec, order: i, head: inHead });
        }
      });
      hits.sort(function (a, b2) {
        if (a.head !== b2.head) return a.head ? -1 : 1;
        return a.order - b2.order;
      });
      if (hits.length) groups.push({ key: d.key, label: d.label, hits: hits });
    });
    return groups;
  }

  function front(q, needleList) {
    var out = [];
    (D.front || []).forEach(function (f) {
      if (q.src.length && q.src.indexOf(f[0]) < 0) return;
      if (q.title.length || q.chapter.length || q.art.length || q.period.length) return;
      var hay = (f[1] + ' ' + f[2]).toLowerCase(), ok = true;
      needleList.forEach(function (n) { if (hay.indexOf(n) < 0) ok = false; });
      if (ok) out.push(f);
    });
    return out;
  }

  function run(raw) {
    var q = parse(raw);
    var res = { q: q, groups: [], front: [], widened: false, total: 0, terms: [] };
    if (!q.phrase && !q.src.length && !q.title.length && !q.chapter.length &&
        !q.art.length && !q.period.length) return res;

    if (!q.phrase) {
      res.groups = scan(q, [''], false);
      res.terms = [];
    } else {
      res.terms = [q.phrase.toLowerCase()];
      res.groups = scan(q, res.terms, false);
      res.front = front(q, res.terms);
      if (!res.groups.length && !res.front.length && !q.quoted && q.terms.length > 1) {
        res.widened = true;
        res.terms = q.terms;
        res.groups = scan(q, res.terms, true);
        res.front = front(q, res.terms);
      }
    }
    res.groups.forEach(function (g) { res.total += g.hits.length; });
    res.total += res.front.length;
    return res;
  }

  /* ---------- snippets ---------- */

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function marks(text, terms) {
    if (!terms.length || !terms[0]) return esc(text);
    var low = text.toLowerCase(), spans = [];
    terms.forEach(function (t) {
      if (!t) return;
      var i = low.indexOf(t);
      while (i > -1) { spans.push([i, i + t.length]); i = low.indexOf(t, i + t.length); }
    });
    if (!spans.length) return esc(text);
    spans.sort(function (a, b) { return a[0] - b[0]; });
    var out = '', at = 0;
    spans.forEach(function (s) {
      if (s[0] < at) return;
      out += esc(text.slice(at, s[0])) + '<mark>' + esc(text.slice(s[0], s[1])) + '</mark>';
      at = s[1];
    });
    return out + esc(text.slice(at));
  }

  function snippet(text, terms, width) {
    width = width || 150;
    if (!text) return '';
    var low = text.toLowerCase(), at = -1;
    terms.forEach(function (t) {
      if (!t) return;
      var i = low.indexOf(t);
      if (i > -1 && (at < 0 || i < at)) at = i;
    });
    var start = 0;
    if (at > -1) start = Math.max(0, at - Math.floor(width / 3));
    var end = Math.min(text.length, start + width);
    if (start > 0) { while (start > 0 && text.charAt(start) !== ' ') start--; }
    if (end < text.length) { while (end < text.length && text.charAt(end) !== ' ') end++; }
    var cut = text.slice(start, end).trim();
    return (start > 0 ? '... ' : '') + marks(cut, terms) + (end < text.length ? ' ...' : '');
  }

  window.FluidSearch = {
    data: D, root: ROOT, docs: DOCS, key: 'fluid.search.q',
    run: run, parse: parse, href: href, heading: heading, body: body,
    context: context, number: number, snippet: snippet, esc: esc, marks: marks,
    articleHref: function (n) {
      for (var i = 0; i < D.con.length; i++) {
        if (D.con[i][0] === n) return href('con', D.con[i]);
      }
      return null;
    }
  };

  /* ---------- the search page ---------- */

  var page = document.getElementById('searchpage');
  if (!page) return;

  var box = document.getElementById('sq'),
      facets = document.getElementById('facets'),
      out = document.getElementById('results'),
      note = document.getElementById('note'),
      shown = {}, jump = null;

  function pill(label, prefix, on) {
    return '<button type="button" class="fc' + (on ? ' on' : '') +
      '" data-prefix="' + esc(prefix) + '">' + esc(label) + '</button>';
  }

  function has(prefix) {
    return box.value.toLowerCase().split(/\s+/).indexOf(prefix.toLowerCase()) > -1;
  }

  function drawFacets() {
    var q = window.FluidSearch.parse(box.value), h = '';

    h += '<div class="frow"><span class="flab">Source</span>';
    h += pill('Constitution', 'in:constitution', q.src.indexOf('con') > -1);
    h += pill('Summary', 'in:summary', q.src.indexOf('sum') > -1);
    h += pill('History', 'in:history', q.src.indexOf('his') > -1);
    (D.secs || []).forEach(function (s) {
      h += pill(s[1], 'in:' + s[0], q.src.indexOf(s[0]) > -1);
    });
    h += '</div>';

    h += '<div class="frow"><span class="flab">Title</span>';
    for (var t = 1; t <= 13; t++) {
      h += pill(String(t), 'title:' + t, q.title.indexOf(t) > -1);
    }
    h += '</div>';

    if (q.title.length === 1 && D.chapters[q.title[0]]) {
      var cs = D.chapters[q.title[0]];
      h += '<div class="frow"><span class="flab">Chapter</span>';
      Object.keys(cs).forEach(function (c) {
        h += pill(c + '. ' + cs[c], 'chapter:' + c, q.chapter.indexOf(+c) > -1);
      });
      h += '</div>';
    }

    h += '<div class="frow"><span class="flab">Articles</span>';
    [[1, 17], [18, 57], [58, 118], [119, 152], [153, 200], [201, 250], [251, 300], [301, 340]]
      .forEach(function (r) {
        h += pill(r[0] + ' to ' + r[1], 'art:' + r[0] + '-' + r[1],
          has('art:' + r[0] + '-' + r[1]));
      });
    h += '</div>';

    h += '<div class="frow"><span class="flab">Period</span>';
    D.periods.forEach(function (p) {
      h += pill(p[1], 'period:' + p[0], q.period.indexOf(p[0]) > -1);
    });
    h += '</div>';

    facets.innerHTML = h;
  }

  function row(doc, rec, terms) {
    var n = window.FluidSearch.number(doc, rec);
    return '<li><a href="' + window.FluidSearch.href(doc, rec) + '">' +
      (n ? '<span class="n">' + n + '</span>' : '<span class="n dot">&middot;</span>') +
      '<span class="body"><span class="h">' +
      marks(window.FluidSearch.heading(doc, rec), terms) + '</span>' +
      '<span class="ctx">' + esc(window.FluidSearch.context(doc, rec)) + '</span>' +
      '<span class="sn">' +
      snippet(window.FluidSearch.body(doc, rec), terms) + '</span></span></a></li>';
  }

  function draw() {
    var res = window.FluidSearch.run(box.value);
    drawFacets();

    if (!box.value.trim()) {
      var pages = 0;
      (D.secs || []).forEach(function (s) { pages += (D[s[0]] || []).length; });
      note.textContent = 'Searching ' + D.con.length + ' articles, ' +
        D.sum.length + ' summary lines, ' + D.his.length +
        ' history sections and ' + pages + ' sections of the register pages.';
      out.innerHTML = '';
      return;
    }

    jump = null;
    var pinned = '';
    if (res.q.num && res.q.raw.trim() === String(res.q.num)) {
      for (var i = 0; i < D.con.length; i++) {
        if (D.con[i][0] === res.q.num) {
          jump = window.FluidSearch.href('con', D.con[i]);
          pinned = '<section class="grp pin"><h2>Article ' + res.q.num +
            '</h2><ul class="res">' + row('con', D.con[i], []) + '</ul>' +
            '<p class="more">Press Enter to open it.</p></section>';
          break;
        }
      }
    }

    if (!res.total && !pinned) {
      note.textContent = 'Nothing matches that.';
      out.innerHTML = '';
      return;
    }

    note.textContent = res.total + (res.total === 1 ? ' result.' : ' results.') +
      (jump ? ' Enter opens Article ' + res.q.num + '.' : '') +
      (res.widened ? ' The exact phrase was not found, so the words were matched in any order.' : '');

    var h = pinned;
    if (res.front.length) {
      h += '<section class="grp"><h2>Front matter</h2><ul class="res">';
      res.front.forEach(function (f) {
        var target = f[0] === 'con' ? ROOT + 'index.html' : ROOT + 'summary/index.html';
        h += '<li><a href="' + target + '"><span class="n dot">&middot;</span>' +
          '<span class="body"><span class="h">' + marks(f[1], res.terms) + '</span>' +
          '<span class="ctx">' + (f[0] === 'con' ? 'Constitution' : 'Official summary') +
          '</span><span class="sn">' + snippet(f[2], res.terms) + '</span></span></a></li>';
      });
      h += '</ul></section>';
    }

    res.groups.forEach(function (g) {
      var cap = shown[g.key] || 10;
      h += '<section class="grp" data-key="' + g.key + '"><h2>' + g.label +
        ' <span class="c">' + g.hits.length + '</span></h2><ul class="res">';
      g.hits.slice(0, cap).forEach(function (hit) {
        h += row(hit.doc, hit.rec, res.terms);
      });
      h += '</ul>';
      if (g.hits.length > cap) {
        h += '<p class="more"><button type="button" class="morebtn" data-key="' + g.key +
          '">Show ' + Math.min(10, g.hits.length - cap) + ' more of ' + g.hits.length +
          '</button></p>';
      }
      h += '</section>';
    });
    out.innerHTML = h;
  }

  out.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('.morebtn') : null;
    if (!b) return;
    shown[b.dataset.key] = (shown[b.dataset.key] || 10) + 10;
    draw();
  });

  facets.addEventListener('click', function (e) {
    var b = e.target.closest ? e.target.closest('.fc') : null;
    if (!b) return;
    var p = b.dataset.prefix,
        words = box.value.split(/\s+/).filter(Boolean),
        at = words.map(function (w) { return w.toLowerCase(); }).indexOf(p.toLowerCase());
    if (at > -1) words.splice(at, 1);
    else words.unshift(p);
    box.value = words.join(' ');
    shown = {};
    box.focus();
    draw();
  });

  box.addEventListener('input', function () { shown = {}; draw(); });
  box.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && jump) { e.preventDefault(); window.location.href = jump; }
  });

  var handed = null;
  try { handed = sessionStorage.getItem(window.FluidSearch.key); } catch (e) {}
  if (handed) {
    box.value = handed;
    try { sessionStorage.removeItem(window.FluidSearch.key); } catch (e) {}
  }
  draw();
  box.focus();
})();
